<?php

    class Proposal extends Page {


        public static $arg_list = array(//'s' => '[\w\s-]+',
                              // 'per_page' => '\d+',
                              // 'page' => '\d+',
                              // 'sort_by' => '\w+',
                              // 'order' => '\w+',

                              'prop' => '\w+\d+',
                              // 'array' => '\d',
                              // 'term' => '\w+',
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
                              // 'proposal' => '\w+\d+',
                              'current' => '\d',

                              'COMMENTS' => '(\w|\s|-)+',
                               );
        

        public static $dispatch = array(array('(/:prop)', 'get', '_get_proposals'),
                                        array('/visits(/:visit)', 'get', '_get_visits'),
                                        array('/visits/:visit', 'patch', '_update_visit'),
                                        array('/bls/:ty', 'get', '_get_beamlines'),
                                        array('/type', 'get', '_get_types'),
                             );
        
        
        
        

        function _get_beamlines() {
            global $bl_types;

            if (!$this->has_arg('ty')) $this->_error('No type specified');
            if (!array_key_exists($this->arg('ty'), $bl_types)) $this->_error('No such proposal type');

            $this->_output($bl_types[$this->arg('ty')]);
        }


        function _get_types() {
            global $bl_types;

            $bls = implode("', '", $bl_types[$this->ptype->ty]);
            $rows = $this->db->pq("SELECT distinct p.proposalcode 
                FROM proposal p
                INNER JOIN blsession s ON s.proposalid = p.proposalid
                WHERE s.beamlinename IN ('$bls')");
            $this->_output($rows);
        }


        # ------------------------------------------------------------------------
        # List proposals for current user
        function _get_proposals($id=null) {
            global $prop_types, $bl_types, $prop_codes;

            $args = array();
            $codes = implode("', '", (array)$prop_codes);
            $where = "WHERE p.proposalcode in ('$codes')";

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
                #$where = " INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id ".$where." AND u.name=:".(sizeof($args)+1);
                $where = " INNER JOIN session_has_person shp ON shp.sessionid = s.sessionid  ".$where;
                $where .= " AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
                
                #$where .= " AND s.sessionid in ('".implode("','", $this->sessionids)."')";
            }
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(p.title) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(CONCAT(p.proposalcode, p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                for ($i = 0; $i < 2; $i++) array_push($args, $this->arg('s'));
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
            
            $rows = $this->db->paginate("SELECT CONCAT(p.proposalcode,p.proposalnumber) as proposal, p.title, TO_CHAR(p.bltimestamp, 'DD-MM-YYYY') as st, p.proposalcode, p.proposalnumber, count(s.sessionid) as vcount, p.proposalid 
                    FROM proposal p 
                    LEFT OUTER JOIN blsession s ON p.proposalid = s.proposalid 
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
        # Get visits for a proposal
        function _get_visits($visit=null, $output=true) {
            global $bl_types, $mx_beamlines;

            if ($this->has_arg('current')) {
                $this->_current_visits();
                return;
            }
            
            if (!$this->staff && !$this->has_arg('prop')) $this->_error('No proposal specified');
            
            if ($this->has_arg('all') && $this->staff) {
                $args = array();
                $where = 'WHERE 1=1';
                
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
                $where .= " AND s.enddate > SYSDATE AND TO_CHAR(s.startdate,'YYYY') > 2009 AND p.proposalcode not in ('cm', 'nr', 'lb')";
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
            
            
            if ($visit) {
                $where .= " AND CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $visit);
            }
            
            
            if (!$this->staff) {
                // $where = " INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id ".$where." AND u.name=:".(sizeof($args)+1);
                $where = " INNER JOIN session_has_person shp ON shp.sessionid = s.sessionid ".$where;
                $where .= " AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }
            
            $tot = $this->db->pq("SELECT count(s.sessionid) as tot FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid $where", $args);
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
            
            
            $rows = $this->db->paginate("SELECT case when SYSDATE between s.startdate and s.enddate then 1 else 0 end as active, case when SYSDATE between s.startdate-0.4 and s.enddate+0.4 then 1 else 0 end as cams, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'HH24:MI DD-MM-YYYY') as st, TO_CHAR(s.enddate, 'HH24:MI DD-MM-YYYY') as en, TO_CHAR(s.startdate, 'YYYY-MM-DD\"T\"HH24:MI:SS') as stiso, TO_CHAR(s.enddate, 'YYYY-MM-DD\"T\"HH24:MI:SS') as eniso,  s.sessionid, s.visit_number as vis, s.beamlinename as bl, s.beamlineoperator as lc, s.comments/*, count(dc.datacollectionid) as dcount*/ 
                    FROM blsession s 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid 
                    /*LEFT OUTER JOIN datacollection dc ON s.sessionid = dc.sessionid*/ 
                    $where 
                    /*GROUP BY TO_CHAR(s.startdate, 'HH24:MI DD-MM-YYYY'),TO_CHAR(s.enddate, 'HH24:MI DD-MM-YYYY'), s.sessionid, s.visit_number,s.beamlinename,s.beamlineoperator,s.comments,s.startdate*/ 
                    ORDER BY $order", $args);
            
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
            
            if ($output) {
                if ($visit) {
                    if (sizeof($rows))$this->_output($rows[0]);
                    else $this->_error('No such visit');
                } else $this->_output(array('total' => $tot,
                                     'data' => $rows,
                               ));
            } else return $rows;
        }
        


        function _current_visits() {
            global $bl_types;
            unset($this->args['current']);

            if (!array_key_exists($this->ptype->ty, $bl_types)) $this->_error('No such proposal type');

            $beamlines = $bl_types[$this->ptype->ty];

            $this->args['per_page'] = 1;
            $this->args['page'] = 1;
            $this->args['all'] = 1;

            $rows = array();
            foreach (array('next', 'prev', 'cm') as $t) {
                unset($this->args['order']);
                unset($this->args['sort_by']);
                foreach (array('next', 'prev', 'cm') as $r) unset($this->args[$r]); 
                $this->args[$t] = True;

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




        function _update_visit() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $vis = $this->db->pq("SELECT s.sessionid from blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE p.proposalid = :1 AND CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :2", array($this->proposalid, $this->arg('visit')));
            
            if (!sizeof($vis)) $this->_error('No such visit');
            
            foreach (array('COMMENTS') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsession set $f=:1 where sessionid=:2", array($this->arg($f), $vis[0]['SESSIONID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }

    
    }

?>