<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Process extends Page
{
    private $queue;
        
        public static $arg_list = array(
            'PROCESSINGJOBID' => '\d+',
            'DATACOLLECTIONID' => '\d+',
            'DISPLAYNAME' => '([\w\s-])+',
            'COMMENTS' => '.*',

            'PROCESSINGJOBIMAGESWEEPID' => '\d+',
            'STARTIMAGE' => '\d+',
            'ENDIMAGE' => '\d+',
            
            'PROCESSINGJOBPARAMETERID' => '\d+',
            'PARAMETERKEY' => '\w+',
            // Processing parameter value needs to cope with '/' characters e.g. spacegroups for reprocessing
            'PARAMETERVALUE' => '([a-zA-Z0-9-_\.,\/])+',

            'AUTOMATIC' => '\d',

            'RECIPE' => '([\w-])+',

            'ids' => '\d+', 
            'pipelinestatus' => '([\w\s-])+',
            'category' => '([\w\s-])+',
            'discipline' => '([\w\s-])+',
        );
        

        public static $dispatch = array(
            array('(/:PROCESSINGJOBID)', 'get', '_get_reprocessing'),
            array('', 'post', '_add_reprocessing'),

            array('/params(/:PROCESSINGJOBPARAMETERID)', 'get', '_get_reprocessing_params'),
            array('/params', 'post', '_add_reprocessing_params'),

            array('/sweeps(/:PROCESSINGJOBIMAGESWEEPID)', 'get', '_get_reprocessing_sweeps'),
            array('/sweeps', 'post', '_add_reprocessing_sweeps'),

            array('/enqueue', 'post', '_enqueue'),

            array('/pipelines', 'get', '_pipelines'),
        );


        # Reprocessings
        function _get_reprocessing() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('PROCESSINGJOBID')) {
                $where .= ' AND rp.processingjobid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('PROCESSINGJOBID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }

            if (!$this->has_arg('AUTOMATIC')) $where .= " AND rp.automatic!=1";


            $tot = $this->db->pq("SELECT count(distinct rp.processingjobid) as tot, sum(IF(app.processingstatus IS NULL, 1, 0)) as running, sum(IF(app.autoprocprogramid IS NULL, 1, 0)) as waiting
                FROM processingjob rp
                LEFT OUTER JOIN autoprocprogram app ON app.processingjobid = rp.processingjobid
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $args);
            $tot = $tot[0];
            
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
            

            $rows = $this->db->paginate("SELECT
                rp.processingjobid, rp.displayname, rp.comments, TO_CHAR(rp.recordtimestamp, 'DD-MM-YYYY HH24:MI') as recordtimestamp, rp.automatic, 
                dc.filetemplate, dc.imagedirectory, dc.datacollectionid, dc.imageprefix, dc.datacollectionnumber,
                smp.name as sample, smp.blsampleid as blsampleid, pr.acronym as protein, pr.proteinid,
                CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) as visit,

                apss.cchalf, apss.ccanomalous, apss.anomalous, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.rmeasalliplusiminus as rmeas, apss.rmerge, apss.completeness, apss.anomalouscompleteness as anomcompleteness, apss.anomalousmultiplicity as anommultiplicity, apss.multiplicity, apss.meanioversigi as isigi,
                IF(app.autoprocprogramid, IF(api.autoprocintegrationid IS NOT NULL AND app.processingstatus = 1, 1, app.processingstatus), 2) as status, app.processingmessage, TO_CHAR(app.processingendtime, 'DD-MM-YYYY HH24:MI') as lastupdatetimestamp
                FROM processingjob rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                LEFT OUTER JOIN blsample smp ON smp.blsampleid = dc.blsampleid
                LEFT OUTER JOIN crystal cr ON cr.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid

                LEFT OUTER JOIN autoprocprogram app ON app.processingjobid = rp.processingjobid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                LEFT OUTER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                LEFT OUTER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                LEFT OUTER JOIN autoprocscalingstatistics apss ON (apss.autoprocscalingid = aph.autoprocscalingid AND scalingstatisticstype = 'overall')

                WHERE $where
                GROUP BY rp.processingjobid
                ORDER BY rp.processingjobid DESC", $args);    

            foreach ($rows as &$r) {
                $r['IMAGEDIRECTORYFULL'] = $r['IMAGEDIRECTORY'];
                $r['IMAGEDIRECTORY'] = preg_replace('/(.*?\/'.$r['VISIT'].')/', '', $r['IMAGEDIRECTORY'], 1);
            }

            if ($this->has_arg('PROCESSINGJOBID')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such reprocessing job');
            } $this->_output(array('total' => intval($tot['TOT']), 'data' => $rows, 'running' => intval($tot['RUNNING']), 'waiting' => intval($tot['WAITING'])));
        }


        function _add_reprocessing() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('DATACOLLECTIONID')) $this->_error('No datacollection specified');
            if (!$this->has_arg('RECIPE')) $this->_error('No recipe specified');

            $chk = $this->db->pq("SELECT dc.datacollectionid
                FROM datacollection dc
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND dc.datacollectionid = :2", array($this->proposalid, $this->arg('DATACOLLECTIONID')));

            if (!sizeof($chk)) $this->_error('No such datacollection');


            $comments = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : null;
            $display = $this->has_arg('DISPLAYNAME') ? $this->arg('DISPLAYNAME') : null;

            $this->db->pq("INSERT INTO processingjob (datacollectionid, displayname, comments, automatic, recipe) 
                VALUES (:1, :2, :3, :4, :5)", array($this->arg('DATACOLLECTIONID'), $display, $comments, 0, $this->arg('RECIPE')));

            $this->_output(array('PROCESSINGJOBID' => $this->db->id()));
        }



        # Params
        function _get_reprocessing_params() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    $idwhere = array();
                    foreach ($this->arg('ids') as $i) {
                        array_push($args,$i);
                        array_push($idwhere,'rp.processingjobid=:'.sizeof($args));
                    }

                    $where .= ' AND ('.implode(' OR ', $idwhere).')';
                }
            }

            if ($this->has_arg('PROCESSINGJOBID')) {
                $where .= ' AND rp.processingjobid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('PROCESSINGJOBID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }


            $rows = $this->db->pq("SELECT rpp.processingjobparameterid, rpp.parameterkey, rpp.parametervalue, rp.processingjobid
                FROM processingjobparameter rpp
                INNER JOIN processingjob rp ON rp.processingjobid = rpp.processingjobid
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
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
                        $p['PROCESSINGJOBPARAMETERID'] = $id;
                        array_push($col, $p);
                    }
                }

                $this->_output($col);

            } else {
                $id = $this->_add_reprocessing_param($this->args);
                $this->_output(array('PROCESSINGJOBPARAMETERID' => $id));
            }
        }


        function _add_reprocessing_param($param) {
            if (!array_key_exists('PROCESSINGJOBID', $param)) $this->_error('No processing job specified');
            if (!array_key_exists('PARAMETERKEY', $param)) $this->_error('No key specified');
            if (!array_key_exists('PARAMETERVALUE', $param)) $this->_error('No value specified');

            $chk = $this->db->pq("SELECT rp.processingjobid
                FROM processingjob rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.processingjobid = :2", array($this->proposalid, $param['PROCESSINGJOBID']));

            if (!sizeof($chk)) $this->_error('No such processing job');

            $this->db->pq("INSERT INTO processingjobparameter (processingjobid, parameterkey, parametervalue) 
                VALUES (:1, :2, :3)", array($param['PROCESSINGJOBID'], $param['PARAMETERKEY'], $param['PARAMETERVALUE']));

            return $this->db->id();
        }



        # Sweeps
        function _get_reprocessing_sweeps() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    $idwhere = array();
                    foreach ($this->arg('ids') as $i) {
                        array_push($args,$i);
                        array_push($idwhere,'rp.processingjobid=:'.sizeof($args));
                    }

                    $where .= ' AND ('.implode(' OR ', $idwhere).')';
                }
            }

            if ($this->has_arg('PROCESSINGJOBID')) {
                $where .= ' AND rp.processingjobid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('PROCESSINGJOBID'));
            }

            if ($this->has_arg('VISIT')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('VISIT'));
            }


            $rows = $this->db->pq("SELECT
                ris.processingjobimagesweepid, ris.processingjobid, ris.startimage, ris.endimage, ris.datacollectionid,
                dc.filetemplate, dc.imagedirectory, dc.imageprefix, dc.datacollectionid, dc.datacollectionnumber,
                smp.name as sample, smp.blsampleid as blsampleid, pr.acronym as protein, pr.proteinid,
                CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) as visit
                FROM processingjobimagesweep ris
                INNER JOIN processingjob rp ON rp.processingjobid = ris.processingjobid
                INNER JOIN datacollection dc ON dc.datacollectionid = ris.datacollectionid
                LEFT OUTER JOIN blsample smp ON smp.blsampleid = dc.blsampleid
                LEFT OUTER JOIN crystal cr ON cr.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
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
                        $p['PROCESSINGJOBIMAGESWEEPID'] = $id;
                        array_push($col, $p);
                    }
                }

                $this->_output($col);

            } else {
                $id = $this->_add_reprocessing_sweep($this->args);
                $this->_output(array('PROCESSINGJOBIMAGESWEEPID' => $id));
            }
        }


        function _add_reprocessing_sweep($args) {
            if (!array_key_exists('PROCESSINGJOBID', $args)) $this->_error('No processing job specified');
            if (!array_key_exists('DATACOLLECTIONID', $args)) $this->_error('No datacollection specified');
            if (!array_key_exists('STARTIMAGE', $args)) $this->_error('No start image specified');
            if (!array_key_exists('ENDIMAGE', $args)) $this->_error('No end image specified');

            $chk = $this->db->pq("SELECT rp.processingjobid
                FROM processingjob rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.processingjobid = :2", array($this->proposalid, $args['PROCESSINGJOBID']));

            if (!sizeof($chk)) $this->_error('No such processing job');

            $chk = $this->db->pq("SELECT dc.datacollectionid
                FROM datacollection dc
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND dc.datacollectionid = :2", array($this->proposalid, $args['DATACOLLECTIONID']));

            if (!sizeof($chk)) $this->_error('No such datacollection');

            $this->db->pq("INSERT INTO processingjobimagesweep (processingjobid, datacollectionid, startimage, endimage) VALUES (:1, :2, :3, :4)", array($args['PROCESSINGJOBID'], $args['DATACOLLECTIONID'], $args['STARTIMAGE'], $args['ENDIMAGE']));

            $this->_output(array('PROCESSINGJOBIMAGESWEEPID' => $this->db->id()));
        }

    function _enqueue()
    {
        global $zocalo_mx_reprocess_queue;

        if (!$this->has_arg('PROCESSINGJOBID')) $this->_error('No processing job specified');

        $this->db->wait_rep_sync(true);
        
        $chk = $this->db->pq("SELECT rp.processingjobid
                FROM processingjob rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE p.proposalid = :1 AND rp.processingjobid = :2", array($this->proposalid, $this->arg('PROCESSINGJOBID')));

        $this->db->wait_rep_sync(false);

        if (!sizeof($chk)) $this->_error('No such processing job');

        // Send job to processing queue
        $message = array(
            'parameters' => array(
                'ispyb_process' => intval($this->arg('PROCESSINGJOBID')),
            )
        );
        $this->_send_zocalo_message($zocalo_mx_reprocess_queue, $message);

        $this->_output(new \stdClass);
    }

    /*
    * Controller method for /process/pipelines
    * Returns list of processing pipelines that meet query parameters
    * Supported query parameters:
    *     discipline (MX, CryoEM etc),
    *     category (processing, post processing)
    *     pipelinestatus (automatic, optional, deprecated)
    */
    function _pipelines() {
        // By default return all processing pipelines for a given discipline.
        // Filters can be used to return pipelines with a specific status and category
        $discipline = $this->has_arg('discipline') ? $this->arg('discipline') : 'MX';

        $where = 'pp.discipline=:1';
        $args = array($discipline);

        $status = $this->has_arg('pipelinestatus') ? $this->arg('pipelinestatus') : null;
        $category = $this->has_arg('category') ? $this->arg('category') : null;

        if ($status) {
            $where .= ' AND pp.pipelinestatus=:'.(sizeof($args)+1);
            array_push($args, $this->arg('pipelinestatus'));
        }
        if ($category) {
            $where .= ' AND ppc.name=:'.(sizeof($args)+1);
            array_push($args, $this->arg('category'));
        }

        // Make the actual query based on our filters
        $rows = $this->db->pq("SELECT pp.name, pp.processingpipelineid
            FROM processingpipeline pp
            INNER JOIN processingpipelinecategory ppc ON ppc.processingpipelinecategoryid = pp.processingpipelinecategoryid
            WHERE $where", $args);

        $total = count($rows);
        $retVal = array('total' => $total,
                        'data' => $rows);
        $this->_output($retVal);
    }
}
