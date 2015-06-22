<?php

    class Proposal extends Page {


        public static $arg_list = array('s' => '[\w\s-]+',
                              'per_page' => '\d+',
                              'page' => '\d+',
                              'sort_by' => '\w+',
                              'order' => '\w+',

                              'prop' => '\w+\d+',
                              'array' => '\d',
                              'term' => '\w+',
                              'value' => '.*',
                              'visit' => '\w+\d+-\d+',
                              'all' => '\d',
                              'year' => '\d\d\d\d',
                              'month' => '\d+',
                              'bl' => '\w\d\d(-\d)?',
                              'cm' => '\d',
                              'ty' => '\w+',
                              'next' => '\d',
                              'prev' => '\d',
                              'proposal' => '\w+\d+',
                              'location' => '(\w|-|\/)+'
                               );
        

        public static $dispatch = array(array('(/:prop)', 'get', '_get_proposals'),
                              array('/visits(/:visit)', 'get', '_get_visits'),
                              array('/user', 'get', '_get_user'),
                              array('/users', 'get', '_get_users'),
                              array('/login', 'get', '_login'),
                              array('/log(/)', 'post', '_log_action'),
                              array('/time', 'get', '_get_time'),


                              //array('/set', 'get', '_set_proposal'),
                              //array('/comment', 'get', '_set_comment'),
                             );
        
        
        
        
        # ------------------------------------------------------------------------
        # Helpers for backbone application
        function _get_user() {
            $this->_output(array('user' => $this->user, 'is_staff' => $this->staff, 'visits' => $this->visits));
        }
        
        function _login() {
        }
        

        function _log_action() {
            if (!$this->has_arg('location')) $this->_error('No location specified');
            $this->log_action(1, $this->arg('location'));
            print $this->arg('location');
        }



        # ------------------------------------------------------------------------
        # List proposals for current user
        function _get_time() {
            $d = new DateTime("now");
            $this->_output(array('TIME' => $d->format('D M d Y H:i:s (\G\M\TO)')));
        }



        # ------------------------------------------------------------------------
        # List proposals for current user
        function _get_proposals($id=null) {
            global $prop_types, $bl_types, $prop_codes;

            $args = array();
            $codes = implode("', '", $prop_codes);
            $where = "WHERE p.proposalcode in ('$codes')";
            
            if ($id) {
                $where .= " AND p.proposalcode||p.proposalnumber LIKE :".(sizeof($args)+1);
                array_push($args, $id);
            }
            
            if (!$this->staff) {
                $where = " INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id ".$where." AND u.name=:".(sizeof($args)+1);
                array_push($args, $this->user);
                
                #$where .= " AND s.sessionid in ('".implode("','", $this->sessionids)."')";
            }
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(p.title) LIKE lower('%'||:".$st."||'%') OR lower(p.proposalcode || p.proposalnumber) LIKE lower('%'||:".($st+1)."||'%'))";
                for ($i = 0; $i < 2; $i++) array_push($args, $this->arg('s'));
            }

            $tot = $this->db->pq("SELECT count(distinct p.proposalid) as tot FROM proposal p INNER JOIN blsession s ON p.proposalid = s.proposalid $where", $args);
            $tot = intval($tot[0]['TOT']);
            
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'p.bltimestamp DESC';
            
            if ($this->has_arg('sort_by')) {
                $cols = array('ST' => 'p.bltimestamp', 'PROPOSALCODE' => 'p.proposalcode', 'PROPOSALNUMBER' => 'p.proposalnumber', 'VCOUNT' => 'vcount', 'TITLE' => 'lower(p.title)');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->pq("SELECT outer.* FROM (
                SELECT ROWNUM rn, inner.* FROM (
                    SELECT p.proposalcode || '-' || p.proposalnumber as proposal, p.title, TO_CHAR(p.bltimestamp, 'DD-MM-YYYY') as st, p.proposalcode, p.proposalnumber, count(s.sessionid) as vcount, p.proposalid 
                    FROM proposal p INNER JOIN blsession s ON p.proposalid = s.proposalid $where GROUP BY TO_CHAR(p.bltimestamp, 'DD-MM-YYYY'), p.bltimestamp, p.proposalcode, p.proposalnumber, p.title, p.proposalid ORDER BY $order) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);
            

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
                                    break;
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
        # Get visits for a proposal
        function _get_visits($visit=null) {
            global $bl_types, $mx_beamlines;
            
            if (!$this->staff && !$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $props = $this->db->pq('SELECT proposalid as id FROM proposal WHERE proposalcode || proposalnumber LIKE :1', array($this->arg('prop')));
            
            if (!sizeof($props)) $this->_error('No such proposal');
            else $p = $props[0]['ID'];
            
            if ($this->has_arg('all') && $this->staff) {
                $args = array();
                $where = 'WHERE 1=1';
            } else {
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
                $where .= " AND p.proposalcode LIKE 'cm' AND s.enddate <= SYSDATE";
            }
            
            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'mx') {
                    $bls = implode("', '", $mx_beamlines);
                    $where .= " AND s.beamlinename IN ('$bls')";
                }
            }

            if ($this->has_arg('s')) {
                $where .= " AND s.visit_number LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('s'));
            }
            
            
            if ($visit) {
                $where .= " AND p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :".(sizeof($args)+1);
                array_push($args, $visit);
            }
            
            
            if (!$this->staff) {
                $where = " INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id ".$where." AND u.name=:".(sizeof($args)+1);
                array_push($args, $this->user);
            }
            
            $tot = $this->db->pq("SELECT count(s.sessionid) as tot FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid $where", $args);
            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
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
            
            
            $rows = $this->db->pq("SELECT outer.* FROM (
                SELECT ROWNUM rn, inner.* FROM (
                    SELECT case when sysdate between s.startdate and s.enddate then 1 else 0 end as active, case when sysdate between s.startdate-0.4 and s.enddate+0.4 then 1 else 0 end as cams, p.proposalcode||p.proposalnumber||'-'||s.visit_number as visit, TO_CHAR(s.startdate, 'HH24:MI DD-MM-YYYY') as st, TO_CHAR(s.enddate, 'HH24:MI DD-MM-YYYY') as en, TO_CHAR(s.startdate, 'YYYY-MM-DD\"T\"HH24:MI:SS') as stiso, TO_CHAR(s.enddate, 'YYYY-MM-DD\"T\"HH24:MI:SS') as eniso,  s.sessionid, s.visit_number as vis, s.beamlinename as bl, s.beamlineoperator as lc, s.comments/*, count(dc.datacollectionid) as dcount*/ 
                    FROM blsession s 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid 
                    /*LEFT OUTER JOIN datacollection dc ON s.sessionid = dc.sessionid*/ 
                    $where 
                    /*GROUP BY TO_CHAR(s.startdate, 'HH24:MI DD-MM-YYYY'),TO_CHAR(s.enddate, 'HH24:MI DD-MM-YYYY'), s.sessionid, s.visit_number,s.beamlinename,s.beamlineoperator,s.comments,s.startdate*/ 
                    ORDER BY $order) inner) outer 
                    WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);
            
            $ids = array();
            $wcs = array();
            foreach ($rows as $r) {
                array_push($ids, $r['SESSIONID']);
                array_push($wcs, 'sessionid=:'.sizeof($ids));
            }
            
            $dcs = array();
            if (sizeof($ids)) {
                $where = implode(' OR ', $wcs);
                $tdcs = $this->db->pq("SELECT count(datacollectionid) as c, sessionid FROM datacollection WHERE $where GROUP BY sessionid", $ids);
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
            
            if ($visit) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such visit');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));
        }
        
        
        # ------------------------------------------------------------------------
        # Get users for a visit
        function _get_users() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            
            $rows = $this->db->pq("SELECT iu.role, u.name, u.fullname, count(it.id) as visits, TO_CHAR(max(it.startdate), 'DD-MM-YYYY') as last 
                FROM investigation@DICAT_RO i 
                INNER JOIN investigationuser@DICAT_RO iu ON i.id = iu.investigation_id 
                INNER JOIN user_@DICAT_RO u ON u.id = iu.user_id 
                LEFT OUTER JOIN investigationuser@DICAT_RO iut ON u.id = iut.user_id 
                LEFT OUTER JOIN investigation@DICAT_RO it ON it.id = iut.investigation_id AND it.startdate < i.startdate 
                WHERE lower(i.visit_id) LIKE :1 
                GROUP BY iu.role,u.name, u.fullname 
                ORDER BY SUBSTR(u.fullname,INSTR(u.fullname,' ',-1,1))", array($this->arg('visit')));
            
            $this->_output($rows);
        }

        
    // Deprecated
        # ------------------------------------------------------------------------
        # Cookie selected proposal
        function _set_proposal() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            $this->cookie($this->arg('prop'));          
            print $this->arg('prop');
        }
    
        
        
        # ------------------------------------------------------------------------
        # Update comment for a visit
        function _set_comment() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->arg('value')) $this->_error('No comment specified');
            
            $com = $this->db->pq("SELECT s.comments,s.sessionid from blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($com)) $this->_error('No such data collection');
            else $com = $com[0];
            
            $this->db->pq("UPDATE blsession set comments=:1 where sessionid=:2", array($this->arg('value'), $com['SESSIONID']));
            
            print $this->arg('value');
        }
    
    }

?>