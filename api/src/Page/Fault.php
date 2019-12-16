<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Fault extends Page
{
        
        public static $arg_list = array('time' => '\d+',
                              'bl' => '[\w-]+',
                              'sid' => '\d+',
                              'cid' => '\d+',
                              'scid' => '\d+',
                              'fid' => '\d+',
                              'runid' => '\d+',

                              'NAME' => '[A-Za-z0-9_\- ]+',
                              'BLS' => '[\w-]+',
                              'SYSTEMID' => '\d+',
                              'COMPONENTID' => '\d+',

                              'term' => '\w+',
                              'visit' => '\w+\d+-\d+',
                              
                              'BEAMLINE' => '[\w-]+',
                              'STARTTIME' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'ENDTIME' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'BEAMTIMELOST_STARTTIME' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'BEAMTIMELOST_ENDTIME' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
                              'SUBCOMPONENTID' => '\d+',
                              'BEAMTIMELOST' => '\d',
                              'RESOLVED' => '\d',
                              'SESSIONID' => '\d+',
                              
                              'TITLE' => '.*',
                              'DESCRIPTION' => '.*',
                              'RESOLUTION' => '.*',
                              
                              'ASSIGNEEID' => '\d+',
                              );


        public static $dispatch = array(array('(/:fid)', 'get', '_get_faults'),
                              array('', 'post', '_add_fault'),
                              array('/:fid', 'patch', '_update_fault'),

                              array('/bls', 'get', '_get_beamlines'),

                              array('/sys', 'get', '_get_systems'),
                              array('/sys', 'post', '_add_system'),
                              array('/sys/:sid', 'put', '_update_system'),

                              array('/com', 'get', '_get_components'),
                              array('/com', 'post', '_add_component'),
                              array('/com/:cid', 'put', '_update_component'),

                              array('/scom', 'get', '_get_subcomponents'),
                              array('/scom', 'post', '_add_subcomponent'),
                              array('/scom/:scid', 'put', '_update_subcomponent'),

                              // array('/migrate', 'get', '_migrate'),
        );


        function _migrate() {
            $faults = $this->db->pq("SELECT faultid, owner, assignee FROM bf_fault WHERE personid IS NULL");
            foreach ($faults as $f) {
                $owner = $this->db->pq("SELECT personid FROM person WHERE login=:1", array($f['OWNER']));
                if (sizeof($owner)) {
                    $this->db->pq("UPDATE bf_fault SET personid=:1 WHERE faultid=:2", array($owner[0]['PERSONID'], $f['FAULTID']));
                }

                if ($f['ASSIGNEE']) {
                    $assignee = $this->db->pq("SELECT personid FROM person WHERE login=:1", array($f['ASSIGNEE']));
                    if (sizeof($assignee)) {
                        $this->db->pq("UPDATE bf_fault SET assigneeid=:1 WHERE faultid=:2", array($assignee[0]['PERSONID'], $f['FAULTID']));
                    }
                }
            }
        }

        
        # ------------------------------------------------------------------------
        # Return faults based on search terms / filters
        function _get_faults() {
            $args = array();
            $where = array();
            $join = '';
            
            if (!$this->user->has('fault_view')) {
                array_push($where, 'shp.personid=:'.(sizeof($args)+1));
                array_push($args, $this->user->personid);
                $join = 'INNER JOIN session_has_person shp ON shp.sessionid = bl.sessionid';
            }

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                array_push($where, "(lower(f.title) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(f.description) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."),'%')) OR lower(s.name) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."),'%')) OR lower(c.name) LIKE lower(CONCAT(CONCAT('%',:".($st+3)."),'%')) OR lower(sc.name) LIKE lower(CONCAT(CONCAT('%',:".($st+4)."),'%')))");
                for ($i = 0; $i < 5; $i++) array_push($args, $this->arg('s'));
            }
            
            $ext_columns = '';
            if ($this->has_arg('fid')) {
                array_push($where, 'f.faultid=:'.(sizeof($args) +1));
                array_push($args, $this->arg('fid'));
                $ext_columns = 'f.description, f.resolution,';
            }

            if ($this->has_arg('visit')) {
                array_push($where, "CONCAT(CONCAT(CONCAT(p.proposalcode,p.proposalnumber),'-'),bl.visit_number) LIKE :".(sizeof($args)+1));
                array_push($args, $this->arg('visit'));
            }
            
            
            if ($this->has_arg('sid')) {
                array_push($where, 's.systemid=:'.(sizeof($args) + 1));
                array_push($args, $this->arg('sid'));
            }

            if ($this->has_arg('cid')) {
                array_push($where, 'c.componentid=:'.(sizeof($args) + 1));
                array_push($args, $this->arg('cid'));
            }
            
            if ($this->has_arg('scid')) {
                array_push($where, 'sc.subcomponentid=:'.(sizeof($args) + 1));
                array_push($args, $this->arg('scid'));
            }

            if ($this->has_arg('bl')) {
                if ($this->arg('bl') == 'P01') {
                    $bls = array();
                    foreach (array('i02', 'i03', 'i04') as $b) {
                        array_push($bls, 'bl.beamlinename LIKE :'.(sizeof($args) + 1));
                        array_push($args, $b);
                    }
                    array_push($where, '('.implode($bls, ' OR ').')');
                } else {
                    array_push($where, 'bl.beamlinename LIKE :'.(sizeof($args) + 1));
                    array_push($args, $this->arg('bl'));
                }
            }

            if ($this->has_arg('runid')) {
                array_push($where, 'vr.runid = :' . (sizeof($args)+1));
                array_push($args, $this->arg('runid'));
            }
            
            $where = implode($where, ' AND ');
            if ($where) $where = ' WHERE ' . $where;
            
            $start = 0;
            $pp = $this->has_arg('pp') ? $this->arg('pp') : 20;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $tot = $this->db->pq("SELECT count(faultid) as tot
                FROM bf_fault f
                INNER JOIN bf_subcomponent sc ON f.subcomponentid = sc.subcomponentid
                INNER JOIN bf_component c ON sc.componentid = c.componentid
                INNER JOIN bf_system s ON c.systemid = s.systemid
                INNER JOIN blsession bl ON f.sessionid = bl.sessionid
                INNER JOIN v_run vr ON bl.startdate BETWEEN vr.startdate AND vr.enddate
                INNER JOIN proposal p on p.proposalid = bl.proposalid
                $join
                $where", $args);
            $tot = $tot[0]['TOT'];
            
            $pgs = intval($tot/$pp);
            if ($tot % $pp != 0) $pgs++;
            
            $st = sizeof($args) + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $rows = $this->db->paginate("SELECT $ext_columns f.personid, f.assigneeid, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as name, CONCAT(CONCAT(asi.givenname, ' '), asi.familyname) as assignee, f.faultid, f.sessionid, f.elogid, f.attachment, CONCAT(CONCAT(CONCAT(p.proposalcode,p.proposalnumber),'-'),bl.visit_number) as visit, bl.beamlinename as beamline, s.systemid, s.name as system, c.componentid, c.name as component, f.subcomponentid, sc.name as subcomponent, TO_CHAR(f.starttime, 'DD-MM-YYYY HH24:MI') as starttime, TO_CHAR(f.endtime, 'DD-MM-YYYY HH24:MI') as endtime, f.beamtimelost, round(TIMESTAMPDIFF('MINUTE',f.beamtimelost_starttime, f.beamtimelost_endtime)/60,2) as lost, f.title, f.resolved, TO_CHAR(f.beamtimelost_endtime, 'DD-MM-YYYY HH24:MI') as beamtimelost_endtime, TO_CHAR(f.beamtimelost_starttime, 'DD-MM-YYYY HH24:MI') as beamtimelost_starttime
                FROM bf_fault f
                INNER JOIN person pe ON pe.personid = f.personid
                LEFT OUTER JOIN person asi ON asi.personid = f.assigneeid
                INNER JOIN bf_subcomponent sc ON f.subcomponentid = sc.subcomponentid
                INNER JOIN bf_component c ON sc.componentid = c.componentid
                INNER JOIN bf_system s ON c.systemid = s.systemid
                INNER JOIN blsession bl ON f.sessionid = bl.sessionid
                INNER JOIN v_run vr ON bl.startdate BETWEEN vr.startdate AND vr.enddate
                INNER JOIN proposal p on p.proposalid = bl.proposalid
                $join
                $where
                GROUP BY f.faultid
                ORDER BY f.starttime DESC", $args);
               
            foreach ($rows as &$r) {
                foreach (array('DESCRIPTION', 'RESOLUTION') as $k) {
                    if (array_key_exists($k, $r)) {
                        $r[$k] = $this->db->read($r[$k]);
                    }
                }

                $r['ATTACH_IMAGE'] = false;
                if ($r['ATTACHMENT']) {
                    $r['ATTACHMENT'] = basename($r['ATTACHMENT']);
                    $ext = pathinfo($r['ATTACHMENT'], PATHINFO_EXTENSION);
                                      
                    if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) $r['ATTACH_IMAGE'] = true;
                }
            }
                                  
            if ($this->has_arg('fid')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such fault');
                                  
            } else $this->_output(array($pgs, $rows));
        }
                                  

        # ------------------------------------------------------------------------
        # Update fields for a fault
        function _update_fault() {
            $check = $this->db->pq('SELECT personid,assigneeid FROM bf_fault WHERE faultid=:1', array($this->arg('fid')));
            if (!sizeof($check)) $this->_error('A fault with that id doesnt exists');
            $check = $check[0];
                                
            if ($this->user->personid != $check['PERSONID'] && $this->user->personid != $check['ASSIGNEEID'] && !$this->user->can('fault_global')) $this->_error('You cant edit that fault report');


            $fields = array('TITLE', 'STARTTIME', 'ENDTIME', 'BEAMTIMELOST_STARTTIME', 'BEAMTIMELOST_ENDTIME', 'SESSIONID', 'SUBCOMPONENTID', 'BEAMTIMELOST', 'RESOLVED', 'RESOLUTION', 'DESCRIPTION');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $fl = ':1';
                    if (in_array($f, array('STARTTIME', 'ENDTIME', 'BEAMTIMELOST_STARTTIME', 'BEAMTIMELOST_ENDTIME'))) {
                        $fl = "TO_DATE(:1, 'DD-MM-YYYY HH24:MI')"; 
                    }

                    $this->db->pq("UPDATE bf_fault SET $f=$fl WHERE faultid=:2", array($this->arg($f), $this->arg('fid')));

                    if ($f == 'SESSIONID') {
                        $v = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode,p.proposalnumber),'-'),bl.visit_number) as visit FROM blsession bl INNER JOIN proposal p ON bl.proposalid = p.proposalid WHERE bl.sessionid=:1", array($this->arg($f)));
                        if (sizeof($v)) {
                            $this->_output(array('VISIT' => $v[0]['VISIT']));
                        }

                    } else if ($f == 'SUBCOMPONENTID') {
                        $sc = $this->db->pq('SELECT name FROM bf_subcomponent WHERE subcomponentid=:1', array($this->arg($f)));
                        if (sizeof($sc)) {
                            $this->_output(array('SUBCOMPONENT' => $sc[0]['NAME']));
                        }

                    } else $this->_output(array($f => $this->arg($f)));

                }
            }
        }

        
        # ------------------------------------------------------------------------
        # Return a list of beamlines with ids
        function _get_beamlines() {       
            $row_tmp = $this->db->pq("SELECT distinct beamlinename as name FROM blsession WHERE beamlinename NOT LIKE 'i04 1' ORDER BY beamlinename");
            $rows = array();
            foreach ($row_tmp as $r) {
                array_push($rows, array('NAME' => $r['NAME']));
            }

            // $rows = array(array('NAME' => 'i02'), array('NAME' => 'i03'), array('NAME' => 'i04'), array('NAME' => 'i04-1'), array('NAME' => 'i24'));
                                 
            $bls = array();
            foreach ($rows as $r) $bls[$r['NAME']] = $r['NAME'];
            $this->_output($this->has_arg('array') ? $bls : $rows);
        }
        
        # ------------------------------------------------------------------------
        # Return a list of sytems for a beamline
        function _get_systems() {
            $args = array();
                                  
            if ($this->has_arg('bl')) {
                $bls = $this->arg('bl') == 'P01' ? array('i02', 'i03', 'i04') : array($this->arg('bl'));

                $blw = array();
                foreach ($bls as $b) {
                    array_push($blw, 'hs.beamlinename LIKE :'.(sizeof($args) + 1));
                    array_push($args, $b);
                }
                                  
                $where = ' WHERE ('.implode($blw, ' OR ').')';
                                  
            } else $where = '';
            
            $rows = $this->db->pq("SELECT s.systemid, s.name, s.description, string_agg(hs.beamlinename) as beamlines FROM bf_system s INNER JOIN bf_system_beamline hs ON s.systemid = hs.systemid ".$where." GROUP BY s.systemid, s.name, s.description ORDER BY s.name", $args);
                                 
            $sys = array();
            foreach ($rows as $s) $sys[$s['SYSTEMID']] = $s['NAME'];
                                 
            $this->_output($this->has_arg('array') ? $sys : $rows);
        }
        
        # ------------------------------------------------------------------------
        # Return a list of components for a system on a beamline
        function _get_components() {
            if (!$this->has_arg('sid')) $this->_error('No systemid specified');
            $args = array($this->arg('sid'));
            
            if ($this->has_arg('bl')) {
                $bls = $this->arg('bl') == 'P01' ? array('i02', 'i03', 'i04') : array($this->arg('bl'));

                $blw = array();
                foreach ($bls as $b) {
                    array_push($blw, 'hc.beamlinename LIKE :'.(sizeof($args) + 1));
                    array_push($args, $b);
                }
                                  
                $where = ' AND ('.implode($blw, ' OR ').')';
            } else $where = '';
            
            $rows = $this->db->pq('SELECT c.componentid, c.name, c.description, string_agg(hc.beamlinename) as beamlines FROM bf_component c INNER JOIN bf_component_beamline hc ON c.componentid = hc.componentid WHERE c.systemid=:1'.$where.' GROUP BY c.componentid, c.name, c.description ORDER BY beamlines,c.name', $args);
                                 
            $com = array();
            foreach ($rows as $c) $com[$c['COMPONENTID']] = $c['NAME'];
                                
            $this->_output($this->has_arg('array') ? $com : $rows);
        }
        
        # ------------------------------------------------------------------------
        # Return a list of subcomponents for a component on a beamline
        function _get_subcomponents() {
            if (!$this->has_arg('cid')) $this->_error('No componentid specified');
            $args = array($this->arg('cid'));
            
            if ($this->has_arg('bl')) {
                $bls = $this->arg('bl') == 'P01' ? array('i02', 'i03', 'i04') : array($this->arg('bl'));
                                  
                $blw = array();
                foreach ($bls as $b) {
                    array_push($blw, 'hs.beamlinename LIKE :'.(sizeof($args) + 1));
                    array_push($args, $b);
                }
                                  
                $where = ' AND ('.implode($blw, ' OR ').')';
            } else $where = '';
            
            $rows = $this->db->pq('SELECT s.subcomponentid, s.name, s.description, string_agg(hs.beamlinename) as beamlines FROM bf_subcomponent s INNER JOIN bf_subcomponent_beamline hs ON s.subcomponentid = hs.subcomponentid WHERE s.componentid=:1'.$where.' GROUP BY s.subcomponentid, s.name, s.description ORDER BY s.name', $args);
            
            $scom = array();
            foreach ($rows as $s) $scom[$s['SUBCOMPONENTID']] = $s['NAME'];
                                 
            $this->_output($this->has_arg('array') ? $scom : $rows);
        }
        

        # ------------------------------------------------------------------------
        # Add a new system
        function _add_system() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('NAME')) $this->_error('Please specify a system name');
                                  
            $this->db->pq('INSERT INTO bf_system (systemid,name,description) 
                VALUES (s_bf_system.nextval, :1, :2) RETURNING systemid INTO :id', 
                array($this->arg('NAME'), $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : ''));
                            
            $sysid = $this->db->id();
                 
            if ($this->has_arg('BLS')) {                 
                foreach ($this->arg('BLS') as $b) {
                    $this->db->pq('INSERT INTO bf_system_beamline (system_beamlineid, systemid, beamlinename) 
                        VALUES (s_bf_system_beamline.nextval,:1, :2)', array($sysid, $b));
                }
            }
                                  
            $this->_output(array('SYSTEMID' => $sysid));
        }
                                 
        # ------------------------------------------------------------------------
        # Add a new component
        function _add_component() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('NAME')) $this->_error('Please specify a component name');
            if (!$this->has_arg('SYSTEMID')) $this->_error('Please specify a system id');
                                  
            $this->db->pq('INSERT INTO bf_component (componentid, systemid,name,description) 
                VALUES (s_bf_component.nextval, :1, :2, :3) RETURNING componentid INTO :id', 
                array($this->arg('SYSTEMID'), $this->arg('NAME'), $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : ''));
                            
            $comid = $this->db->id();

            if ($this->has_arg('BLS')) {                 
                foreach ($this->arg('BLS') as $b) {
                    $this->db->pq('INSERT INTO bf_component_beamline (component_beamlineid, componentid, beamlinename) 
                        VALUES (s_bf_component_beamline.nextval,:1, :2)', 
                        array($comid, $b));
                }
            }
                                  
            $this->_output(array('COMPONENTID' => $comid));
        }
                                 
        # ------------------------------------------------------------------------
        # Add a new subcomponent
        function _add_subcomponent() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('NAME')) $this->_error('Please specify a subcomponent name');
            if (!$this->has_arg('COMPONENTID')) $this->_error('Please specify a component id');
                                  
            $this->db->pq('INSERT INTO bf_subcomponent (subcomponentid, componentid,name,description) 
                VALUES (s_bf_subcomponent.nextval, :1, :2, :3) RETURNING subcomponentid INTO :id', 
                array($this->arg('COMPONENTID'), $this->arg('NAME'), $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : ''));
                            
            $scomid = $this->db->id();
                                  
            if ($this->has_arg('BLS')) {                 
                foreach ($this->arg('BLS') as $b) {
                    $this->db->pq('INSERT INTO bf_subcomponent_beamline (subcomponent_beamlineid, subcomponentid, beamlinename) 
                        VALUES (s_bf_subcomponent_beamline.nextval,:1, :2)', 
                        array($scomid, $b));
                }
            }
                                  
            $this->_output(array('SUBCOMPONENTID' => $scomid));
        }
                                 
                                 
        # ------------------------------------------------------------------------
        # Delete a row
        function _delete_component() {
            $this->_output($_POST);
        
        }


        # ------------------------------------------------------------------------
        # Edit a row
        function _update_system() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('SYSTEMID')) $this->_error('No system specified');
            $this->_edit($this->arg('SYSTEMID'), 'systems');
        }

        function _update_component() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('COMPONENTID')) $this->_error('No component specified');
            $this->_edit($this->arg('COMPONENTID'), 'components');
        }

        function _update_subcomponent() {
            if (!$this->user->has('fault_admin')) $this->_error('No Access');

            if (!$this->has_arg('SUBCOMPONENTID')) $this->_error('No subcomponent specified');
            $this->_edit($this->arg('SUBCOMPONENTID'), 'subcomponents');
        }


        function _edit($id, $typ) {  
            if (!$this->has_arg('NAME')) $this->_error('No name specified');
                                  
            $types = array('systems' => array('system'), 'components' => array('component'), 'subcomponents' => array('subcomponent'));
            if (!array_key_exists($typ, $types)) $this->_error('That type doesnt exists');
                                 
            $ty = $types[$typ];
                                  
            $check = $this->db->pq('SELECT '.$ty[0].'id as id FROM bf_'.$ty[0].' WHERE '.$ty[0].'id=:1', array($id));
            if (!sizeof($check)) $this->_error("That $typ doesnt exist");
                                  
            $desc = $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : '';
                                  
            $bls = $this->has_arg('BLS') ? $this->arg('BLS') : array();
            $bl_temp = $this->db->pq('SELECT '.$ty[0].'_beamlineid as id,beamlinename FROM bf_'.$ty[0].'_beamline WHERE '.$ty[0].'id=:1', array($id));
            $bl_old = array();
            foreach ($bl_temp as $b) $bl_old[$b['BEAMLINENAME']] = $b['ID'];
                                  
            $rem = array_values(array_diff(array_keys($bl_old), $bls));
            $add = array_values(array_diff($bls, array_keys($bl_old)));
                            
                                  
            foreach ($rem as $r) {
                $this->db->pq('DELETE FROM bf_'.$ty[0].'_beamline WHERE '.$ty[0].'_beamlineid=:1', array($bl_old[$r]));
            }
                                  
            foreach ($add as $a) {
                $this->db->pq('INSERT INTO bf_'.$ty[0].'_beamline ('.$ty[0].'_beamlineid, '.$ty[0].'id, beamlinename) 
                    VALUES (s_bf_'.$ty[0].'_beamline.nextval, :1, :2)', array($id, $a));
            }
                                  
            $this->db->pq('UPDATE bf_'.$ty[0].' SET name=:1, description=:2 WHERE '.$ty[0].'id=:3', array($this->arg('NAME'), $desc, $id));
                                  
            $this->_output(1);
        }

                                  
        # ------------------------------------------------------------------------
        # Add fault via ajax
        function _add_fault() {
            if (!$this->user->has('fault_add')) $this->_error('No Access');

            $valid = True;
            foreach (array('TITLE', 'DESCRIPTION', 'SESSIONID', 'STARTTIME', 'SUBCOMPONENTID', 'BEAMTIMELOST', 'RESOLVED') as $f) {
                if (!$this->has_arg($f)) $valid = False;
            }
            
            if (!$valid) $this->_error('Missing Fields');
            
            $btlstart = $this->has_arg('BEAMTIMELOST_STARTTIME') ? $this->arg('BEAMTIMELOST_STARTTIME') : '';
            $btlend = $this->has_arg('BEAMTIMELOST_ENDTIME') ? $this->arg('BEAMTIMELOST_ENDTIME') : '';
            $end = $this->has_arg('ENDTIME') ? $this->arg('ENDTIME') : '';
            $as = $this->has_arg('ASSIGNEEID') ? $this->arg('ASSIGNEEID') : null;
            $res = $this->has_arg('RESOLUTION') ? $this->arg('RESOLUTION') : '';
            
            $this->db->pq("INSERT INTO bf_fault (faultid, sessionid, personid, subcomponentid, starttime, endtime, beamtimelost, beamtimelost_starttime, beamtimelost_endtime, title, description, resolved, resolution, assigneeid) 
                VALUES (s_bf_fault.nextval, :1, :2, :3, TO_DATE(:4, 'DD-MM-YYYY HH24:MI'), TO_DATE(:5, 'DD-MM-YYYY HH24:MI'), :6, TO_DATE(:7, 'DD-MM-YYYY HH24:MI'), TO_DATE(:8, 'DD-MM-YYYY HH24:MI'), :9, :10, :11, :12, :13) RETURNING faultid INTO :id", 
                array($this->arg('SESSIONID'), $this->user->personid, $this->arg('SUBCOMPONENTID'), $this->arg('STARTTIME'), $end, $this->arg('BEAMTIMELOST'), $btlstart, $btlend, $this->arg('TITLE'), $this->arg('DESCRIPTION'), $this->arg('RESOLVED'), $res, $as));
                    
            $newid = $this->db->id();

            $info = $this->db->pq("SELECT CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as name, CONCAT(CONCAT(CONCAT(p.proposalcode,p.proposalnumber),'-'),bl.visit_number) as visit, bl.beamlinename as beamline, s.name as system, c.name as component, sc.name as subcomponent, TO_CHAR(f.starttime, 'DD-MM-YYYY HH24:MI') as starttime, TO_CHAR(f.endtime, 'DD-MM-YYYY HH24:MI') as endtime, f.beamtimelost, round(TIMESTAMPDIFF('MINUTE', f.beamtimelost_starttime, f.beamtimelost_endtime)/60,2) as lost, f.title, f.resolved, f.resolution, f.description, TO_CHAR(f.beamtimelost_endtime, 'DD-MM-YYYY HH24:MI') as beamtimelost_endtime, TO_CHAR(f.beamtimelost_starttime, 'DD-MM-YYYY HH24:MI') as beamtimelost_starttime, f.owner
                FROM bf_fault f
                INNER JOIN bf_subcomponent sc ON f.subcomponentid = sc.subcomponentid
                INNER JOIN bf_component c ON sc.componentid = c.componentid
                INNER JOIN bf_system s ON c.systemid = s.systemid
                INNER JOIN blsession bl ON f.sessionid = bl.sessionid
                INNER JOIN proposal p ON bl.proposalid = p.proposalid
                INNER JOIN person pe ON pe.personid = f.personid

                WHERE f.faultid=:1", array($newid));
            
            $info = $info[0];
                                
            foreach (array('DESCRIPTION', 'RESOLUTION') as $k) {
                #if ($info[$k]) {
                    #$info[$k] = Markdown::defaultTransform($info[$k]->read($info[$k]->size()));
                $info[$k] = $this->db->read($info[$k]);
                #}
            }
                                  
            $report = '<b>'.$info['TITLE'].'</b><br/><br/>Reported By: '.$info['NAME'].'<br/><br/>System: '.$info['SYSTEM'].'<br/>Component: '.$info['COMPONENT'].' &raquo; '.$info['SUBCOMPONENT'].'<br/><br/>Start: '.$info['STARTTIME'].' End: '.($info['RESOLVED'] == 1 ? $info['ENDTIME'] : 'N/A') .'<br/>Resolved: '.($info['RESOLVED']  == 2 ? 'Partial' : ($info['RESOLVED'] ? 'Yes' : 'No')).'<br/>Beamtime Lost: '.($info['BEAMTIMELOST'] ? ('Yes ('.$info['LOST'].'h between '.$info['BEAMTIMELOST_STARTTIME'].' and '.$info['BEAMTIMELOST_ENDTIME'].')') : 'No').'<br/><br/><b>Description</b><br/>'.$info['DESCRIPTION'].'<br/><br/>'.($info['RESOLVED'] ? ('<b>Resolution</b><br/>'.$info['RESOLUTION']):'').'<br/><br/><a href="https://ispyb.diamond.ac.uk/faults/fid/'.$this->db->id().'">Fault Report Link</a>';
                                  
            $data = array('txtTITLE'      => 'Fault Report: '. $info['TITLE'],
                          'txtCONTENT'    => $report,
                          'txtLOGBOOKID'  =>'BL'.strtoupper($info['BEAMLINE']),
                          'txtGROUPID'    => 'GEN',
                          'txtENTRYTYPEID'=> '41',
                          'txtUSERID'     => $this->user->login,
                          'txtMANUALAUTO' => 'M',
                          );
            
            
            if (array_key_exists('userfile1', $_FILES)) {
                if ($_FILES['userfile1']['name']) {
                    move_uploaded_file($_FILES['userfile1']['tmp_name'], '/tmp/fault_'.strtolower($_FILES['userfile1']['name']));
                    $data['userfile1'] = '@/tmp/fault_'.strtolower($_FILES['userfile1']['name']);
                }
            }
            
            $ch = curl_init('http://rdb.pri.diamond.ac.uk/php/elog/cs_logentryext_bl.php');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            curl_close($ch);

            
            if (preg_match('/New Log Entry ID:(\d+)/', $response, $eid)) {
                $this->db->pq('UPDATE bf_fault SET elogid=:1 WHERE faultid=:2', array($eid[1], $newid));
            }
                                  
            if (preg_match('/Attachment Id:(\d+)/', $response, $aid)) {
                $this->db->pq('UPDATE bf_fault SET attachment=:1 WHERE faultid=:2', array($aid[1].'-fault_'.strtolower($_FILES['userfile1']['name']), $newid));
            }

                                  
            $this->_output(array('FAULTID' => $newid));
        }
}
