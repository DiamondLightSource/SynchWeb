<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Exp extends Page
{
        
        public static $arg_list = array(

            // Filters
            'CONTAINERID' => '\d+',
            'BLSAMPLEID' => '\d+',


            // Replacement for DiffractionPlan in various tables
            'DATACOLLECTIONPLANID' => '\d+',


            // DiffractionPlan (=>DataCollectionPlan)
            'DIFFRACTIONPLANID' => '\d+',
            'BLSAMPLEID' => '\d+',
            'EXPERIMENTKIND' => '\w+',
            'EXPOSURETIME' => '\d+(.\d+)?',
            'REQUIREDRESOLUTION' => '\d+(.\d+)?',
            'PREFERREDBEAMSIZEX' => '\d+',
            'PREFERREDBEAMSIZEY' => '\d+',
            'BOXSIZEX' => '\d+',
            'BOXSIZEY' => '\d+',
            'NUMBEROFIMAGES' => '\d+',
            'AXISSTART' => '-?\d+(.\d+)?',
            'AXISRANGE' => '\d+(.\d+)?',
            'TRANSMISSION' => '\d+(.\d+)?',
            'ENERGY' => '\d+(.\d+)?',
            'MONOCHROMATOR' => '\w+',
            'MONOBANDWIDTH' => '\d+(.\d+)?',
            'COMMENTS' => '.*',
            'PLANORDER' => '\d+',


            // Detector
            'DETECTORID' => '\d+',
            'DETECTORTYPE' => '[\w-\s]+',
            'DETECTORMANUFACTURER' => '[\w-]+',
            'DETECTORMODEL' => '[\w-\s]+',
            'DETECTORPIXELSIZEHORIZONTAL' => '\d+',
            'DETECTORPIXELSIZEVERTICAL' => '\d+',
            'DETECTORDISTANCEMIN' => '\d+',
            'DETECTORDISTANCEMAX' => '\d+',
            'DENSITY' => '\d+(.\d+)?',
            'COMPOSITION' => '\w+',
            'DETECTORMAXRESOLUTION' => '\d+(.\d+)?',
            'DETECTORMINRESOLUTION' => '\d+(.\d+)?',
            'DETECTORROLLMIN' => '-?\d+(.\d+)?',
            'DETECTORROLLMAX' => '-?\d+(.\d+)?',
            'SENSORTHICKNESS' => '\d+',
            'DETECTORSERIALNUMBER' => '[\w-]+',
            'NUMBEROFPIXELSX' => '\d+',
            'NUMBEROFPIXELSY' => '\d+',


            // Scan Param Service
            'SCANPARAMETERSSERVICEID' => '\d+',
            'NAME' => '[\w|\s|-]+',
            'DESCRIPTION' => '.*',


            // Scan Param Model
            'SCANPARAMETERSMODELID' => '\d+',
            'SEQUENCENUMBER' => '\d+',
            'START' => '\d+(.\d+)?',
            'STOP' => '\d+(.\d+)?',
            'STEP' => '\d+(.\d+)?',
            'ARRAY' => '[\d+(.\d+)?)\s,]+',

            
            // DCPlan has Detector
            'DATACOLLECTIONPLANHASDETECTORID' => '\d+',
            'EXPOSURETIME' => '\d+(.\d+)?',
            'DISTANCE' => '\d+(.\d+)?',
            'ROLL' => '\d+(.\d+)?',


            // Beamline Setup
            'BEAMLINESETUPID' => '\d+',
            'BEAMLINENAME' => '[\w-]+',
            'BEAMSIZEXMAX' => '\d+(.\d+)?',
            'BEAMSIZEXMIN' => '\d+(.\d+)?',
            'BEAMSIZEYMAX' => '\d+',
            'BEAMSIZEYMIN' => '\d+',
            'BOXSIZEXMAX' => '\d+(.\d+)?',
            'BOXSIZEXMIN' => '\d+(.\d+)?',
            'BOXSIZEYMAX' => '\d+(.\d+)?',
            'BOXSIZEYMIN' => '\d+(.\d+)?',
            'CS' => '\d+(.\d+)?',
            'ENERGYMAX' => '\d+',
            'ENERGYMIN' => '\d+',
            'GONIOSTATMAXOSCILLATIONWIDTH' => '\d+(.\d+)?',
            'GONIOSTATMINOSCILLATIONWIDTH' => '\d+(.\d+)?',
            'KAPPAMAX' => '-?\d+(.\d+)?',
            'KAPPAMIN' => '-?\d+(.\d+)?',
            'MAXEXPOSURETIMEPERIMAGE' => '\d+(.\d+)?',
            'MINEXPOSURETIMEPERIMAGE' => '\d+(.\d+)?',
            'MAXTRANSMISSION' => '\d+',
            'MINTRANSMISSION' => '\d+',
            'NUMBEROFIMAGESMAX' => '\d+',
            'NUMBEROFIMAGESMIN' => '\d+',
            'OMEGAMAX' => '-?\d+(.\d+)?',
            'OMEGAMIN' => '-?\d+(.\d+)?',
            'PHIMAX' => '-?\d+(.\d+)?',
            'PHIMIN' => '-?\d+(.\d+)?',
            'MONOBANDWIDTHMIN' => '\d+(.\d+)?',
            'MONOBANDWIDTHMAX' => '\d+(.\d+)?',
            'ACTIVE' => '\d',

        );
        
        
        public static $dispatch = array(
            array('/plans(/:DIFFRACTIONPLANID)', 'get', '_get_diffraction_plans'),
            array('/plans', 'post', '_add_diffraction_plan'),
            array('/plans/:DIFFRACTIONPLANID', 'patch', '_update_diffraction_plan'),
            array('/plans/:DIFFRACTIONPLANID', 'delete', '_delete_diffraction_plan'),

            array('/detectors(/:DETECTORID)', 'get', '_detectors'),
            array('/detectors', 'post', '_add_detector'),
            array('/detectors/:DETECTORID', 'patch', '_update_detector'),

            array('/parameters/services(/:SCANPARAMETERSSERVICEID)', 'get', '_scan_services'),
            array('/parameters/services', 'post', '_add_scan_service'),
            array('/parameters/services/:SCANPARAMETERSSERVICEID', 'patch', '_update_scan_service'),

            array('/parameters/models(/:SCANPARAMETERSMODELID)', 'get', '_scan_models'),
            array('/parameters/models', 'post', '_add_scan_model'),
            array('/parameters/models/:SCANPARAMETERSMODELID', 'patch', '_update_scan_model'),
            array('/parameters/models/:SCANPARAMETERSMODELID', 'delete', '_delete_scan_model'),

            array('/plans/detectors(/:DATACOLLECTIONPLANHASDETECTORID)', 'get', '_dp_has_detectors'),
            array('/plans/detectors', 'post', '_dp_add_detector'),
            array('/plans/detectors/:DATACOLLECTIONPLANHASDETECTORID', 'patch', '_dp_update_detector'),
            array('/plans/detectors/:DATACOLLECTIONPLANHASDETECTORID', 'delete', '_dp_remove_detector'),

            array('/setup', 'get', '_get_beamline_setups'),
            array('/setup', 'post', '_add_beamline_setup'),
            array('/setup/:BEAMLINESETUPID', 'patch', '_update_beamline_setup'),
        );


        function _detectors() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('DETECTORID')) {
                $where .= ' AND detectorid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('DETECTORID'));
            }

            if ($this->has_arg('BEAMLINENAME')) {
                $where .= ' AND bls.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BEAMLINENAME'));
            }

            $rows = $this->db->pq("SELECT d.detectorid, d.detectortype, d.detectormanufacturer, d.detectorserialnumber, d.sensorthickness, d.detectormodel, d.detectorpixelsizehorizontal, d.detectorpixelsizevertical, d.detectordistancemin, d.detectordistancemax, d.density, d.composition, concat(d.detectormanufacturer,' ',d.detectormodel, ' (',d.detectortype,')') as description, d.detectormaxresolution, d.detectorminresolution, count(distinct dc.datacollectionid) as dcs, count(distinct bls.beamlinesetupid) as blsetups, count(distinct dphd.detectorid) as dps,count(distinct dp.detectorid) as dps2, CONCAT(IFNULL(GROUP_CONCAT(distinct ses.beamlinename),''),IFNULL(GROUP_CONCAT(distinct bls.beamlinename),'')) as beamlines, d.numberofpixelsx, d.numberofpixelsy, d.detectorrollmin, d.detectorrollmax
                FROM detector d
                LEFT OUTER JOIN datacollection dc ON dc.detectorid = d.detectorid
                LEFT OUTER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                LEFT OUTER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                LEFT OUTER JOIN beamlinesetup bls ON bls.detectorid = d.detectorid
                LEFT OUTER JOIN datacollectionplan_has_detector dphd ON dphd.detectorid = d.detectorid
                LEFT OUTER JOIN diffractionplan dp ON dp.detectorid = d.detectorid
                WHERE $where
                GROUP BY d.detectorid", $args);

            if ($this->has_arg('DETECTORID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such detector');
                
            } else $this->_output($rows);
        }


        function _add_detector() {
            $this->user->can('manage_detector');

            if (!$this->has_arg('DETECTORTYPE')) $this->_error('No detector type specified');
            if (!$this->has_arg('DETECTORMANUFACTURER')) $this->_error('No detector manufacturer specified');
            if (!$this->has_arg('DETECTORMODEL')) $this->_error('No detector model specified');

            $args = array($this->arg('DETECTORTYPE'), $this->arg('DETECTORMANUFACTURER'), $this->arg('DETECTORMODEL'));
            foreach (array('DETECTORPIXELSIZEHORIZONTAL','DETECTORPIXELSIZEVERTICAL','DETECTORDISTANCEMIN','DETECTORDISTANCEMAX','DENSITY','COMPOSITION','DETECTORMINRESOLUTION','DETECTORMAXRESOLUTION','DETECTORROLLMIN', 'DETECTORROLLMAX', 'SENSORTHICKNESS') as $e) array_push($args, $this->has_arg($e) ? $this->arg($e) : null);

            $this->db->pq("INSERT INTO detector (detectortype,detectormanufacturer,detectormodel,detectorpixelsizehorizontal,detectorpixelsizevertical,detectordistancemin,detectordistancemax,density,composition,detectorminresolution,detectormaxresolution,detectorrollmin,detectorrollmax,sensorthickness) VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14)", $args);

            $this->_output(array('DETECTORID' => $this->db->id()));
        }


        function _update_detector() {
            $this->user->can('manage_detector');
            if (!$this->has_arg('DETECTORID')) $this->_error('No detector specified');

            $chk = $this->db->pq("SELECT detectorid FROM detector WHERE detectorid=:1", array($this->arg('DETECTORID')));
            if (!sizeof($chk)) $this->_error('No such detector');

            foreach(array('DETECTORTYPE','DETECTORMANUFACTURER','DETECTORMODEL','DETECTORPIXELSIZEHORIZONTAL','DETECTORPIXELSIZEVERTICAL','DETECTORDISTANCEMIN','DETECTORDISTANCEMAX','DENSITY','COMPOSITION','SENSORTHICKNESS','DETECTORSERIALNUMBER','DETECTORMINRESOLUTION','DETECTORMAXRESOLUTION','NUMBEROFPIXELSX','NUMBEROFPIXELSY','DETECTORROLLMIN','DETECTORROLLMAX') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE detector SET '.$f.'=:1 WHERE detectorid=:2', array($this->arg($f), $this->arg('DETECTORID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }



        function _scan_services() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('SCANPARAMETERSSERVICEID')) {
                $where .= ' AND scanparametersserviceid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('SCANPARAMETERSSERVICEID'));
            }

            $rows = $this->db->pq("SELECT scanparametersserviceid, name, description
                FROM scanparametersservice
                WHERE $where", $args);

            if ($this->has_arg('SCANPARAMETERSSERVICEID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such scan service');
                
            } else $this->_output($rows);
        }


        function _add_scan_service() {
            $this->user->can('manage_service');

            if (!$this->has_arg('NAME')) $this->_error('No name specified');
            if (!$this->has_arg('DESCRIPTION')) $this->_error('No description model specified');

            $this->db->pq("INSERT INTO scanparametersservice (name,description) VALUES (:1,:2)",
                array($this->arg('NAME'), $this->arg('DESCRIPTION')));

            $this->_output(array('SCANPARAMETERSSERVICEID' => $this->db->id()));
        }


        function _update_scan_service() {
            $this->user->can('manage_service');
            if (!$this->has_arg('SCANPARAMETERSSERVICEID')) $this->_error('No service specified');

            $chk = $this->db->pq("SELECT scanparametersserviceid FROM scanparametersservice WHERE scanparametersserviceid=:1", array($this->arg('SCANPARAMETERSSERVICEID')));
            if (!sizeof($chk)) $this->_error('No such service');

            foreach(array('NAME','DESCRIPTION') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE scanparametersservice SET '.$f.'=:1 WHERE scanparametersserviceid=:2', array($this->arg($f), $this->arg('SCANPARAMETERSSERVICEID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

        }



        function _scan_models() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'WHERE pr.proposalid = :1';
            

            if ($this->has_arg('SCANPARAMETERSMODELID')) {
                $where .= ' AND m.scanparametersmodelid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('SCANPARAMETERSMODELID'));
            }

            if ($this->has_arg('SCANPARAMETERSSERVICEID')) {
                $where .= ' AND m.scanparametersserviceid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('SCANPARAMETERSMODELID'));
            }

            if ($this->has_arg('BLSAMPLEID')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEID'));
            }

            if ($this->has_arg('CONTAINERID')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERID'));
            }

            if ($this->has_arg('DATACOLLECTIONPLANID')) {
                $where .= ' AND (m.datacollectionplanid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('DATACOLLECTIONPLANID'));
            }
            

            $tot = $this->db->pq("SELECT count(m.scanparametersmodelid) as tot
                FROM scanparametersmodel m
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = m.datacollectionplanid

                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                INNER JOIN proposal pr ON pr.proposalid = p.proposalid

                INNER JOIN container c ON c.containerid = s.containerid
                $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('SCANPARAMETERSMODELID' => 'm.scanparametersmodelid'),
                'm.scanparametersmodelid DESC'
            );

            $rows = $this->db->paginate("SELECT m.scanparametersmodelid,sv.name as scanparametersservice, m.scanparametersserviceid, m.datacollectionplanid, s.blsampleid, c.containerid, m.sequencenumber, m.start, m.stop, m.step, m.array
                FROM scanparametersmodel m
                INNER JOIN scanparametersservice sv ON sv.scanparametersserviceid = m.scanparametersserviceid
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = m.datacollectionplanid

                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                INNER JOIN proposal pr ON pr.proposalid = p.proposalid

                INNER JOIN container c ON c.containerid = s.containerid
                $where
                ORDER BY $order", $args);
            
            if ($this->has_arg('SCANPARAMETERSMODELID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such scan parameters model');
                
            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }


        function _add_scan_model() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            if (!$this->has_arg('DATACOLLECTIONPLANID')) $this->_error('No data collection plan specified');
            if (!$this->has_arg('SCANPARAMETERSSERVICEID')) $this->_error('No parameter model specified');
            
            $chk = $this->db->pq("SELECT shdp.datacollectionplanid
                FROM blsample_has_datacollectionplan shdp
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE shdp.datacollectionplanid=:1 AND p.proposalid=:2", array($this->arg('DATACOLLECTIONPLANID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan');

            $args = array($this->arg('DATACOLLECTIONPLANID'), $this->arg('SCANPARAMETERSSERVICEID'));
            foreach(array('SEQUENCENUMBER', 'START', 'STOP', 'STEP', 'ARRAY') as $f) array_push($args, $this->has_arg($f) ? $this->arg($f) : null);

            $this->db->pq("INSERT INTO scanparametersmodel (datacollectionplanid, scanparametersserviceid, sequencenumber, start, stop, step, array) VALUES (:1,:2,:3,:4,:5,:6,:7)", $args);

            $this->_output(array('SCANPARAMETERSMODELID' => $this->db->id()));
        }


        function _update_scan_model() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SCANPARAMETERSMODELID')) $this->_error('No model specified');

            $chk = $this->db->pq("SELECT m.scanparametersmodelid
                FROM scanparametersmodel m
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = m.datacollectionplanid
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE m.scanparametersmodelid=:1 AND p.proposalid=:2", array($this->arg('SCANPARAMETERSMODELID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such model');

            foreach(array('SEQUENCENUMBER','START', 'STOP', 'STEP', 'ARRAY') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE scanparametersmodel SET '.$f.'=:1 WHERE scanparametersmodelid=:2', array($this->arg($f), $this->arg('SCANPARAMETERSMODELID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }


        function _delete_scan_model() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SCANPARAMETERSMODELID')) $this->_error('No model specified');

            $chk = $this->db->pq("SELECT m.scanparametersmodelid
                FROM scanparametersmodel m
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = m.datacollectionplanid
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE m.scanparametersmodelid=:1 AND p.proposalid=:2", array($this->arg('SCANPARAMETERSMODELID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such model');

            $this->db->pq("DELETE FROM scanparametersmodel WHERE scanparametersmodelid=:1", array($this->arg('SCANPARAMETERSMODELID')));

            $this->_output(new \stdClass);
        }



        function _dp_has_detectors() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'WHERE pr.proposalid = :1';
            

            if ($this->has_arg('DATACOLLECTIONPLANHASDETECTORID')) {
                $where .= ' AND dhd.datacollectionplanhasdetectorid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('DATACOLLECTIONPLANHASDETECTORID'));
            }

            if ($this->has_arg('BLSAMPLEID')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEID'));
            }

            if ($this->has_arg('CONTAINERID')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERID'));
            }

            if ($this->has_arg('DATACOLLECTIONPLANID')) {
                $where .= ' AND (d.datacollectionplanid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('DATACOLLECTIONPLANID'));
            }
            

            $tot = $this->db->pq("SELECT count(dhd.datacollectionplanhasdetectorid) as tot
                FROM datacollectionplan_has_detector dhd
                INNER JOIN detector d ON d.detectorid = dhd.detectorid
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = dhd.datacollectionplanid

                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                INNER JOIN proposal pr ON pr.proposalid = p.proposalid

                INNER JOIN container c ON c.containerid = s.containerid
                $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('DATACOLLECTIONPLANHASDETECTORID' => 'dhd.datacollectionplanhasdetectorid'),
                'dhd.datacollectionplanhasdetectorid DESC'
            );

            $rows = $this->db->paginate("SELECT dhd.datacollectionplanhasdetectorid, d.detectorid, dhd.datacollectionplanid, d.detectormodel, d.detectormanufacturer, d.detectortype, dhd.datacollectionplanid, dhd.exposuretime, dhd.distance, dhd.roll
                FROM datacollectionplan_has_detector dhd
                INNER JOIN detector d ON d.detectorid = dhd.detectorid
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = dhd.datacollectionplanid

                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                INNER JOIN proposal pr ON pr.proposalid = p.proposalid

                INNER JOIN container c ON c.containerid = s.containerid
                $where
                ORDER BY $order", $args);
            
            if ($this->has_arg('DATACOLLECTIONPLANHASDETECTORID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such data collection plan detector');
                
            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }


        function _dp_add_detector() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            if (!$this->has_arg('DETECTORID')) $this->_error('No detector specified');
            if (!$this->has_arg('DATACOLLECTIONPLANID')) $this->_error('No data collection plan specified');
            
            $chk = $this->db->pq("SELECT shdp.datacollectionplanid
                FROM blsample_has_datacollectionplan shdp
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE shdp.datacollectionplanid=:1 AND p.proposalid=:2", array($this->arg('DATACOLLECTIONPLANID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan');

            $args = array($this->arg('DATACOLLECTIONPLANID'), $this->arg('DETECTORID'));
            foreach(array('EXPOSURETIME', 'DISTANCE', 'ROLL') as $f) array_push($args, $this->has_arg($f) ? $this->arg($f) : null);

            $this->db->pq("INSERT INTO datacollectionplan_has_detector (datacollectionplanid, detectorid, exposuretime, distance, roll) VALUES (:1,:2,:3,:4,:5)", $args);

            $this->_output(array('DATACOLLECTIONPLANHASDETECTORID' => $this->db->id()));
        }


        function _dp_update_detector() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DATACOLLECTIONPLANHASDETECTORID')) $this->_error('No data collection plan detector specified');

            $chk = $this->db->pq("SELECT dhd.datacollectionplanhasdetectorid
                FROM datacollectionplan_has_detector dhd
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = dhd.datacollectionplanid
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE dhd.datacollectionplanhasdetectorid=:1 AND p.proposalid=:2", array($this->arg('DATACOLLECTIONPLANHASDETECTORID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan detector');

            foreach(array('EXPOSURETIME', 'DISTANCE', 'ROLL', 'DETECTORID') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE datacollectionplan_has_detector SET '.$f.'=:1 WHERE datacollectionplanhasdetectorid=:2', array($this->arg($f), $this->arg('DATACOLLECTIONPLANHASDETECTORID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }


        function _dp_remove_detector() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DATACOLLECTIONPLANHASDETECTORID')) $this->_error('No data collection plan detector specified');

            $chk = $this->db->pq("SELECT dhd.datacollectionplanhasdetectorid
                FROM datacollectionplan_has_detector dhd
                INNER JOIN blsample_has_datacollectionplan shdp ON shdp.datacollectionplanid = dhd.datacollectionplanid
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE dhd.datacollectionplanhasdetectorid=:1 AND p.proposalid=:2", array($this->arg('DATACOLLECTIONPLANHASDETECTORID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan detector');

            $this->db->pq("DELETE FROM datacollectionplan_has_detector WHERE datacollectionplanhasdetectorid=:1", array($this->arg('DATACOLLECTIONPLANHASDETECTORID')));

            $this->_output(new \stdClass);
        }




        function _get_diffraction_plans() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('DIFFRACTIONPLANID')) {
                $where .= ' AND dp.diffractionplanid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }

            if ($this->has_arg('BLSAMPLEID')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEID'));
            }

            if ($this->has_arg('CONTAINERID')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERID'));
            }

            $tot = $this->db->pq("SELECT count(dp.diffractionplanid) as tot
              FROM diffractionplan dp
              INNER JOIN blsample_has_datacollectionplan hp ON hp.datacollectionplanid = dp.diffractionplanid
              INNER JOIN blsample s ON s.blsampleid = hp.blsampleid
              INNER JOIN crystal cr ON cr.crystalid = s.crystalid
              INNER JOIN protein p ON p.proteinid = cr.proteinid
              INNER JOIN container c ON c.containerid = s.containerid
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('DIFFRACTIONPLANID' => 'dp.diffractionplanid'),
                'dp.diffractionplanid DESC'
            );


            $rows = $this->db->paginate("SELECT dp.diffractionplanid, dp.comments, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, ROUND(dp.exposuretime, 2) as exposuretime, ROUND(dp.requiredresolution, 2) as requiredresolution, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy as energy, dp.monochromator, dp.monobandwidth, s.blsampleid, s.name as sample, p.proteinid, p.acronym as protein, hp.planorder
              FROM diffractionplan dp
              INNER JOIN blsample_has_datacollectionplan hp ON hp.datacollectionplanid = dp.diffractionplanid
              INNER JOIN blsample s ON s.blsampleid = hp.blsampleid
              INNER JOIN crystal cr ON cr.crystalid = s.crystalid
              INNER JOIN protein p ON p.proteinid = cr.proteinid
              INNER JOIN container c ON c.containerid = s.containerid
              WHERE $where
            ", $args);

            if ($this->has_arg('DIFFRACTIONPLANID')) {
                if (sizeof($dps)) $this->_output($dps[0]);
                else $this->_error('No such diffraction plan');

            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }


        function _add_diffraction_plan() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');

            $chk = $this->db->pq("SELECT s.blsampleid
                FROM blsample s
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE s.blsampleid=:1 AND p.proposalid=:2", array($this->arg('BLSAMPLEID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such sample');

            $args = array();
            foreach(array('COMMENTS', 'EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR', 'MONOBANDWIDTH') as $f) {
                array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
            } 

            $this->db->pq("INSERT INTO diffractionplan (comments, experimentkind, requiredresolution, preferredbeamsizex, preferredbeamsizey, exposuretime, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy, monochromator, monobandwidth)
              VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15)", $args);

            $order = $this->has_arg('PLANORDER') ? $this->arg('PLANORDER') : 1;

            $dpid = $this->db->id();
            $this->db->pq("INSERT INTO blsample_has_datacollectionplan (blsampleid, datacollectionplanid, planorder) VALUES (:1,:2, :3)", array($this->arg('BLSAMPLEID'), $dpid, $order));

            $this->_output(array('DIFFRACTIONPLANID' => $dpid));
        }


        function _update_diffraction_plan() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DIFFRACTIONPLANID')) $this->_error('No data collection plan specified');

            $chk = $this->db->pq("SELECT shdp.datacollectionplanid
                FROM blsample_has_datacollectionplan shdp
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE shdp.datacollectionplanid=:1 AND p.proposalid=:2", array($this->arg('DIFFRACTIONPLANID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan');

            foreach(array('COMMENTS', 'EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR', 'MONOBANDWIDTH') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE diffractionplan SET '.$f.'=:1 WHERE diffractionplanid=:2', array($this->arg($f), $this->arg('DIFFRACTIONPLANID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            foreach (array('PLANORDER') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsample_has_datacollectionplan SET $f=:1 WHERE datacollectionplanid=:2", array($this->arg($f), $this->arg('DIFFRACTIONPLANID')));
                    $this->_output(array($f => $this->arg($f)));
                }   
            }
        }


        function _delete_diffraction_plan() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DIFFRACTIONPLANID')) $this->_error('No data collection plan specified');

            $chk = $this->db->pq("SELECT shdp.datacollectionplanid
                FROM blsample_has_datacollectionplan shdp
                INNER JOIN blsample s ON shdp.blsampleid = s.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein p ON p.proteinid = cr.proteinid
                WHERE shdp.datacollectionplanid=:1 AND p.proposalid=:2", array($this->arg('DIFFRACTIONPLANID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such data collection plan');

            $this->db->pq("DELETE FROM blsample_has_datacollectionplan WHERE datacollectionplanid=:1", array($this->arg('DIFFRACTIONPLANID')));
            $this->db->pq("DELETE FROM datacollectionplan_has_detector WHERE datacollectionplanid=:1", array($this->arg('DIFFRACTIONPLANID')));
            $this->db->pq("DELETE FROM scanparametersmodel WHERE datacollectionplanid=:1", array($this->arg('DIFFRACTIONPLANID')));
            $this->db->pq("DELETE FROM diffractionplan WHERE diffractionplanid=:1", array($this->arg('DIFFRACTIONPLANID')));

            $this->_output(new \stdClass);
        }        



        function _get_beamline_setups() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('BEAMLINESETUPID')) {
                $where .= ' AND bls.beamlinesetupid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('BEAMLINESETUPID'));
            }

            if ($this->has_arg('BEAMLINENAME')) {
                $where .= ' AND bls.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BEAMLINENAME'));
            }

            if ($this->has_arg('ACTIVE')) {
                $where .= ' AND bls.active=1';
            }

            $tot = $this->db->pq("SELECT count(bls.beamlinesetupid) as tot
              FROM beamlinesetup bls
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $this->_get_start_end($args);

            $order = $this->_get_order(
                array('BEAMLINESETUPID' => 'bls.beamlinesetupid'),
                'bls.beamlinesetupid DESC'
            );


            $rows = $this->db->paginate("SELECT bls.beamlinesetupid, TO_CHAR(bls.setupdate, 'DD-MM-YYYY') as setupdate, bls.minexposuretimeperimage, bls.goniostatminoscillationwidth, bls.mintransmission, bls.beamlinename, bls.cs, 
                bls.active, bls.goniostatmaxoscillationwidth, bls.maxexposuretimeperimage, bls.maxtransmission, 
                bls.beamsizexmin, bls.beamsizexmax, bls.beamsizeymin, bls.beamsizeymax, bls.omegamin, bls.omegamax, bls.kappamin, bls.kappamax, bls.phimin, bls.phimax, bls.energymin, bls.energymax, bls.numberofimagesmin, bls.numberofimagesmax, bls.boxsizexmin, bls.boxsizeymin, bls.boxsizexmax, bls.boxsizeymax, bls.monobandwidthmin, bls.monobandwidthmax, 
                bls.detectorid, d.detectorminresolution, d.detectormaxresolution, d.detectordistancemin, d.detectordistancemax, d.detectorpixelsizehorizontal, d.detectorpixelsizevertical, d.numberofpixelsx, d.numberofpixelsy, d.detectorrollmin, d.detectorrollmax,
                count(ses.sessionid) as sessions
              FROM beamlinesetup bls
              LEFT OUTER JOIN blsession ses ON ses.beamlinesetupid = bls.beamlinesetupid
              LEFT OUTER JOIN detector d ON d.detectorid = bls.detectorid
              WHERE $where
              GROUP BY bls.beamlinesetupid
            ", $args);

            if ($this->has_arg('BEAMLINESETUPID')) {
                if (sizeof($dps)) $this->_output($dps[0]);
                else $this->_error('No such beamline setup');

            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }


        function _add_beamline_setup() {
            if (!$this->user->can('manage_params')) $this->_error('You do not have permission to add beamline parameters');
            if (!$this->has_arg('BEAMLINENAME')) $this->_error('No beamline specified');
            if (!$this->has_arg('DETECTORID')) $this->_error('No detector specified');

            $args = array($this->arg('BEAMLINENAME'), $this->arg('DETECTORID'));
            foreach (array('BEAMSIZEXMAX', 'BEAMSIZEXMIN', 'BEAMSIZEYMAX', 'BEAMSIZEYMIN', 'BOXSIZEXMAX', 'BOXSIZEXMIN', 'BOXSIZEYMAX', 'BOXSIZEYMIN', 'CS', 'ENERGYMAX', 'ENERGYMIN', 'GONIOSTATMAXOSCILLATIONWIDTH', 'GONIOSTATMINOSCILLATIONWIDTH', 'KAPPAMAX', 'KAPPAMIN', 'MAXEXPOSURETIMEPERIMAGE', 'MINEXPOSURETIMEPERIMAGE', 'MAXTRANSMISSION', 'MINTRANSMISSION', 'NUMBEROFIMAGESMAX', 'NUMBEROFIMAGESMIN', 'OMEGAMAX', 'OMEGAMIN', 'PHIMAX', 'PHIMIN', 'MONOBANDWIDTHMIN', 'MONOBANDWIDTHMAX') as $e) array_push($args, $this->has_arg($e) ? $this->arg($e) : null);

            $this->db->pq("INSERT INTO beamlinesetup (setupdate,beamlinename,detectorid,
                beamsizexmin,beamsizexmax,beamsizeymin,beamsizeymax,boxsizexmax,boxsizexmin,boxsizeymax,boxsizeymin,cs,energymax,energymin,goniostatmaxoscillationwidth,goniostatminoscillationwidth,kappamax,kappamin,maxexposuretimeperimage,minexposuretimeperimage,maxtransmission,mintransmission,numberofimagesmax,numberofimagesmin,omegamax,omegamin,phimax,phimin,active,monobandwidthmin,monobandwidthmax) VALUES (CURRENT_TIMESTAMP,:1,:2
                ,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21,:22,:23,:24,:25,:26,:27,0,:28,:29)", $args);

            $this->_output(array('BEAMLINESETUPID' => $this->db->id(), 'SETUPDATE' => date('d-m-Y')));
        }


        function _update_beamline_setup() {
            if (!$this->user->can('manage_params')) $this->_error('You do not have permission to update beamline parameters');
            if (!$this->has_arg('BEAMLINESETUPID')) $this->_error('No beamline setup specified');

            $chk = $this->db->pq("SELECT beamlinesetupid, detectorid, beamlinename
                FROM beamlinesetup
                WHERE beamlinesetupid=:1", array($this->arg('BEAMLINESETUPID')));
            if (!sizeof($chk)) $this->_error('No such beamline setup');

            foreach(array('DETECTORID', 'BEAMLINENAME', 'BEAMSIZEXMAX', 'BEAMSIZEXMIN', 'BEAMSIZEYMAX', 'BEAMSIZEYMIN', 'BOXSIZEXMAX', 'BOXSIZEXMIN', 'BOXSIZEYMAX', 'BOXSIZEYMIN', 'CS', 'ENERGYMAX', 'ENERGYMIN', 'GONIOSTATMAXOSCILLATIONWIDTH', 'GONIOSTATMINOSCILLATIONWIDTH', 'KAPPAMAX', 'KAPPAMIN', 'MAXEXPOSURETIMEPERIMAGE', 'MINEXPOSURETIMEPERIMAGE', 'MAXTRANSMISSION', 'MINTRANSMISSION', 'NUMBEROFIMAGESMAX', 'NUMBEROFIMAGESMIN', 'OMEGAMAX', 'OMEGAMIN', 'PHIMAX', 'PHIMIN', 'ACTIVE', 'MONOBANDWIDTHMIN', 'MONOBANDWIDTHMAX') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE beamlinesetup SET '.$f.'=:1 WHERE beamlinesetupid=:2', array($this->arg($f), $this->arg('BEAMLINESETUPID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }



        function _get_start_end(&$args, $default=15) {
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : $default;
            $start = 0;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            array_push($args, $start);
            array_push($args, $end);
        }

        function _get_order($cols, $default) {
            if ($this->has_arg('sort_by')) {
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) return $cols[$this->arg('sort_by')].' '.$dir;
            } else return $default;
        }
}
