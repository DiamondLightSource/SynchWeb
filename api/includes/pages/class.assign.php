<?php

    class Assign extends Page {
        
        public static $arg_list = array('visit' => '\w+\d+-\d+', 'cid' => '\d+', 'did' => '\d+', 'pos' => '\d+', 'bl' => '[\w-]+');

        public static $dispatch = array(array('/visits(/:visit)', 'get', '_blsr_visits'),
                              array('/assign', 'get', '_assign'),
                              array('/unassign', 'get', '_unassign'),
                              array('/deact', 'get', '_deactivate'),
                              array('/names', 'get', '_get_puck_names'),

                             );
        
        var $def = 'unassign';
        
        
        # ------------------------------------------------------------------------
        # Assign a container
        function _assign() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->has_arg('cid')) $this->_error('No container id specified');
            if (!$this->has_arg('pos')) $this->_error('No position specified');
                                 
            $cs = $this->db->pq("SELECT d.dewarid,bl.beamlinename,c.containerid,c.code FROM container c
                                INNER JOIN dewar d ON d.dewarid = c.dewarid
                                INNER JOIN shipping s ON s.shippingid = d.shippingid
                                INNER JOIN blsession bl ON bl.proposalid = s.proposalid
                                INNER JOIN proposal p ON s.proposalid = p.proposalid
                                WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE :1 AND c.containerid=:2", array($this->arg('visit'), $this->arg('cid')));
                               
            if (sizeof($cs) > 0) {
                $c = $cs[0];
                $this->db->pq("UPDATE dewar SET dewarstatus='processing' WHERE dewarid=:1", array($c['DEWARID']));
                               
                $this->db->pq("UPDATE container SET beamlinelocation=:1,samplechangerlocation=:2,containerstatus='processing' WHERE containerid=:3", array($c['BEAMLINENAME'], $this->arg('pos'), $c['CONTAINERID']));
                $this->db->pq("INSERT INTO containerhistory (containerid,status,location,beamlinename) VALUES (:1,:2,:3,:4)", array($c['CONTAINERID'], 'processing', $this->arg('pos'), $c['BEAMLINENAME']));
                $this->_update_history($c['DEWARID'], 'processing', $c['BEAMLINENAME'], $c['CODE'].' => '.$this->arg('pos'));
                                
                $this->_output(1);
            }
                               
            $this->_output(0);
        }
                                 
        # ------------------------------------------------------------------------
        # Unassign a container
        function _unassign() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->has_arg('cid')) $this->_error('No container id specified');
                               
            $cs = $this->db->pq("SELECT d.dewarid,bl.beamlinename,c.containerid FROM container c
                                INNER JOIN dewar d ON d.dewarid = c.dewarid
                                INNER JOIN shipping s ON s.shippingid = d.shippingid
                                INNER JOIN blsession bl ON bl.proposalid = s.proposalid
                                INNER JOIN proposal p ON s.proposalid = p.proposalid
                                WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE :1 AND c.containerid=:2", array($this->arg('visit'), $this->arg('cid')));
                               
            if (sizeof($cs) > 0) {
                $c = $cs[0];
                               
                $this->db->pq("UPDATE container SET samplechangerlocation='',beamlinelocation='',containerstatus='at facility' WHERE containerid=:1",array($c['CONTAINERID']));
                $this->db->pq("INSERT INTO containerhistory (containerid,status,beamlinename) VALUES (:1,:2,:3)", array($c['CONTAINERID'], 'at facility', $c['BEAMLINENAME']));                
                //$this->_update_history($c['DEWARID'], 'unprocessing');
                                
                $this->_output(1);
            }
            $this->_output(0);
        }
              
        
        # ------------------------------------------------------------------------
        # Deactivate a dewar
        function _deactivate() {
            if (!$this->has_arg('visit') && !$this->has_arg('prop')) $this->_error('No visit or proposal specified');
            if (!$this->has_arg('did')) $this->_error('No dewar id specified');
                            
            if ($this->has_arg('visit')) {
                $where = "CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE :1";
                $arg = $this->arg('visit');
            } else {
                $where = "p.proposalid=:1";
                $arg = $this->proposalid;
            }
                                
            $ds = $this->db->pq("SELECT d.dewarid FROM dewar d
                                INNER JOIN shipping s ON s.shippingid = d.shippingid
                                INNER JOIN blsession bl ON bl.proposalid = s.proposalid
                                INNER JOIN proposal p ON s.proposalid = p.proposalid
                                WHERE $where AND d.dewarid=:2", array($arg, $this->arg('did')));
                               
            if (sizeof($ds) > 0) {
                $this->_update_history($this->arg('did'), 'unprocessing');
                                
                $conts = $this->db->pq("SELECT containerid as id FROM container WHERE dewarid=:1", array($this->arg('did')));
                foreach ($conts as $c) {
                    $this->db->pq("UPDATE container SET containerstatus='at facility', samplechangerlocation='', beamlinelocation='' WHERE containerid=:1", array($c['ID']));
                    $this->db->pq("INSERT INTO containerhistory (containerid,status) VALUES (:1,:2)", array($c['ID'], 'at facility'));
                }
                $this->_output(1);
                                
            }
            $this->_output(0);
        }
                                
                                
        function _update_history($did,$status,$bl=null,$ext=null) {
            # Update history
            $st = $status;
            if ($ext) $st .= ' ('.$ext.')';
            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) 
                VALUES (s_dewartransporthistory.nextval,:1,:2,:3,CURRENT_TIMESTAMP)", array($did, $st,$bl));
                                
            # Update dewar status
            if ($status == 'unprocessing') $status = 'at facility';
            $this->db->pq("UPDATE dewar set dewarstatus=:2 WHERE dewarid=:1", array($did, $status));
        }

                                
        # ------------------------------------------------------------------------
        # Return visits for beamline
        function _blsr_visits($visit=null) {
            $visits = $this->blsr_visits();
            
            if ($visit) {
                foreach ($visits as $i => $v) {
                    if ($v['VISIT'] == $visit) {
                        $this->_output($v);
                        return;
                    }
                }
                $this->_error('No such visit');
            } else $this->_output($visits);
        }


        # ------------------------------------------------------------------------
        # Puck names from puck scanner
        # BL03I-MO-ROBOT-01:PUCK_01_NAME
        function _get_puck_names() {
            global $bl_pv_map;
            session_write_close();
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');
            if (!array_key_exists($this->arg('bl'), $bl_pv_map)) $this->_error('No such beamline');
            $pv_prefix = $bl_pv_map[$this->arg('bl')];

            $pvs = array();
            for ($i = 1; $i < 38; $i++) {
                $id = $i < 10 ? '0'.$i : $i;
                array_push($pvs, $pv_prefix.'-MO-ROBOT-01:PUCK_'.$id.'_NAME');
            }
            
            $vals = $this->pv(array_values($pvs), true, true);

            $rows = $this->db->pq("SELECT cr.barcode 
                FROM containerregistry cr
                INNER JOIN containerregistry_has_proposal crhp ON crhp.containerregistryid = cr.containerregistryid
                WHERE crhp.proposalid = :1", array($this->proposalid));

            $codes = array();
            foreach ($rows as $r) {
                array_push($codes, rtrim($r['BARCODE']));
            }

            $return = array();
            foreach ($vals as $k => $v) {
                if (preg_match('/PUCK_(\d+)_NAME/', $k, $mat)) {
                    if (is_array($v) && sizeof($v)) {
                        $val = (!in_array($v[0], $codes) && !$this->staff) ? '[Loaded]' : $v[0];
                    } else $val = '';
                    array_push($return, array('id' => intval($mat[1]), 'name' => $val));
                }
            }
            
            $this->_output($return);
            
        }
    
    }

?>