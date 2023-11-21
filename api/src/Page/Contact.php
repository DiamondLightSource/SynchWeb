<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Database\DatabaseQueryBuilder;

class Contact extends Page
{

        public static $arg_list = array('CARDNAME' => '([\w\s\-])+',
                              'FAMILYNAME' => '([\w\-])+',
                              'GIVENNAME' => '([\w\-])+',
                              'PHONENUMBER' => '.*',
                              'EMAILADDRESS' => '.*',
                              'LABNAME' => '([\w\s\-])+',
                              'ADDRESS' => '([\w\s\-\n,])+',
                              'COUNTRY' => '([\w\s\-,\(\)\'])+',
                              'CITY' => '([\w\s\-])+',
                              'POSTCODE' => '([\w\s\-])+',
                              'DEFAULTCOURRIERCOMPANY' => '([\w\s\-])+',
                              'COURIERACCOUNT' => '([\w\-])+',
                              'BILLINGREFERENCE' => '([\w\s\-])+',
                              'DEWARAVGTRANSPORTVALUE' => '\d+',
                              'DEWARAVGCUSTOMSVALUE' => '\d+',

                              'PERSONID' => '\d+',

                              'cid' => '\d+',
                              );

        public static $dispatch = array(array('(/:cid)', 'get', '_get_contacts'),
                              array('', 'post', '_add_contact'),
                              array('/:cid', 'patch', '_update_contact'),
                              );
        
        
        # ------------------------------------------------------------------------
        # Get List of Lab Contacts
        function _get_contacts() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'WHERE c.proposalid = :1';
            
            if ($this->has_arg('cid')) {
                $where .= ' AND c.labcontactid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }

            if ($this->has_arg('s')) {
                $fields = array('pe.givenname', 'pe.familyname', 'c.cardname',
                    'l.name', 'l.address', 'l.city', 'l.country', 'pe.phonenumber', 'l.postcode');
                $where = $where . DatabaseQueryBuilder::getWhereSearch($this->arg('s'), $fields, $args);
            }

            $tot = $this->db->pq("SELECT count(c.labcontactid) as tot FROM labcontact c
                                    INNER JOIN person pe ON c.personid = pe.personid
                                    INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid
                                    $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $start = 0;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'c.labcontactid DESC';
        
            $rows = $this->db->paginate("SELECT c.labcontactid, c.cardname, pe.givenname, pe.familyname, pe.phonenumber, l.name as labname, l.address, l.city, l.country, c.courieraccount,  c.billingreference, c.defaultcourriercompany, c.dewaravgcustomsvalue, c.dewaravgtransportvalue, pe.emailaddress, l.postcode, l.country
                                 FROM labcontact c 
                                 INNER JOIN person pe ON c.personid = pe.personid 
                                 INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid 
                                 INNER JOIN proposal p ON p.proposalid = c.proposalid 
                                 $where ORDER BY $order", $args);
            
            if ($this->has_arg('cid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such contact');
                
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));
        }
        
        
        # ------------------------------------------------------------------------
        # Update field for lab contact
        function _update_contact() {
            if (!$this->has_arg('cid')) $this->_error('No contact specified');
            
            $cont = $this->db->pq("SELECT c.labcontactid, l.laboratoryid, p.personid 
                FROM labcontact c 
                INNER JOIN person p ON p.personid = c.personid 
                INNER JOIN laboratory l ON l.laboratoryid = p.laboratoryid 
                WHERE c.labcontactid=:1 and c.proposalid=:2", array($this->arg('cid'), $this->proposalid));
            
            if (!sizeof($cont)) $this->_error('The specified contact doesnt exist');
            else $cont = $cont[0];
            
            # Update labcontact
            $cfields = array('CARDNAME', 'DEFAULTCOURRIERCOMPANY', 'COURIERACCOUNT', 'BILLINGREFERENCE', 'DEWARAVGTRANSPORTVALUE', 'DEWARAVGCUSTOMSVALUE');
            foreach ($cfields as $i => $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE labcontact SET '.$f.'=:1 WHERE labcontactid=:2', array($this->arg($f), $cont['LABCONTACTID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
            
            
            # Update person
            $pfields = array('FAMILYNAME', 'GIVENNAME', 'PHONENUMBER', 'EMAILADDRESS');
            foreach ($pfields as $i => $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE person SET '.$f.'=:1 WHERE personid=:2', array($this->arg($f), $cont['PERSONID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
            
            
            # Update laboratory
            $lfields = array('LABNAME', 'ADDRESS', 'CITY', 'COUNTRY', 'POSTCODE');
            foreach ($lfields as $i => $f) {
                if ($this->has_arg($f)) {
                    $c = $f == 'LABNAME' ? 'NAME' : $f;
                    $this->db->pq('UPDATE laboratory SET '.$c.'=:1 WHERE laboratoryid=:2', array($this->arg($f), $cont['LABORATORYID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }
        
        
        
        # ------------------------------------------------------------------------
        # Add a new lab contact
        function _add_contact() {
            if (!$this->has_arg('prop')) $this->_error('No proposal selected');
            
            $valid = True;
            foreach (array('CARDNAME', 'FAMILYNAME', 'GIVENNAME', 'LABNAME', 'ADDRESS', 'CITY', 'COUNTRY', 'POSTCODE') as $k) {
                if (!$this->has_arg($k)) $valid = False;
            }
            
            if (!$valid) $this->_error('Missing Fields');

            $cont = $this->db->pq("SELECT c.labcontactid
                FROM labcontact c
                WHERE c.cardname=:1 and c.proposalid=:2", array($this->arg('CARDNAME'), $this->proposalid));
            if (sizeof($cont)) $this->_error('The specified card name already exists');
            
            if ($this->has_arg('PERSONID')) {
                $pid = $this->arg('PERSONID');

                $check = $this->db->pq("SELECT c.labcontactid
                    FROM labcontact c
                    WHERE c.personid=:1 and c.proposalid=:2", array($pid, $this->proposalid));
                if (sizeof($check)) $this->_error('The specified login already has a lab contact for this proposal');

                $lab = $this->db->pq("SELECT l.laboratoryid FROM laboratory l
                    INNER JOIN person p ON l.laboratoryid = p.laboratoryid
                    WHERE p.personid=:1", array($pid));

                if (sizeof($lab)) {
                    # Update laboratory
                    $lfields = array('LABNAME', 'ADDRESS', 'CITY', 'COUNTRY', 'POSTCODE');
                    foreach ($lfields as $i => $f) {
                        if ($this->has_arg($f)) {
                            $c = $f == 'LABNAME' ? 'NAME' : $f;
                            $this->db->pq('UPDATE laboratory SET '.$c.'=:1 WHERE laboratoryid=:2', array($this->arg($f), $lab[0]['LABORATORYID']));
                        }
                    }
                }
                else {
                    # Create laboratory
                    $this->db->pq("INSERT INTO laboratory (laboratoryid,name,address,city,postcode,country)
                        VALUES (s_laboratory.nextval, :1, :2, :3, :4, :5) RETURNING laboratoryid INTO :id",
                        array($this->arg('LABNAME'), $this->arg('ADDRESS'), $this->arg('CITY'), $this->arg('POSTCODE'), $this->arg('COUNTRY')));
                    $lid = $this->db->id();
                    $this->db->pq('UPDATE person SET laboratoryid=:1 WHERE personid=:2', array($lid, $pid));
                }

                # Update person
                $pfields = array('FAMILYNAME', 'GIVENNAME', 'PHONENUMBER', 'EMAILADDRESS');
                foreach ($pfields as $i => $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE person SET '.$f.'=:1 WHERE personid=:2', array($this->arg($f), $pid));
                    }
                }

            }
            else {
            
                $this->db->pq("INSERT INTO laboratory (laboratoryid,name,address,city,postcode,country)
                    VALUES (s_laboratory.nextval, :1, :2, :3, :4, :5) RETURNING laboratoryid INTO :id",
                    array($this->arg('LABNAME'), $this->arg('ADDRESS'), $this->arg('CITY'), $this->arg('POSTCODE'), $this->arg('COUNTRY')));
                $lid = $this->db->id();

                $email = $this->has_arg('EMAILADDRESS') ? $this->arg('EMAILADDRESS') : '';
                $phone = $this->has_arg('PHONENUMBER') ? $this->arg('PHONENUMBER') : '';

                $this->db->pq("INSERT INTO person (personid, givenname, familyname, emailaddress, phonenumber, laboratoryid)
                    VALUES (s_person.nextval, :1, :2, :3, :4, :5) RETURNING personid INTO :id",
                    array($this->arg('GIVENNAME'), $this->arg('FAMILYNAME'), $email, $phone, $lid));

                $pid = $this->db->id();
            }
            
            $c = $this->def_arg('DEFAULTCOURRIERCOMPANY', '');
            $ca = $this->has_arg('COURIERACCOUNT') ? $this->arg('COURIERACCOUNT') : '';
            $br = $this->has_arg('BILLINGREFERENCE') ? $this->arg('BILLINGREFERENCE') : '';
            $cv = $this->has_arg('DEWARAVGCUSTOMSVALUE') ? $this->arg('DEWARAVGCUSTOMSVALUE') : 0;
            $tv = $this->has_arg('DEWARAVGTRANSPORTVALUE') ? $this->arg('DEWARAVGTRANSPORTVALUE') : 0;
            
            $this->db->pq("INSERT INTO labcontact (labcontactid, cardname, defaultcourriercompany, courieraccount, billingreference, dewaravgcustomsvalue, dewaravgtransportvalue, proposalid, personid) 
                VALUES (s_labcontact.nextval, :1, :2, :3, :4, :5, :6, :7, :8) RETURNING labcontactid INTO :id", 
                array($this->arg('CARDNAME'), $c, $ca, $br, $cv, $tv, $this->proposalid, $pid));
            
            $this->_output(array('LABCONTACTID' => $this->db->id()));
        }
}
