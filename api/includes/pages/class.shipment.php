<?php

    class Shipment extends Page {
        

        public static $arg_list = array('did' => '\d+',
                              'cid' => '\d+',
                              'sid' => '\d+',
                              'lcid' => '\d+',
                              'pid' => '\d+',
                              'iid' => '\d+',

                              
                              'visit' => '\w+\d+-\d+',
                              'bl' => '[\w-]+',
                              'current' => '\d',
                              'all' => '\d',
                              'ty' => '\w+',
                              'imager' => '\d',
                              'imid' => '\d+',


                              // cache name
                              'name' => '\w+',


                              // Dewar Fields
                              'CODE' => '([\w-])+',
                              'FACILITYCODE' => '([\w-])+',
                              'TRACKINGNUMBERTOSYNCHROTRON' => '\w+',
                              'TRACKINGNUMBERFROMSYNCHROTRON' => '\w+',
                              'FIRSTEXPERIMENTID' => '\d+',
                              'SHIPPINGID' => '\d+',

                              'BARCODE' => '([\w-])+',
                              'LOCATION' => '[\w|\s|-]+',
                              'NEXTLOCATION' => '[\w|\s|-]+',

                              'PURCHASEDATE' => '\d+-\d+-\d+',
                              'LABCONTACTID' => '\d+',
                              'REPORT' => '.*',

                              'ADDRESS' => '.*',
                              'DESCRIPTION' => '.*',
                              'EMAILADDRESS' => '.*',
                              'FAMILYNAME' => '.*',
                              'GIVENNAME' => '.*',
                              'LABNAME' => '.*',
                              'LOCALCONTACT' => '[\w|\s+|-]+',
                              'NEXTLOCALCONTACT' => '[\w|\s+|-]+',
                              'PHONENUMBER' => '.*',
                              'VISIT' => '\w+\d+-\d+',
                              'NEXTVISIT' => '\w+\d+-\d+',
                              'AWBNUMBER' => '\w+',
                              
                              // Shipment fields
                              'FCODES' => '([\w-])+',
                              'SENDINGLABCONTACTID' => '\d+',
                              'RETURNLABCONTACTID' => '\d+',
                              'SHIPPINGNAME' => '([\w\s-])+',
                              'DELIVERYAGENT_SHIPPINGDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_DELIVERYDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_AGENTNAME' => '[\s|\w|-]+',
                              'DELIVERYAGENT_AGENTCODE' => '[\w-]+',
                              'SAFETYLEVEL' => '\w+',
                              'DEWARS' => '\d+',
                              //'FIRSTEXPERIMENTID' => '\w+\d+-\d+',
                              'COMMENTS' => '.*',
                              
                              'assigned' => '\d',
                              'bl' => '[\w-]+',
                              'unassigned' => '[\w-]+',
                              
                              // Container fields
                              'DEWARID' => '\d+',
                              'CAPACITY' => '\d+',
                              'CONTAINERTYPE' => '\w+',
                              'NAME' => '([\w-])+',
                              'SCHEDULEID' => '\d+',
                              'SCREENID' => '\d+',
                              'PERSONID' => '\d+',
                              'DISPOSE' => '\d',
                              'REQUESTEDRETURN' => '\d',
                              'REQUESTEDIMAGERID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'UNQUEUE' => '\d',
                              );
        

        public static $dispatch = array(array('/shipments(/:sid)', 'get', '_get_shipments'),
                              array('/shipments', 'post', '_add_shipment'),
                              array('/shipments/:sid', 'patch', '_update_shipment'),
                              array('/send/:sid', 'get', '_send_shipment'),


                              array('/dewars(/:did)(/sid/:sid)(/fc/:FACILITYCODE)', 'get', '_get_dewars'),
                              array('/dewars', 'post', '_add_dewar'),
                              array('/dewars/:did', 'patch', '_update_dewar'),

                              array('/dewars/history(/did/:did)', 'get', '_get_history'),
                              array('/dewars/history', 'post', '_add_history'),

                              array('/dewars/registry(/:FACILITYCODE)', 'get', '_dewar_registry'),
                              array('/dewars/registry/:FACILITYCODE', 'patch', '_update_dewar_registry'),
                              array('/dewars/registry/:FACILITYCODE', 'put', '_add_dewar_registry'),

                              array('/dewars/reports(/:drid)', 'get', '_get_dewar_reports'),
                              array('/dewars/reports', 'post', '_add_dewar_report'),

                              array('/dewars/default', 'get', '_get_default_dewar'),

                              array('/dewars/transfer', 'post', '_transfer_dewar'),
                              array('/dewars/dispatch', 'post', '_dispatch_dewar'),

                              array('/dewars/tracking(/:DEWARID)', 'get', '_get_dewar_tracking'),



                              array('/containers(/:cid)(/did/:did)', 'get', '_get_all_containers'),
                              array('/containers/', 'post', '_add_container'),
                              array('/containers/:cid', 'patch', '_update_container'),
                              array('/containers/move', 'get', '_move_container'),
                              array('/containers/queue', 'get', '_queue_container'),
                              

                              array('/cache/:name', 'put', '_session_cache'),
                              array('/cache/:name', 'get', '_get_session_cache'),


                              array('/terms', 'get', '_get_terms'),
                              array('/termsaccept', 'get', '_accept_terms'),
        );

        // Keep session open so we can cache data
        var $session_close = False;
        
        
        # ------------------------------------------------------------------------
        # List of shipments for a proposal
        function _get_shipments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'Please select a proposal first');
            $args = array($this->proposalid);
            $where = '';
            
            if ($this->has_arg('sid')) {
                $where = 'AND s.shippingid=:2';
                array_push($args, $this->arg('sid'));
            }
            
            $rows = $this->db->pq("SELECT s.deliveryagent_agentname, s.deliveryagent_agentcode, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as deliveryagent_shippingdate, TO_CHAR(s.deliveryagent_deliverydate, 'DD-MM-YYYY') as deliveryagent_deliverydate, s.safetylevel, count(d.dewarid) as dcount,s.sendinglabcontactid, c.cardname as lcout, c2.cardname as lcret, s.returnlabcontactid, s.shippingid, s.shippingname, s.shippingstatus,TO_CHAR(s.creationdate, 'DD-MM-YYYY') as created, s.isstorageshipping, s.shippingtype, s.comments 
              FROM proposal p 
              INNER JOIN shipping s ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid 
              LEFT OUTER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid 
              LEFT OUTER JOIN dewar d ON d.shippingid = s.shippingid 
              WHERE p.proposalid = :1 $where 
              GROUP BY s.sendinglabcontactid, s.returnlabcontactid, s.deliveryagent_agentname, s.deliveryagent_agentcode, s.deliveryagent_shippingdate, s.deliveryagent_deliverydate, s.safetylevel, c.cardname, c2.cardname, s.shippingid, s.shippingname, s.shippingstatus,TO_CHAR(s.creationdate, 'DD-MM-YYYY'), s.isstorageshipping, s.shippingtype, s.comments, s.creationdate ORDER BY s.creationdate DESC", $args);
            
            if ($this->has_arg('sid')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such shipment');
            } else $this->_output($rows);
        }
        
        
        # ------------------------------------------------------------------------
        # Dewar history
        function _get_history() {
            if (!$this->has_arg('did') && !$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';
            if ($this->has_arg('all') && ($this->bcr() || $this->staff)) {
                $args = array();
                $where = '1=1';
            }

            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            } else {
                $where .= ' AND d.facilitycode=:'.(sizeof($args)+1);
                array_push($args, $this->arg('FACILITYCODE'));
            }

            $tot = $this->db->pq("SELECT count(h.dewartransporthistoryid) as tot 
              FROM dewartransporthistory h 
              INNER JOIN dewar d ON d.dewarid = h.dewarid 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT s.shippingid, s.shippingname as shipment, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), b.visit_number) as visit, b.beamlinename as bl, b.beamlineoperator as localcontact, h.dewarid, h.dewarstatus,h.storagelocation,TO_CHAR(h.arrivaldate, 'DD-MM-YYYY HH24:MI') as arrival 
              FROM dewartransporthistory h 
              INNER JOIN dewar d ON d.dewarid = h.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession b ON b.sessionid = d.firstexperimentid
              WHERE $where ORDER BY h.arrivaldate DESC", $args);
            
            $this->_output(array('total' => $tot, 'data' => $rows));
        }


        function _add_history() {
            global $in_contacts, $transfer_email;
            if (!$this->bcr()) $this->_error('You need to be on the internal network to add history');

            if (!$this->has_arg('BARCODE')) $this->_error('No barcode specified');
            if (!$this->has_arg('LOCATION')) $this->_error('No location specified');

            $dew = $this->db->pq("SELECT CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as lcout, pe.emailaddress as lcoutemail, CONCAT(CONCAT(pe2.givenname, ' '), pe2.familyname) as lcret, pe2.emailaddress as lcretemail, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), e.visit_number) as firstexp, TO_CHAR(e.startdate, 'DD-MM-YYYY HH24:MI') as firstexpst, e.beamlinename, e.beamlineoperator, d.dewarid, d.trackingnumberfromsynchrotron, s.shippingid, s.shippingname, p.proposalcode, CONCAT(p.proposalcode, p.proposalnumber) as prop, d.barcode, d.facilitycode
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid 
              LEFT OUTER JOIN person pe ON pe.personid = c.personid
              LEFT OUTER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid  
              LEFT OUTER JOIN person pe2 ON pe2.personid = c2.personid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              LEFT OUTER JOIN blsession e ON e.sessionid = d.firstexperimentid
              WHERE lower(barcode) LIKE lower(:1)", array($this->arg('BARCODE')));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            $track = $this->has_arg('TRACKINGNUMBERFROMSYNCHROTRON') ? $this->arg('TRACKINGNUMBERFROMSYNCHROTRON') : $dew['TRACKINGNUMBERFROMSYNCHROTRON'];

            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) VALUES (s_dewartransporthistory.nextval,:1,'at DLS',lower(:2),CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", array($dew['DEWARID'], $this->arg('LOCATION')));
            $dhid = $this->db->id();

            $this->db->pq("UPDATE dewar set dewarstatus='at DLS', storagelocation=lower(:2), trackingnumberfromsynchrotron=:3 WHERE dewarid=:1", array($dew['DEWARID'], $this->arg('LOCATION'), $track));
            $this->db->pq("UPDATE shipping set shippingstatus='at DLS' WHERE shippingid=:1", array($dew['SHIPPINGID']));


            // Email
            // EHCs, local contact(s), labcontact, dh, pa
            $dew['NOW'] = strftime('%d-%m-%Y %H:%M');
            $dew['INCONTACTS'] = $in_contacts;
            $dew['TRACKINGNUMBERFROMSYNCHROTRON'] = $track;

            if (strtolower($this->arg('LOCATION')) == 'stores-in' && $dew['LCOUTEMAIL']) {
                require_once('includes/class.email.php');
                $email = new Email($dew['PROPOSALCODE'] == 'in' ? 'dewar-stores-in-in' : 'dewar-stores-in', '*** Dewar Received for '.$dew['PROP'].' at '.$dew['NOW'].' ***');
                $email->data = $dew;
                $email->send($dew['LCOUTEMAIL'].', '.$transfer_email);
            }

            if (strtolower($this->arg('LOCATION')) == 'stores-out' && $dew['LCRETEMAIL']) {
                require_once('includes/class.email.php');
                $email = new Email('dewar-stores-out', '*** Dewar ready to leave Synchrotron ***');
                $email->data = $dew;
                $email->send($dew['LCRETEMAIL']);
            }

            if (strpos(strtolower($this->arg('LOCATION')),'-rack') !== false && $dew['LCRETEMAIL']) {
                $dew['LOCATION'] = $this->arg('LOCATION');

                require_once('includes/class.email.php');
                $email = new Email('dewar-rack', '*** Dewar now outside Beamline ***');
                $email->data = $dew;
                $email->send($dew['LCRETEMAIL']);
            }

            $this->_output(array('DEWARHISTORYID' => $dhid));
        }




        function _dewar_registry() {
            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';

            $fields = "CONCAT(p.proposalcode, p.proposalnumber) as prop, r.facilitycode, TO_CHAR(r.purchasedate, 'DD-MM-YYYY') as purchasedate, ROUND(TIMESTAMPDIFF('DAY',r.purchasedate, CURRENT_TIMESTAMP)/30.42,1) as age, r.labcontactid, pe.familyname, pe.givenname, pe.phonenumber, pe.emailaddress, lc.cardname, l.name as labname, l.address, count(d.dewarid) as dewars";
            $group = "CONCAT(p.proposalcode, p.proposalnumber), r.facilitycode, r.purchasedate, r.labcontactid, pe.familyname, pe.givenname, pe.phonenumber, pe.emailaddress, lc.cardname, l.name, l.address";

            if ($this->has_arg('all')) {
                $args = array();
                $where = '1=1';

                if (!$this->bcr() && !$this->staff) {
                    $fields = "CONCAT(p.proposalcode, p.proposalnumber) as prop, r.facilitycode";
                    $group = "CONCAT(p.proposalcode, p.proposalnumber), r.facilitycode";
                }
            }

            if ($this->has_arg('FACILITYCODE')) {
                $where .= ' AND r.facilitycode=:'.(sizeof($args)+1);
                array_push($args, $this->arg('FACILITYCODE'));
            }

            if ($this->has_arg('s')) {
                $where .= " AND lower(r.facilitycode) LIKE lower(CONCAT(CONCAT('%', :".(sizeof($args)+1)."), '%'))";
                array_push($args, $this->arg('s'));
            }


            $tot = $this->db->pq("SELECT count(r.facilitycode) as tot 
              FROM dewarregistry r 
              INNER JOIN proposal p ON p.proposalid = r.proposalid WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT $fields
              FROM dewarregistry r 
              INNER JOIN proposal p ON p.proposalid = r.proposalid 
              INNER JOIN labcontact lc ON r.labcontactid = lc.labcontactid
              INNER JOIN person pe ON pe.personid = lc.personid
              INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid
              LEFT OUTER JOIN dewar d ON d.facilitycode = r.facilitycode
              LEFT OUTER JOIN shipping s ON d.shippingid = s.shippingid 

              WHERE $where 
              GROUP BY $group

              ORDER BY r.facilitycode DESC", $args);
            
            if ($this->has_arg('FACILITYCODE')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such dewar');

            } else  $this->_output(array('total' => $tot, 'data' => $rows));
        }



        function _add_dewar_registry() {
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar code specified');
            if (!$this->has_arg('LABCONTACTID')) $this->_error('No lab contact specified');
            $purchase = $this->has_arg('PURCHASEDATE') ? $this->arg('PURCHASEDATE') : '';

            $this->db->pq("INSERT INTO dewarregistry (facilitycode, labcontactid, proposalid, purchasedate, bltimestamp) VALUES (:1, :2, :3, TO_DATE(:4, 'DD-MM-YYYY'), SYSDATE)", array($this->arg('FACILITYCODE'), $this->arg('LABCONTACTID'), $this->proposalid, $purchase));
            $this->_output(array('FACILITYCODE' => $this->arg('FACILITYCODE')));
        }


        function _update_dewar_registry() {
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar code specified');

            $dew = $this->db->pq("SELECT facilitycode FROM dewarregistry WHERE facilitycode LIKE :1 AND proposalid = :2", array($this->arg('FACILITYCODE'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            $fields = array('LABCONTACTID', 'PURCHASEDATE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $fl = ':1';
                    if (in_array($f, array('PURCHASEDATE'))) {
                        $fl = "TO_DATE(:1, 'DD-MM-YYYY')"; 
                    }

                    $this->db->pq("UPDATE dewarregistry SET $f=$fl WHERE facilitycode=:2", array($this->arg($f), $this->arg('FACILITYCODE')));
                    $this->_output(array($f => $this->arg($f)));
                    //$this->_dewar_registry();
                }
            }
        }


        function _get_dewar_reports() {
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $where = 'r.facilitycode=:1';
            $args = array($this->arg('FACILITYCODE'));


            $tot = $this->db->pq("SELECT count(r.dewarreportid) as tot 
              FROM dewarreport r
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT r.dewarreportid, r.report, TO_CHAR(r.bltimestamp, 'HH24:MI DD-MM-YYYY') as bltimestamp, r.attachment
                FROM dewarreport r
              WHERE $where ORDER BY r.bltimestamp DESC", $args);

            foreach ($rows as $i => &$row) {
              $row['REPORT'] = $this->db->read($row['REPORT']);
            }

            $this->_output(array('total' => $tot, 'data' => $rows));
        }

        function _add_dewar_report() {
            if (!$this->has_arg('REPORT')) $this->_error('No report specified');
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $last_visits = $this->db->pq("SELECT s.beamlineoperator as localcontact, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'YYYY') as year, s.beamlinename
              FROM dewar d
              INNER JOIN blsession s ON d.firstexperimentid = s.sessionid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE d.facilitycode = :1
              ORDER BY s.startdate DESC", array($this->arg('FACILITYCODE')));

            if (!sizeof($last_visits)) $this->_error('Cant find a visit for that dewar');
            else $lv = $last_visits[0];

            if (array_key_exists('ATTACHMENT', $_FILES)) {
                if ($_FILES['ATTACHMENT']['name']) {
                    $info = pathinfo($_FILES['ATTACHMENT']['name']);

                    if ($info['extension'] == 'jpg') {
                        # dls_mxweb cant write to visits...
                        #$root = '/dls/'.$lv['BEAMLINENAME'].'/data/'.$lv['YEAR'].'/'.$lv['VISIT'].'/.ispyb/';

                        $root = '/dls_sw/dasc/ispyb2/uploads/'.$lv['YEAR'].'/'.$lv['VISIT'].'/';
                        if (!is_dir($root)) {
                            mkdir($root, 0755, true);
                        }

                        $file = strftime('%Y-%m-%d_%H%M').'dewarreport.jpg';

                        $this->db->pq("INSERT INTO dewarreport (dewarreportid,facilitycode,report,attachment,bltimestamp) VALUES (s_dewarreport.nextval,:1,:2,:3,SYSDATE) RETURNING dewarreportid INTO :id", 
                        array($this->arg('FACILITYCODE'), $this->arg('REPORT'), $root.$file));
                        move_uploaded_file($_FILES['ATTACHMENT']['tmp_name'], $root.$file);

                        $lc = $this->db->pq("SELECT p.emailaddress
                          FROM dewarregistry r 
                          INNER JOIN labcontact l ON l.labcontactid = r.labcontactid
                          INNER JOIN person p ON p.personid = l.personid
                          WHERE r.facilitycode=:1", array($this->arg('FACILITYCODE')));

                        if (sizeof($lc)) {
                            $recpts = array($lc[0]['EMAILADDRESS']);
                            $local = $this->_get_email_fn($lv['LOCALCONTACT']);
                            if ($local) array_push($recpts, $local);

                            require_once('includes/class.email.php');
                            $this->args['NOW'] = strftime('%d-%m-%Y %H:%M');
                            $email = new Email('dewar-report', '*** Status Report for Dewar '.$this->arg('FACILITYCODE').' at '.$this->arg('NOW').' ***');
                            $email->data = $this->args;
                            $email->send(implode(', ', $recpts));
                        }


                        $this->_output(array('DEWARREPORTID' => $this->db->id()));


                    }
                }
            }
        }


        function _transfer_dewar() {
            global $transfer_email;
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $dew = $this->db->pq("SELECT d.dewarid,s.shippingid 
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 and p.proposalid=:2", array($this->arg('DEWARID'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            
            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) 
              VALUES (s_dewartransporthistory.nextval,:1,'transfer-requested',:2,CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
              array($dew['DEWARID'], $this->arg('LOCATION')));

            require_once('includes/class.email.php');
            $email = new Email('dewar-transfer', '*** Dewar ready for internal transfer ***');

            $this->args['LCEMAIL'] = $this->_get_email_fn($this->arg('LOCALCONTACT'));
            $this->args['LCNEXTEMAIL'] = $this->_get_email_fn($this->arg('NEXTLOCALCONTACT'));

            $data = $this->args;
            if (!array_key_exists('FACILITYCODE', $data)) $data['FACILITYCODE'] = '';
            $email->data = $data;            

            $recpts = $transfer_email.', '.$this->arg('EMAILADDRESS');
            if ($this->args['LCEMAIL']) $recpts .= ', '.$this->arg('LCEMAIL');
            if ($this->args['LCNEXTEMAIL']) $recpts .= ', '.$this->arg('LCNEXTEMAIL');

            $email->send($recpts);

            $this->_output(1);
        }


        function _dispatch_dewar() {
            global $dispatch_email;
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $dew = $this->db->pq("SELECT d.dewarid,s.shippingid 
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 and p.proposalid=:2", array($this->arg('DEWARID'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            
            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) 
              VALUES (s_dewartransporthistory.nextval,:1,'dispatch-requested',:2,CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
              array($dew['DEWARID'], $this->arg('LOCATION')));

            require_once('includes/class.email.php');
            $email = new Email('dewar-dispatch', '*** Dewar ready for Shipping from Diamond ***');

            $this->args['LCEMAIL'] = $this->_get_email_fn($this->arg('LOCALCONTACT'));

            $data = $this->args;
            if (!array_key_exists('FACILITYCODE', $data)) $data['FACILITYCODE'] = '';
            $email->data = $data;

            $recpts = $dispatch_email.', '.$this->arg('EMAILADDRESS');
            if ($this->args['LCEMAIL']) $recpts .= ', '.$this->arg('LCEMAIL');

            $email->send($recpts);

            $this->_output(1);
        }



        function _get_dewar_tracking() {
            if (!$this->has_arg('prop') && !$this->user->can('all_dewars')) $this->_error('No proposal id specified');
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $where = 'AND p.proposalid=:1';
            $args = array($this->arg('DEWARID'), $this->proposalid);

            if ($this->user->can('all_dewars')) {
                $where = '';
                $args = array($this->arg('DEWARID'));
            }

            $dew = $this->db->pq("SELECT d.trackingnumbertosynchrotron,d.trackingnumberfromsynchrotron 
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 $where", $args);

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            $tr = $this->_dewar_tracking($dew);

            $this->_output(array(
              'ORIGIN' => (string)$tr['status']->AWBInfo->ShipmentInfo->OriginServiceArea->Description,
              'DESTINATION' => (string)$tr['status']->AWBInfo->ShipmentInfo->DestinationServiceArea->Description,
              'EVENTS' => $tr['events']
            ));

        }

        function _dewar_tracking($dewar) {
            global $dhl_user, $dhl_pass;

            require_once('includes/class.dhl.php');
            $dhl = new DHL($dhl_user, $dhl_pass);
            if ($dewar['TRACKINGNUMBERFROMSYNCHROTRON']) $status = $dhl->get_tracking_info(array('AWB' => $dewar['TRACKINGNUMBERFROMSYNCHROTRON']));
            else $status = $dhl->get_tracking_info(array('AWB' => (string)($dewar['TRACKINGNUMBERTOSYNCHROTRON'])));

            if ($status->Response->Status) $this->_error($status->Response->Status);
            else {
                if ($status->AWBInfo->Status->ActionStatus != 'success') $this->_error((string)$status->AWBInfo->Status->ActionStatus);
                else {
                    $states = array(
                        'PU' => 'Picked Up',
                        'PL' => 'Processed',
                        'DF' => 'Departed Facility',
                        'AF' => 'Arrived at Facility',
                        'WC' => 'With Courier',
                        'OK' => 'Delivered',
                        'AR' => 'Arrived at Facility',
                        'TR' => 'In Transit'
                    );

                    $events = array();
                    // print_r($status->AWBInfo->ShipmentInfo);
                    $i = 1;
                    foreach ($status->AWBInfo->ShipmentInfo->ShipmentEvent as $e) {
                        $st = (string)$e->ServiceEvent->EventCode;
                        $event = array(
                            'EVENTID' => $i++,
                            'STISO' => (string)$e->Date.'T'.(string)$e->Time,
                            'DATE' => (string)$e->Date.' '.(string)$e->Time,
                            'EVENT' => (string)$e->ServiceEvent->EventCode,
                            'STATE' => $states[$st],
                            'LOCATION' => (string)$e->ServiceArea->Description,
                            'SIGNATORY' => (string)$e->Signatory
                        );

                        array_push($events, $event);
                    }

                    return array('status' => $status, 'events' => $events);
                }
            }
        }

        
        # ------------------------------------------------------------------------
        # List of dewars for a shipment
        function _get_dewars() {
            global $bl_types;
            if (!$this->has_arg('prop') && !$this->user->has('all_dewars')) $this->_error('No proposal id specified');

            $where = 's.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->user->has('all_dewars') && $this->has_arg('all')) {
                $where = '1=1';
                $args = array();
            }

            if ($this->has_arg('bl')) { 
                $where = 'se.beamlinename=:1';
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:2';
                array_push($args, $this->arg('did'));
            } 

            if ($this->has_arg('FACILITYCODE')) { 
                $where .= ' AND d.facilitycode=:2';
                array_push($args, $this->arg('FACILITYCODE'));
            }

            if ($this->has_arg('sid')) { 
                $where .= ' AND d.shippingid=:2';
                array_push($args, $this->arg('sid'));
            }

            if ($this->has_arg('current')) {
                $where .= ' AND (se.startdate > CURRENT_TIMESTAMP)';
            }

            if ($this->has_arg('ty')) {
                if (array_key_exists($this->arg('ty'), $bl_types)) {
                    $bls = implode("', '", $bl_types[$this->arg('ty')]);
                    $where .= " AND se.beamlinename IN ('$bls')";
                }
            }

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(d.code) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(d.facilitycode) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(CONCAT(p.proposalcode, p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }

            $tot = $this->db->pq("SELECT count(d.dewarid) as tot
              FROM dewar d 
              LEFT OUTER JOIN container c ON c.dewarid = d.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession se ON d.firstexperimentid = se.sessionid 
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'd.dewarid DESC';
            if ($this->has_arg('sort_by')) {
                $cols = array('FIRSTEXPERIMENTST' => 'se.startdate');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $dewars = $this->db->paginate("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number) as firstexperiment, r.labcontactid, se.beamlineoperator as localcontact, se.beamlinename, TO_CHAR(se.startdate, 'HH24:MI DD-MM-YYYY') as firstexperimentst, d.firstexperimentid, s.shippingid, s.shippingname, d.facilitycode, count(c.containerid) as ccount, (case when se.visit_number > 0 then (CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number)) else '' end) as exp, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron, s.deliveryagent_agentname
              FROM dewar d 
              LEFT OUTER JOIN container c ON c.dewarid = d.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession se ON d.firstexperimentid = se.sessionid 
              LEFT OUTER JOIN dewarregistry r ON r.facilitycode = d.facilitycode
              WHERE $where 
              GROUP BY CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number), r.labcontactid, se.beamlineoperator, TO_CHAR(se.startdate, 'HH24:MI DD-MM-YYYY'), (case when se.visit_number > 0 then (CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number)) else '' end),s.shippingid, s.shippingname, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron, d.facilitycode, d.firstexperimentid
              ORDER BY $order", $args);
            
            if ($this->has_arg('did')) {
                if (sizeof($dewars)) $this->_output($dewars[0]);
                else $this->_error('No such dewar');
            } else $this->_output(array('total' => $tot, 'data' => $dewars));
            
        }
        
        # ------------------------------------------------------------------------
        # Add a dewar to a shipment
        function _add_dewar() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SHIPPINGID')) $this->_error('No shipping id specified');
            if (!$this->has_arg('CODE')) $this->_error('No dewar name specified');
            
            $ship = $this->db->pq("SELECT s.shippingid 
              FROM shipping s 
              WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('SHIPPINGID')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            
            $to = $this->has_arg('TRACKINGNUMBERTOSYNCHROTRON') ? $this->arg('TRACKINGNUMBERTOSYNCHROTRON') : '';
            $from = $this->has_arg('TRACKINGNUMBERFROMSYNCHROTRON') ? $this->arg('TRACKINGNUMBERFROMSYNCHROTRON') : '';
            $fc = $this->has_arg('FACILITYCODE') ? $this->arg('FACILITYCODE') : '';
            
            $exp = $this->has_arg('FIRSTEXPERIMENTID') ? $this->arg('FIRSTEXPERIMENTID') : null;
            
            $this->db->pq("INSERT INTO dewar (dewarid,code,trackingnumbertosynchrotron,trackingnumberfromsynchrotron,shippingid,bltimestamp,dewarstatus,firstexperimentid,facilitycode) 
              VALUES (s_dewar.nextval,:1,:2,:3,:4,CURRENT_TIMESTAMP,'opened',:5,:6) RETURNING dewarid INTO :id", 
              array($this->arg('CODE'), $to, $from, $this->arg('SHIPPINGID'), $exp, $fc));
            
            $id = $this->db->id();
            
            # Need to generate barcode
            $vis = '';
            if ($exp) {
                $vr = $this->db->pq("SELECT s.beamlinename as bl,s.visit_number as vis FROM blsession s WHERE s.sessionid=:1", array($exp));
                if (sizeof($vr)) $vis = '-'.$vr[0]['VIS'].'-'.$vr[0]['BL'];
            }
            
            $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($this->arg('prop').$vis.'-'.str_pad($id,7,'0',STR_PAD_LEFT), $id));
            
            $this->_output(array('DEWARID' => $id));
        }
        

        
        
        # Update shipment
        function _update_shipment() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT s.shippingid FROM shipping s WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            
            $fields = array('SHIPPINGNAME', 'SAFETYLEVEL', 'COMMENTS', 'DELIVERYAGENT_AGENTNAME', 'DELIVERYAGENT_AGENTCODE', 'DELIVERYAGENT_SHIPPINGDATE', 'DELIVERYAGENT_DELIVERYDATE', 'SENDINGLABCONTACTID', 'RETURNLABCONTACTID');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $fl = ':1';
                    if (in_array($f, array('DELIVERYAGENT_DELIVERYDATE', 'DELIVERYAGENT_SHIPPINGDATE'))) {
                        $fl = "TO_DATE(:1, 'DD-MM-YYYY')"; 
                    }

                    $this->db->pq("UPDATE shipping SET $f=$fl WHERE shippingid=:2", array($this->arg($f), $this->arg('sid')));

                    $lcf = array('SENDINGLABCONTACTID' => 'LCOUT', 'RETURNLABCONTACTID' => 'LCRET');
                    if (array_key_exists($f, $lcf)) {
                        $lc = $this->db->pq('SELECT cardname FROM labcontact WHERE labcontactid=:1', array($this->arg($f)));
                        if (sizeof($lc)) {
                            $this->_output(array($lcf[$f] => $lc[0]['CARDNAME']));
                        }

                    } else $this->_output(array($f => $this->arg($f)));

                }
            }

        }
        
        
        # Update dewar in shipment
        function _update_dewar() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('did')) $this->_error('No dewar id specified');
            
            $dewar = $this->db->pq("SELECT d.dewarid FROM dewar d 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              WHERE s.proposalid = :1 AND d.dewarid = :2", array($this->proposalid,$this->arg('did')));
            
            if (!sizeof($dewar)) $this->_error('No such dewar');
            
            $fields = array('CODE', 'TRACKINGNUMBERTOSYNCHROTRON', 'TRACKINGNUMBERFROMSYNCHROTRON', 'FIRSTEXPERIMENTID', 'FACILITYCODE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE dewar SET $f=:1 WHERE dewarid=:2", array($this->arg($f), $this->arg('did')));

                    if ($f == 'FIRSTEXPERIMENTID') {
                        $visit = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit 
                          FROM blsession s 
                          INNER JOIN proposal p ON p.proposalid = s.proposalid 
                          WHERE s.sessionid=:1", array($this->arg($f)));

                        if (sizeof($visit)) {
                            $this->_output(array($f => $this->arg($f), 'EXP' => $visit[0]['VISIT']));
                        }

                    } else $this->_output(array($f => $this->arg($f)));
                }
            }
        }
        
        
        
        # Update shipping status to sent, email for CL3
        function _send_shipment() {
            global $cl3_email;
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, s.safetylevel, s.shippingid, s.deliveryagent_agentname, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as shippingdate, TO_CHAR(s.deliveryagent_deliverydate, 'DD-MM-YYYY') as deliverydate, s.shippingname, s.comments, c.cardname as lcout FROM shipping s INNER JOIN proposal p ON s.proposalid = p.proposalid LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid WHERE p.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];
            
            $this->db->pq("UPDATE shipping SET shippingstatus='sent to DLS' where shippingid=:1", array($ship['SHIPPINGID']));
            $this->db->pq("UPDATE dewar SET dewarstatus='sent to DLS' where shippingid=:1", array($ship['SHIPPINGID']));
            
            $dewars = $this->db->pq("SELECT d.dewarid, s.visit_number as vn, s.beamlinename as bl, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as startdate 
              FROM dewar d 
              LEFT OUTER JOIN blsession s ON s.sessionid = d.firstexperimentid 
              WHERE d.shippingid=:1", array($ship['SHIPPINGID']));
            foreach ($dewars as $d) {
                $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,arrivaldate) 
                  VALUES (s_dewartransporthistory.nextval,:1,'sent to DLS',CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
                  array($d['DEWARID']));
            }

            # Send email if CL3
            if ($ship['SAFETYLEVEL'] == 'Red') {
                $exps = array();
                foreach ($dewars as $d) {
                    array_push($exps, $ship['PROP'].'-'.$d['VN'].' on '.$d['BL'].' starting '.$d['STARTDATE']);
                }
                $ship['EXPS'] = $exps;
                
                require_once('includes/class.email.php');
                $email = new Email('dewar-redexp', '*** RED safety level shipment sent for '.$ship['PROP'].' ***');
                $email->data = $ship;
                $email->send($cl3_email);
            }
            
            $this->_output(1);
            
        }
        
        
        # Show and accept terms to use diamonds shipping account
        function _get_terms() {
            $this->_output(file_get_contents('/dls_sw/dasc/ispyb2/shipping/terms.html'));
        }
        
        function _accept_terms() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SHIPPINGNAME')) $this->_error('No shipment name specified');
            
            # Register acceptance in db
            // $this->db->pq("INSERT INTO genericdata (genericdataid,parametervaluedate,parametervaluestring,parametercomments) 
              // VALUES (s_genericdata.nextval, SYSDATE, 'terms_accepted', :1)", array($this->arg('prop').','.$this->arg('SHIPPINGNAME').','.$this->user->login));

            $this->db->pq("INSERT INTO couriertermsaccepted (couriertermsacceptedid,proposalid,personid,shippingname,timestamp) 
              VALUES (s_dhltermsaccepted.nextval, :1, :2, :3, CURRENT_TIMESTAMP)", array($this->proposalid, $this->user->personid, $this->arg('SHIPPINGNAME')));
            
            $root = '/dls_sw/dasc/ispyb2/shipping';
            $this->_output(array(file_get_contents($root.'/instructions.html'), file_get_contents($root.'/pin.txt'), file_get_contents($root.'/account.txt')));
        }
        
        
        function _get_all_containers() {
            //$this->db->set_debug(True);
            if (!$this->has_arg('prop') && !$this->has_arg('visit') && !$this->staff) $this->_error('No proposal specified');
            
            $having = '';
            
            if ($this->has_arg('visit')) {
                $join = " INNER JOIN blsession ses ON ses.proposalid = p.proposalid";
                $args = array($this->arg('visit'));
                $where = "CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses.visit_number) LIKE :1";

            } else if ($this->has_arg('all') && $this->staff) {
                $join = '';
                $args = array();
                $where = '1=1';

            } else {
                $join = '';
                $args = array($this->proposalid);
                $where = 'sh.proposalid=:1';
            }


            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'plate') {
                    $where .= " AND c.containertype NOT LIKE 'Puck'";
                } else if ($this->arg('ty') == 'puck') {
                    $where .= " AND c.containertype LIKE 'Puck'";
                } else if ($this->arg('ty') == 'imager') {
                    $where .= " AND c.imagerid IS NOT NULL";
                } else if ($this->arg('ty') == 'todispose') {
                    $where .= " AND c.imagerid IS NOT NULL";
                    $having .= " HAVING (TIMESTAMPDIFF('HOUR', min(ci.bltimestamp), CURRENT_TIMESTAMP)/24) > 42";
                } 
            }

            
            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }
            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }

            if ($this->has_arg('pid')) {
                // $this->db->set_debug(True);
                $where .= ' AND pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
            }
            
            if ($this->has_arg('assigned')) {
                $where .= " AND d.dewarstatus LIKE 'processing' AND c.samplechangerlocation > 0";
            }
                
            if ($this->has_arg('bl')) {
                $where .= " AND c.beamlinelocation LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('unassigned')) {
                $where  .= " AND c.containerid NOT IN (SELECT c.containerid FROM container c INNER JOIN dewar d ON d.dewarid = c.dewarid WHERE d.dewarstatus LIKE 'processing' AND c.samplechangerlocation > 0 AND c.beamlinelocation=:".(sizeof($args)+1).")";
                
                array_push($args, $this->arg('unassigned'));
                $this->args['sort_by'] = 'SHIPPINGID';
                $this->args['order'] = 'desc';
            }

            if ($this->has_arg('imager')) {
                $where .= ' AND c.imagerid IS NOT NULL';
            }


            if ($this->has_arg('iid')) {
                $where .= ' AND c.imagerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('iid'));
            }
                

            $tot = $this->db->pq("SELECT count(distinct c.containerid) as tot 
                FROM container c 
                INNER JOIN dewar d ON d.dewarid = c.dewarid 
                INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = sh.proposalid
                LEFT OUTER JOIN blsample s ON s.containerid = c.containerid 
                LEFT OUTER JOIN crystal cr ON cr.crystalid = s.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                LEFT OUTER JOIN containerinspection ci ON ci.containerid = c.containerid AND ci.state = 'Completed'
                $join 
                WHERE $where
                $having", $args);
            $tot = intval($tot[0]['TOT']);
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(c.code) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(c.barcode) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }
            
            
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'c.bltimestamp DESC';
            

            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'todispose') {
                    $order = 'c.requestedreturn DESC, age DESC';
                } 
            }
            
            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'c.code', 'DEWAR' => 'd.code', 'SHIPMENT' => 'sh.shippingname', 'SAMPLES' => 'count(s.blsampleid)', 'SHIPPINGID' =>'sh.shippingid', 'LASTINSPECTION' => 'max(ci.bltimestamp)', 'INSPECTIONS' => 'count(ci.containerinspectionid)');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            // $this->db->set_debug(True);
            $rows = $this->db->paginate("SELECT round(TIMESTAMPDIFF('HOUR', min(ci.bltimestamp), CURRENT_TIMESTAMP)/24,1) as age, case when count(ci2.containerinspectionid) > 1 then 0 else 1 end as allow_adhoc, sch.name as schedule, c.scheduleid, c.screenid, sc.name as screen, c.imagerid, i.temperature as temperature, i.name as imager, TO_CHAR(max(ci.bltimestamp), 'HH24:MI DD-MM-YYYY') as lastinspection, count(distinct ci.containerinspectionid) as inspections, CONCAT(p.proposalcode, p.proposalnumber) as prop, c.bltimestamp, c.samplechangerlocation, c.beamlinelocation, d.dewarstatus, c.containertype, c.capacity, c.containerstatus, c.containerid, c.code as name, d.code as dewar, sh.shippingname as shipment, d.dewarid, sh.shippingid, count(distinct s.blsampleid) as samples, cq.containerqueueid, cq.createdtimestamp as queuedtimestamp, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses.visit_number) as visit, c.requestedreturn, c.requestedimagerid, i2.name as requestedimager, c.comments
                                  FROM container c INNER JOIN dewar d ON d.dewarid = c.dewarid 
                                  INNER JOIN shipping sh ON sh.shippingid = d.shippingid 
                                  INNER JOIN proposal p ON p.proposalid = sh.proposalid 
                                  LEFT OUTER JOIN blsample s ON s.containerid = c.containerid 
                                  LEFT OUTER JOIN crystal cr ON cr.crystalid = s.crystalid
                                  LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN containerinspection ci ON ci.containerid = c.containerid AND ci.state = 'Completed'
                                  LEFT OUTER JOIN imager i ON i.imagerid = c.imagerid
                                  LEFT OUTER JOIN imager i2 ON i2.imagerid = c.requestedimagerid
                                  LEFT OUTER JOIN screen sc ON sc.screenid = c.screenid
                                  LEFT OUTER JOIN schedule sch ON sch.scheduleid = c.scheduleid
                                  LEFT OUTER JOIN containerinspection ci2 ON ci2.containerid = c.containerid AND ci2.state != 'Completed' AND ci2.manual!=1 AND ci2.schedulecomponentid IS NULL
                                  LEFT OUTER JOIN containerqueue cq ON cq.containerid = c.containerid AND cq.completedtimestamp IS NULL

                                  LEFT OUTER JOIN blsession ses ON c.sessionid = ses.sessionid
                                  $join
                                  WHERE $where
                                  GROUP BY sch.name, c.scheduleid, c.screenid, sc.name, c.imagerid, i.temperature, i.name, CONCAT(p.proposalcode, p.proposalnumber), c.bltimestamp, c.samplechangerlocation, c.beamlinelocation, d.dewarstatus, c.containertype, c.capacity, c.containerstatus, c.containerid, c.code, d.code, sh.shippingname, d.dewarid, sh.shippingid
                                  $having
                                  ORDER BY $order", $args);

            if ($this->has_arg('cid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such container');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                                 ));   
        
        }
        
        

        function _queue_container() {
            if (!$this->has_arg('CONTAINERID')) $this->_error('No container specified');

            $chkc = $this->db->pq("SELECT c.containerid FROM container c 
                INNER JOIN dewar d ON c.dewarid = d.dewarid 
                INNER JOIN shipping s ON s.shippingid = d.shippingid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE c.containerid=:1 AND p.proposalid=:2", array($this->arg('CONTAINERID'), $this->proposalid));
            
            if (!sizeof($chkc)) $this->_error('No such container');


            if ($this->has_arg('UNQUEUE')) {
                $chkq = $this->db->pq("SELECT containerqueueid FROM containerqueue WHERE containerid=:1 AND completedtimestamp IS NULL", array($this->arg('CONTAINERID')));
                if (!sizeof($chkq)) $this->_error('That container is not queued');
                $cqid = $chkq[0]['CONTAINERQUEUEID'];

                $this->db->pq("UPDATE containerqueuesample SET containerqueueid = NULL WHERE containerqueueid=:1", array($cqid));
                $this->db->pq("DELETE FROM containerqueue WHERE containerqueueid=:1", array($cqid));
                $this->_output(new stdClass);

            } else {
                $chkq = $this->db->pq("SELECT containerid FROM containerqueue WHERE containerid=:1 AND completedtimestamp IS NULL", array($this->arg('CONTAINERID')));
                if (sizeof($chkq)) $this->_error('That container is already queued');

                $this->db->pq("INSERT INTO containerqueue (containerid, personid) VALUES (:1, :2)", array($this->arg('CONTAINERID'), $this->user->personid));
                $qid = $this->db->id();

                $samples = $this->db->pq("SELECT ss.blsubsampleid, cqs.containerqueuesampleid FROM blsubsample ss
                  INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
                  INNER JOIN container c ON c.containerid = s.containerid
                  INNER JOIN dewar d ON d.dewarid = c.dewarid
                  INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                  INNER JOIN proposal p ON p.proposalid = sh.proposalid
                  INNER JOIN containerqueuesample cqs ON cqs.blsubsampleid = ss.blsubsampleid
                  WHERE p.proposalid=:1 AND c.containerid=:2 AND cqs.containerqueueid IS NULL", array($this->proposalid, $this->arg('CONTAINERID')));

                foreach ($samples as $s) {
                    $this->db->pq("UPDATE containerqueuesample SET containerqueueid=:1 WHERE containerqueuesampleid=:2", array($qid, $s['CONTAINERQUEUESAMPLEID']));
                }

                $this->_output(array('CONTAINERQUEUEID' => $qid));
            }
        }

        
        # Move Container
        function _move_container() {
            if (!$this->has_arg('cid')) $this->_error('No container specified');
            if (!$this->has_arg('did')) $this->_error('No dewar specified');
            
            $chkd = $this->db->pq("SELECT d.dewarid FROM dewar d INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE d.dewarid=:1 AND p.proposalid=:2", array($this->arg('did'), $this->proposalid));
            $chkc = $this->db->pq("SELECT c.containerid FROM container c INNER JOIN dewar d ON c.dewarid = d.dewarid INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE c.containerid=:1 AND p.proposalid=:2", array($this->arg('cid'), $this->proposalid));
            
            if (sizeof($chkd) && sizeof($chkc)) {
                $this->db->pq("UPDATE container SET dewarid=:1 WHERE containerid=:2", array($this->arg('did'), $this->arg('cid')));
                $this->_output(1);
            }
            
        }
        
        
        # Update Container
        function _update_container() {
            if (!$this->has_arg('cid')) $this->_error('No container specified');
            
            $chkc = $this->db->pq("SELECT c.containerid FROM container c INNER JOIN dewar d ON c.dewarid = d.dewarid INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE c.containerid=:1 AND p.proposalid=:2", array($this->arg('cid'), $this->proposalid));
            
            if (!sizeof($chkc)) $this->_error('No such container');

            $fields = array('NAME' => 'CODE', 'REQUESTEDRETURN' => 'REQUESTEDRETURN', 'REQUESTEDIMAGERID' => 'REQUESTEDIMAGERID', 'COMMENTS' => 'COMMENTS');
            foreach ($fields as $k => $f) {
                if ($this->has_arg($k)) {
                    $this->db->pq("UPDATE container SET $f=:1 WHERE containerid=:2", array($this->arg($k), $this->arg('cid')));
                    $this->_output(array($k => $this->arg($k)));
                }
            }

            if ($this->user->can('disp_cont') && $this->has_arg('DISPOSE')) {
                $this->db->pq("UPDATE container SET imagerid=NULL WHERE containerid=:1", array($this->arg('cid')));
                $this->_output(array('IMAGERID' => null));
            }
        }
        

        
        
        # Add container
        function _add_container() {
            if (!$this->has_arg('NAME')) $this->_error('No container name specified');
            if (!$this->has_arg('CONTAINERTYPE')) $this->_error('No container type specified');
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar id specified');
        
            
            $cap = $this->has_arg('CAPACITY') ? $this->arg('CAPACITY') : 16;
            $sch = $this->has_arg('SCHEDULEID') ? $this->arg('SCHEDULEID') : null;
            $scr = $this->has_arg('SCREENID') ? $this->arg('SCREENID') : null;
            $own = $this->has_arg('PERSONID') ? $this->arg('PERSONID') : null;
            $rid = $this->has_arg('REQUESTEDIMAGERID') ? $this->arg('REQUESTEDIMAGERID') : null;
            $com = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : null;

            $this->db->pq("INSERT INTO container (containerid,dewarid,code,bltimestamp,capacity,containertype,scheduleid,screenid,ownerid,requestedimagerid,comments) 
              VALUES (s_container.nextval,:1,:2,CURRENT_TIMESTAMP,:3,:4,:5,:6,:7,:8,:9) RETURNING containerid INTO :id", 
              array($this->arg('DEWARID'), $this->arg('NAME'), $cap, $this->arg('CONTAINERTYPE'), $sch, $scr, $own, $rid, $com));
                                 
            $cid = $this->db->id();
            
            if ($this->has_arg('SCHEDULEID')) {
                include_once('class.imaging.shared.php');
                $sh = new ImagingShared($this->db);
                $sh->_generate_schedule(array(
                    'CONTAINERID' => $cid,
                    'SCHEDULEID' => $this->arg('SCHEDULEID'),
                ));
            }

            $this->_output(array('CONTAINERID' => $cid));
        }
        
        
        # Cache form temporary data to session
        function _session_cache() {
            $data = array_key_exists('data', $this->request) ? $this->request['data'] : null;
            if (!$this->has_arg('name') || !$data) $this->_error('No key and data specified');

            $this->user->set_cache($this->arg('name'), $data);
            $this->_output(array('data' => $data));
        }
        
        
        function _get_session_cache() {
            if (!$this->has_arg('name')) $this->_error('No key specified');
            $this->_output($this->user->cache($this->arg('name')));
        }
        
        
        # Ajax shipment registration
        function _add_shipment() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'Please select a proposal first');
        
            if (!$this->has_arg('SHIPPINGNAME')) $this->_error('No shipment name specified', 'Please specify a shipment name');
            
            $sd = $this->has_arg('DELIVERYAGENT_SHIPPINGDATE') ? $this->arg('DELIVERYAGENT_SHIPPINGDATE') : '';
            $dd = $this->has_arg('DELIVERYAGENT_DELIVERYDATE') ? $this->arg('DELIVERYAGENT_DELIVERYDATE') : '';
            $com = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : '';
            
            $this->db->pq("INSERT INTO shipping (shippingid, proposalid, shippingname, deliveryagent_agentname, deliveryagent_agentcode, deliveryagent_shippingdate, deliveryagent_deliverydate, bltimestamp, creationdate, comments, sendinglabcontactid, returnlabcontactid, shippingstatus, safetylevel) 
              VALUES (s_shipping.nextval,:1,:2,:3,:4,TO_DATE(:5,'DD-MM-YYYY'), TO_DATE(:6,'DD-MM-YYYY'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,:7,:8,:9,'opened',:10) RETURNING shippingid INTO :id", 
              array($this->proposalid, $this->arg('SHIPPINGNAME'), $this->arg('DELIVERYAGENT_AGENTNAME'), $this->arg('DELIVERYAGENT_AGENTCODE'), $sd, $dd, $com, $this->arg('SENDINGLABCONTACTID'), $this->arg('RETURNLABCONTACTID'), $this->arg('SAFETYLEVEL')));
            
            $sid = $this->db->id();
            
            if ($this->has_arg('DEWARS')) {
                if ($this->arg('DEWARS') > 0) {
                    $exp = $this->has_arg('FIRSTEXPERIMENTID') ? $this->arg('FIRSTEXPERIMENTID') : null;
                    
                    $fcs = $this->arg('FCODES');
                    for ($i = 0; $i < $this->arg('DEWARS'); $i++) {
                        $fc = $i < sizeof($this->arg('FCODES')) ? $fcs[$i] : ''; 
                        $n = $fc ? $fc : ('Dewar'.($i+1));
                        
                        $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus,firstexperimentid,facilitycode) 
                          VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'opened',:3,:4) RETURNING dewarid INTO :id", 
                          array($n, $sid, $exp, $fc));
                        
                        $id = $this->db->id();
                        
                        $vis = '';
                        if ($exp) {
                            $vr = $this->db->pq("SELECT s.beamlinename as bl,s.visit_number as vis FROM blsession s WHERE s.sessionid=:1", array($exp));
                            if (sizeof($vr)) $vis = '-'.$vr[0]['VIS'].'-'.$vr[0]['BL'];
                        }
                        
                        $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($this->arg('prop').$vis.'-'.str_pad($id,7,'0',STR_PAD_LEFT), $id));
                    }
                }
            }
            
            $this->_output(array('SHIPPINGID' => $sid));
        }
        
        
        
        function _get_default_dewar() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            
            $sids = $this->db->pq("SELECT s.sessionid FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1 AND p.proposalid=:2", array($this->arg('visit'), $this->proposalid));
            
            if (!sizeof($sids)) $this->_error('No such visit');
            else $sid = $sids[0]['SESSIONID'];
            
            
            $shids = $this->db->pq("SELECT shippingid FROM shipping WHERE proposalid LIKE :1 AND shippingname LIKE :2", array($this->proposalid, $this->arg('visit').'_Shipment1'));
            
            if (sizeof($shids) > 0) {
                $shid = $shids[0]['SHIPPINGID'];
            } else {
                $this->db->pq("INSERT INTO shipping (shippingid,proposalid,shippingname,bltimestamp,creationdate,shippingstatus) VALUES (s_shipping.nextval,:1,:2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'processing') RETURNING shippingid INTO :id", array($this->proposalid, $this->arg('visit').'_Shipment1'));
                
                $shid = $this->db->id();
                
                $vals = $this->db->pq("INSERT INTO shippinghassession (shippingid,sessionid) VALUES (:1,:2)", array($shid, $sid));
                
            }
            
            $did = -1;
            if ($sid) {
                $dids = $this->db->pq("SELECT dewarid from dewar WHERE shippingid LIKE :1 AND code LIKE :2", array($shid, $this->arg('visit').'_Dewar1'));
                
                if (sizeof($dids) > 0) {
                    $did = $dids[0]['DEWARID'];
                    
                } else {
                    $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus,firstexperimentid) VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'processing',:3) RETURNING dewarid INTO :id", array($this->arg('visit').'_Dewar1', $shid, $sid));
                    
                    $did = $this->db->id();
                }
            }
            
            if ($did == -1) $this->_error('Couldnt create default dewar');
            $this->_output($did);
        }

    
    }

?>