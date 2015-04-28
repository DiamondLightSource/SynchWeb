<?php

    class Shipment extends Page {
        

        var $arg_list = array('did' => '\d+',
                              'cid' => '\d+',
                              'sid' => '\d+',
                              'lcid' => '\d+',

                              
                              'visit' => '\w+\d+-\d+',


                              // cache name
                              'name' => '\w+',


                              // Dewar Fields
                              'CODE' => '([\w-])+',
                              'FACILITYCODE' => '([\w-])+',
                              'TRACKINGNUMBERTOSYNCHROTRON' => '\w+',
                              'TRACKINGNUMBERFROMSYNCHROTRON' => '\w+',
                              'FIRSTEXPERIMENTID' => '\d+',
                              'SHIPPINGID' => '\d+',
                              
                              // Shipment fields
                              'FCODES' => '([\w-])+',
                              'SENDINGLABCONTACTID' => '\d+',
                              'RETURNLABCONTACTID' => '\d+',
                              'SHIPPINGNAME' => '([\w\s-])+',
                              'DELIVERYAGENT_SHIPPINGDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_DELIVERYDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_AGENTNAME' => '\w+',
                              'DELIVERYAGENT_AGENTCODE' => '\w+',
                              'SAFETYLEVEL' => '\w+',
                              'DEWARS' => '\d+',
                              'FIRSTEXPERIMENTID' => '\w+\d+-\d+',
                              'COMMENTS' => '.*',
                              
                              'assigned' => '\d',
                              'bl' => '\w\d\d(-\d)?',
                              'unassigned' => '\w\d\d(-\d)?',
                              
                              // Container fields
                              'DEWARID' => '\d+',
                              'CAPACITY' => '\d+',
                              'CONTAINERTYPE' => '\w+',
                              'NAME' => '([\w-])+',
                              );
        

        var $dispatch = array(array('/shipments(/:sid)', 'get', '_get_shipments'),
                              array('/shipments', 'post', '_add_shipment'),
                              array('/shipments/:sid', 'patch', '_update_shipment'),
                              array('/send/:sid', 'get', '_send_shipment'),


                              array('/dewars(/:did)(/sid/:sid)', 'get', '_get_dewars'),
                              array('/dewars', 'post', '_add_dewar'),
                              array('/dewars/:did', 'patch', '_update_dewar'),
                              array('/dewars/history(/:did)', 'get', '_get_history'),
                              array('/dewars/default', 'get', '_get_default_dewar'),


                              array('/containers(/:cid)(/did/:did)', 'get', '_get_all_containers'),
                              array('/containers/', 'post', '_add_container'),
                              array('/containers/:cid', 'patch', '_update_container'),
                              array('/containers/move', 'get', '_move_container'),
                              

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
            $args = array($this->arg('prop'));
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
              WHERE p.proposalcode || p.proposalnumber = :1 $where 
              GROUP BY s.sendinglabcontactid, s.returnlabcontactid, s.deliveryagent_agentname, s.deliveryagent_agentcode, s.deliveryagent_shippingdate, s.deliveryagent_deliverydate, s.safetylevel, c.cardname, c2.cardname, s.shippingid, s.shippingname, s.shippingstatus,TO_CHAR(s.creationdate, 'DD-MM-YYYY'), s.isstorageshipping, s.shippingtype, s.comments, s.creationdate ORDER BY s.creationdate DESC", $args);
            
            if ($this->has_arg('sid')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such shipment');
            } else $this->_output($rows);
        }
        
        
        # ------------------------------------------------------------------------
        # Dewar history
        function _get_history() {
            if (!$this->has_arg('did')) $this->_error('No dewar id specified');
            
            $rows = $this->db->pq("SELECT h.dewarid, h.dewarstatus,h.storagelocation,TO_CHAR(h.arrivaldate, 'HH24:MI DD-MM-YYYY') as arrival FROM dewartransporthistory h INNER JOIN dewar d ON d.dewarid = h.dewarid INNER JOIN shipping s ON d.shippingid = s.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE h.dewarid=:1 AND p.proposalid=:2 ORDER BY h.arrivaldate", array($this->arg('did'), $this->proposalid));
            
            $this->_output($rows);
        }

        
        # ------------------------------------------------------------------------
        # List of dewars for a shipment
        function _get_dewars() {
            if (!$this->has_arg('prop')) $this->_error('No proposal id specified');
            if (!$this->has_arg('sid') && !$this->has_arg('did')) $this->_error('No shipment or dewar id specified');
            
            if ($this->has_arg('did')) {
                $where = ' d.dewarid=:2';
                $arg = $this->arg('did');
            } else {
                $where = ' d.shippingid=:2';
                $arg = $this->arg('sid');
            }
            
            
            $dewars = $this->db->pq("SELECT d.firstexperimentid, s.shippingid, s.shippingname, d.facilitycode, count(c.containerid) as ccount, (case when se.visit_number > 0 then (p.proposalcode||p.proposalnumber||'-'||se.visit_number) else '' end) as exp, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron FROM dewar d LEFT OUTER JOIN container c ON c.dewarid = d.dewarid INNER JOIN shipping s ON d.shippingid = s.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid LEFT OUTER JOIN blsession se ON d.firstexperimentid = se.sessionid WHERE s.proposalid=:1 AND $where GROUP BY (case when se.visit_number > 0 then (p.proposalcode||p.proposalnumber||'-'||se.visit_number) else '' end),s.shippingid, s.shippingname, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron, d.facilitycode, d.firstexperimentid", array($this->proposalid, $arg));
            
            if ($this->has_arg('did')) {
                if (sizeof($dewars)) $this->_output($dewars[0]);
                else $this->_error('No such dewar');
            } else $this->_output($dewars);
            
        }
        
        # ------------------------------------------------------------------------
        # Add a dewar to a shipment
        function _add_dewar() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SHIPPINGID')) $this->_error('No shipping id specified');
            if (!$this->has_arg('CODE')) $this->_error('No dewar name specified');
            
            $ship = $this->db->pq("SELECT s.shippingid 
              FROM shipping s 
              INNER JOIN proposal p ON s.proposalid = p.proposalid 
              WHERE p.proposalcode || p.proposalnumber LIKE :1 AND s.shippingid = :2", array($this->arg('prop'),$this->arg('SHIPPINGID')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            
            $to = $this->has_arg('TRACKINGNUMBERTOSYNCHROTRON') ? $this->arg('TRACKINGNUMBERTOSYNCHROTRON') : '';
            $from = $this->has_arg('TRACKINGNUMBERFROMSYNCHROTRON') ? $this->arg('TRACKINGNUMBERFROMSYNCHROTRON') : '';
            $fc = $this->has_arg('FACILITYCODE') ? $this->arg('FACILITYCODE') : '';
            
            $exp = $this->has_arg('FIRSTEXPERIMENTID') ? $this->arg('FIRSTEXPERIMENTID') : '';
            
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
            
            $ship = $this->db->pq("SELECT s.shippingid FROM shipping s INNER JOIN proposal p ON s.proposalid = p.proposalid WHERE p.proposalcode || p.proposalnumber LIKE :1 AND s.shippingid = :2", array($this->arg('prop'),$this->arg('sid')));
            
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
            
            $dewar = $this->db->pq("SELECT d.dewarid FROM dewar d INNER JOIN shipping s ON d.shippingid = s.shippingid INNER JOIN proposal p ON s.proposalid = p.proposalid WHERE p.proposalcode || p.proposalnumber LIKE :1 AND d.dewarid = :2", array($this->arg('prop'),$this->arg('did')));
            
            if (!sizeof($dewar)) $this->_error('No such dewar');
            
            $fields = array('CODE', 'TRACKINGNUMBERTOSYNCHROTRON', 'TRACKINGNUMBERFROMSYNCHROTRON', 'FIRSTEXPERIMENTID', 'FACILITYCODE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE dewar SET $f=:1 WHERE dewarid=:2", array($this->arg($f), $this->arg('did')));

                    if ($f == 'FIRSTEXPERIMENTID') {
                        $visit = $this->db->pq("SELECT p.proposalcode||p.proposalnumber||'-'||s.visit_number as visit 
                          FROM blsession s 
                          INNER JOIN proposal p ON p.proposalid = s.proposalid 
                          WHERE s.sessionid=:1", array($this->arg($f)));

                        if (sizeof($visit)) {
                            $this->_output(array($f => $visit[0]['VISIT']));
                        }

                    } else $this->_output(array($f => $this->arg($f)));
                }
            }
        }
        
        
        
        # Update shipping status to sent, email for CL3
        function _send_shipment() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT p.proposalcode || p.proposalnumber as prop, s.safetylevel, s.shippingid, s.deliveryagent_agentname, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as shippingdate, TO_CHAR(s.deliveryagent_deliverydate, 'DD-MM-YYYY') as deliverydate, s.shippingname, s.comments, c.cardname as lcout FROM shipping s INNER JOIN proposal p ON s.proposalid = p.proposalid LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid WHERE p.proposalcode || p.proposalnumber LIKE :1 AND s.shippingid = :2", array($this->arg('prop'),$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];
            
            $this->db->pq("UPDATE shipping SET shippingstatus='sent to DLS' where shippingid=:1", array($ship['SHIPPINGID']));
            
            # Send email if CL3
            if ($ship['SAFETYLEVEL'] == 'Red') {
                $dewars = $this->db->pq("SELECT s.visit_number as vn, s.beamlinename as bl, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as startdate FROM dewar d INNER JOIN blsession s ON s.sessionid = d.firstexperimentid WHERE d.shippingid=:1", array($ship['SHIPPINGID']));
                
                $exps = array();
                foreach ($dewars as $d) {
                    array_push($exps, $ship['PROP'].'-'.$d['VN'].' on '.$d['BL'].' starting '.$d['STARTDATE']);
                }
                
                $subject = "RED safety level shipment sent to DLS for ". $ship['PROP'];
                $message = "Shipment Name: ". $ship['SHIPPINGNAME']."\nVisit(s): ".implode(', ', $exps)."\nShipment Sent: ".$ship['SHIPPINGDATE']."\nShipment Expected at Synchrotron: ".$ship['DELIVERYDATE']."\nShipment Courier: ".$ship['DELIVERYAGENT_AGENTNAME']."\nShipment Lab Contact: ".$ship['LCOUT']."\nShipment Comments: ".($ship['COMMENTS'] ? $ship['COMMENTS'] : 'None');
                
                mail('stuart.fisher@diamond.ac.uk, mark.williams@diamond.ac.uk, katherine.mcauley@diamond.ac.uk, goodshandling@diamond.ac.uk', $subject, $message);
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
            $this->db->pq("INSERT INTO genericdata (genericdataid,parametervaluedate,parametervaluestring,parametercomments) 
              VALUES (s_genericdata.nextval, SYSDATE, 'terms_accepted', :1)", array($this->arg('prop').','.$this->arg('SHIPPINGNAME').','.$this->user));
            
            $root = '/dls_sw/dasc/ispyb2/shipping';
            $this->_output(array(file_get_contents($root.'/instructions.html'), file_get_contents($root.'/pin.txt'), file_get_contents($root.'/account.txt')));
        }
        
        
        
        function _get_all_containers() {
            #$this->db->set_debug(True);
            if (!$this->has_arg('prop') && !$this->has_arg('visit')) $this->_error('No proposal specified');
            
            
            if ($this->has_arg('visit')) {
                $join = " INNER JOIN proposal p ON p.proposalid = sh.proposalid INNER JOIN blsession ses ON ses.proposalid = p.proposalid";
                $args = array($this->arg('visit'));
                $where = "p.proposalcode||p.proposalnumber||'-'||ses.visit_number LIKE :1";
            } else {
                $join = '';
                $args = array($this->proposalid);
                $where = 'sh.proposalid=:1';
            }
            
            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }
            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
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
                

            $tot = $this->db->pq("SELECT count(c.containerid) as tot FROM container c INNER JOIN dewar d ON d.dewarid = c.dewarid INNER JOIN shipping sh ON sh.shippingid = d.shippingid $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND lower(c.code) LIKE lower('%'||:".$st."||'%')";
                array_push($args, $this->arg('s'));
            }
            
            
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'c.bltimestamp DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'c.code', 'DEWAR' => 'd.code', 'SHIPMENT' => 'sh.shippingname', 'SAMPLES' => 'count(s.blsampleid)', 'SHIPPINGID' =>'sh.shippingid');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                                  SELECT c.bltimestamp, c.samplechangerlocation, c.beamlinelocation, d.dewarstatus, c.containertype, c.capacity, c.containerstatus, c.containerid, c.code as name, d.code as dewar, sh.shippingname as shipment, d.dewarid, sh.shippingid, count(s.blsampleid) as samples
                                  FROM container c INNER JOIN dewar d ON d.dewarid = c.dewarid INNER JOIN shipping sh ON sh.shippingid = d.shippingid LEFT OUTER JOIN blsample s ON s.containerid = c.containerid $join
                                  WHERE $where
                                  GROUP BY c.bltimestamp, c.samplechangerlocation, c.beamlinelocation, d.dewarstatus, c.containertype, c.capacity, c.containerstatus, c.containerid, c.code, d.code, sh.shippingname, d.dewarid, sh.shippingid
                                  ORDER BY $order
                                  ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);

            if ($this->has_arg('cid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such container');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                                 ));   
        
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

            $fields = array('NAME' => 'CODE');
            foreach ($fields as $k => $f) {
                if ($this->has_arg($k)) {
                    $this->db->pq("UPDATE container SET $f=:1 WHERE containerid=:2", array($this->arg($k), $this->arg('cid')));
                    $this->_output(array($k => $this->arg($k)));
                }
            }
        }
        

        
        
        # Add container
        function _add_container() {
            if (!$this->has_arg('NAME')) $this->_error('No container name specified');
            if (!$this->has_arg('CONTAINERTYPE')) $this->_error('No container type specified');
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar id specified');
        
            
            $cap = $this->has_arg('CAPACITY') ? $this->arg('CAPACITY') : 16;

            $this->db->pq("INSERT INTO container (containerid,dewarid,code,bltimestamp,capacity,containertype) 
              VALUES (s_container.nextval,:1,:2,CURRENT_TIMESTAMP,:3,:4) RETURNING containerid INTO :id", 
              array($this->arg('DEWARID'), $this->arg('NAME'), $cap, $this->arg('CONTAINERTYPE')));
                                 
            $cid = $this->db->id();
            
            //unset($_SESSION['container']);
            $this->_output(array('CONTAINERID' => $cid));
        }
        
        
        # Cache form temporary data to session
        function _session_cache() {
            $data = array_key_exists('data', $this->request) ? $this->request['data'] : null;
            if (!$this->has_arg('name') || !$data) $this->_error('No key and data specified');
            $caches = array('container', 'shipment');
            if (!in_array($this->arg('name'), $caches)) $this->_error('No such cache');
            
            $_SESSION[$this->arg('name')] = $data;
            
            $this->_output(array('data' => $data));
        }
        
        
        function _get_session_cache() {
            if (!$this->has_arg('name')) $this->_error('No key specified');
            
            if (array_key_exists($this->arg('name'), $_SESSION)) {
                if ($_SESSION[$this->arg('name')])
                    $this->_output($_SESSION[$this->arg('name')]);
            }
            
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
                    $exp = $this->has_arg('FIRSTEXPERIMENTID') ? $this->arg('FIRSTEXPERIMENTID') : '';
                    
                    for ($i = 0; $i < $this->arg('DEWARS'); $i++) {
                        $fc = $i < sizeof($this->arg('FCODES')) ? $this->arg('FCODES')[$i] : ''; 
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
            
            $sids = $this->db->pq("SELECT s.sessionid FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :1 AND p.proposalid=:2", array($this->arg('visit'), $this->proposalid));
            
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
                    $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus) VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'processing') RETURNING dewarid INTO :id", array($this->arg('visit').'_Dewar1', $shid));
                    
                    $did = $this->db->id();
                }
            }
            
            if ($did == -1) $this->_error('Couldnt create default dewar');
            $this->_output($did);
        }

    
    }

?>