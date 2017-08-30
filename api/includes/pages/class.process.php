<?php

    use Stomp\Stomp;
    use Stomp\Message\Map;


    class Process extends Page {
        
        public static $arg_list = array(
            'REPROCESSINGID' => '\d+',
            'DATACOLLECTIONID' => '\d+',
            'DISPLAYNAME' => '([\w\s-])+',
            'COMMENTS' => '.*',

            'REPROCESSINGIMAGESWEEPID' => '\d+',
            'STARTIMAGE' => '\d+',
            'ENDIMAGE' => '\d+',
            
            'REPROCESSINGPARAMETERID' => '\d+',
            'PARAMETERKEY' => '\w+',
            'PARAMETERVALUE' => '([\w-\.,])+',

            'RECIPE' => '([\w-])+',
        );
        

        public static $dispatch = array(
            array('(/:REPROCESSINGID)', 'get', '_get_reprocessing'),
            array('', 'post', '_add_reprocessing'),

            array('/params(/:REPROCESSINGPARAMETERID)', 'get', '_get_reprocessing_params'),
            array('/params', 'post', '_add_reprocessing_params'),

            array('/sweeps(/:REPROCESSINGIMAGESWEEPID)', 'get', '_get_reprocessing_sweeps'),
            array('/sweeps', 'post', '_add_reprocessing_sweeps'),

            array('/enqueue', 'post', '_enqueue'),
        );


        # Reprocessings
        function _get_reprocessing() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('REPROCESSINGID')) {
                $where .= ' AND rp.reprocessingid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('REPROCESSINGID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }

            $rows = $this->db->pq("SELECT
                rp.reprocessingid, rp.displayname, rp.comments, TO_CHAR(rp.recordtimestamp, 'DD-MM-YYYY HH24:MI') as recordtimestamp, 
                dc.filetemplate, dc.imagedirectory, dc.datacollectionid, dc.imageprefix,
                smp.name as sample, smp.blsampleid as blsampleid, pr.acronym as protein, pr.proteinid,
                CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) as visit,

                apss.cchalf, apss.ccanomalous, apss.anomalous, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.rmeasalliplusiminus as rmeas, apss.rmerge, apss.completeness, apss.anomalouscompleteness as anomcompleteness, apss.anomalousmultiplicity as anommultiplicity, apss.multiplicity, apss.meanioversigi as isigi,
                IF(app.autoprocprogramid, IF(api.autoprocintegrationid, 1, app.processingstatus), 2) as status
                FROM reprocessing rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                LEFT OUTER JOIN blsample smp ON smp.blsampleid = dc.blsampleid
                LEFT OUTER JOIN crystal cr ON cr.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid

                LEFT OUTER JOIN autoprocprogram app ON app.reprocessingid = rp.reprocessingid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                LEFT OUTER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                LEFT OUTER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                LEFT OUTER JOIN autoprocscalingstatistics apss ON (apss.autoprocscalingid = aph.autoprocscalingid AND scalingstatisticstype = 'overall')

                WHERE $where
                GROUP BY rp.reprocessingid
                ORDER BY rp.reprocessingid DESC", $args);    

            foreach ($rows as &$r) {
                $r['IMAGEDIRECTORYFULL'] = $r['IMAGEDIRECTORY'];
                $r['IMAGEDIRECTORY'] = preg_replace('/(.*?\/'.$r['VISIT'].')/', '', $r['IMAGEDIRECTORY'], 1);
            }

            $this->_output($rows);
        }


        function _add_reprocessing() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DATACOLLECTIONID')) $this->_error('No datacollection specified');
            if (!$this->has_arg('RECIPE')) $this->_error('No recipe specified');

            $chk = $this->db->pq("SELECT dc.datacollectionid
                FROM datacollection dc
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND dc.datacollectionid = :2", array($this->proposalid, $this->arg('DATACOLLECTIONID')));

            if (!sizeof($chk)) $this->_error('No such datacollection');


            $comments = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : null;
            $display = $this->has_arg('DISPLAYNAME') ? $this->arg('DISPLAYNAME') : null;

            $this->db->pq("INSERT INTO reprocessing (datacollectionid, displayname, comments, source, recipe) 
                VALUES (:1, :2, :3, :4, :5)", array($this->arg('DATACOLLECTIONID'), $display, $comments, 'ISPyB', $this->arg('RECIPE')));

            $this->_output(array('REPROCESSINGID' => $this->db->id()));
        }



        # Params
        function _get_reprocessing_params() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('REPROCESSINGID')) {
                $where .= ' AND rp.reprocessingid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('REPROCESSINGID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }


            $rows = $this->db->pq("SELECT rpp.reprocessingparameterid, rpp.parameterkey, rpp.parametervalue, rp.reprocessingid
                FROM reprocessingparameter rpp
                INNER JOIN reprocessing rp ON rp.reprocessingid = rpp.reprocessingid
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $args);

            $this->_output($rows);
        }


        function _add_reprocessing_params() {
            if ($this->has_arg('collection')) {
                $col = array();
                foreach ($this->arg('collection') as $p) {
                    $id = $this->_add_reprocessing_param($p);

                    if ($id) {
                        $p['REPROCESSINGPARAMETERID'] = $id;
                        array_push($col, $p);
                    }
                }

                $this->_output($col);

            } else {
                $id = $this->_add_reprocessing_param($this->args);
                $this->_output(array('REPROCESSINGPARAMETERID' => $id));
            }
        }


        function _add_reprocessing_param($param) {
            if (!array_key_exists('REPROCESSINGID', $param)) $this->_error('No reprocessing specified');
            if (!array_key_exists('PARAMETERKEY', $param)) $this->_error('No key specified');
            if (!array_key_exists('PARAMETERVALUE', $param)) $this->_error('No value specified');

            $chk = $this->db->pq("SELECT rp.reprocessingid
                FROM reprocessing rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.reprocessingid = :2", array($this->proposalid, $param['REPROCESSINGID']));

            if (!sizeof($chk)) $this->_error('No such reprocessing');

            $this->db->pq("INSERT INTO reprocessingparameter (reprocessingid, parameterkey, parametervalue) 
                VALUES (:1, :2, :3)", array($param['REPROCESSINGID'], $param['PARAMETERKEY'], $param['PARAMETERVALUE']));

            return $this->db->id();
        }



        # Sweeps
        function _get_reprocessing_sweeps() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('REPROCESSINGID')) {
                $where .= ' AND rp.reprocessingid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('REPROCESSINGID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }


            $rows = $this->db->pq("SELECT
                ris.reprocessingimagesweepid, ris.reprocessingid, ris.startimage, ris.endimage, ris.datacollectionid,
                dc.filetemplate, dc.imagedirectory, dc.imageprefix, dc.datacollectionid,
                smp.name as sample, smp.blsampleid as blsampleid, pr.acronym as protein, pr.proteinid,
                CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) as visit
                FROM reprocessingimagesweep ris
                INNER JOIN reprocessing rp ON rp.reprocessingid = ris.reprocessingid
                INNER JOIN datacollection dc ON dc.datacollectionid = ris.datacollectionid
                LEFT OUTER JOIN blsample smp ON smp.blsampleid = dc.blsampleid
                LEFT OUTER JOIN crystal cr ON cr.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $args);

            foreach ($rows as &$r) {
                $r['IMAGEDIRECTORYFULL'] = $r['IMAGEDIRECTORY'];
                $r['IMAGEDIRECTORY'] = preg_replace('/(.*?\/'.$r['VISIT'].')/', '', $r['IMAGEDIRECTORY'], 1);
            }

            $this->_output($rows);
        }


        function _add_reprocessing_sweeps() {
            if ($this->has_arg('collection')) {
                $col = array();
                foreach ($this->arg('collection') as $p) {
                    $id = $this->_add_reprocessing_sweep($p);

                    if ($id) {
                        $p['REPROCESSINGIMAGESWEEPID'] = $id;
                        array_push($col, $p);
                    }
                }

                $this->_output($col);

            } else {
                $id = $this->_add_reprocessing_sweep($this->args);
                $this->_output(array('REPROCESSINGIMAGESWEEPID' => $id));
            }
        }


        function _add_reprocessing_sweep($args) {
            if (!array_key_exists('REPROCESSINGID', $args)) $this->_error('No reprocessing specified');
            if (!array_key_exists('DATACOLLECTIONID', $args)) $this->_error('No datacollection specified');
            if (!array_key_exists('STARTIMAGE', $args)) $this->_error('No start image specified');
            if (!array_key_exists('ENDIMAGE', $args)) $this->_error('No end image specified');

            $chk = $this->db->pq("SELECT rp.reprocessingid
                FROM reprocessing rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.reprocessingid = :2", array($this->proposalid, $args['REPROCESSINGID']));

            if (!sizeof($chk)) $this->_error('No such reprocessing');

            $chk = $this->db->pq("SELECT dc.datacollectionid
                FROM datacollection dc
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND dc.datacollectionid = :2", array($this->proposalid, $args['DATACOLLECTIONID']));

            if (!sizeof($chk)) $this->_error('No such datacollection');

            $this->db->pq("INSERT INTO reprocessingimagesweep (reprocessingid, datacollectionid, startimage, endimage) VALUES (:1, :2, :3, :4)", array($args['REPROCESSINGID'], $args['DATACOLLECTIONID'], $args['STARTIMAGE'], $args['ENDIMAGE']));

            $this->_output(array('REPROCESSINGIMAGESWEEPID' => $this->db->id()));
        }


        function _enqueue() {
            global $loader;
            $loader->addNamespace('Stomp',  dirname(__FILE__).'/../../lib/stomp-php/src/Stomp');

            global $activemq_server, $activemq_rp_queue;
            if (!$activemq_server || !$activemq_rp_queue) return;

            if (!$this->has_arg('REPROCESSINGID')) $this->_error('No reprocessingid specified');

            $chk = $this->db->pq("SELECT rp.reprocessingid
                FROM reprocessing rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.reprocessingid = :2", array($this->proposalid, $this->arg('REPROCESSINGID')));

            if (!sizeof($chk)) $this->_error('No such reprocessing');

            $body = array(
                'parameters' => array(
                    'ispby_process' => $this->arg('REPROCESSINGID'),
                )
            );

            $header['transformation'] = 'jms-map-json';
            $mapMessage = new Map($body, $header);

            $client = new Stomp($activemq_server);
            $client->connect();
            $client->send($activemq_rp_queue, $mapMessage);
            $client->disconnect();

            $this->_output(new stdClass);
        }

    }
