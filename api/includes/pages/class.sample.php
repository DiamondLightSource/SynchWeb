<?php

    class Sample extends Page {
        

        public static $arg_list = array('page' => '\d+',
                              'per_page' => '\d+',
                              'sort_by' => '\w+',
                              'order' => '\w+',
                              's' => '\w+',


                              'prop' => '\w\w\d+',
                              'term' => '\w+',
                              'pid' => '\d+',
                              'sid' => '\d+',
                              'ssid' => '\d+',
                              'cid' => '\d+',
                              'value' => '.*',
                              'ty' => '\w+',
                              't' => '\w+',
                              'pjid' => '\d+',
                              'imp' => '\d',
                              'existing_pdb' => '\d+',
                              'pdb_code' => '\w\w\w\w',
                              'pdbid' => '\d+',
                              'visit' => '\w+\d+-\d+',

                              'PROTEINID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'LOCATION' => '\d+',
                              // 'NAME' => '.*',
                              'ACRONYM' => '([\w-])+',
                              'SEQUENCE' => '\w+',
                              'MOLECULARMASS' => '\d+(.\d+)?',
                              'LIGANDS' => '\d+',

                              'NAME' => '[\w|\s|-|(|)]+',
                              'COMMENTS' => '.*',
                              'SPACEGROUP' => '\w+',
                              'CELL_A' => '\d+(.\d+)?',
                              'CELL_B' => '\d+(.\d+)?',
                              'CELL_C' => '\d+(.\d+)?',
                              'CELL_ALPHA' => '\d+(.\d+)?',
                              'CELL_BETA' => '\d+(.\d+)?',
                              'CELL_GAMMA' => '\d+(.\d+)?',
                              'REQUIREDRESOLUTION' => '\d+(.\d+)?',
                              'ANOMALOUSSCATTERER' => '\w+',
                              'BLSUBSAMPLEID' => '\d+',
                              'SCREENCOMPONENTGROUPID' => '\d+',

                              'BLSAMPLEID' => '\d+',
                              'X' => '\d+(.\d+)?',
                              'Y' => '\d+(.\d+)?',
                              'Z' => '\d+(.\d+)?',

                              'EXPERIMENTKIND' => '\w+',
                              'EXPOSURETIME' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEX' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEY' => '\d+(.\d+)?',

                               );
        
        
        public static $dispatch = array(array('(/:sid)(/cid/:cid)', 'get', '_samples'),
                              array('/:sid', 'patch', '_update_sample'),
                              array('/:sid', 'put', '_update_sample_full'),
                              array('', 'post', '_add_sample'),

                              array('/sub(/:ssid)(/sid/:sid)', 'get', '_sub_samples'),
                              array('/sub/:ssid', 'patch', '_update_sub_sample'),
                              array('/sub/:ssid', 'put', '_update_sub_sample_full'),
                              array('/sub', 'post', '_add_sub_sample'),
                              array('/sub/:ssid', 'delete', '_delete_sub_sample'),

                              array('/plan', 'get', '_get_diffraction_plans'),
                              array('/plan', 'post', '_add_diffraction_plan'),
                              array('/plan/:pid', 'delete', '_delete_diffraction_plan'),


                              array('/proteins(/:pid)', 'get', '_proteins'),
                              array('/proteins', 'post', '_add_protein'),
                              array('/proteins/:pid', 'patch', '_update_protein'),
                              array('/proteins/distinct', 'get', '_disinct_proteins'),

                              array('/pdbs(/pid/:pid)', 'get', '_get_pdbs'),
                              array('/pdbs', 'post', '_add_pdb'),
                              array('/pdbs(/:pdbid)', 'delete', '_remove_pdb'),
        );
        

        function _sub_samples() {
            $where = '';
            $args = array($this->proposalid);

            if ($this->has_arg('sid')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));
            }

            if ($this->has_arg('ssid')) {
                $where .= ' AND ss.blsubsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('ssid'));
            }

            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }

            $subs = $this->db->pq("SELECT pr.acronym as protein, s.name as sample, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, dp.exposuretime, dp.requiredresolution, count(sss.blsampleid) as samples, s.location, ss.diffractionplanid, pr.proteinid, ss.blsubsampleid, ss.blsampleid, ss.comments, ss.positionid, p.x, p.y, p.z
              FROM blsubsample ss
              LEFT OUTER JOIN position p ON p.positionid = ss.positionid
              LEFT OUTER JOIN blsample sss on ss.blsubsampleid = sss.blsubsampleid
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN crystal cr ON cr.crystalid = s.crystalid
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid

              LEFT OUTER JOIN diffractionplan dp ON ss.diffractionplanid = dp.diffractionplanid

              WHERE p.proposalid=:1 $where
              GROUP BY pr.acronym, s.name, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, dp.exposuretime, dp.requiredresolution, s.location, ss.diffractionplanid, pr.proteinid, ss.blsubsampleid, ss.blsampleid, ss.comments, ss.positionid, p.x, p.y, p.z
              ORDER BY ss.blsubsampleid", $args);

            if ($this->has_arg('ssid')) {
                if (!sizeof($subs)) $this->_error('No such sub sample');
                else $this->_output($subs[0]);

            } else $this->_output($subs);
        }

        function _update_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');
            
            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($samp)) $this->_error('No such sub sample');
            
            foreach(array('COMMENTS') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE blsubsample SET '.$f.'=:1 WHERE blsubsampleid=:2', array($this->arg($f), $this->arg('ssid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($samp[0]['DIFFRACTIONPLANID']) {
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE diffractionplan SET '.$f.'=:1 WHERE diffractionplanid=:2', array($this->arg($f), $samp[0]['DIFFRACTIONPLANID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }

            if ($samp[0]['POSITIONID']) {
                foreach(array('X', 'Y', 'Z') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE position SET '.$f.'=:1 WHERE positionid=:2', array($this->arg($f), $samp[0]['POSITIONID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }
        }


        function _update_sub_sample_full() {
            if (!$this->arg('ssid')) $this->_error('No sub sample specified');

            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($samp)) $this->_error('No such sub sample');

            if ($samp[0]['DIFFRACTIONPLANID']) {
                $args = array($samp[0]['DIFFRACTIONPLANID']);
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME') as $f) {
                    array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
                }
                $this->db->pq('UPDATE diffractionplan 
                  SET requiredresolution=:2, experimentkind=:3, preferredbeamsizex=:4, preferredbeamsizey=:5, exposuretime=:6 
                  WHERE diffractionplanid=:1', $args);

                $this->_output(array('BLSUBSAMPLEID' => $this->arg('ssid')));
            }
        }



        function _add_sub_sample() {
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');
            if (!$this->has_arg('X')) $this->_error('No x position specified');
            if (!$this->has_arg('Y')) $this->_error('No y position specified');

            $z = $this->has_arg('Z') ? $this->arg('Z') : null;

            $samp = $this->db->pq("SELECT s.blsampleid FROM blsample s
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND s.blsampleid=:2", array($this->proposalid, $this->arg('BLSAMPLEID')));

            if (!sizeof($samp)) $this->_error('No such sample');

            $this->db->pq("INSERT INTO position (positionid, x, y, z) 
              VALUES (s_position.nextval, :1, :2, :3) RETURNING positionid INTO :id", array($this->arg('X'), $this->arg('Y'), $z));
            $pid = $this->db->id();

            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid) 
              VALUES (s_diffractionplan.nextval) RETURNING diffractionplanid INTO :id");
            $did = $this->db->id();

            $this->db->pq("INSERT INTO blsubsample (blsubsampleid, blsampleid, positionid, diffractionplanid) 
              VALUES (s_blsubsample.nextval, :1, :2, :3) RETURNING blsubsampleid INTO :id", array($this->arg('BLSAMPLEID'), $pid, $did));

            // $this->_output(array('BLSUBSAMPLEID' => $this->db->id()));
            $this->args['ssid'] = $this->db->id();
            $this->_sub_samples();
        }


        function _delete_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');

            $ssamp = $this->db->pq("SELECT ss.blsubsampleid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($ssamp)) $this->_error('No such subsample');

            $this->db->pq("DELETE FROM blsubsample WHERE blsubsampleid=:1", array($this->arg('ssid')));
            $this->_output(1);
        }





        # ------------------------------------------------------------------------
        # List of samples for a proposal
        function _samples() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'pr.proposalid=:1';
            $having = '';
            $join = '';
            
            # For a specific project
            if ($this->has_arg('pjid')) {
                $args = array($this->arg('pjid'));
                $where = '(pj.projectid=:'.sizeof($args).')';
                $join = ' LEFT OUTER JOIN project_has_blsample pj ON pj.blsampleid=b.blsampleid';
                
                if (!$this->staff) {
                    #$join .= " INNER JOIN blsession ses ON ses.proposalid = p.proposalid INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || ses.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id";
                    #$where .= " AND u.name=:".(sizeof($args)+1);

                    $join .= " INNER JOIN blsession ses ON ses.proposalid = p.proposalid 
                    INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);

                    array_push($args, $this->user->personid);
                }
                
                if ($this->has_arg('imp')) {
                    if ($this->arg('imp')) {
                        array_push($args, $this->arg('pjid'));
                        $join .= ' LEFT OUTER JOIN project_has_protein pji ON pji.proteinid=pr.proteinid';
                        $where = preg_replace('/\(pj/', '(pji.projectid=:'.sizeof($args).' OR pj', $where);
                    }
                }
            }
            
            # For a specific protein
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
            }

            # For a specific container
            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }
            
            # For a particular sample
            if ($this->has_arg('sid')) {
                $where .= ' AND b.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));                
            }
            
            
            # For a visit
            if ($this->has_arg('visit')) {
                $info = $this->db->pq("SELECT s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode || p.proposalnumber || '-' || s.visit_number LIKE :1", array($this->arg('visit')));
            
                if (!sizeof($info)) $this->_error('No such visit');
                else $info = $info[0];
                                      
                $where .= " AND d.dewarstatus='processing' AND c.beamlinelocation LIKE :".(sizeof($args)+1)." AND c.samplechangerlocation is NOT NULL";
                array_push($args, $info['BL']);
            }
            
            
            
            
            // Search
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(b.name) LIKE lower('%'||:".$st."||'%') OR lower(pr.acronym) LIKE lower('%'||:".($st+1)."||'%') OR lower(b.comments) LIKE lower('%'||:".($st+2)."||'%'))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }
            
            
            // Filter by sample status
            if ($this->has_arg('t')) {
                //$this->db->set_debug(true);
                $types = array('R' => 'count(distinct r.robotactionid)',
                               'SC' => 'count(distinct dc.datacollectionid)',
                               'AI' => 'count(distinct so.screeningid)',
                               'DC' => 'count(distinct dc2.datacollectionid)',
                               'AP' => 'count(distinct ap.autoprocintegrationid)');
                if (array_key_exists($this->arg('t'), $types)) {
                    $having .= " HAVING ".$types[$this->arg('t')]." > 0";
                }
            }

            $tot = $this->db->pq("SELECT count(distinct b.blsampleid) as tot 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              INNER JOIN proposal p ON p.proposalid = pr.proposalid 
              INNER JOIN container c ON c.containerid = b.containerid 
              INNER JOIN dewar d ON d.dewarid = c.dewarid $join WHERE $where", $args);
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
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'b.blsampleid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('SAMPLEID' => 'b.blsampleid', 'NAME' => 'b.name', 'ACRONYM' => 'pr.acronym', 'SPACEGROUP' => 'cr.spacegroup', 'COMMENTS' => 'b.comments', 'SHIPMENT' => 'shipment', 'DEWAR' => 'dewar', 'CONTAINER' => 'container', 'b.blsampleid', 'SC' => 'sc', 'SCRESOLUTION' => 'scresolution', 'DC' => 'ap', 'DCRESOLUTION' => 'dcresolution', 'POSITION' => 'TO_NUMBER(location)');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                                  SELECT distinct b.blsampleid, b.screencomponentgroupid, ssp.blsampleid as parentsampleid, ssp.name as parentsample, b.blsubsampleid, count(distinct si.blsampleimageid) as inspections, p.proposalcode||p.proposalnumber as prop, b.code, b.location, pr.acronym, pr.proteinid, cr.spacegroup,b.comments,b.name,s.shippingname as shipment,s.shippingid,d.dewarid,d.code as dewar, c.code as container, c.containerid, c.samplechangerlocation as sclocation, count(distinct dc.datacollectionid) as sc, count(distinct dc2.datacollectionid) as dc, count(distinct so.screeningid) as ai, count(distinct ap.autoprocintegrationid) as ap, count(distinct r.robotactionid) as r, min(st.rankingresolution) as scresolution, max(ssw.completeness) as sccompleteness, min(dc.datacollectionid) as scid, min(dc2.datacollectionid) as dcid, min(apss.resolutionlimithigh) as dcresolution, max(apss.completeness) as dccompleteness, dp.anomalousscatterer, dp.requiredresolution, cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma
                                  
                                  
                                  FROM blsample b
                                  INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  INNER JOIN container c ON b.containerid = c.containerid
                                  INNER JOIN dewar d ON d.dewarid = c.dewarid
                                  INNER JOIN shipping s ON s.shippingid = d.shippingid
                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join
                                  
                                  LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = b.diffractionplanid 
                                  LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid AND dc.overlap != 0
                                  LEFT OUTER JOIN screening sc ON dc.datacollectionid = sc.datacollectionid
                                  LEFT OUTER JOIN screeningoutput so ON sc.screeningid = so.screeningid
                                  
                                  LEFT OUTER JOIN screeningstrategy st ON st.screeningoutputid = so.screeningoutputid AND sc.shortcomments LIKE '%EDNA%'
                                  LEFT OUTER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid
                                  
                                  
                                  LEFT OUTER JOIN datacollection dc2 ON b.blsampleid = dc2.blsampleid AND dc2.overlap = 0 AND dc2.axisrange > 0
                                  LEFT OUTER JOIN autoprocintegration ap ON ap.datacollectionid = dc2.datacollectionid
                                  
                                  LEFT OUTER JOIN autoprocscaling_has_int aph ON aph.autoprocintegrationid = ap.autoprocintegrationid
                                  LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid

                                  LEFT OUTER JOIN blsampleimage si ON b.blsampleid = si.blsampleid

                                  LEFT OUTER JOIN blsubsample ss ON b.blsubsampleid = ss.blsubsampleid
                                  LEFT OUTER JOIN blsample ssp ON ss.blsampleid = ssp.blsampleid
                                  
                                  
                                  LEFT OUTER JOIN robotaction r ON r.blsampleid = b.blsampleid AND r.actiontype = 'LOAD'
                                  
                                  WHERE $where
                                  
                                  GROUP BY b.screencomponentgroupid, ssp.blsampleid, ssp.name, b.blsubsampleid, b.blsampleid, b.code, b.location, pr.acronym, pr.proteinid, cr.spacegroup,b.comments,b.name,s.shippingname,s.shippingid,d.dewarid,d.code, c.code, c.containerid, c.samplechangerlocation, p.proposalcode||p.proposalnumber, dp.anomalousscatterer, dp.requiredresolution, cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma
                                  
                                  $having
                                  
                                  ORDER BY $order
                                  ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);
            
            if ($this->has_arg('sid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such sample');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }
        

        function _update_sample_full() {           
            $a = $this->_prepare_sample_args();

            $samp = $this->db->pq("SELECT sp.blsampleid, pr.proteinid, cr.crystalid, dp.diffractionplanid 
              FROM blsample sp 
              INNER JOIN crystal cr ON sp.crystalid = cr.crystalid 
              INNER JOIN protein pr ON cr.proteinid = pr.proteinid 
              INNER JOIN proposal p ON pr.proposalid = p.proposalid 
              LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = sp.diffractionplanid 
              WHERE p.proposalcode || p.proposalnumber LIKE :1 AND sp.blsampleid=:2", 
              array($this->arg('prop'),$this->arg('sid')));
                
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $this->db->pq("UPDATE blsample set name=:1,comments=:2,code=:3 WHERE blsampleid=:4", 
              array($a['NAME'],$a['COMMENTS'],$a['CODE'],$this->arg('sid')));                
            $this->db->pq("UPDATE crystal set spacegroup=:1,proteinid=:2,cell_a=:3,cell_b=:4,cell_c=:5,cell_alpha=:6,cell_beta=:7,cell_gamma=:8 WHERE crystalid=:9", 
              array($a['SPACEGROUP'], $a['PROTEINID'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $samp['CRYSTALID']));            
            $this->db->pq("UPDATE diffractionplan set anomalousscatterer=:1,requiredresolution=:2 WHERE diffractionplanid=:3", 
              array($a['ANOMALOUSSCATTERER'], $a['REQUIREDRESOLUTION'], $samp['DIFFRACTIONPLANID']));

            $this->_output(array('BLSAMPLEID' => $samp['BLSAMPLEID']));
        }


        function _add_sample() {
            // Register entire container
            if ($this->has_arg('collection')) {
                $col = array();
                foreach ($this->arg('collection') as $s) {
                    $id = $this->_do_add_sample($this->_prepare_sample_args($s));

                    if ($id) {
                        $s['BLSAMPLEID'] = $id;
                        array_push($col, $s);
                    }
                }

                unset($_SESSION['container']);
                $this->_output($col);

            // Register single sample
            } else {
                $a = $this->_prepare_sample_args();
                $id = $this->_do_add_sample($a);
                $this->_output(array('BLSAMPLEID' => $id));
            }
        }


        function _prepare_sample_args($s=null) {
            $a = array();
            foreach (array('LOCATION', 'CONTAINERID', 'PROTEINID', 'NAME') as $f) {
                if ($s) {
                    if (!array_key_exists($f, $s)) $this->_error('One or more fields are mising');
                    else $a[$f] = $s[$f];

                } else {
                    if (!$this->has_arg($f)) $this->_error('One or more fields are mising');
                    else $a[$f] = $this->arg($f);
                }
            }
            
            foreach (array('SCREENCOMPONENTGROUPID', 'BLSUBSAMPLEID', 'COMMENTS', 'SPACEGROUP', 'CODE', 'ANOMALOUSSCATTERER', 'REQUIREDRESOLUTION', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA') as $f) {
                if ($s) $a[$f] = array_key_exists($f, $s) ? $s[$f] : '';
                else $a[$f] = $this->has_arg($f) ? $this->arg($f) : '';

            }

            return $a;
        }


        function _do_add_sample($a) {
            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, requiredresolution, anomalousscatterer) VALUES (s_diffractionplan.nextval, :1, :2) RETURNING diffractionplanid INTO :id", 
                array($a['REQUIREDRESOLUTION'], $a['ANOMALOUSSCATTERER']));
            $did = $this->db->id();

            $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,cell_a,cell_b,cell_c,cell_alpha,cell_beta,cell_gamma) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6,:7,:8) RETURNING crystalid INTO :id", 
                array($a['PROTEINID'], $a['SPACEGROUP'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA']));
            $crysid = $this->db->id();
                             
            $this->db->pq("INSERT INTO blsample (blsampleid,crystalid,diffractionplanid,containerid,location,comments,name,code,blsubsampleid, screencomponentgroupid) VALUES (s_blsample.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9) RETURNING blsampleid INTO :id", 
                array($crysid, $did, $a['CONTAINERID'], $a['LOCATION'], $a['COMMENTS'], $a['NAME'] ,$a['CODE'], $a['BLSUBSAMPLEID'], $a['SCREENCOMPONENTGROUPID']));
                
            return $this->db->id();
        }
        
        
        # ------------------------------------------------------------------------
        # List of proteins for a proposal
        function _proteins() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = '(pr.proposalid=:1 or pr.global=1)';
            $join = '';
            $extc = '';

            if ($this->has_arg('pjid')) {
                $args = array($this->arg('pjid'));
                $where = 'pj.projectid=:'.sizeof($args);
                $join .= ' INNER JOIN project_has_protein pj ON pj.proteinid=pr.proteinid';
                
                if (!$this->staff) {
                    // $join .= " INNER JOIN blsession s ON s.proposalid = p.proposalid 
                    // INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) LIKE p.proposalcode || p.proposalnumber || '-' || s.visit_number 
                    // INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id 
                    // INNER JOIN user_@DICAT_RO u on u.id = iu.user_id ";
                    // $where .= " AND u.name=:".(sizeof($args)+1);
                    // array_push($args, $this->user);
                    $join .= " INNER JOIN blsession ses ON ses.proposalid = p.proposalid 
                    INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);

                    array_push($args, $this->user->personid);
                }
            }
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
                $extc = 'pr.sequence, ';
            }
            

            $tot = $this->db->pq("SELECT count(distinct pr.proteinid) as tot FROM protein pr INNER JOIN proposal p ON p.proposalid = pr.proposalid $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(pr.name) LIKE lower('%'||:".$st."||'%') OR lower(pr.acronym) LIKE lower('%'||:".($st+1)."||'%'))";
                for ($i = 0; $i < 2; $i++) array_push($args, $this->arg('s'));
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
            
            $order = 'pr.proteinid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'pr.name', 'ACRONYM' => 'pr.acronym', 'MOLECULARMASS' =>'pr.molecularmass', 'HASSEQ' => "CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END");
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                                  SELECT /*distinct*/ $extc CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END as hasseq, pr.proteinid, p.proposalcode||p.proposalnumber as prop, pr.name,pr.acronym,pr.molecularmass/*,  count(distinct b.blsampleid) as scount, count(distinct dc.datacollectionid) as dcount*/ 
                                  FROM protein pr
                                  /*LEFT OUTER JOIN crystal cr ON cr.proteinid = pr.proteinid
                                  LEFT OUTER JOIN blsample b ON b.crystalid = cr.crystalid
                                  LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid*/
                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join
                                  WHERE $where
                                  /*GROUP BY pr.proteinid,pr.name,pr.acronym,pr.molecularmass, pr.sequence, p.proposalcode||p.proposalnumber*/
                                  ORDER BY $order
                                  ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);
            
            $ids = array();
            $wcs = array();
            foreach ($rows as $r) {
                array_push($ids, $r['PROTEINID']);
                array_push($wcs, 'pr.proteinid=:'.sizeof($ids));
            }
            
            $dcs = array();
            $scs = array();
            
            if (sizeof($ids)) {
                $dcst = $this->db->pq('SELECT pr.proteinid, count(dc.datacollectionid) as dcount FROM datacollection dc INNER JOIN blsample s ON s.blsampleid=dc.blsampleid INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid WHERE '.implode(' OR ', $wcs).' GROUP BY pr.proteinid', $ids);

                
                foreach ($dcst as $d) {
                    $dcs[$d['PROTEINID']] = $d['DCOUNT'];
                }

                $scst = $this->db->pq('SELECT pr.proteinid, count(s.blsampleid) as scount FROM blsample s INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid WHERE '.implode(' OR ', $wcs).' GROUP BY pr.proteinid', $ids);

                foreach ($scst as $d) {
                    $scs[$d['PROTEINID']] = $d['SCOUNT'];
                }
            }
            
            foreach ($rows as &$r) {
                $dcount = array_key_exists($r['PROTEINID'], $dcs) ? $dcs[$r['PROTEINID']] : 0;
                $r['DCOUNT'] = $dcount;
                $scount = array_key_exists($r['PROTEINID'], $scs) ? $scs[$r['PROTEINID']] : 0;
                $r['SCOUNT'] = $scount;
                
                if ($this->has_arg('pid')) $r['SEQUENCE'] = $this->db->read($r['SEQUENCE']);
            }
            
            if ($this->has_arg('pid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such protein');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }

        
        # ------------------------------------------------------------------------
        # Return distinct proteins for a proposal
        function _disinct_proteins() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = '';
            
            if ($this->has_arg('term')) {
                $where = " AND lower(pr.acronym) LIKE lower('%'||:2||'%')";
                array_push($args, $this->arg('term'));
            }
            
            $rows = $this->db->pq("SELECT distinct pr.name, pr.acronym, max(pr.proteinid) as proteinid, ct.symbol as unit, 1 as hasph
              FROM protein pr 
              LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = pr.concentrationtypeid
              WHERE pr.acronym is not null AND (pr.proposalid=:1 OR pr.global=1) $where 
              GROUP BY ct.symbol, pr.acronym, pr.name
              ORDER BY lower(pr.acronym)", $args);
                                 
            $this->_output($rows);
        }


        
        # ------------------------------------------------------------------------
        # Update a particular field for a protein
        function _update_protein() {
            if (!$this->has_arg('pid')) $this->_error('No proteinid specified');
            
            $prot = $this->db->pq("SELECT pr.proteinid FROM protein pr INNER JOIN proposal p ON pr.proposalid = p.proposalid WHERE p.proposalcode || p.proposalnumber LIKE :1 AND pr.proteinid = :2", array($this->arg('prop'),$this->arg('pid')));
            
            if (!sizeof($prot)) $this->_error('No such protein');
            
            foreach(array('NAME', 'SEQUENCE', 'ACRONYM', 'MOLECULARMASS') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE protein SET '.$f.'=:1 WHERE proteinid=:2', array($this->arg($f), $this->arg('pid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }
        

        # ------------------------------------------------------------------------
        # Update a particular field for a sample
        function _update_sample() {
            if (!$this->has_arg('sid')) $this->_error('No sampleid specified');
            
            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              INNER JOIN proposal p ON pr.proposalid = p.proposalid 
              WHERE p.proposalcode || p.proposalnumber LIKE :1 AND b.blsampleid = :2", array($this->arg('prop'),$this->arg('sid')));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $sfields = array('CODE', 'NAME', 'COMMENTS');
            foreach ($sfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsample SET $f=:1 WHERE blsampleid=:2", array($this->arg($f), $samp['BLSAMPLEID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            $cfields = array('PROTEINID', 'SPACEGROUP', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA');
            foreach ($cfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE crystal SET $f=:1 WHERE crystalid=:2", array($this->arg($f), $samp['CRYSTALID']));
                    
                    if ($f == 'PROTEINID') {
                        $name = $this->db->pq('SELECT acronym FROM protein WHERE proteinid=:1', array($this->arg('PROTEINID')));
                        if (sizeof($name)) {
                            $this->_output(array('ACRONYM' => $name[0]['ACRONYM']));
                        }
                    } else $this->_output(array($f => $this->arg($f)));
                }
            }

            $dfields = array('REQUIREDRESOLUTION', 'ANOMALOUSSCATTERER');
            foreach ($dfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE diffractionplan SET $f=:1 WHERE diffractionplanid=:2", array($this->arg($f), $samp['DIFFRACTIONPLANID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

        }
        
        
        # ------------------------------------------------------------------------
        # Get list of pdbs for a proposal
        function _get_pdbs() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $where = 'pr.proposalid=:1';
            $args = array($this->proposalid);
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:2';
                array_push($args, $this->arg('pid'));
            }

            $rows = $this->db->pq("SELECT distinct hp.proteinhaspdbid, p.pdbid,pr.proteinid, p.name,p.code FROM pdb p INNER JOIN protein_has_pdb hp ON p.pdbid = hp.pdbid INNER JOIN protein pr ON pr.proteinid = hp.proteinid WHERE $where ORDER BY p.pdbid DESC", $args);
            
            $this->_output($rows);
        }
        
        # ------------------------------------------------------------------------
        # Add a new pdb
        function _add_pdb() {
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein id specified');

            $prot = $this->db->pq("SELECT pr.proteinid 
              FROM protein pr 
              INNER JOIN proposal p ON pr.proposalid = p.proposalid 
              WHERE p.proposalcode || p.proposalnumber LIKE :1 AND pr.proteinid = :2", array($this->arg('prop'),$this->arg('PROTEINID')));
            
            if (!sizeof($prot)) $this->_error('No such protein');
            
            if (array_key_exists('pdb_file', $_FILES)) {
                if ($_FILES['pdb_file']['name']) {
                    $info = pathinfo($_FILES['pdb_file']['name']);
                    
                    if ($info['extension'] == 'pdb') {
                        $file = file_get_contents($_FILES['pdb_file']['tmp_name']);
                        $this->_associate_pdb($info['basename'],$file,'',$this->arg('PROTEINID'));
                    }
                }
            }
                
            if ($this->has_arg('pdb_code')) {
                $this->_associate_pdb($this->arg('pdb_code'),'',$this->arg('pdb_code'),$this->arg('PROTEINID'));
            }

            if ($this->has_arg('existing_pdb')) {
                $rows = $this->db->pq("SELECT p.pdbid FROM pdb p INNER JOIN protein_has_pdb hp ON p.pdbid = hp.pdbid INNER JOIN protein pr ON pr.proteinid = hp.proteinid WHERE pr.proposalid=:1 AND p.pdbid=:2", array($this->proposalid, $this->arg('existing_pdb')));
                
                if (!sizeof($rows)) $this->_error('The specified pdb doesnt exist');
                
                $this->db->pq("INSERT INTO protein_has_pdb (proteinhaspdbid,proteinid,pdbid) VALUES (s_protein_has_pdb.nextval,:1,:2)", array($this->arg('PROTEINID'),$this->arg('existing_pdb')));
            }
                
            $this->_output(1);

        }
                
        # Duplication :(
        function _associate_pdb($name,$contents,$code,$pid) { 
            $this->db->pq("INSERT INTO pdb (pdbid,name,contents,code) VALUES(s_pdb.nextval,:1,:2,:3) RETURNING pdbid INTO :id", array($name,$contents,$code));
            $pdbid = $this->db->id();
            
            $this->db->pq("INSERT INTO protein_has_pdb (proteinhaspdbid,proteinid,pdbid) VALUES (s_protein_has_pdb.nextval,:1,:2)", array($pid,$pdbid));
        }
        
        # ------------------------------------------------------------------------
        # Remove a pdb
        function _remove_pdb() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            #if (!$this->has_arg('pid')) $this->_error('No protein specified');
            if (!$this->has_arg('pdbid')) $this->_error('No pdb specified');
            
            $pdb = $this->db->pq("SELECT pd.pdbid 
              FROM pdb pd 
              INNER JOIN protein_has_pdb hp ON hp.pdbid=pd.pdbid 
              INNER JOIN protein p ON p.proteinid = hp.proteinid 
              WHERE p.proposalid=:1 AND hp.proteinhaspdbid=:2", array($this->proposalid, $this->arg('pdbid')));
            
            if (!sizeof($pdb)) $this->_error('No such pdb');
            else $pdb = $pdb[0];
            
            # Remove association
            $this->db->pq("DELETE FROM protein_has_pdb WHERE proteinhaspdbid=:1", array($this->arg('pdbid')));
            
            # Remove entry if its the last one
            $count = $this->db->pq("SELECT pdbid FROM protein_has_pdb WHERE pdbid=:1", array($pdb['PDBID']));
            if (!sizeof($count)) $this->db->pq("DELETE FROM pdb WHERE pdbid=:1", array($pdb['PDBID']));
            
            $this->_output(1);
        }
        
        
        
        function _add_protein() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            $pids = $this->db->pq("SELECT p.proposalid FROM blsession bl INNER JOIN proposal p ON bl.proposalid = p.proposalid WHERE p.proposalcode || p.proposalnumber LIKE :1", array($this->arg('prop')));
            
            if (!sizeof($pids) > 0) $this->_error('No such proposal');
            else $pid = $pids[0]['PROPOSALID'];
            
            if (!$this->has_arg('ACRONYM')) $this->_error('No protein acronym');
            
            $name = $this->has_arg('NAME') ? $this->arg('NAME') : '';
            $seq = $this->has_arg('SEQUENCE') ? $this->arg('SEQUENCE') : '';
            $mass = $this->has_arg('MOLECULARMASS') ? $this->arg('MOLECULARMASS') : '';
            
            $this->db->pq('INSERT INTO protein (proteinid,proposalid,name,acronym,sequence,molecularmass,bltimestamp) VALUES (s_protein.nextval,:1,:2,:3,:4,:5,CURRENT_TIMESTAMP) RETURNING proteinid INTO :id',array($pid, $name, $this->arg('ACRONYM'), $seq, $mass));
            
            $pid = $this->db->id();
            
            $this->_output(array('PROTEINID' => $pid));
        }


        function _get_diffraction_plans() {
            $where = '';
            $args = array();//$this->proposalid);

            if ($this->has_arg('did')) {
                $where .= ' AND dp.diffractionplanid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }

            $dps = $this->db->pq("SELECT dp.diffractionplanid, dp.comments, dp.complexity,
              dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, rtrim(to_char(dp.exposuretime, 'FM90.99'), '.') as exposuretime, rtrim(to_char(dp.requiredresolution, 'FM90.99'), '.') as requiredresolution
              FROM diffractionplan dp
              WHERE dp.complexity = 'PRESET' $where
            ", $args);

            if ($this->has_arg('did')) {
                if (sizeof($dps)) $this->_output($dps[0]);
                else $this->_error('No such diffraction plan');

            } else $this->_output($dps);
        }


        function _add_diffraction_plan() {
            if (!$this->has_arg('COMMENTS')) $this->_error('No name specified');

            $args = array('PRESET', $this->arg('COMMENTS'));
            foreach(array('EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME') as $f) {
                array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
            } 

            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, complexity, comments, experimentkind, requiredresolution, preferredbeamsizex, preferredbeamsizey, exposuretime)
              VALUES (s_diffractionplan.nextval, :1, :2, :3, :4, :5, :6, :7) RETURNING diffractionplanid INTO :id", $args);

            $this->_output(array('DIFFRACTIONPLANID' => $this->db->id()));
        }


        function _delete_diffraction_plan() {

        }

        
    }

?>