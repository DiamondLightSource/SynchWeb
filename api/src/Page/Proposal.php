<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\UAS;

class Proposal extends Page
{


        public static $arg_list = array(
                              'prop' => '\w+\d+',
                              'value' => '.*',
                              'visit' => '\w+\d+-\d+',
                              'all' => '\d',
                              'year' => '\d\d\d\d',
                              'month' => '\d+',
                              'bl' => '[\w-]+',
                              'ty' => '\w+',
                              'cm' => '\d',
                              'ty' => '\w+',
                              'next' => '\d',
                              'prev' => '\d',
                              'started' => '\d',
        					  'scheduled' => '\d',
                              'current' => '\d',

                              'COMMENTS' => '(\w|\s|-)+',


                              'BLSAMPLEID' => '\d+',
                              'CRYSTALID' => '\d+',
                              'PROTEINID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'DEWARID' => '\d+',
                              'SHIPPINGID' => '\d+',
                              'LABCONTACTID' => '\d+',
                              'DATACOLLECTIONID' => '\d+',

                              // proposal
                              'PROPOSALCODE' => '\w+',
                              'PROPOSALNUMBER' => '\d+',
                              'TITLE' => '(\w|\s|\-|\(|\))+',
                              'PERSONID' => '\d+',
                              'STATE' => '\w+',
                              'EXTERNALID' => '\w+',

                              // visit
                              'PROPOSALID' => '\d+',
                              'STARTDATE' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'ENDDATE' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'BEAMLINENAME' => '[\w-]+',
                              'BEAMLINEOPERATOR' => '(\w|\s|-)+',
                              'SCHEDULED' => '\d',
                              'ARCHIVED' => '\d',
                              'SESSIONTYPE' => '\w+',
                              'BEAMLINESETUPID' => '\d+',
                              'BEAMCALENDARID' => '\d+',

                              // visit has person
                              'SHPKEY' => '\d+\-\d+',
                              'SESSIONID' => '\d+',
                              'ROLE' => '([\w\s-])+',
                              'REMOTE' => '\d',
                               );
        

        public static $dispatch = array(array('(/:prop)', 'get', '_get_proposals'),
                                        array('/', 'post', '_add_proposal'),
                                        array('/:prop', 'patch', '_update_proposal'),

                                        array('/visits(/:visit)', 'get', '_get_visits'),
                                        array('/visits/:visit', 'patch', '_update_visit'),
                                        array('/visits', 'post', '_add_visit'),

                                        array('/visits/users', 'get', '_get_visit_users'),
                                        array('/visits/users', 'post', '_add_visit_user'),
                                        array('/visits/users/:SHPKEY', 'patch', '_update_visit_user'),
                                        array('/visits/users/:SHPKEY', 'delete', '_remove_visit_user'),

                                        array('/calendar', 'get', '_get_beam_calendar'),

                                        array('/bls/:ty', 'get', '_get_beamlines'),
                                        array('/type', 'get', '_get_types'),
                                        array('/lookup', 'post', '_lookup'),

                                        array('/auto', 'get', '_auto_visit'),
                                        array('/auto', 'delete', '_close_auto_visit'),
                            );
        
        
        
        

        function _get_beamlines() {
            global $bl_types;

            if (!$this->has_arg('ty')) $this->_error('No type specified');
            if (!array_key_exists($this->arg('ty'), $bl_types)) $this->_error('No such proposal type');

            $this->_output($bl_types[$this->arg('ty')]);
        }


        function _get_types() {
            global $bl_types;

            $bls = implode("', '", $bl_types[$this->ty]);
            $rows = $this->db->pq("SELECT distinct p.proposalcode 
                FROM proposal p
                INNER JOIN blsession s ON s.proposalid = p.proposalid
                WHERE s.beamlinename IN ('$bls')");
            $this->_output($rows);
        }


        # ------------------------------------------------------------------------
        # List proposals for current user
        function _get_proposals($id=null) {
            global $prop_types, $bl_types;

            $args = array();
            $where = "WHERE 1=1";

            if ($id) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber) LIKE :".(sizeof($args)+1);
                array_push($args, $id);
            }

            if ($this->staff) {
                if (!$this->user->has('super_admin')) {
                    $bls = array();
                    foreach ($this->user->perms as $p) {
                        if (strpos($p, '_admin')) {
                            $parts = explode('_', $p);
                            $ty = $parts[0];
                            if (array_key_exists($ty, $bl_types)) $bls = array_merge($bls, $bl_types[$ty]);
                        }
                    }

                    $where .= " AND s.beamlinename in ('".implode("','", $bls)."')";
                }
            } else {
                $where = " INNER JOIN session_has_person shp ON shp.sessionid = s.sessionid  ".$where;
                $where .= " AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(s.beamlinename) LIKE lower(:".$st.") OR lower(p.title) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."),'%')) OR lower(CONCAT(p.proposalcode, p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }

            $tot = $this->db->pq("SELECT count(distinct p.proposalid) as tot FROM proposal p 
                LEFT OUTER JOIN blsession s ON p.proposalid = s.proposalid $where", $args);
            $tot = intval($tot[0]['TOT']);
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'p.proposalid DESC';
            
            if ($this->has_arg('sort_by')) {
                $cols = array('ST' => 'p.bltimestamp', 'PROPOSALCODE' => 'p.proposalcode', 'PROPOSALNUMBER' => 'p.proposalnumber', 'VCOUNT' => 'vcount', 'TITLE' => 'lower(p.title)');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT CONCAT(p.proposalcode,p.proposalnumber) as proposal, p.title, TO_CHAR(p.bltimestamp, 'DD-MM-YYYY') as st, p.proposalcode, p.proposalnumber, count(s.sessionid) as vcount, p.proposalid, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname, pe.personid, p.state, CONCAT(p.proposalcode,p.proposalnumber) as prop
                    FROM proposal p 
                    LEFT OUTER JOIN blsession s ON p.proposalid = s.proposalid 
                    LEFT OUTER JOIN person pe ON pe.personid = p.personid
                    $where 
                    GROUP BY TO_CHAR(p.bltimestamp, 'DD-MM-YYYY'), p.bltimestamp, p.proposalcode, p.proposalnumber, p.title, p.proposalid ORDER BY $order", $args);
            

            foreach ($rows as &$r) {
                // See if proposal code matches list in config
                $found = False;
                $ty = null;
                foreach ($prop_types as $pty) {
                    if ($r['PROPOSALCODE'] == $pty) {
                        $ty = $pty;
                        $found = True;
                    }
                }
                
                // Proposal code didnt match, work out what beamline the visits are on
                if (!$found) {
                    $bls = $this->db->pq("SELECT s.beamlinename FROM blsession s WHERE s.proposalid=:1", array($r['PROPOSALID']));
                    
                    if (sizeof($bls)) {
                        foreach ($bls as $bl) {
                            $b = $bl['BEAMLINENAME'];
                            foreach ($bl_types as $tty => $bls) {
                                if (in_array($b, $bls)) {
                                    $ty = $tty;
                                    break 2;
                                }
                            }
                        }
                    }
                }
                
                if (!$ty) $ty = 'gen';
                $r['TYPE'] = $ty;
                
            }
            
            if ($id) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such proposal');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));
        }
        


        # ------------------------------------------------------------------------
        # Add a proposal
        function _add_proposal() {
            if (!$this->user->can('manage_proposal')) $this->_error('No access');

            if (!$this->has_arg('PROPOSALCODE')) $this->_error('No proposal code specified');
            if (!$this->has_arg('PROPOSALNUMBER')) $this->_error('No proposalnumber specified');
            if (!$this->has_arg('TITLE')) $this->_error('No title specified');
            if (!$this->has_arg('PERSONID')) $this->_error('No PI specified');
        
            $this->db->pq("INSERT INTO proposal (personid, proposalcode, proposalnumber, title, state) 
                VALUES (:1, :2, :3, :4, 'Open')", 
                array($this->arg('PERSONID'), $this->arg('PROPOSALCODE'), $this->arg('PROPOSALNUMBER'), $this->arg('TITLE')));

            $this->_output(array(
                'PROPOSALID' => $this->db->id(), 
                'PROPOSAL' => $this->arg('PROPOSALCODE').$this->arg('PROPOSALNUMBER')
            ));
        }


        # ------------------------------------------------------------------------
        # Update a proposal
        function _update_proposal() {
            if (!$this->user->can('manage_proposal')) $this->_error('No access');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $prop = $this->db->pq("SELECT p.proposalid FROM proposal p
                WHERE CONCAT(p.proposalcode, p.proposalnumber) LIKE :1", array($this->arg('prop')));
            
            if (!sizeof($prop)) $this->_error('No such proposal');
            
            foreach (array('PROPOSALCODE', 'PROPOSALNUMBER', 'TITLE', 'PERSONID', 'STATE', 'EXTERNALID') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE proposal SET $f=:1 WHERE proposalid=:2", array($this->arg($f), $prop[0]['PROPOSALID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }
    

        # ------------------------------------------------------------------------
        # Get visits for a proposal
        function _get_visits($visit=null, $output=true) {
            global $bl_types, $mx_beamlines;

            if ($this->has_arg('current')) {
                $this->_current_visits();
                return;
            }
            
            // if (!$this->staff && !$this->has_arg('prop')) $this->_error('No proposal specified');
            
            if ($this->has_arg('all')) {
                $args = array();
                $where = 'WHERE 1=1';
                // 'All' is used for the main summary view (Next, Last, Commissioning)
                // Ignore session zero for this summary view - they should be included if a proposal is selected
                $where .= " AND s.visit_number > 0";                
            } else {
                $props = $this->db->pq('SELECT proposalid as id FROM proposal WHERE CONCAT(proposalcode, proposalnumber) LIKE :1', array($this->arg('prop')));
                if (!sizeof($props)) $this->_error('No such proposal');
                else $p = $props[0]['ID'];

                $args = array($p);
                $where = 'WHERE s.proposalid = :1';
            }
            
            if ($this->has_arg('year')) {
                $where .= " AND TO_CHAR(s.startdate, 'YYYY') = :".(sizeof($args)+1);
                array_push($args, $this->arg('year'));
            }
                
            if ($this->has_arg('month')) {
                $where .= " AND TO_CHAR(s.startdate, 'MM') = :".(sizeof($args)+1);
                array_push($args, $this->arg('month'));
            }
            
            if ($this->has_arg('prev')) {
                $where .= " AND s.enddate < SYSDATE";
            }

            if ($this->has_arg('started')) {
            	$where .= " AND s.startdate < SYSDATE";
            }
            
            if ($this->has_arg('next')) {
                $where .= " AND s.enddate > SYSDATE AND TO_CHAR(s.startdate,'YYYY') > 2009";
                $this->args['order'] = 'asc';
                $this->args['sort_by'] = 'ST';
            }
            
            if ($this->has_arg('bl')) {
                $where .= " AND s.beamlinename = :".(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('cm')) {
                $where .= " AND p.proposalcode LIKE 'cm' AND s.startdate <= SYSDATE";
            }
            
            if ($this->has_arg('ty')) {
                if (array_key_exists($this->arg('ty'), $bl_types)) {
                    $bls = implode("', '", $bl_types[$this->arg('ty')]);
                    $where .= " AND s.beamlinename IN ('$bls')";
                }
            }

            if ($this->has_arg('s')) {
                $where .= " AND s.visit_number LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('s'));
            }

            if ($this->has_arg('scheduled')) {
                $where .= " AND s.scheduled=1";
            }
            
            
            if ($visit) {
                $where .= " AND CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $visit);
            }
            
            
            if (!$this->staff) {
                $where .= " AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }
            
            $tot = $this->db->pq("SELECT count(distinct s.sessionid) as tot 
                FROM blsession s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                LEFT OUTER JOIN session_has_person shp ON shp.sessionid = s.sessionid
                $where", $args);
            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 's.startdate DESC';
            
            if ($this->has_arg('sort_by')) {
                $cols = array('ST' => 's.startdate', 'EN' => 's.enddate', 'VIS' => 's.visit_number', 'BL' => 's.beamlinename', 'LC' => 's.beamlineoperator', 'COMMENT' =>'s.comments');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }

            $rows = $this->db->paginate("
                SELECT CURRENT_TIMESTAMP BETWEEN s.startdate AND s.enddate        AS active,
                    CURRENT_TIMESTAMP BETWEEN
                    DATE_SUB(s.startdate, INTERVAL 20 MINUTE) AND
                    DATE_ADD(s.enddate, INTERVAL 20 MINUTE)                       AS cams,
                    CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) AS visit,
                    DATE_FORMAT(s.startdate, '%H:%i %d-%m-%Y')                    AS st,
                    DATE_FORMAT(s.enddate, '%H:%i %d-%m-%Y')                      AS en,
                    DATE_FORMAT(s.startdate, '%Y-%m-%dT%H:%i:%s')                 AS stiso,
                    DATE_FORMAT(s.enddate, '%Y-%m-%dT%H:%i:%s')                   AS eniso,
                    s.sessionid,
                    s.visit_number                                                AS vis,
                    s.beamlinename                                                AS bl,
                    s.beamlineoperator                                            AS lc,
                    s.comments,
                    s.scheduled,
                    st.typename                                                   AS sessiontype,
                    DATE_FORMAT(s.startdate, '%H:%i %d-%m-%Y')                    AS startdate,
                    DATE_FORMAT(s.enddate, '%H:%i %d-%m-%Y')                      AS enddate,
                    s.beamlinename,
                    s.beamlineoperator,
                    s.archived,
                    bls.setupdate                                                 AS beamlinesetup,
                    s.beamlinesetupid,
                    bc.run                                                        AS beamcalendar,
                    s.beamcalendarid,
                    CONCAT(p.proposalcode, p.proposalnumber)                      AS proposal,
                    COUNT(shp.personid)                                           AS persons
                FROM BLSession s
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    LEFT OUTER JOIN sessiontype st ON st.sessionid = s.sessionid
                    LEFT OUTER JOIN session_has_person shp ON shp.sessionid = s.sessionid
                    LEFT OUTER JOIN beamlinesetup bls on bls.beamlinesetupid = s.beamlinesetupid
                    LEFT OUTER JOIN beamcalendar bc ON bc.beamcalendarid = s.beamcalendarid
                $where
                GROUP BY s.sessionid
                ORDER BY $order", $args);

            $ids = array();
            $wcs = array();
            foreach ($rows as $r) {
                array_push($ids, $r['SESSIONID']);
                array_push($wcs, 'dcg.sessionid=:'.sizeof($ids));
            }
            
            $dcs = array();
            if (sizeof($ids)) {
                $where = implode(' OR ', $wcs);
                $tdcs = $this->db->pq("SELECT count(dc.datacollectionid) as c, dcg.sessionid 
                    FROM datacollection dc
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    WHERE $where GROUP BY dcg.sessionid", $ids);
                foreach($tdcs as $t) $dcs[$t['SESSIONID']] = $t['C'];
            }
            

            foreach ($rows as &$r) {
                $dc = array_key_exists($r['SESSIONID'], $dcs) ? $dcs[$r['SESSIONID']] : 0;
                $r['COMMENT'] = $r['COMMENTS'];
                $r['DCCOUNT'] = $dc;
                
                $r['TYPE'] = null;
                foreach ($bl_types as $tty => $bls) {
                    if (in_array($r['BL'], $bls)) {
                        $r['TYPE'] = $tty;
                        break;
                    }
                }
                if (!$r['TYPE']) $r['TYPE'] = 'gen';
            }
            
            if ($output) {
                if ($visit) {
                    if (sizeof($rows))$this->_output($rows[0]);
                    else $this->_error('No such visit');
                } else $this->_output(array('total' => $tot,
                                     'data' => $rows,
                               ));
            } else return $rows;
        }
        

        # ------------------------------------------------------------------------
        # Get current visits
        function _current_visits() {
            global $bl_types;
            unset($this->args['current']);

            if (!array_key_exists($this->ty, $bl_types)) $this->_error('No such proposal type');

            $beamlines = $bl_types[$this->ty];

            $this->args['per_page'] = 1;
            $this->args['page'] = 1;
            $this->args['all'] = 1;

            $rows = array();
            foreach (array('next', 'prev', 'cm') as $t) {
                unset($this->args['order']);
                unset($this->args['sort_by']);
                foreach (array('next', 'prev', 'cm') as $r) unset($this->args[$r]); 
                $this->args[$t] = True;
                if ($t == 'cm') unset($this->args['scheduled']);
                else $this->args['scheduled'] = 1;

                foreach ($beamlines as $bl) {
                    $this->args['bl'] = $bl;
                    $vis = $this->_get_visits(null, False);

                    if (sizeof($vis)) {
                        $vis[0]['VISIT-TYPE'] = $vis[0]['VISIT'].'-'.$t;
                        $vis[0]['type'] = $t;
                        array_push($rows, $vis[0]);
                    }
                }
            }

            $this->_output(array('total' => sizeof($rows), 'data' => $rows));
        }


        # ------------------------------------------------------------------------
        # Update visit
        function _update_visit() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $vis = $this->db->pq("SELECT s.sessionid, st.sessiontypeid, st.typename from blsession s
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                LEFT OUTER JOIN sessiontype st on st.sessionid = s.sessionid
                WHERE p.proposalid = :1 AND CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :2", array($this->proposalid, $this->arg('visit')));
            
            if (!sizeof($vis)) $this->_error('No such visit');
            $vis = $vis[0];
            
            $fields = array('COMMENTS');
            if ($this->user->can('manage_visits')) {
                $fields = array_merge($fields, array('STARTDATE', 'ENDDATE', 'BEAMLINENAME', 'BEAMLINEOPERATOR', 'SCHEDULED', 'ARCHIVED', 'BEAMLINESETUPID', 'BEAMCALENDARID'));
            }
            foreach ($fields as $f) {
                $fl = in_array($f, array('STARTTIME', 'ENDTIME')) ? "TO_DATE(:1, 'DD-MM-YYYY HH24:MI')" : ':1';
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsession set $f=$fl where sessionid=:2", array($this->arg($f), $vis['SESSIONID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($this->user->can('manage_visits')) {
                if ($this->has_arg('SESSIONTYPE')) {
                    // Does this session already have a session type recorded?
                    if ($vis['SESSIONTYPEID']) {
                        // If so update the session type only if it's different (case sensitive check currently)
                        if (strcmp($vis['TYPENAME'], $this->arg('SESSIONTYPE')) !== 0) {
                            $this->db->pq("UPDATE sessiontype SET typename=:1 WHERE sessiontypeid=:2", array($this->arg('SESSIONTYPE'), $vis['SESSIONTYPEID']));
                        }
                    } else {
                        $this->db->pq("INSERT INTO sessiontype (sessionid, typename) VALUES (:1, :2)", array($vis['SESSIONID'], $this->arg('SESSIONTYPE')));
                    }

                    $this->_output(array('SESSIONTYPE' => $this->arg('SESSIONTYPE')));
                }
            }
        }


        # ------------------------------------------------------------------------
        # Add visit
        function _add_visit() {
            if (!$this->user->can('manage_visits')) $this->_error('No access');

            if (!$this->has_arg('PROPOSALID')) $this->_error('No proposal specified');
            if (!$this->has_arg('STARTDATE')) $this->_error('No start date specified');
            if (!$this->has_arg('ENDDATE')) $this->_error('No end date specified');
            if (!$this->has_arg('BEAMLINENAME')) $this->_error('No beamline specified');
            if (!$this->has_arg('BEAMLINEOPERATOR')) $this->_error('No beamline operator specified');

            $sch = $this->has_arg('SCHEDULED') ? $this->arg('SCHEDULED') : 1;
            $arc = $this->has_arg('ARCHIVED') ? $this->arg('ARCHIVED') : 0;
            $extid = $this->has_arg('EXTERNALID') ? $this->arg('EXTERNALID') : null;
            $blsid = $this->has_arg('BEAMLINESETUPID') ? $this->arg('BEAMLINESETUPID') : null;
            $calid = $this->has_arg('BEAMCALENDARID') ? $this->arg('BEAMCALENDARID') : null;

            $max = $this->db->pq("SELECT MAX(visit_number) as max_visit FROM blsession WHERE proposalid=:1", array($this->arg('PROPOSALID')));
            $vis = $max[0]['MAX_VISIT'] + 1;

            $this->db->pq("INSERT INTO blsession (proposalid, startdate, enddate, beamlinename, beamlineoperator, scheduled, visit_number, externalid, archived, beamlinesetupid, beamcalendarid) 
                VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY HH24:MI'), TO_DATE(:3, 'DD-MM-YYYY HH24:MI'), :4, :5, :6, :7, :8, :9, :10, :11)", 
                array($this->arg('PROPOSALID'), $this->arg('STARTDATE'), $this->arg('ENDDATE'), $this->arg('BEAMLINENAME'), $this->arg('BEAMLINEOPERATOR'), $sch, $vis, $extid, $arc, $blsid, $calid));

            $id = $this->db->id();

            $visit = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) as visit
                FROM blsession s
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE s.sessionid = :1", array($id));

            $this->_output(array(
                'BLSESSIONID' => $id,
                'VISIT' => $visit[0]['VISIT'],
            ));
        }


        # ------------------------------------------------------------------------
        # Add user to a visit
        function _add_visit_user() {
            if (!$this->user->can('manage_vusers')) $this->_error('No access');
            if (!$this->has_arg('PERSONID')) $this->_error('No person specified');
            if (!$this->has_arg('SESSIONID')) $this->_error('No visit specified');

            $user = $this->db->pq("SELECT personid FROM person where personid=:1", array($this->arg('PERSONID')));
            if (!sizeof($user)) $this->_error('The specified person doesnt exist');

            $visit = $this->db->pq("SELECT sessionid FROM blsession WHERE sessionid=:1", array($this->arg('SESSIONID')));
            if (!sizeof($user)) $this->_error('The specified visit doesnt exist');

            $chk = $this->db->pq("SELECT shp.role
                FROM session_has_person shp 
                WHERE sessionid=:1 and personid=:2", array($this->arg('SESSIONID'), $this->arg('PERSONID')));

            if (sizeof($chk)) {
                $this->_error('That user is already registered on the specified visit');
            }

            $role = $this->has_arg("ROLE") ? $this->arg("ROLE") : 'Team Member';
            $remote = $this->has_arg("REMOTE") ? $this->arg("REMOTE") : 0;

            $this->db->pq("INSERT INTO session_has_person (sessionid, personid, role, remote) 
                VALUES (:1, :2, :3, :4)", array($this->arg("SESSIONID"), $this->arg("PERSONID"), $role, $remote));

            $this->_output(array(
                'SHPKEY' => $this->arg("SESSIONID").'-'.$this->arg("PERSONID"),
            ));
        }


        # ------------------------------------------------------------------------
        # Get visit users
        #  duplication from class.users.php :(
        function _get_visit_users() {
            if (!$this->user->can('manage_vusers')) $this->_error('No access');

            $where = '1=1';
            $args = array();

            if ($this->has_arg('SHPKEY')) {
                list($sessionid, $personid) = split('-', $this->arg('SHPKEY'));
                $where .= " shp.sessionid=:1 AND shp.personid=:2";
                array_push($args, $sessionid);
                array_push($args, $personid);
            }

            if ($this->has_arg('visit')) {
                $where .= " AND CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1";
                array_push($args, $this->arg('visit'));
            }

            $tot = $this->db->pq("SELECT count(shp.personid) as tot
              FROM session_has_person shp
              INNER JOIN blsession s ON s.sessionid = shp.sessionid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('PERSONID' => 'shp.personid', 'SESSIONID' => 'shp.sessionid'),
                'shp.personid DESC'
            );

            $rows = $this->db->paginate("SELECT shp.personid, shp.sessionid, shp.role, shp.remote, CONCAT(shp.sessionid, '-', pe.personid) as shpkey, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname
              FROM session_has_person shp
              INNER JOIN person pe ON pe.personid = shp.personid
              INNER JOIN blsession s ON s.sessionid = shp.sessionid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE $where
            ", $args);

            if ($this->has_arg('SHPKEY')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such person on that session');

            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }

        # ------------------------------------------------------------------------
        # Update a user on a visit
        function _update_visit_user() {
            if (!$this->user->can('manage_vusers')) $this->_error('No access');
            list($sessionid, $personid) = split('-', $this->arg('SHPKEY'));

            $chk = $this->db->pq("SELECT personid, sessionid FROM session_has_person WHERE sessionid=:1 AND personid=:2", array($sessionid, $personid));
            if (!sizeof($chk)) $this->_error('The specified user is not registered on that visit');

            $fields = array('ROLE', 'REMOTE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE session_has_person set $f=:1 where sessionid=:2 and personid=:3", array($this->arg($f), $sessionid, $personid));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }


        # ------------------------------------------------------------------------
        # Remove user from a visit
        function _remove_visit_user() {
            if (!$this->user->can('manage_vusers')) $this->_error('No access');
            list($sessionid, $personid) = split('-', $this->arg('SHPKEY'));

            $chk = $this->db->pq("SELECT personid FROM session_has_person WHERE sessionid=:1 AND personid=:2", array($sessionid, $personid));
            if (!sizeof($chk)) $this->_error('The specified user is not registered on that visit');

            $this->db->pq("DELETE FROM session_has_person 
                WHERE sessionid=:1 and personid=:2", array($sessionid, $personid));

            $this->_output(1);
        }


        # ------------------------------------------------------------------------
        # Get beam calendar
        function _get_beam_calendar() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('BEAMCALENDARID')) {
                $where .= ' AND bc.beamcalendarid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('BEAMCALENDARID'));
            }

            if ($this->has_arg('STARTDATE')) {
                $where .= ' AND bc.startdate >= TO_DATE(:'.(sizeof($args)+1)+')';
                array_push($args, $this->arg('STARTDATE'));
            }

            if ($this->has_arg('ENDDATE')) {
                $where .= ' AND bc.enddate <= TO_DATE(:'.(sizeof($args)+1)+')';
                array_push($args, $this->arg('ENDDATE'));
            }

            $tot = $this->db->pq("SELECT count(bc.beamcalendarid) as tot
              FROM beamcalendar bc
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('BEAMCALENDARID' => 'bc.beamcalendarid'),
                'bls.beamlinesetupid DESC'
            );


            $rows = $this->db->paginate("SELECT bc.beamcalendarid, bc.run, TO_CHAR(bc.startdate, 'DD-MM-YYYY') as startdate, TO_CHAR(bc.enddate, 'DD-MM-YYYY') as enddate, count(s.sessionid) as sessions
              FROM beamcalendar bc
              LEFT OUTER JOIN blsession s ON s.beamcalendarid = bc.beamcalendarid
              WHERE $where
              GROUP BY bc.beamcalendarid
            ", $args);

            if ($this->has_arg('BEAMCALENDARID')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such beam calendar');

            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }

        # ------------------------------------------------------------------------
        # Lookup visit from container, dewar, sample, etc, ...
        function _lookup() {
            global $bl_types;

            $fields = array(
                'BLSAMPLEID' => 's.blsampleid',
                'CRYSTALID' => 'cr.crystalid',
                'PROTEINID' => 'pr.proteinid',
                'CONTAINERID' => 'c.containerid',
                'DEWARID' => 'd.dewarid',
                'SHIPPINGID' => 'sh.shippingid',
                'LABCONTACTID' => 'lc.labcontactid',
                'DATACOLLECTIONID' => 'dc.datacollectionid',
            );

            $field = null;
            foreach ($fields as $f => $v) {
                if ($this->has_arg($f)) {
                    $field = $f;
                    break;
                }
            }

            if (!$field) $this->_error('No id specified');

            $where = "WHERE 1=1";
            $args = array();


            if ($this->staff) {
                if (!$this->user->has('super_admin')) {
                    $bls = array();
                    foreach ($this->user->perms as $p) {
                        if (strpos($p, '_admin')) {
                            $parts = explode('_', $p);
                            $ty = $parts[0];
                            if (array_key_exists($ty, $bl_types)) $bls = array_merge($bls, $bl_types[$ty]);
                        }
                    }

                    $where .= " AND ses.beamlinename in ('".implode("','", $bls)."')";
                }
            } else {
                $where = " INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid  ".$where;
                $where .= " AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }

            $where .= ' AND '.$fields[$field].'=:'.(sizeof($args)+1);
            array_push($args, $this->arg($field));

            // $this->db->set_debug(True);
            $rows = $this->db->pq("SELECT distinct CONCAT(p.proposalcode, p.proposalnumber) as prop
                FROM proposal p
                LEFT OUTER JOIN blsession ses ON ses.proposalid = p.proposalid
                LEFT OUTER JOIN datacollectiongroup dcg ON dcg.sessionid = ses.sessionid
                LEFT OUTER JOIN datacollection dc ON dc.datacollectiongroupid = dcg.datacollectiongroupid

                LEFT OUTER JOIN protein pr ON pr.proposalid = p.proposalid
                LEFT OUTER JOIN crystal cr ON cr.proteinid = pr.proteinid
                LEFT OUTER JOIN blsample s ON s.crystalid = cr.crystalid

                LEFT OUTER JOIN shipping sh ON sh.proposalid = p.proposalid
                LEFT OUTER JOIN dewar d ON d.shippingid = sh.shippingid
                LEFT OUTER JOIN container c ON c.dewarid = d.dewarid

                LEFT OUTER JOIN labcontact lc ON lc.proposalid = p.proposalid
                $where
            ", $args);


            if (sizeof($rows)) {
                $this->_output($rows[0]);
            } else {
                $this->_error('No such proposal');
            }

        }



        # ------------------------------------------------------------------------
        # Create visit for autocollect
        /**
         * Controller method for auto collect.
         * This function will be called when pucks are scanned into a sample changer.
         * First time a puck is scanned we create a new session.
         * If there is already an active Auto Collect session for the beamline then add the container to the existing session.
         * Containers are added to the autocollect session if they are on the same shipment to provide some sensible aggregation.
         * Access is restricted to ip addresses within an "auto" list from config.php and certain beamlines 'auto_bls'.
         *
         */
        function _auto_visit() {
            global $auto, $auto_bls, $auto_exp_hazard, $auto_sample_hazard, $auto_user, $auto_pass, $auto_session_type;

            if (!(in_array($_SERVER["REMOTE_ADDR"], $auto))) $this->_error('You do not have access to that resource');

            if (!$this->has_arg('CONTAINERID')) $this->_error('No container specified');
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');
            if (!in_array($this->arg('bl'), $auto_bls)) $this->_error('That beamline cannot create autocollect visits');

            // Get container information - note that if the container has no owner - we use the proposal person.
            // A person record is required for UAS so we can set investigators. UAS needs one 'TEAM_LEADER' and others as 'DATA_ACCESS'
            $cont = $this->db->pq("SELECT c.sessionid, p.proposalid, ses.visit_number, CONCAT(p.proposalcode, p.proposalnumber) as proposal, c.containerid, HEX(p.externalid) as externalid, IFNULL(HEX(pe.externalid), HEX(pe2.externalid)) as pexternalid, s.shippingid
                FROM proposal p
                INNER JOIN shipping s ON s.proposalid = p.proposalid
                INNER JOIN dewar d ON d.shippingid = s.shippingid
                INNER JOIN container c ON c.dewarid = d.dewarid
                LEFT OUTER JOIN blsession ses ON c.sessionid = ses.sessionid
                LEFT OUTER JOIN person pe ON pe.personid = c.ownerid
                LEFT OUTER JOIN person pe2 ON pe2.personid = p.personid
                WHERE c.containerid=:1", array($this->arg('CONTAINERID')));

            if (!sizeof($cont)) $this->_error('No such container', 404);

            // Store container info for convenience
            $cont = $cont[0];

            if (!$cont['PEXTERNALID']) {
                $this->_error('That container does not have an owner');
            }
            if ($cont['SESSIONID']) {
                error_log('That container already has a session ' . $cont['SESSIONID']);

                $this->_output(array('VISIT' => $cont['PROPOSAL'].'-'.$cont['VISIT_NUMBER']));
            } else {
                // Is there an existing auto collect session for this beamline with containers on the same shipment?
                // If so we add this container to the existing Auto Collect session.
                // Proposal reference is used to capture the visit string to return later
                $auto_sessions = $this->db->pq("SELECT ses.sessionid, HEX(ses.externalid) as sexternalid, ses.startDate, ses.endDate, CONCAT(p.proposalcode, p.proposalnumber, '-', ses.visit_number) as visit
                    FROM Container c
                    INNER JOIN Dewar d ON d.dewarId = c.dewarId
                    INNER JOIN Shipping sh ON sh.shippingId = d.shippingId
                    INNER JOIN BLSession ses ON ses.sessionId = c.sessionId
                    INNER JOIN SessionType st ON st.sessionId = ses.sessionId
                    INNER JOIN Proposal p ON p.proposalId = sh.proposalId
                    WHERE ses.beamlinename=:1
                    AND st.typename='Auto Collect'
                    AND sh.shippingid = :2
                    AND (CURRENT_TIMESTAMP BETWEEN ses.startDate AND ses.endDate)", array($this->arg('bl'), $cont['SHIPPINGID']));

                if(!sizeof($auto_sessions)) {
                    // Create new session - passing containerID, proposalID and UAS proposal ID
                    $sessionNumber = $this->_create_new_autocollect_session($cont['CONTAINERID'], $cont['PROPOSALID'], $cont['EXTERNALID'] );

                    if ($sessionNumber > 0) {
                        $result = array('VISIT' => $cont['PROPOSAL'].'-'.$sessionNumber, 'CONTAINERS' => array($cont['CONTAINERID']));

                        $this->_output($result);
                    } else {
                        $this->_error('Something went wrong creating a session for that container ' . $cont['CONTAINERID']);                        
                    }
                } else {
                    // Update existing session - passing Session ID, UAS Session ID and Container ID
                    $auto_session = $auto_sessions[0];

                    $result = $this->_update_autocollect_session($auto_session['SESSIONID'], $auto_session['SEXTERNALID'], $cont['CONTAINERID']);

                    if ($result) {
                        // Add visit to return value...
                        // Just returning number of samples and investigators along with container list
                        $resp['VISIT'] = $auto_session['VISIT'];
                        $resp['CONTAINERS'] = $result['CONTAINERS'];
                        $this->_output($resp);
                    } else {
                        $this->_error('Something went wrong adding container ' . $cont['CONTAINERID'] . ' to session ' . $auto_session['SESSIONID']);                        
                    }
                }
            }
        }
        /** 
         * Create new auto collect session
         * This function needs to find the samples and investigators for this container
         * 
         * @param array $containerId ISPyB ContainerID 
         * @param array $proposalId ISPyB ProposalID
         * @param array $uasProposalId UAS ProposalID (from Proposal.externalId)
         * @return integer Returns session number generated from UAS
         */
        function _create_new_autocollect_session($containerId, $proposalId, $uasProposalId) {
            global $auto_exp_hazard, $auto_sample_hazard, $auto_user, $auto_pass, $auto_session_type;
            // Return session number generated from UAS ( will be > 0 if OK)
            $sessionNumber = 0;
            // So now we need to create a new session in UAS and update ISPyB
            // Get Samples info from current (new) container
            $sampleInfo = $this->_get_valid_samples_from_containers(array($containerId));

            if ($sampleInfo['INVESTIGATORS'] && $sampleInfo['SAMPLES']) {
                // Create new session.....
                $data = array(
                    'proposalId' => strtoupper($uasProposalId),
                    'sampleIds' => array_values($sampleInfo['SAMPLES']),
                    'startAt' => date('Y-m-d\TH:i:s.000\Z'),
                    'facility' => strtoupper($this->arg('bl')),
                    'investigators' => array_values($sampleInfo['INVESTIGATORS']),
                    'experimentalMethods' => array(array(
                        'state' => 'Submitted',
                        'experimentHazard' => array('description' => $auto_exp_hazard),
                        'preparationHazard' => array('description' => $auto_sample_hazard)
                    )),
                    'eraState' => 'Submitted'
                );
                // Create the session in UAS with our special autocollect user
                $uas = new UAS($auto_user, $auto_pass);
                $sess = $uas->create_session($data);

                if ($sess['code'] == 200 && $sess['resp']) {
                    // Set the initial end Date as two days from now - this will be updated by propagation from UAS later.
                    // Also the session endDate will be set once the samples are unloaded by calling the close_session endpoint.
                    $this->db->pq("INSERT INTO blsession (proposalid, visit_number, externalid, beamlinename, beamlinesetupid, startDate, endDate) 
                        VALUES (:1,:2,UNHEX(:3),:4,1, CURRENT_TIMESTAMP, TIMESTAMPADD(DAY,2,CURRENT_TIMESTAMP))",
                        array($proposalId, $sess['resp']->sessionNumber, $sess['resp']->id, $this->arg('bl')));

                    $sessionId = $this->db->id();

                    $this->db->pq("INSERT INTO sessiontype (sessionid, typename) VALUES (:1, :2)", array($sessionId, $auto_session_type));
                    $this->db->pq("UPDATE container SET sessionid=:1, bltimestamp=CURRENT_TIMESTAMP WHERE containerid=:2", array($sessionId, $containerId));

                    $sessionNumber = $sess['resp']->sessionNumber;

                } else {
                    error_log(print_r(array('error' => 'Session could not be created via UAS', 'data' => $data, 'resp' => $sess), True));
                    $this->_error('Something went wrong creating a session for that container, response code was: '.$sess['code'].' response: '.json_encode($sess['resp']));
                }
            } else {
                $this->_error("No Samples or investigators! FAILED to create autocollect session!");
            }
            return $sessionNumber;
        }
        /** 
         * Given an acitve auto collect session - add this container to the session.
         * This function needs to find all the existing samples and investigators so we can update UAS
         * 
         * @param integer $sessionId ISPyB SessionID for currently active Auto Collect session
         * @param integer $uasSessionId UAS SessionID for currently active Auto Collect session (from BLSession.externalId)
         * @param array $containerId ISPyB ContainerID 
         * @return Array Result of updating session - null or array with samples/investigators added
         */
        function _update_autocollect_session($sessionId, $uasSessionId, $containerId) {
            global $auto_user, $auto_pass;
            // Return response if successful
            $result = null;

            // First find list of containers in the existing session...
            $containers = $this->db->pq("SELECT c.containerId
                FROM Container c
                INNER JOIN BLSession ses ON c.sessionid = ses.sessionid
                WHERE c.sessionId = :1
                ORDER BY c.containerId", array($sessionId));

            if (sizeof($containers)) {
                // ...now add the requested container id (the new one) to the list
                // Apparently this is better/faster than array_push!
                $containers[] = array('CONTAINERID' => $containerId);

                // Extract only the parts we want
                $containerList = array_map(function($item) {
                    return strtoupper($item['CONTAINERID']);
                }, $containers);

                $sampleInfo = $this->_get_valid_samples_from_containers($containerList);

                // Patch the UAS session
                $data = array(
                    'sampleIds' => array_values($sampleInfo['SAMPLES']),
                    'investigators' => array_values($sampleInfo['INVESTIGATORS']),
                );
                $uas = new UAS($auto_user, $auto_pass);
                $code = $uas->update_session($uasSessionId, $data);

                if ($code == 200) {
                    // Update ISPyB records
                    $this->db->pq("UPDATE container SET sessionid=:1 WHERE containerid=:2", array($sessionId, $containerId));
                    // For debugging - actually just want to return Success!
                    $result = array('SAMPLES' => array_values($sampleInfo['SAMPLES']),
                                    'INVESTIGATORS' => array_values($sampleInfo['INVESTIGATORS']),
                                    'CONTAINERS' => $containerList,
                                    );
                } else if ($code == 403) {
                    $this->_error('UAS Error - samples and/or investigators not valid. ISPyB/UAS Session ID: '. $sessionId . ' / ' . $uasSessionId);
                } else if ($code == 404) {
                    $this->_error('UAS Error - session not found in UAS, Session ID: '. $sessionId . ' UAS Session ID: ' . $uasSessionId);
                } else {
                    $this->_error('UAS Error - something wrong creating a session for that container ' . $containerId . ', response code was: '. $code);
                }
            } else {
                error_log("Something wrong - an Auto Collect session exists but with no containers " . $container['SESSIONID']);

                $this->_error('No valid containers on the existing Auto Collect Session id:', $container['SESSIONID']);
            }
            return $result;
        }
        /** 
         * Find samples and owners of containers in a session
         * This function needs to find the samples and investigators for this container
         * 
         * @param array $containers Array of containerIds 
         * @return Array Returns list of valid samples 'SAMPLES' and investigators 'INVESTIGATORS' (i.e. those with valid UAS references)
         */
        function _get_valid_samples_from_containers($containers=array()) {
            // If the first (oldest) container is scanned first, then it should be set as the Team Lead
            // We have already found relevant container ids by matching session (or it's a new container)
            // If the container has an owner then we would not need to link to Proposal via Dewar/Shipping to get an owner
            //
            // Prepare a string with a list of container ids - to be passed into a SQL query
            $containerIds = implode("', '", $containers);
            error_log("Getting valid samples/investigators for containers = " . $containerIds);

            $containerResults = $this->db->pq("SELECT c.containerid, HEX(pr.externalid) as externalid, IFNULL(HEX(pe.externalid), HEX(pe2.externalid)) as investigator
                FROM Container c
                INNER JOIN BLSample bls ON bls.containerid = c.containerid
                INNER JOIN Crystal cr ON cr.crystalid = bls.crystalid
                INNER JOIN Protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN Dewar d ON d.dewarId = c.dewarId
                INNER JOIN Shipping sh ON sh.shippingId = d.shippingId
                INNER JOIN Proposal p ON p.proposalid = sh.proposalid
                LEFT OUTER JOIN Person pe ON pe.personid = c.ownerid
                LEFT OUTER JOIN Person pe2 ON pe2.personid = p.personid
                WHERE c.containerId IN ('$containerIds') ORDER BY containerid");

            $samples = array_map(function($result) {
                return strtoupper($result['EXTERNALID']);
            }, $containerResults);

            $investigators = array_map(function($result) {
                return strtoupper($result['INVESTIGATOR']);
            }, $containerResults);

            // Strip empty values and provide unique list
            $samples        = array_filter(array_unique($samples));
            $investigators  = array_filter(array_unique($investigators));

            $uas_investigators = array_map(function($item) {
                return array('role' => 'DATA_ACCESS', 'personId' => $item);
            }, $investigators);

            // Ensure there is a team leader
            if (sizeof($uas_investigators)) {
                $uas_investigators[0]['role'] = 'TEAM_LEADER';
            } else {
                error_log("No valid investigators found for " . $containerIds);
                $uas_investigators = array();
            }

            return array('SAMPLES' => $samples, 'INVESTIGATORS' => $uas_investigators);
        }


        # ------------------------------------------------------------------------
        # Close visit for autocollect
        function _close_auto_visit() {
            global $auto, $auto_bls, $auto_user, $auto_pass;

            if (!(in_array($_SERVER["REMOTE_ADDR"], $auto))) $this->_error('You do not have access to that resource');
            if (!$this->has_arg('CONTAINERID')) $this->_error('No containerid specified');

            $cont = $this->db->pq("SELECT c.sessionid, c.containerid, HEX(ses.externalid) as externalid, CONCAT(p.proposalcode, p.proposalnumber, '-', ses.visit_number) as visit
                FROM proposal p
                INNER JOIN shipping s ON s.proposalid = p.proposalid
                INNER JOIN dewar d ON d.shippingid = s.shippingid
                INNER JOIN container c ON c.dewarid = d.dewarid
                LEFT OUTER JOIN blsession ses ON c.sessionid = ses.sessionid
                WHERE c.containerid=:1", array($this->arg('CONTAINERID')));

            if (!sizeof($cont)) $this->_error('No such container');
            $cont = $cont[0];

            if ($cont['SESSIONID']) {
                $uas = new UAS($auto_user, $auto_pass);
                $code = $uas->close_session($cont['EXTERNALID']);

                if ($code == 200) {
                    // Don't wait for UAS sync - set end Date in ISPyB now as well
                    $this->db->pq("UPDATE blsession SET endDate=CURRENT_TIMESTAMP WHERE sessionid=:1", array($cont['SESSIONID']));
                    $this->_output(array('MESSAGE' => 'Session closed', 'VISIT' => $cont['VISIT']));
                } else if ($code == 403) {
                    $this->_output(array('MESSAGE' => 'Session already closed', 'VISIT' => $cont['VISIT']));

                } else {
                    $this->_error('Something went wrong closing that session, response code was: '.$code);
                }

            } else {
                $this->_error('That container does not have a session');
            }

        }
}
