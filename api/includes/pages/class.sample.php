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
                              'crid' => '\d+',
                              'lid' => '\d+',
                              'value' => '.*',
                              'ty' => '\w+',
                              't' => '\w+',
                              'pjid' => '\d+',
                              'imp' => '\d',
                              'lt' => '\w+',
                              'existing_pdb' => '\d+',
                              'pdb_code' => '\w\w\w\w',
                              'pdbid' => '\d+',
                              'visit' => '\w+\d+-\d+',
                              'type' => '\d+',
                              'global' => '\d+',
                              'seq' => '\d',

                              'PROTEINID' => '\d+',
                              'CRYSTALID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'LOCATION' => '\d+',
                              'CODE' => '\w+',
                              // 'NAME' => '.*',
                              'ACRONYM' => '([\w-])+',
                              'SEQUENCE' => '[\s\w\(\)\.>\|;\n]+',
                              'MOLECULARMASS' => '\d+(.\d+)?',
                              'VOLUME' => '\d+(.\d+)?',
                              'DENSITY' => '\d+(.\d+)?',
                              'THEORETICALDENSITY' => '\d+(.\d+)?',

                              'NAME' => '[\w\s-()]+',
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

                              'COMPONENTTYPEID' => '\d+',
                              'CONCENTRATIONTYPEID' => '\d+',
                              'GLOBAL' => '\d+',

                              'COMPONENTIDS' => '\d+',
                              'COMPONENTAMOUNTS' => '\d+(.\d+)?',
                              'ABUNDANCE' => '\d+(.\d+)?',
                              'PACKINGFRACTION' => '\d+(.\d+)?',
                              'DIMENSION1' => '\d+(.\d+)?',
                              'DIMENSION2' => '\d+(.\d+)?',
                              'DIMENSION3' => '\d+(.\d+)?',
                              'SHAPE' => '\w+',
                              'LOOPTYPE' => '\w+',
                              'COMPONENTID' => '\d+',
                              'BLSAMPLETYPEID' => '\d+',
                              'scid' => '\d+-\d+',

                              'BLSAMPLEID' => '\d+',
                              'X' => '\d+(.\d+)?',
                              'Y' => '\d+(.\d+)?',
                              'Z' => '\d+(.\d+)?',
                              'X2' => '\d+(.\d+)?',
                              'Y2' => '\d+(.\d+)?',
                              'Z2' => '\d+(.\d+)?',

                              'EXPERIMENTKIND' => '\w+',
                              'EXPOSURETIME' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEX' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEY' => '\d+(.\d+)?',
                              'BOXSIZEX' => '\d+',
                              'BOXSIZEY' => '\d+',
                              'NUMBEROFIMAGES' => '\d+',
                              'AXISSTART' => '-?\d+(.\d+)?',
                              'AXISRANGE' => '\d+(.\d+)?',
                              'TRANSMISSION' => '\d+(.\d+)?',
                              'ENERGY' => '\d+(.\d+)?',
                              'MONOCHROMATOR' => '\w+',

                              'queued' => '\d',
                              'UNQUEUE' => '\d',

                              'externalid' => '\d',

                              'COMPONENTLATTICEID' => '\d+',

                              'BLSAMPLEGROUPID' => '\d+',
                              'GROUPORDER' => '\d+',
                              'TYPE' => '\w+',
                              'BLSAMPLEGROUPSAMPLEID' => '\d+-\d+',

                               );
        
        
        public static $dispatch = array(array('(/:sid)(/cid/:cid)', 'get', '_samples'),
                              array('/:sid', 'patch', '_update_sample'),
                              array('/:sid', 'put', '_update_sample_full'),
                              array('', 'post', '_add_sample'),

                              array('/components', 'post', '_add_sample_component'),
                              array('/components/:scid', 'delete', '_remove_sample_component'),

                              array('/sub(/:ssid)(/sid/:sid)', 'get', '_sub_samples'),
                              array('/sub/:ssid', 'patch', '_update_sub_sample'),
                              array('/sub/:ssid', 'put', '_update_sub_sample_full'),
                              array('/sub', 'post', '_add_sub_sample'),
                              array('/sub/:ssid', 'delete', '_delete_sub_sample'),
                              array('/sub/queue/:BLSUBSAMPLEID', 'get', '_pre_q_sub_sample'),

                              array('/plan', 'get', '_get_diffraction_plans'),
                              array('/plan', 'post', '_add_diffraction_plan'),
                              array('/plan/:pid', 'delete', '_delete_diffraction_plan'),


                              array('/proteins(/:pid)', 'get', '_proteins'),
                              array('/proteins', 'post', '_add_protein'),
                              array('/proteins/:pid', 'patch', '_update_protein'),
                              array('/proteins/distinct', 'get', '_disinct_proteins'),

                              array('/proteins/lattice(/:lid)', 'get', '_protein_lattices'),
                              array('/proteins/lattice', 'post', '_add_protein_lattice'),
                              array('/proteins/lattice/:lid', 'patch', '_update_protein_lattice'),


                              array('/crystals(/:CRYSTALID)', 'get', '_crystals'),
                              array('/crystals', 'post', '_add_crystal'),
                              array('/crystals/:CRYSTALID', 'patch', '_update_crystal'),

                              array('/pdbs(/pid/:pid)', 'get', '_get_pdbs'),
                              array('/pdbs', 'post', '_add_pdb'),
                              array('/pdbs(/:pdbid)', 'delete', '_remove_pdb'),

                              array('/concentrationtypes', 'get', '_concentration_types'),
                              array('/componenttypes', 'get', '_component_types'),

                              array('/groups', 'get', '_sample_groups'),
                              array('/groups', 'post', '_add_sample_to_group'),
                              array('/groups/:BLSAMPLEGROUPSAMPLEID', 'put', '_update_sample_group'),
                              array('/groups/:BLSAMPLEGROUPSAMPLEID', 'delete', '_remove_sample_from_group'),
        );


        function _pre_q_sub_sample() {
            if (!$this->has_arg('BLSUBSAMPLEID')) $this->_error('No subsample specified');

            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('BLSUBSAMPLEID')));

            if (!sizeof($samp)) $this->_error('No such sub sample');

            if ($this->has_arg('UNQUEUE')) {
                $this->db->pq("DELETE FROM containerqueuesample WHERE blsubsampleid=:1 AND containerqueueid IS NULL", array($this->arg('BLSUBSAMPLEID')));

            } else {
                $this->db->pq("INSERT INTO containerqueuesample (blsubsampleid) VALUES (:1)", array($this->arg("BLSUBSAMPLEID")));
                $this->_output(array('CONTAINERQUEUESAMPLEID' => $this->db->id()));
            }
        }


        function _add_sample_component() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('ABUNDANCE')) $this->_error('No amount specified');
            if (!$this->has_arg('COMPONENTID')) $this->_error('No component specified');
            if (!$this->has_arg('BLSAMPLETYPEID')) $this->_error('No crystal specified');

            $check = $this->db->pq("SELECT crystalid FROM crystal c
              INNER JOIN protein pr ON pr.proteinid = c.proteinid
              WHERE pr.proposalid=:1 AND c.crystalid=:2", array($this->proposalid, $this->arg('BLSAMPLETYPEID')));
            if (!sizeof($check)) $this->_error('No such blsampletype');

            $this->_update_sample_components(array(), array($this->arg('COMPONENTID')), array($this->arg('ABUNDANCE')), $this->arg('BLSAMPLETYPEID'));
            $this->_output(1);
        }


        function _remove_sample_component() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('scid')) $this->_error('No crystal/component specified');

            list($crystalid, $componentid) = explode('-', $this->arg('scid'));

            $check = $this->db->pq("SELECT crystalid FROM crystal c
              INNER JOIN protein pr ON pr.proteinid = c.proteinid
              WHERE pr.proposalid=:1 AND c.crystalid=:2", array($this->proposalid, $crystalid));
            if (!sizeof($check)) $this->_error('No such blsampletype');

            $this->_update_sample_components(array($componentid), array(), array(), $crystalid);
            $this->_output(1);
        }
        

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

            if ($this->has_arg('queued')) {
                $where .= ' AND cqs.containerqueuesampleid IS NOT NULL';
            }

            $subs = $this->db->pq("SELECT pr.acronym as protein, s.name as sample, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, round(dp.exposuretime,3) as exposuretime, dp.requiredresolution, dp.boxsizex, dp.boxsizey, dp.monochromator, dp.axisstart, dp.axisrange, dp.numberofimages, dp.transmission, dp.energy, count(sss.blsampleid) as samples, s.location, ss.diffractionplanid, pr.proteinid, ss.blsubsampleid, ss.blsampleid, ss.comments, ss.positionid, po.posx as x, po.posy as y, po.posz as z, po2.posx as x2, po2.posy as y2, po2.posz as z2, IF(cqs.containerqueuesampleid IS NOT NULL AND cqs.containerqueueid IS NULL, 1, 0) as readyforqueue, cq.containerqueueid, count(distinct IF(dc.overlap != 0,dc.datacollectionid,NULL)) as sc, count(distinct IF(dc.overlap = 0 AND dc.axisrange = 0,dc.datacollectionid,NULL)) as gr, count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL)) as dc, count(distinct so.screeningid) as ai, count(distinct ap.autoprocintegrationid) as ap, round(min(st.rankingresolution),2) as scresolution, max(ssw.completeness) as sccompleteness, round(min(apss.resolutionlimithigh),2) as dcresolution, round(max(apss.completeness),1) as dccompleteness
              FROM blsubsample ss
              LEFT OUTER JOIN position po ON po.positionid = ss.positionid
              LEFT OUTER JOIN position po2 ON po2.positionid = ss.position2id
              LEFT OUTER JOIN blsample sss on ss.blsubsampleid = sss.blsubsampleid
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN crystal cr ON cr.crystalid = s.crystalid
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              LEFT OUTER JOIN containerqueuesample cqs ON cqs.blsubsampleid = ss.blsubsampleid
              LEFT OUTER JOIN containerqueue cq ON cqs.containerqueueid = cq.containerqueueid AND cq.completedtimestamp IS NULL

              LEFT OUTER JOIN diffractionplan dp ON ss.diffractionplanid = dp.diffractionplanid

              LEFT OUTER JOIN datacollection dc ON ss.blsubsampleid = dc.blsubsampleid
              LEFT OUTER JOIN screening sc ON dc.datacollectionid = sc.datacollectionid
              LEFT OUTER JOIN screeningoutput so ON sc.screeningid = so.screeningid
              
              LEFT OUTER JOIN screeningstrategy st ON st.screeningoutputid = so.screeningoutputid AND sc.shortcomments LIKE '%EDNA%'
              LEFT OUTER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid
              
              LEFT OUTER JOIN autoprocintegration ap ON ap.datacollectionid = dc.datacollectionid
              LEFT OUTER JOIN autoprocscaling_has_int aph ON aph.autoprocintegrationid = ap.autoprocintegrationid
              LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid

              WHERE p.proposalid=:1 $where
              GROUP BY pr.acronym, s.name, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, dp.exposuretime, dp.requiredresolution, s.location, ss.diffractionplanid, pr.proteinid, ss.blsubsampleid, ss.blsampleid, ss.comments, ss.positionid, po.posx, po.posy, po.posz
              ORDER BY ss.blsubsampleid", $args);

            foreach ($subs as $i => &$r) $r['RID'] = $i;

            if ($this->has_arg('ssid')) {
                if (!sizeof($subs)) $this->_error('No such sub sample');
                else $this->_output($subs[0]);

            } else $this->_output($subs);
        }

        function _update_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');
            
            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid,ss.position2id FROM blsubsample ss
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
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE diffractionplan SET '.$f.'=:1 WHERE diffractionplanid=:2', array($this->arg($f), $samp[0]['DIFFRACTIONPLANID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }

            if ($samp[0]['POSITIONID']) {
                foreach(array('X', 'Y', 'Z') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE position SET pos'.$f.'=:1 WHERE positionid=:2', array($this->arg($f), $samp[0]['POSITIONID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }

            if ($samp[0]['POSITION2ID']) {
                foreach(array('X2', 'Y2', 'Z2') as $f) {
                    if ($this->has_arg($f)) {
                        $cn = str_replace('2', '', $f);
                        $this->db->pq('UPDATE position SET pos'.$cn.'=:1 WHERE positionid=:2', array($this->arg($f), $samp[0]['POSITION2ID']));
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
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 
                  'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR') as $f) {
                    array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
                }
                $this->db->pq('UPDATE diffractionplan 
                  SET requiredresolution=:2, experimentkind=:3, preferredbeamsizex=:4, preferredbeamsizey=:5, exposuretime=:6, boxsizex=:7, boxsizey=:8, axisstart=:9, axisrange=:10, numberofimages=:11, transmission=:12, energy=:13, monochromator=:14 
                  WHERE diffractionplanid=:1', $args);

                $this->_output(array('BLSUBSAMPLEID' => $this->arg('ssid')));
            }
        }



        function _add_sub_sample() {
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');
            if (!$this->has_arg('X')) $this->_error('No x position specified');
            if (!$this->has_arg('Y')) $this->_error('No y position specified');

            $z = $this->has_arg('Z') ? $this->arg('Z') : null;

            $x2 = $this->has_arg('X2') ? $this->arg('X2') : null;
            $y2 = $this->has_arg('Y2') ? $this->arg('Y2') : null;
            $z2 = $this->has_arg('Z2') ? $this->arg('Z2') : null;

            $samp = $this->db->pq("SELECT s.blsampleid FROM blsample s
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND s.blsampleid=:2", array($this->proposalid, $this->arg('BLSAMPLEID')));

            if (!sizeof($samp)) $this->_error('No such sample');

            $this->db->pq("INSERT INTO position (positionid, posx, posy, posz) 
              VALUES (s_position.nextval, :1, :2, :3) RETURNING positionid INTO :id", array($this->arg('X'), $this->arg('Y'), $z));
            $pid = $this->db->id();

            if ($x2 && $y2) {
                $this->db->pq("INSERT INTO position (positionid, posx, posy, posz) 
                    VALUES (s_position.nextval, :1, :2, :3) RETURNING positionid INTO :id", array($x2, $y2, $z2));
                $pid2 = $this->db->id();
            } else $pid2 = null;

            $exp = ($x2 && $y2) ? 'MESH' : 'SAD';
            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid,experimentkind) 
              VALUES (s_diffractionplan.nextval,:1) RETURNING diffractionplanid INTO :id", array($exp));
            $did = $this->db->id();

            $this->db->pq("INSERT INTO blsubsample (blsubsampleid, blsampleid, positionid, position2id, diffractionplanid) 
              VALUES (s_blsubsample.nextval, :1, :2, :3, :4) RETURNING blsubsampleid INTO :id", array($this->arg('BLSAMPLEID'), $pid, $pid2, $did));

            // $this->_output(array('BLSUBSAMPLEID' => $this->db->id()));
            $this->args['ssid'] = $this->db->id();
            $this->_sub_samples();
        }


        function _delete_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');

            $can_delete = true;
            $ref = null;
            foreach (array('datacollection', 'energyscan', 'xfefluorescencespectrum', 'blsample') as $table) {
                $chk = $this->db->pq("SELECT blsubsampleid FROM ${table} WHERE blsubsampleid=:1", array($this->arg('ssid')));
                if (sizeof($chk)) $can_delete = false;
                $ref = $table;
            }

            if (!$can_delete) $this->_error('Cannot delete that subsample as it is referenced by another entity: '.$ref);

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
                $info = $this->db->pq('SELECT p.title FROM project p LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid WHERE p.projectid=:1 AND (p.personid=:2 or php.personid=:3)', array($this->arg('pjid'), $this->user->personid, $this->user->personid));
                if (!sizeof($info)) $this->_error('No such project');

                $args = array($this->arg('pjid'));
                $where = '(pj.projectid=:'.sizeof($args).')';
                $join = ' LEFT OUTER JOIN project_has_blsample pj ON pj.blsampleid=b.blsampleid';
                
                if (!$this->staff) {
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
                $where .= ' AND (pr.proteinid=:'.(sizeof($args)+1).' OR chc2.componentid=:'.(sizeof($args)+2).')';
                $join .= ' LEFT OUTER JOIN blsampletype_has_component chc2 ON chc2.blsampletypeid=b.crystalid';
                array_push($args, $this->arg('pid'));
                array_push($args, $this->arg('pid'));
            }

            # For a particular crystal
            if ($this->has_arg('crid')) {
                $where .= ' AND cr.crystalid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('crid'));                
            }

            # Sample group
            if ($this->has_arg('BLSAMPLEGROUPID')) {
                $where .= ' AND bsg.blsamplegroupid =:'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEGROUPID'));
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

            # For a loop type
            if ($this->has_arg('lt')) {
                $where .= ' AND b.looptype LIKE :'.(sizeof($args)+1);
                array_push($args, $this->arg('lt'));
            }
            
            
            # For a visit
            if ($this->has_arg('visit')) {
                $info = $this->db->pq("SELECT s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
                if (!sizeof($info)) $this->_error('No such visit');
                else $info = $info[0];
                                      
                $where .= " AND d.dewarstatus='processing' AND c.beamlinelocation LIKE :".(sizeof($args)+1)." AND c.samplechangerlocation is NOT NULL";
                array_push($args, $info['BL']);
            }
            

            $cseq = '';
            $sseq = '';
            if ($this->has_arg('seq')) {
                $cseq = 'string_agg(cpr.sequence) as componentsequences,';
                $sseq = 'pr.sequence,';
            }
            
            
            // Search
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(b.name) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(b.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')) OR lower(b.code) LIKE lower(CONCAT(CONCAT('%',:".($st+3)."), '%')))";
                for ($i = 0; $i < 4; $i++) array_push($args, $this->arg('s'));
            }
            
            
            // Filter by sample status
            if ($this->has_arg('t')) {
                //$this->db->set_debug(true);
                $types = array('R' => 'count(distinct r.robotactionid)',
                               'SC' => 'count(distinct IF(dc.overlap != 0,dc.datacollectionid,NULL))',
                               'AI' => 'count(distinct so.screeningid)',
                               'DC' => 'count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL))',
                               'AP' => 'count(distinct ap.autoprocintegrationid)');
                if (array_key_exists($this->arg('t'), $types)) {
                    $having .= " HAVING ".$types[$this->arg('t')]." > 0";
                }
            }

            $tot = $this->db->pq("SELECT count(distinct b.blsampleid) as tot 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN blsamplegroup_has_blsample bsg ON bsg.blsampleid = b.blsampleid
              LEFT OUTER JOIN blsampletype_has_component chc ON b.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON p.proposalid = pr.proposalid 
              INNER JOIN container c ON c.containerid = b.containerid 
              INNER JOIN dewar d ON d.dewarid = c.dewarid $join WHERE $where", $args);
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
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'b.blsampleid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('SAMPLEID' => 'b.blsampleid', 'NAME' => 'b.name', 'ACRONYM' => 'pr.acronym', 'SPACEGROUP' => 'cr.spacegroup', 'COMMENTS' => 'b.comments', 'SHIPMENT' => 'shipment', 'DEWAR' => 'dewar', 'CONTAINER' => 'container', 'b.blsampleid', 'SC' => 'sc', 'SCRESOLUTION' => 'scresolution', 'DC' => 'ap', 'DCRESOLUTION' => 'dcresolution', 'POSITION' => 'TO_NUMBER(b.location)', 'RECORDTIMESTAMP' => 'b.recordtimestamp');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT distinct b.blsampleid, b.crystalid, b.screencomponentgroupid, ssp.blsampleid as parentsampleid, ssp.name as parentsample, b.blsubsampleid, count(distinct si.blsampleimageid) as inspections, CONCAT(p.proposalcode,p.proposalnumber) as prop, b.code, b.location, pr.acronym, pr.proteinid, cr.spacegroup,b.comments,b.name,s.shippingname as shipment,s.shippingid,d.dewarid,d.code as dewar, c.code as container, c.containerid, c.samplechangerlocation as sclocation, count(distinct IF(dc.overlap != 0,dc.datacollectionid,NULL)) as sc, count(distinct IF(dc.overlap = 0 AND dc.axisrange = 0,dc.datacollectionid,NULL)) as gr, count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL)) as dc, count(distinct so.screeningid) as ai, count(distinct ap.autoprocintegrationid) as ap, count(distinct r.robotactionid) as r, round(min(st.rankingresolution),2) as scresolution, max(ssw.completeness) as sccompleteness, round(min(apss.resolutionlimithigh),2) as dcresolution, round(max(apss.completeness),1) as dccompleteness, dp.anomalousscatterer, dp.requiredresolution, cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma, b.packingfraction, b.dimension1, b.dimension2, b.dimension3, b.shape, cr.theoreticaldensity, cr.name as crystal, pr.name as protein, b.looptype
                                  , $cseq $sseq string_agg(cpr.name) as componentnames, string_agg(cpr.density) as componentdensities
                                  ,string_agg(cpr.proteinid) as componentids, string_agg(cpr.acronym) as componentacronyms, string_agg(cpr.global) as componentglobals, string_agg(chc.abundance) as componentamounts, string_agg(ct.symbol) as componenttypesymbols, b.volume, pct.symbol,ROUND(cr.abundance,3) as abundance, TO_CHAR(b.recordtimestamp, 'DD-MM-YYYY') as recordtimestamp
                                  
                                  FROM blsample b

                                  INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN concentrationtype pct ON pr.concentrationtypeid = pct.concentrationtypeid

                                  LEFT OUTER JOIN blsampletype_has_component chc ON b.crystalid = chc.blsampletypeid
                                  LEFT OUTER JOIN protein cpr ON cpr.proteinid = chc.componentid
                                  LEFT OUTER JOIN concentrationtype ct ON cpr.concentrationtypeid = ct.concentrationtypeid

                                  INNER JOIN container c ON b.containerid = c.containerid
                                  INNER JOIN dewar d ON d.dewarid = c.dewarid
                                  INNER JOIN shipping s ON s.shippingid = d.shippingid
                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join
                                  
                                  LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = b.diffractionplanid 
                                  LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid
                                  LEFT OUTER JOIN screening sc ON dc.datacollectionid = sc.datacollectionid
                                  LEFT OUTER JOIN screeningoutput so ON sc.screeningid = so.screeningid
                                  
                                  LEFT OUTER JOIN screeningstrategy st ON st.screeningoutputid = so.screeningoutputid AND sc.shortcomments LIKE '%EDNA%'
                                  LEFT OUTER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid
                                  
                                  
                                  LEFT OUTER JOIN autoprocintegration ap ON ap.datacollectionid = dc.datacollectionid
                                  LEFT OUTER JOIN autoprocscaling_has_int aph ON aph.autoprocintegrationid = ap.autoprocintegrationid
                                  LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid

                                  LEFT OUTER JOIN blsampleimage si ON b.blsampleid = si.blsampleid

                                  LEFT OUTER JOIN blsubsample ss ON b.blsubsampleid = ss.blsubsampleid
                                  LEFT OUTER JOIN blsample ssp ON ss.blsampleid = ssp.blsampleid
                                  
                                  
                                  LEFT OUTER JOIN robotaction r ON r.blsampleid = b.blsampleid AND r.actiontype = 'LOAD'
                                  
                                  WHERE $where
                                  
                                  GROUP BY b.crystalid, b.screencomponentgroupid, ssp.blsampleid, ssp.name, b.blsubsampleid, b.blsampleid, b.code, b.location, pr.acronym, pr.proteinid, cr.spacegroup,b.comments,b.name,s.shippingname,s.shippingid,d.dewarid,d.code, c.code, c.containerid, c.samplechangerlocation, CONCAT(p.proposalcode,p.proposalnumber), dp.anomalousscatterer, dp.requiredresolution, cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma
                                  
                                  $having
                                  
                                  ORDER BY $order", $args);
            
            foreach ($rows as &$r) {
                foreach (array('COMPONENTIDS', 'COMPONENTAMOUNTS', 'COMPONENTACRONYMS', 'COMPONENTTYPESYMBOLS', 'COMPONENTGLOBALS', 'COMPONENTNAMES', 'COMPONENTDENSITIES', 'COMPONENTSEQUENCES') as $k) {
                    if (array_key_exists($k, $r)) {
                      if ($r[$k]) $r[$k] = explode(',', $r[$k]);
                    }
                }
            }


            if ($this->has_arg('sid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such sample');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }
        

        function _update_sample_full() {           
            $a = $this->_prepare_sample_args();

            $samp = $this->db->pq("SELECT sp.blsampleid, pr.proteinid, cr.crystalid, dp.diffractionplanid, string_agg(chc.componentid) as componentids
              FROM blsample sp 
              INNER JOIN crystal cr ON sp.crystalid = cr.crystalid 
              INNER JOIN protein pr ON cr.proteinid = pr.proteinid 
              LEFT OUTER JOIN blsampletype_has_component chc ON sp.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON pr.proposalid = p.proposalid 
              LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = sp.diffractionplanid 
              WHERE p.proposalid = :1 AND sp.blsampleid=:2
              GROUP BY sp.blsampleid, pr.proteinid, cr.crystalid, dp.diffractionplanid", 
              array($this->proposalid,$this->arg('sid')));
                
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $this->db->pq("UPDATE blsample set name=:1,comments=:2,code=:3,volume=:4,packingfraction=:5,dimension1=:6,dimension2=:7,dimension3=:8,shape=:9,looptype=:10 WHERE blsampleid=:11", 
              array($a['NAME'],$a['COMMENTS'],$a['CODE'],$a['VOLUME'],$a['PACKINGFRACTION'],$a['DIMENSION1'],$a['DIMENSION2'],$a['DIMENSION3'],$a['SHAPE'],$a['LOOPTYPE'],$this->arg('sid'))); 

            if (array_key_exists('PROTEINID', $a)) {
                $this->db->pq("UPDATE crystal set spacegroup=:1,proteinid=:2,cell_a=:3,cell_b=:4,cell_c=:5,cell_alpha=:6,cell_beta=:7,cell_gamma=:8,theoreticaldensity=:9 WHERE crystalid=:10", 
                  array($a['SPACEGROUP'], $a['PROTEINID'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['THEORETICALDENSITY'], $samp['CRYSTALID']));
                $this->db->pq("UPDATE diffractionplan set anomalousscatterer=:1,requiredresolution=:2 WHERE diffractionplanid=:3", 
                  array($a['ANOMALOUSSCATTERER'], $a['REQUIREDRESOLUTION'], $samp['DIFFRACTIONPLANID']));
            }

            $init_comps = explode(',', $samp['COMPONENTIDS']);
            $fin_comps = $a['COMPONENTIDS'] ? $a['COMPONENTIDS'] : array();
            $amounts = $a['COMPONENTAMOUNTS'] ? $a['COMPONENTAMOUNTS'] : null;
            $this->_update_sample_components($init_comps, $fin_comps, $amounts, $samp['CRYSTALID']);

            $this->_output(array('BLSAMPLEID' => $samp['BLSAMPLEID']));
        }

        function _update_sample_components($initial, $final, $amounts, $crystalid) {
            $rem = array_diff($initial, $final);
            $add = array_diff($final, $initial);

            foreach ($rem as $r) $this->db->pq("DELETE FROM blsampletype_has_component WHERE blsampletypeid=:1 AND componentid=:2", array($crystalid, $r));
            foreach ($add as $a) $this->db->pq("INSERT INTO blsampletype_has_component (blsampletypeid, componentid) VALUES (:1,:2)", array($crystalid, $a));

            if ($amounts) {
                foreach($final as $i => $f) {
                    $this->db->pq("UPDATE blsampletype_has_component SET abundance=:1 WHERE blsampletypeid=:2 AND componentid=:3", array($amounts[$i], $crystalid, $f));
                }
            }
        }


        function _add_sample() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            // Register entire container
            if ($this->has_arg('collection')) {
                $this->db->start_transaction();
                $col = array();
                foreach ($this->arg('collection') as $s) {
                    $id = $this->_do_add_sample($this->_prepare_sample_args($s));

                    if ($id) {
                        $s['BLSAMPLEID'] = $id;
                        array_push($col, $s);
                    }
                }

                $this->db->end_transaction();
                $this->user->set_cache('container', null);
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
            foreach (array('LOCATION', 'CONTAINERID', 'NAME') as $f) {
                if ($s) {
                    if (!array_key_exists($f, $s)) $this->_error('One or more fields are mising');
                    else $a[$f] = $s[$f];

                } else {
                    if (!$this->has_arg($f)) $this->_error('One or more fields are mising');
                    else $a[$f] = $this->arg($f);
                }
            }

            $haskey = false;
            foreach (array('PROTEINID', 'CRYSTALID') as $f) {
                if ($s) {
                    if (array_key_exists($f, $s)) {
                        $a[$f] = $s[$f];
                        $haskey = true;
                    }
                } else {
                    if ($this->has_arg($f)) {
                        $a[$f] = $this->arg($f);
                        $haskey = true;
                    }
                }
            }            
            if (!$haskey) $this->_error('One or more fields is missing');


            foreach (array('COMMENTS', 'SPACEGROUP', 'CODE', 'ANOMALOUSSCATTERER') as $f) {
                if ($s) $a[$f] = array_key_exists($f, $s) ? $s[$f] : '';
                else $a[$f] = $this->has_arg($f) ? $this->arg($f) : '';
            }

            foreach (array('SCREENCOMPONENTGROUPID', 'BLSUBSAMPLEID', 'COMPONENTIDS', 'COMPONENTAMOUNTS', 'REQUIREDRESOLUTION', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'VOLUME', 'ABUNDANCE', 'PACKINGFRACTION', 'DIMENSION1', 'DIMENSION2', 'DIMENSION3', 'SHAPE', 'THEORETICALDENSITY', 'LOOPTYPE') as $f) {
                if ($s) $a[$f] = array_key_exists($f, $s) ? $s[$f] : null;
                else $a[$f] = $this->has_arg($f) ? $this->arg($f) : null;
            }

            return $a;
        }


        function _do_add_sample($a) {
            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, requiredresolution, anomalousscatterer) VALUES (s_diffractionplan.nextval, :1, :2) RETURNING diffractionplanid INTO :id", 
                array($a['REQUIREDRESOLUTION'], $a['ANOMALOUSSCATTERER']));
            $did = $this->db->id();

            if (!array_key_exists('CRYSTALID', $a)) {
                $chk = $this->db->pq("SELECT pr.proteinid
                    FROM protein pr
                    INNER JOIN proposal p ON p.proposalid = pr.proposalid
                    WHERE p.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid, $a['PROTEINID']));
                if (!sizeof($chk)) $this->_error('No such crystal');

                $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,cell_a,cell_b,cell_c,cell_alpha,cell_beta,cell_gamma,abundance,theoreticaldensity) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10) RETURNING crystalid INTO :id", 
                array($a['PROTEINID'], $a['SPACEGROUP'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['ABUNDANCE'], $a['THEORETICALDENSITY']));
                $crysid = $this->db->id();

                if ($a['COMPONENTIDS']) $this->_update_sample_components(array(), $a['COMPONENTIDS'], $a['COMPONENTAMOUNTS'], $crysid);
            } else {
                $chk = $this->db->pq("SELECT cr.crystalid
                    FROM crystal cr
                    INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                    INNER JOIN proposal p ON p.proposalid = pr.proposalid
                    WHERE p.proposalid = :1 AND cr.crystalid = :2", array($this->proposalid, $a['CRYSTALID']));
                if (!sizeof($chk)) $this->_error('No such crystal');

                $crysid = $a['CRYSTALID'];
            }
                             
            $this->db->pq("INSERT INTO blsample (blsampleid,crystalid,diffractionplanid,containerid,location,comments,name,code,blsubsampleid,screencomponentgroupid,volume,packingfraction,dimension1,dimension2,dimension3,shape,looptype) VALUES (s_blsample.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16) RETURNING blsampleid INTO :id", 
                array($crysid, $did, $a['CONTAINERID'], $a['LOCATION'], $a['COMMENTS'], $a['NAME'] ,$a['CODE'], $a['BLSUBSAMPLEID'], $a['SCREENCOMPONENTGROUPID'], $a['VOLUME'], $a['PACKINGFRACTION'], $a['DIMENSION1'], $a['DIMENSION2'], $a['DIMENSION3'],$a['SHAPE'],$a['LOOPTYPE']));
            $sid = $this->db->id();

            return $sid;
        }
        
        
        # ------------------------------------------------------------------------
        # List of proteins for a proposal
        function _proteins() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $args = array($this->proposalid);
            $where = '(pr.proposalid=:1 /*or pr.global=1*/)';
            $join = '';
            $extc = '';

            if ($this->has_arg('pjid')) {
                $info = $this->db->pq('SELECT p.title FROM project p LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid WHERE p.projectid=:1 AND (p.personid=:2 or php.personid=:3)', array($this->arg('pjid'), $this->user->personid, $this->user->personid));
                if (!sizeof($info)) $this->_error('No such project');

                $args = array($this->arg('pjid'));
                $where = 'pj.projectid=:'.sizeof($args);
                $join .= ' INNER JOIN project_has_protein pj ON pj.proteinid=pr.proteinid';
                
                if (!$this->staff) {
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

            if ($this->has_arg('seq')) {
                $extc = 'pr.sequence, ';
            }


            if ($this->has_arg('type')) {
                $where .= ' AND pr.componenttypeid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('type'));
            }

            if ($this->has_arg('externalid')) {
                $where .= ' AND pr.externalid IS NOT NULL';
            }
            

            $tot = $this->db->pq("SELECT count(distinct pr.proteinid) as tot FROM protein pr INNER JOIN proposal p ON p.proposalid = pr.proposalid $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(pr.name) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                for ($i = 0; $i < 2; $i++) array_push($args, $this->arg('s'));
            }
            
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
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
            
            $order = 'pr.proteinid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'pr.name', 'ACRONYM' => 'pr.acronym', 'MOLECULARMASS' =>'pr.molecularmass', 'HASSEQ' => "CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END");
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT /*distinct*/ $extc pr.concentrationtypeid, ct.symbol as concentrationtype, pr.componenttypeid, cmt.name as componenttype, CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END as hasseq, pr.proteinid, CONCAT(p.proposalcode,p.proposalnumber) as prop, pr.name,pr.acronym,pr.molecularmass,pr.global, IF(pr.externalid IS NOT NULL, 1, 0) as external, pr.density, count(php.proteinid) as pdbs
              /*,  count(distinct b.blsampleid) as scount, count(distinct dc.datacollectionid) as dcount*/ 
                                  FROM protein pr
                                  LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = pr.concentrationtypeid
                                  LEFT OUTER JOIN componenttype cmt ON cmt.componenttypeid = pr.componenttypeid
                                  LEFT OUTER JOIN protein_has_pdb php ON php.proteinid = pr.proteinid
                                  /*LEFT OUTER JOIN crystal cr ON cr.proteinid = pr.proteinid
                                  LEFT OUTER JOIN blsample b ON b.crystalid = cr.crystalid
                                  LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid*/
                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join
                                  WHERE $where
                                  GROUP BY pr.proteinid
                                  /*GROUP BY pr.proteinid,pr.name,pr.acronym,pr.molecularmass, pr.sequence, CONCAT(p.proposalcode,p.proposalnumber)*/
                                  ORDER BY $order", $args);
            
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
            $where = '(pr.proposalid=:1)';

            if ($this->has_arg('global')) {
                $where = '(pr.proposalid=:1 OR pr.global=1)';
            }

            if ($this->has_arg('externalid')) {
                $where .= ' AND pr.externalid IS NOT NULL';
            }

            if ($this->has_arg('term')) {
                $where .= " AND (lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".(sizeof($args)+1)."), '%')) OR lower(pr.name) LIKE lower(CONCAT(CONCAT('%',:".(sizeof($args)+2)."), '%')))";
                array_push($args, $this->arg('term'));
                array_push($args, $this->arg('term'));
            }
            
            $rows = $this->db->pq("SELECT distinct pr.global, pr.name, pr.acronym, max(pr.proteinid) as proteinid, ct.symbol as concentrationtype, 1 as hasph, IF(pr.externalid IS NOT NULL, 1, 0) as external
              FROM protein pr 
              LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = pr.concentrationtypeid
              WHERE pr.acronym is not null AND $where 
              GROUP BY ct.symbol, pr.acronym, pr.name, pr.global
              ORDER BY lower(pr.acronym)", $args);
                                 
            $this->_output($rows);
        }


        
        # ------------------------------------------------------------------------
        # Update a particular field for a protein
        function _update_protein() {
            if (!$this->has_arg('pid')) $this->_error('No proteinid specified');
            
            $prot = $this->db->pq("SELECT pr.proteinid FROM protein pr 
              WHERE pr.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid,$this->arg('pid')));
            
            if (!sizeof($prot)) $this->_error('No such protein');
            
            foreach(array('NAME', 'SEQUENCE', 'ACRONYM', 'MOLECULARMASS', 'CONCENTRATIONTYPEID', 'COMPONENTTYPEID', 'GLOBAL', 'DENSITY') as $f) {
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
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $sfields = array('CODE', 'NAME', 'COMMENTS', 'VOLUME', 'PACKINGFRACTION', 'DIMENSION1', 'DIMENSION2', 'DIMENSION3', 'SHAPE', 'POSITION', 'CONTAINERID', 'LOOPTYPE');
            foreach ($sfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsample SET $f=:1 WHERE blsampleid=:2", array($this->arg($f), $samp['BLSAMPLEID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            $cfields = array('PROTEINID', 'SPACEGROUP', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'THEORETICALDENSITY');
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
              WHERE pr.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid,$this->arg('PROTEINID')));
            
            if (!sizeof($prot)) $this->_error('No such protein');
            
            if (array_key_exists('pdb_file', $_FILES)) {
                if ($_FILES['pdb_file']['name']) {
                    $info = pathinfo($_FILES['pdb_file']['name']);
                    
                    if ($info['extension'] == 'pdb' || $info['extension'] == 'cif') {
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
            if (!$this->has_arg('ACRONYM')) $this->_error('No protein acronym');
            
            $name = $this->has_arg('NAME') ? $this->arg('NAME') : '';
            $seq = $this->has_arg('SEQUENCE') ? $this->arg('SEQUENCE') : '';
            $mass = $this->has_arg('MOLECULARMASS') ? $this->arg('MOLECULARMASS') : null;
            $ct = $this->has_arg('CONCENTRATIONTYPEID') ? $this->arg('CONCENTRATIONTYPEID') : null;
            $cmt = $this->has_arg('COMPONENTTYPEID') ? $this->arg('COMPONENTTYPEID') : null;
            $global = $this->has_arg('GLOBAL') ? $this->arg('GLOBAL') : null;
            $density = $this->has_arg('DENSITY') ? $this->arg('DENSITY') : null;
            
            $chk = $this->db->pq("SELECT proteinid FROM protein
              WHERE proposalid=:1 AND acronym=:2", array($this->proposalid, $this->arg('ACRONYM')));
            if (sizeof($chk)) $this->_error('That protein acronym already exists in this proposal');

            $this->db->pq('INSERT INTO protein (proteinid,proposalid,name,acronym,sequence,molecularmass,bltimestamp,concentrationtypeid,componenttypeid,global,density) 
              VALUES (s_protein.nextval,:1,:2,:3,:4,:5,CURRENT_TIMESTAMP,:6,:7,:8,:9) RETURNING proteinid INTO :id',
              array($this->proposalid, $name, $this->arg('ACRONYM'), $seq, $mass, $ct, $cmt, $global, $density));
            
            $pid = $this->db->id();
            
            $this->_output(array('PROTEINID' => $pid));
        }


        function _get_diffraction_plans() {
            $where = 'dp.presetforproposalid=:1 OR dp.presetforproposalid=:2';
            $args = array($this->proposalid, 37159);

            if ($this->has_arg('did')) {
                $where .= ' AND dp.diffractionplanid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }

            $dps = $this->db->pq("SELECT dp.diffractionplanid, dp.comments, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, ROUND(dp.exposuretime, 3) as exposuretime, ROUND(dp.requiredresolution, 2) as requiredresolution, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy as energy, monochromator
              FROM diffractionplan dp
              WHERE $where
            ", $args);

            if ($this->has_arg('did')) {
                if (sizeof($dps)) $this->_output($dps[0]);
                else $this->_error('No such diffraction plan');

            } else $this->_output($dps);
        }


        function _add_diffraction_plan() {
            if (!$this->has_arg('COMMENTS')) $this->_error('No name specified');

            $args = array($this->arg('COMMENTS'), $this->proposalid);
            foreach(array('EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR') as $f) {
                array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
            } 

            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, comments, presetforproposalid, experimentkind, requiredresolution, preferredbeamsizex, preferredbeamsizey, exposuretime, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy, monochromator)
              VALUES (s_diffractionplan.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15) RETURNING diffractionplanid INTO :id", $args);

            $this->_output(array('DIFFRACTIONPLANID' => $this->db->id()));
        }


        function _delete_diffraction_plan() {

        }



        function _crystals() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'pr.proposalid=:1';
            $join = '';
            
            # For a specific protein
            if ($this->has_arg('pid')) {
                $where .= ' AND (pr.proteinid=:'.(sizeof($args)+1).' OR chc2.componentid=:'.(sizeof($args)+2).')';
                $join .= ' LEFT OUTER JOIN blsampletype_has_component chc2 ON chc2.blsampletypeid=cr.crystalid';
                array_push($args, $this->arg('pid'));
                array_push($args, $this->arg('pid'));
            }
            
            # For a particular crystal
            if ($this->has_arg('CRYSTALID')) {
                $where .= ' AND cr.crystalid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CRYSTALID'));                
            }

            $cseq = '';
            if ($this->has_arg('seq')) {
                $cseq = 'string_agg(cpr.sequence) as componentsequences,';
            }
            
            
            // Search
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(cr.name) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(cr.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }
            
            $tot = $this->db->pq("SELECT count(distinct cr.crystalid) as tot 
              FROM crystal cr
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON p.proposalid = pr.proposalid 
              $join WHERE $where", $args);
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
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'cr.crystalid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('CRYSTALID' => 'cr.crystalid', 'NAME' => 'cr.name', 'ACRONYM' => 'pr.acronym', 'SPACEGROUP' => 'cr.spacegroup', 'COMMENTS' => 'cr.comments');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT distinct cr.crystalid, cr.name, CONCAT(p.proposalcode,p.proposalnumber) as prop, pr.acronym, pr.name as protein, pr.sequence, pr.proteinid, cr.spacegroup,cr.comments,cr.name,cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma, cr.comments, cr.theoreticaldensity, pr.density
                                  ,string_agg(cpr.proteinid) as componentids, string_agg(cpr.name) as componentnames, string_agg(cpr.acronym) as componentacronyms, string_agg(cpr.density) as componentdensities, $cseq string_agg(cpr.global) as componentglobals, string_agg(chc.abundance) as componentamounts, string_agg(ct.symbol) as componenttypesymbols, pct.symbol,ROUND(cr.abundance,3) as abundance
                                  
                                  FROM crystal cr
                                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN concentrationtype pct ON pr.concentrationtypeid = pct.concentrationtypeid

                                  LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
                                  LEFT OUTER JOIN protein cpr ON cpr.proteinid = chc.componentid
                                  LEFT OUTER JOIN concentrationtype ct ON cpr.concentrationtypeid = ct.concentrationtypeid

                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join

                                  WHERE $where
                                  
                                  GROUP BY cr.crystalid, pr.acronym, pr.proteinid, cr.spacegroup, CONCAT(p.proposalcode,p.proposalnumber), cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma
                                  
                                  ORDER BY $order", $args);
            
            foreach ($rows as &$r) {
                foreach (array('COMPONENTIDS', 'COMPONENTAMOUNTS', 'COMPONENTDENSITIES', 'COMPONENTNAMES', 'COMPONENTSEQUENCES', 'COMPONENTACRONYMS', 'COMPONENTTYPESYMBOLS', 'COMPONENTGLOBALS') as $k) {
                    if (array_key_exists($k, $r)) {
                      if ($r[$k]) $r[$k] = explode(',', $r[$k]);
                    }
                }
            }


            if ($this->has_arg('CRYSTALID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such crystal');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }


        function _add_crystal() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein specified');
            if (!$this->has_arg('NAME')) $this->_error('No name specified');

            $chk = $this->db->pq("SELECT proteinid FROM protein WHERE proteinid=:1 AND proposalid=:2", array($this->arg('PROTEINID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such protein');

            $a = array();
            foreach (array('SPACEGROUP', 'COMMENTS', 'NAME') as $f) $a[$f] = $this->has_arg($f) ? $this->arg($f) : '';
            foreach (array('CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'THEORETICALDENSITY') as $f) $a[$f] = $this->has_arg($f) ? $this->arg($f) : null;

            $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,cell_a,cell_b,cell_c,cell_alpha,cell_beta,cell_gamma,abundance,comments,name,theoreticaldensity) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12) RETURNING crystalid INTO :id", 
                array($this->arg('PROTEINID'), $a['SPACEGROUP'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['ABUNDANCE'], $a['COMMENTS'], $a['NAME'], $a['THEORETICALDENSITY']));
            $crysid = $this->db->id();

            if ($this->has_arg('COMPONENTIDS')) $this->_update_sample_components(array(), $this->arg('COMPONENTIDS'), $this->arg('COMPONENTAMOUNTS'), $crysid);
            
            $this->_output(array('CRYSTALID' => $crysid));
        }


        function _update_crystal() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('CRYSTALID')) $this->_error('No crystal specified');

            $chk = $this->db->pq("SELECT pr.proteinid, string_agg(chc.componentid) as componentids
              FROM crystal cr 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid
              LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
              WHERE cr.crystalid=:1 AND pr.proposalid=:2", array($this->arg('CRYSTALID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such crystal');
            $chk = $chk[0];

            $cfields = array('PROTEINID', 'SPACEGROUP', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'COMMENTS', 'NAME', 'THEORETICALDENSITY');
            foreach ($cfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE crystal SET $f=:1 WHERE crystalid=:2", array($this->arg($f), $this->arg('CRYSTALID')));
                    
                    if ($f == 'PROTEINID') {
                        $name = $this->db->pq('SELECT acronym FROM protein WHERE proteinid=:1', array($chk['PROTEINID']));
                        if (sizeof($name)) {
                            $this->_output(array('ACRONYM' => $name[0]['ACRONYM']));
                        }
                    } else $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($this->has_arg('COMPONENTIDS') && $this->has_arg('COMPONENTAMOUNTS')) { 
                $init_comps = explode(',', $chk['COMPONENTIDS']);
                $this->_update_sample_components($init_comps, $this->arg('COMPONENTIDS'), $this->arg('COMPONENTAMOUNTS'), $this->arg('CRYSTALID'));
            }
        }



        function _protein_lattices() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $where = 'pr.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('lid')) {
                $where .= ' AND l.proteinhaslatticeid=:2';
                array_push($args, $this->arg('lid'));
            }
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:2';
                array_push($args, $this->arg('pid'));
            }

            $tot = $this->db->pq("SELECT count(distinct l.componentlatticeid) as tot 
              FROM componentlattice l
              INNER JOIN protein pr ON pr.proteinid = l.componentid
              WHERE $where", $args);
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
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT l.componentlatticeid, pr.proteinid, l.spacegroup, l.cell_a, l.cell_b, l.cell_c, l.cell_alpha, l.cell_beta, l.cell_gamma
              FROM componentlattice l
              INNER JOIN protein pr ON pr.proteinid = l.componentid
              WHERE $where", $args);
            
            if ($this->has_arg('pid')) {
                if (!sizeof($rows)) $this->_error('No such lattice');
                else $this->_output($rows[0]);
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));
        }

        function _add_protein_lattice() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein specified');

            $chk = $this->db->pq("SELECT proteinid FROM protein WHERE proteinid=:1 AND proposalid=:2", array($this->arg('PROTEINID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such protein');


        }

        function _update_protein_lattice() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('CRYSTALID')) $this->_error('No crystal specified');

            $chk = $this->db->pq("SELECT pr.proteinid FROM componentlattice l INNER JOIN protein pr ON l.proteinid = cr.proteinid
              WHERE l.componentlatticeid=:1 AND pr.proposalid=:2", array($this->arg('COMPONENTLATTICEID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such lattice');
        }




        function _concentration_types() {
            $rows = $this->db->pq("SELECT concentrationtypeid, symbol, name FROM concentrationtype");
            $this->_output($rows);
        }


        function _component_types() {
            $rows = $this->db->pq("SELECT componenttypeid, name FROM componenttype");
            $this->_output($rows);
        }


        function _component_sub_types() {
            $rows = $this->db->pq("SELECT componentsubtypeid, name FROM componentsubtype");
            $this->_output($rows);
        }



        # Sample Groups
        function _sample_groups() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid = :1';
            $args = array($this->proposalid);

            if ($this->has_arg('BLSAMPLEGROUPID')) {
                $where .= ' AND bshg.blsamplegroupid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEGROUPID'));
            }

            if ($this->has_arg('CONTAINERID')) {
                $where .= ' AND c.containerid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERID'));
            }


            // TODO: this is awful
            if ($this->has_arg('BLSAMPLEID')) {
                $where .= ' AND bshg.blsamplegroupid IN (SELECT blsamplegroupid FROM blsamplegroup_has_blsample WHERE blsampleid=:'.(sizeof($args)+1).')';
                array_push($args, $this->arg('BLSAMPLEID'));
            }

            $tot = $this->db->pq("SELECT count(b.blsampleid) as tot
                FROM blsample b
                INNER JOIN blsamplegroup_has_blsample bshg ON bshg.blsampleid = b.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN proposal p ON p.proposalid = pr.proposalid
                INNER JOIN container c ON c.containerid = b.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                WHERE $where", $args);

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
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT b.blsampleid, bshg.blsamplegroupid, bshg.grouporder, bshg.type, CONCAT(bshg.blsamplegroupid, '-', b.blsampleid) as blsamplegroupsampleid, b.name as sample, b.dimension1, b.dimension2, b.dimension3, b.shape, b.packingfraction, cr.theoreticaldensity, b.blsampleid, cr.crystalid, cr.name as crystal
                FROM blsample b
                INNER JOIN blsamplegroup_has_blsample bshg ON bshg.blsampleid = b.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN proposal p ON p.proposalid = pr.proposalid
                INNER JOIN container c ON c.containerid = b.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                WHERE $where", $args);

            $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }


        function _add_sample_to_group() {
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid,$this->arg('BLSAMPLEID')));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            if (!$this->has_arg('BLSAMPLEGROUPID')) {
                $this->db->pq("INSERT INTO blsamplegroup (blsamplegroupid) VALUES(NULL)");
                $sgid = $this->db->id();
            } else {
                $sgid = $this->arg('BLSAMPLEGROUPID');
            }

            $chk2 = $this->db->pq("SELECT count(bshg.blsampleid) as samples
                FROM blsamplegroup_has_blsample bshg
                INNER JOIN blsample s ON s.blsampleid = bshg.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN proposal p ON p.proposalid = pr.proposalid
                WHERE p.proposalid = :1 AND bshg.blsamplegroupid = :2", array($this->proposalid, $sgid));
            $in_proposal = $chk2[0]['SAMPLES'];

            $chk = $this->db->pq("SELECT bsg.blsamplegroupid, count(bshg.blsampleid) as samples
                    FROM blsamplegroup bsg
                    LEFT OUTER JOIN blsamplegroup_has_blsample bshg ON bsg.blsamplegroupid = bshg.blsamplegroupid
                    WHERE bsg.blsamplegroupid = :1
                    GROUP BY bsg.blsamplegroupid", array($sgid));
                if (!sizeof($chk)) $this->_error('No such sample group');

            if ($chk[0]['SAMPLES'] != $in_proposal) $this->_error('No such sample group');

            $order = $this->has_arg('GROUPORDER') ? $this->arg('GROUPORDER') : 1;
            $type = $this->has_arg('TYPE') ? $this->arg('TYPE') : null;

            $this->db->pq("INSERT INTO blsamplegroup_has_blsample (blsampleid, blsamplegroupid, grouporder, type) 
                VALUES (:1,:2, :3, :4)", array($this->arg('BLSAMPLEID'), $sgid, $order, $type));

            $this->_output(array('BLSAMPLEGROUPSAMPLEID' => $sgid.'-'.$this->arg('BLSAMPLEID'), 'BLSAMPLEID' => $this->arg('BLSAMPLEID'), 'BLSAMPLEGROUPID' => $sgid));
        }


        function _update_sample_group() {
            if (!$this->has_arg('BLSAMPLEGROUPSAMPLEID')) $this->_error('No sample group sample specified');
            list($gid,$sid) = explode('-', $this->arg('BLSAMPLEGROUPSAMPLEID'));

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid, $sid));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $types = array('sample', 'container', 'background', 'calibrant');
            $fields = array('GROUPORDER', 'TYPE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsamplegroup_has_blsample SET $f=:1 WHERE blsampleid=:2 AND blsamplegroupid=:3", array($this->arg($f), $sid, $gid));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }

        function _remove_sample_from_group() {
            if (!$this->has_arg('BLSAMPLEGROUPSAMPLEID')) $this->_error('No sample group sample specified');
            list($gid,$sid) = explode('-', $this->arg('BLSAMPLEGROUPSAMPLEID'));

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid,$sid));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $this->db->pq("DELETE FROM blsamplegroup_has_blsample 
                WHERE blsampleid=:1 AND blsamplegroupid=:2", array($sid, $gid));

            $this->_output(new stdClass);
        }


        
    }

?>