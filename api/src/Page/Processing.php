<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Downstream\DownstreamProcessing;

class Processing extends Page {
    public static $dispatch = array(
        array('/:id', 'get', '_results'),
        array('/status', 'post', '_statuses'),

        array('/messages/status', 'post', '_ap_message_status'),
        array('/messages', 'get', '_ap_message'),

        array('/downstream/:id', 'get', '_downstream'),
        array('/downstream/images/:aid(/n/:n)', 'get', '_downstream_images'),
        array(
            '/downstream/mapmodel/:aid(/n/:n)',
            'get',
            '_downstream_mapmodel',
        ),
        array(
            '/multiplex_jobs/groups/:blSampleGroupId',
            'get',
            '_get_latest_multiplex_job_result'
        ),
    );

    public static $arg_list = array(
        'id' => '\d+',
        'ids' => '\d+',
        'visit' => '\w+\d+-\d+',
        'map' => '\d+',
        'n' => '\d+',
        'sampleGroupId' => '\d+',
        'resultCount' => '\d+'
    );

    /**
     * Map database status values to something synchweb understands:
     * 0: didnt run, 1: running, 2: success, 3: failed
     */
    var $status_mapping = array(
        null => 1,
        1 => 2,
        0 => 3,
    );

    function _map_status($status) {
        foreach ($this->status_mapping as $state => $value) {
            if ($status == $state) {
                return $value;
            }
        }
    }

    function _screening_status($where, $ids) {
        $screenings = $this->db->pq(
            "SELECT dc.datacollectionid, sc.programversion, so.indexingsuccess, so.strategysuccess, so.alignmentsuccess
                FROM screeningoutput so
                INNER JOIN screening sc on so.screeningid = sc.screeningid 
                INNER JOIN datacollection dc on sc.datacollectionid = dc.datacollectionid
                INNER JOIN datacollectiongroup dcg on dc.datacollectiongroupid = dcg.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where
                GROUP BY dc.datacollectionid, sc.programversion",
            $ids
        );

        $statuses = array();
        foreach ($screenings as $screening) {
            if (!array_key_exists($screening['DATACOLLECTIONID'], $statuses)) {
                $statuses[$screening['DATACOLLECTIONID']][
                    'screening'
                ] = array();
            }

            $statuses[$screening['DATACOLLECTIONID']]['screening'][
                $screening['PROGRAMVERSION']
            ] = $this->_map_status($screening["INDEXINGSUCCESS"]);
        }

        return $statuses;
    }

    function _xrc_status($where, $ids) {
        $dcs = $this->db->pq(
            "SELECT xrc.status as xrcstatus, dc.datacollectionid
            FROM datacollection dc 
            INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
            INNER JOIN gridinfo gr ON (gr.datacollectionid = dc.datacollectionid OR gr.datacollectiongroupid = dc.datacollectiongroupid)
            LEFT OUTER JOIN xraycentringresult xrc ON xrc.gridinfoid = gr.gridinfoid
            INNER JOIN blsession s ON s.sessionid = dcg.sessionid 
            INNER JOIN proposal p ON p.proposalid = s.proposalid
            WHERE $where",
            $ids
        );

        $statuses = array();
        foreach ($dcs as $dc) {
            if (!array_key_exists($dc['DATACOLLECTIONID'], $statuses)) {
                $statuses[$dc['DATACOLLECTIONID']]['XrayCentring'] = array();
            }

            $statuses[$dc['DATACOLLECTIONID']]['XrayCentring'] =
                $dc['XRCSTATUS'] === null
                    ? 0
                    : ($dc['XRCSTATUS'] === 'pending'
                        ? 1
                        : ($dc['XRCSTATUS'] === 'success'
                            ? 2
                            : 3));
        }

        return $statuses;
    }

    function _autoproc_status($where, $ids) {
        global $downstream_filter;
        $filter = $downstream_filter ? implode("','", $downstream_filter) : '';

        $processings = $this->db->union(
            array(
                "SELECT app.autoprocprogramid, dc.datacollectionid, app.processingprograms, app.processingstatus as status, 'autoproc' as type
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN autoprocintegration api ON api.datacollectionid = dc.datacollectionid
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid
                WHERE $where AND app.processingprograms NOT IN ('$filter')",
                "SELECT app.autoprocprogramid, dc.datacollectionid, app.processingprograms, app.processingstatus as status, 'downstream' as type
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN processingjob pj ON pj.datacollectionid = dc.datacollectionid
                INNER JOIN autoprocprogram app ON pj.processingjobid = app.processingjobid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                WHERE $where AND api.autoprocintegrationid IS NULL AND pj.automatic = 1
                    AND app.processingprograms NOT IN ('$filter')",
            ),
            $ids
        );

        $statuses = array();
        foreach ($processings as $p) {
            if (!array_key_exists($p['DATACOLLECTIONID'], $statuses)) {
                $statuses[$p['DATACOLLECTIONID']] = array();
            }
            if (
                !array_key_exists($p['TYPE'], $statuses[$p['DATACOLLECTIONID']])
            ) {
                $statuses[$p['DATACOLLECTIONID']][$p["TYPE"]] = array();
            }

            if (
                !array_key_exists(
                    $p['PROCESSINGPROGRAMS'],
                    $statuses[$p['DATACOLLECTIONID']][$p['TYPE']]
                )
            ) {
                $statuses[$p['DATACOLLECTIONID']][$p["TYPE"]][
                    $p['PROCESSINGPROGRAMS']
                ] = array();
            }

            array_push(
                $statuses[$p['DATACOLLECTIONID']][$p['TYPE']][
                    $p['PROCESSINGPROGRAMS']
                ],
                $this->_map_status($p['STATUS'])
            );
        }

        return $statuses;
    }

    function _get_ids() {
        $where = array();
        $ids = array();
        if ($this->has_arg('ids')) {
            if (is_array($this->arg('ids'))) {
                foreach ($this->arg('ids') as $i) {
                    array_push($ids, $i);
                    array_push($where, 'dc.datacollectionid=:' . sizeof($ids));
                }
            }
        }

        $where = '(' . implode(' OR ', $where) . ')';
        return array($where, $ids);
    }

    /**
     * All screening, auto processing, and downstream statuses
     */
    function _statuses() {
        if (!($this->has_arg('visit') || $this->has_arg('prop'))) {
            $this->_error('No visit or proposal specified');
        }

        list($where, $ids) = $this->_get_ids();
        if (!sizeof($ids)) {
            $this->_output(array());
            return;
        }

        if ($this->has_arg('visit')) {
            $where .=
                " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" .
                (sizeof($ids) + 1);
            array_push($ids, $this->arg('visit'));
        } else {
            $where .= " AND s.proposalid = :" . (sizeof($ids) + 1);
            array_push($ids, $this->proposalid);
        }

        $screenings = $this->_screening_status($where, $ids);
        $xrcs = $this->_xrc_status($where, $ids);
        $autoprocs = $this->_autoproc_status($where, $ids);

        $statuses = array_replace_recursive($screenings, $xrcs, $autoprocs);

        $out = array();
        foreach ($ids as $id) {
            if (array_key_exists($id, $statuses)) {
                array_push($out, array(strval($id), $statuses[$id]));
            } else {
                array_push($out, array(strval($id), new \stdClass()));
            }
        }

        $this->_output($out);
    }

    /**
     * Auto processing results
     *  (Integration results only)
     * @param integer $id DataCollectionId
     */
    function _results($id) {
        $processing_job_query = $this->_autoprocessing_query_builder(
            "api.datacollectionid = :1 AND app.processingstatus IS NOT NULL",
            "GROUP BY app.autoprocprogramid, apss.autoprocscalingstatisticsid",
            "ORDER BY apss.scalingstatisticstype DESC");
        $rows = $this->db->pq($processing_job_query, array($id));

        $whereClause = "api.datacollectionid=:1";
        $messages = $this->_generate_auto_program_messages($whereClause, "", array($id));

        $output = $this->_format_auto_processing_result($rows, $messages);

        $this->_output(array(sizeof($output), $output));
    }

    /**
     * AutoProcProgramMessages status
     */
    function _ap_message_status() {
        if (!($this->has_arg('visit') || $this->has_arg('prop'))) {
            $this->_error('No visit or proposal specified');
        }
        $where = 'WHERE s.proposalid=:1';
        $args = array($this->proposalid);

        $wids = array();
        if ($this->has_arg('ids')) {
            if (is_array($this->arg('ids'))) {
                foreach ($this->arg('ids') as $i) {
                    array_push(
                        $wids,
                        'dc.datacollectionid=:' . (sizeof($args) + 1)
                    );
                    array_push($args, $i);
                }
            }
        }

        if (!sizeof($wids)) {
            $this->_output(array());
            return;
        }

        $where .= ' AND (' . implode(' OR ', $wids) . ')';

        $rows = $this->db->union(
            array(
                "SELECT app.autoprocprogramid, dc.datacollectionid as id, SUM(IF(appm.severity = 'ERROR', 1, 0)) as errors, SUM(IF(appm.severity = 'WARNING', 1, 0)) as warnings, SUM(IF(appm.severity = 'INFO', 1, 0)) as infos
            FROM autoprocprogrammessage appm
            INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
            INNER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
            INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
            INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
            INNER JOIN blsession s ON s.sessionid = dcg.sessionid
            $where
            GROUP BY dc.datacollectionid",
                "SELECT app.autoprocprogramid, dc.datacollectionid as id, SUM(IF(appm.severity = 'ERROR', 1, 0)) as errors, SUM(IF(appm.severity = 'WARNING', 1, 0)) as warnings, SUM(IF(appm.severity = 'INFO', 1, 0)) as infos
            FROM autoprocprogrammessage appm
            INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
            INNER JOIN processingjob pj ON pj.processingjobid = app.processingjobid
            INNER JOIN datacollection dc ON dc.datacollectionid = pj.datacollectionid
            INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
            INNER JOIN blsession s ON s.sessionid = dcg.sessionid
            $where
            GROUP BY dc.datacollectionid
        ",
            ),
            $args,
            false,
            "SELECT autoprocprogramid, id, sum(errors) as errors, sum(warnings) as warnings, sum(infos) as infos FROM (:QUERY) inq GROUP BY id"
        );

        $this->_output($rows);
    }

    /**
     * AutoProcProgramMessages
     */
    function _ap_message() {
        if (!$this->has_arg('prop')) {
            $this->_error('No proposal specified');
        }
        if (
            !$this->has_arg('id') &&
            !$this->has_arg('AUTOPROCPROGRAMMESSAGEID')
        ) {
            $this->_error('No datacollection or message specified');
        }

        $where = 'WHERE p.proposalid=:1';
        $args = array($this->proposalid);

        if ($this->has_arg('AUTOPROCPROGRAMMESSAGEID')) {
            $where .=
                ' AND appm.autoprocprogrammessageid=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('AUTOPROCPROGRAMMESSAGEID'));
        }

        if ($this->has_arg('id')) {
            $where .= ' AND dc.datacollectionid=:2';
            array_push($args, $this->arg('id'));
        }

        $rows = $this->db->union(
            array(
                "SELECT app.processingprograms, appm.autoprocprogrammessageid, appm.recordtimestamp, appm.severity, appm.message, appm.description, app.autoprocprogramid
            FROM autoprocprogrammessage appm
            INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
            INNER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
            INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
            INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
            INNER JOIN blsession s ON s.sessionid = dcg.sessionid
            INNER JOIN proposal p ON p.proposalid = s.proposalid
            $where",
                "SELECT app.processingprograms, appm.autoprocprogrammessageid, appm.recordtimestamp, appm.severity, appm.message, appm.description, app.autoprocprogramid
            FROM autoprocprogrammessage appm
            INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
            INNER JOIN processingjob pj ON pj.processingjobid = app.processingjobid
            INNER JOIN datacollection dc ON dc.datacollectionid = pj.datacollectionid
            INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
            INNER JOIN blsession s ON s.sessionid = dcg.sessionid
            INNER JOIN proposal p ON p.proposalid = s.proposalid
            $where",
            ),
            $args
        );

        if ($this->has_arg('AUTOPROCPROGRAMMESSAGEID')) {
            if (sizeof($rows)) {
                $this->_output($rows[0]);
            } else {
                $this->_error('No such auto processing message');
            }
        } else {
            $this->_output($rows);
        }
    }

    function _get_downstreams($dcid = null, $aid = null) {
        global $downstream_filter;
        $filter = $downstream_filter ? implode("','", $downstream_filter) : '';

        $where = '';
        $args = array($this->proposalid);

        if ($dcid) {
            $where .= ' AND dc.datacollectionid=:' . (sizeof($args) + 1);
            array_push($args, $dcid);
        }

        if ($aid) {
            $where .= ' AND app.autoprocprogramid=:' . (sizeof($args) + 1);
            array_push($args, $aid);
        }

        $downstreams = $this->db->pq(
            "SELECT app.autoprocprogramid, app.processingprograms, pj.automatic, 
                    app.processingstatus, app.processingmessage,
                    app.processingstarttime, app.processingendtime, pj.recipe, pj.comments as processingcomments,
                    dc.imageprefix as dcimageprefix, dc.imagedirectory as dcimagedirectory, 
                    CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit,
                    GROUP_CONCAT(CONCAT(pjp.parameterkey, '=', pjp.parametervalue)) as parameters
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN processingjob pj ON pj.datacollectionid = dc.datacollectionid
                LEFT OUTER JOIN processingjobparameter pjp ON pj.processingjobid = pjp.processingjobid
                INNER JOIN autoprocprogram app ON pj.processingjobid = app.processingjobid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE api.autoprocintegrationid IS NULL AND p.proposalid=:1 $where
                    AND app.processingprograms NOT IN ('$filter')
                GROUP BY pj.processingjobid",
            $args
        );

        foreach ($downstreams as &$downstream) {
            $params = array();
            if ($downstream["PARAMETERS"]) {
                $str_params = explode(',', $downstream["PARAMETERS"]);
                foreach ($str_params as $str_param) {
                    list($key, $value) = explode('=', $str_param);
                    $params[$key] = $value;
                }
            }
            $downstream['PARAMETERS'] = $params;
        }

        if ($aid) {
            if (sizeof($downstreams)) {
                return $downstreams[0];
            }
        } else {
            return $downstreams;
        }
    }

    /**
     * Downstream processing  results
     *  All zocalo ProcessingJob results, excluding rows with integration/screening
     * @param integer $id DataCollectionId
     */
    function _downstream($id) {
        $downstreams = $this->_get_downstreams($id);

        $msg_tmp = $this->db->pq(
            "SELECT app.autoprocprogramid, appm.recordtimestamp, appm.severity, appm.message, appm.description
                FROM autoprocprogrammessage appm
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
                INNER JOIN processingjob pj ON app.processingjobid = pj.processingjobid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                WHERE pj.datacollectionid =:1 AND api.autoprocintegrationid IS NULL",
            array($id)
        );

        $messages = array();
        foreach ($msg_tmp as $m) {
            if (!array_key_exists($m['AUTOPROCPROGRAMID'], $messages)) {
                $messages[$m['AUTOPROCPROGRAMID']] = array();
            }
            array_push($messages[$m['AUTOPROCPROGRAMID']], $m);
        }

        $ds = new DownstreamProcessing($this->db, $this);

        $results = array();
        foreach ($downstreams as $downstream) {
            $downstream['MESSAGES'] = array_key_exists(
                $downstream['AUTOPROCPROGRAMID'],
                $messages
            )
                ? $messages[$downstream['AUTOPROCPROGRAMID']]
                : array();

            $result = $ds->generate(
                strtolower($downstream["PROCESSINGPROGRAMS"]),
                $downstream["AUTOPROCPROGRAMID"],
                $downstream
            );
            if ($result) {
                array_push($results, $result->legacy());
            }
        }

        $this->_output($results);
    }

    /**
     * Downstream images
     * @param integer $aid AutoProcProgramId
     */
    function _downstream_images($aid) {
        $downstream = $this->_get_downstreams(null, $aid);
        if (!$downstream) {
            return $this->_error("No such downstream processing");
        }

        $ds = new DownstreamProcessing($this->db, $this);
        $plugin = $ds->load_plugin(
            strtolower($downstream["PROCESSINGPROGRAMS"]),
            $downstream["AUTOPROCPROGRAMID"],
            $downstream
        );

        if (!$plugin) {
            return $this->_error("This plugin does not provide images");
        }

        if (!$plugin->has_images) {
            return $this->_error("This plugin does not provide images");
        }

        $im = $plugin->images($this->has_arg('n') ? $this->arg("n") : 0);
        if ($im) {
            if (file_exists($im)) {
                $ext = pathinfo($im, PATHINFO_EXTENSION);
                if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) {
                    $head = 'image/' . $ext;
                }

                $this->_browser_cache();
                $this->app->contentType($head);
                readfile($im);
            } else {
                $this->_error("No such image");
            }
        }
    }

    function _browser_cache() {
        $expires = 60 * 60 * 24 * 14;
        $this->app->response->headers->set('Pragma', 'public');
        $this->app->response->headers->set(
            'Cache-Control',
            'maxage=' . $expires
        );
        $this->app->response->headers->set(
            'Expires',
            gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT'
        );
    }

    /**
     * Downstream map / models
     * @param integer $aid AutoProcProgramId
     */
    function _downstream_mapmodel($aid) {
        $downstream = $this->_get_downstreams(null, $aid);
        if (!$downstream) {
            return $this->_error("No such downstream processing");
        }

        $ds = new DownstreamProcessing($this->db, $this);
        $plugin = $ds->load_plugin(
            strtolower($downstream["PROCESSINGPROGRAMS"]),
            $downstream["AUTOPROCPROGRAMID"],
            $downstream
        );

        if (!$plugin) {
            return $this->_error("This plugin does not provide map / models");
        }

        if (!$plugin->has_mapmodel) {
            return $this->_error("This plugin does not provide map / models");
        }

        if ($this->has_arg('map')) {
            if ($this->arg('map') > $plugin->has_mapmodel[1]) {
                return $this->_error('Invalid map specified');
            }
        }

        $mapmodel = $plugin->mapmodel(
            // Specify which map / model number (could be more than one)
            $this->has_arg('n') ? $this->arg("n") : 0,
            // Specify whether to load map or model, default is model
            $this->has_arg('map') ? $this->arg('map') : false
        );

        if (file_exists($mapmodel)) {
            $this->app->response->headers->set(
                "Content-Length",
                filesize($mapmodel)
            );
            readfile($mapmodel);
        } else {
            $this->_error('Could not find map / model');
        }
    }

    /**
     * Processing results by sample groups
     *
     */
    function _get_latest_multiplex_job_result() {
        if (!$this->has_arg('prop')) {
            $this->_error('proposal specified');
        }

        if (!$this->has_arg('blSampleGroupId')) {
            $this->_error('No sample group specified');
        }

        $args = array($this->arg('blSampleGroupId'));

        $result_count = $this->has_arg('resultCount') ? $this->arg('resultCount') : '';
        $result_count = empty($result_count) ? 3 : $this->arg('resultCount');
        array_push($args, $result_count);

        $last_processing_job_result = $this->db->pq("
            SELECT pj.processingJobId
            FROM BLSampleGroup_has_BLSample bhg
            JOIN DataCollectionGroup dcg ON dcg.blSampleId = bhg.blSampleId
            JOIN DataCollection dc ON dc.dataCollectionGroupId = dcg.dataCollectionGroupId
            JOIN ProcessingJob pj ON pj.dataCollectionId = dc.dataCollectionId
            JOIN ProcessingJobParameter pjp ON pj.processingJobId = pjp.processingJobId
            WHERE pjp.parameterKey = 'sample_group_id' AND pjp.parameterValue =:1
            ORDER BY processingJobId DESC
            LIMIT :2",
        $args);

        if (sizeof($last_processing_job_result) < 1) {
            $this->_output(array());
            return;
        }

        $processing_ids_list = array_column($last_processing_job_result, 'PROCESSINGJOBID');
        $processing_jobs = array_reduce(array_keys($processing_ids_list), function ($carry, $index) use ($processing_ids_list) {
            $index_value = $index + 1;

            if ($index_value < sizeof($processing_ids_list)) {
                $carry .= ":{$index_value}, ";
            } else {
                $carry .= ":{$index_value}";
            }
            return $carry;
        }, "");

        $whereClause = "app.processingJobId IN ({$processing_jobs})";
        $job_where_clause = "pj.processingJobId IN ({$processing_jobs})";
        $message_join = "INNER JOIN autoprocprogram app on api.autoprocprogramid = app.autoprocprogramid";

        $multiplex_job_query = $this->_autoprocessing_query_builder(
            $job_where_clause,
            "GROUP BY app.autoprocprogramid, apss.autoprocscalingstatisticsid",
            "ORDER BY processingJobId DESC");
        $last_multiplex_jobs = $this->db->pq($multiplex_job_query, $processing_ids_list);
        $multiplex_jobs_messages = $this->_generate_auto_program_messages($whereClause, $message_join, $processing_ids_list);
        $output = $this->_format_auto_processing_result($last_multiplex_jobs, $multiplex_jobs_messages);
        $this->_output($output);
    }

    private function _autoprocessing_query_builder($where, $group, $order = '') {
        $fields = "
            apss.cchalf,
            apss.ccanomalous,
            apss.anomalous,
            dc.xbeam,
            dc.ybeam,
            api.refinedxbeam,
            api.refinedybeam,
            app.autoprocprogramid,
            app.processingprograms as type,
            apss.ntotalobservations as ntobs,
            apss.ntotaluniqueobservations as nuobs,
            apss.resolutionlimitlow as rlow,
            apss.resolutionlimithigh as rhigh,
            apss.scalingstatisticstype as shell,
            apss.rmeasalliplusiminus as rmeas,
            apss.rmerge, apss.completeness,
            apss.anomalouscompleteness as anomcompleteness,
            apss.anomalousmultiplicity as anommultiplicity,
            apss.multiplicity,
            apss.meanioversigi as isigi,
            apss.resioversigi2 as resisigi,
            ap.spacegroup as sg,
            ap.refinedcell_a as cell_a,
            ap.refinedcell_b as cell_b,
            ap.refinedcell_c as cell_c,
            ap.refinedcell_alpha as cell_al,
            ap.refinedcell_beta as cell_be,
            ap.refinedcell_gamma as cell_ga, 
            (SELECT COUNT(api1.autoprocintegrationid) FROM autoprocintegration api1 WHERE api1.autoprocprogramid =  app.autoprocprogramid) as imagesweepcount,
            app.processingstatus,
            app.processingmessage,
            count(distinct pjis.datacollectionid) as dccount,
            max(pjis.processingjobid) as processingjobid,
            pj.automatic";

        $from = "FROM autoprocintegration api";
        $joins = "
            LEFT OUTER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
            LEFT OUTER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
            LEFT OUTER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
            LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid 
            INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
            LEFT OUTER JOIN processingjob pj ON app.processingjobid = pj.processingjobid
            LEFT OUTER JOIN processingjobimagesweep pjis ON pjis.processingjobid = pj.processingjobid
            INNER JOIN datacollection dc ON api.datacollectionid = dc.datacollectionid
        ";

        return "SELECT $fields $from $joins WHERE $where $group $order";
    }

    private function _generate_auto_program_messages($where, $join = "", $args = array()) {
        $messages = array();

        $query = "SELECT api.autoprocprogramid, appm.recordtimestamp, appm.severity, appm.message, appm.description
            FROM autoprocprogrammessage appm
            INNER JOIN autoprocintegration api ON api.autoprocprogramid = appm.autoprocprogramid
            $join
            WHERE $where";

        $messages_row = $this->db->pq($query, $args);

        foreach ($messages_row as $message) {
            if (!array_key_exists($message['AUTOPROCPROGRAMID'], $messages)) {
                $messages[$message['AUTOPROCPROGRAMID']] = array();
            }
            array_push($messages[$message['AUTOPROCPROGRAMID']], $message);
        }

        return $messages;
    }

    private function _format_auto_processing_result($table_rows, $messages_result) {
        $formatted_result = array();
        $cells_data = array(
            'cell_a',
            'cell_b',
            'cell_c',
            'cell_al',
            'cell_be',
            'cell_ga',
        );
        $resolution_data = array('rlow', 'rhigh');
        $returned_keys = array('PROCESSINGJOBID', 'IMAGESWEEPCOUNT', 'DCCOUNT', 'TYPE', 'PROCESSINGSTATUS', 'PROCESSINGMESSAGE');

        foreach($table_rows as &$row) {
            if (!array_key_exists($row['AUTOPROCPROGRAMID'], $formatted_result)) {
                $formatted_result[$row['AUTOPROCPROGRAMID']] = array_intersect_key($row, array_flip($returned_keys));
                $new_items = array(
                    'BEAM' => array(),
                    'SHELLS' => array(),
                    'CELL' => array()
                );
                $formatted_result[$row['AUTOPROCPROGRAMID']] = array_merge($formatted_result[$row['AUTOPROCPROGRAMID']], $new_items);
            }

            if ($row['PROCESSINGSTATUS'] == '1') {
                $shell = array();
                foreach ($row as $key => &$value) {
                    if ($key == 'TYPE') {
                        if ($row['DCCOUNT'] > 1) {
                            $prefix = preg_match('/multi/', $value) ? '' : 'multi-';
                            $value = $row['DCCOUNT'] . 'x ' . $prefix . $value;
                        }
                    }


                    if ($key == 'ISIGI') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'RESISIGI') {
                        $value = number_format($value, 2);
                    }
                    if ($key == 'RMERGE') {
                        $value = number_format($value, 3);
                    }
                    if ($key == 'RMEAS') {
                        $value = number_format($value, 3);
                    }
                    if ($key == 'COMPLETENESS') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'MULTIPLICITY') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'ANOMCOMPLETENESS') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'ANOMMULTIPLICITY') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'CCHALF') {
                        $value = number_format($value, 1);
                    }
                    if ($key == 'CCANOMALOUS') {
                        $value = number_format($value, 1);
                    }

                    $beam = array(
                        'XBEAM',
                        'YBEAM',
                        'REFINEDXBEAM',
                        'REFINEDYBEAM',
                    );

                    // We need to discriminate between NULL values from the database and when the value is a zero
                    if (in_array($key, $beam) && is_numeric($value)) {
                        $value = number_format($value, 2);
                    }

                    if (
                        $key == 'AUTOPROCPROGRAMID' ||
                        $key == 'SHELL' ||
                        $key == 'PROCESSINGJOBID' ||
                        $key == 'IMAGESWEEPCOUNT'
                    ) {
                        continue;
                    } elseif ($key == 'SG') {
                        $formatted_result[$row['AUTOPROCPROGRAMID']]['SG'] = $value;
                    } elseif (in_array(strtolower($key), $resolution_data)) {
                        $shell[$key] = number_format($value, 2);
                    } elseif (in_array(strtolower($key), $cells_data)) {
                        $value = number_format($value, 2);
                        $formatted_result[$row['AUTOPROCPROGRAMID']]['CELL'][$key] = $value;
                    } elseif (in_array($key, $beam)) {
                        $formatted_result[$row['AUTOPROCPROGRAMID']]['BEAM'][$key] = $value;
                    } else {
                        $shell[$key] = $value;
                    }
                }

                // Allow Shells to always be returned in order of 'OUTERSHELL', 'INNERSHELL', 'OVERALL'
                switch($row['SHELL']) {
                    case 'OUTERSHELL':
                    case 'outerShell':
                        $shell['INDEX'] = 0;
                        break;
                    case 'INNERSHELL':
                    case 'innerShell':
                        $shell['INDEX'] = 1;
                            break;
                    case 'OVERALL':
                    case 'overall':
                        $shell['INDEX'] = 2;
                        break;
                    default:
                        $shell['INDEX'] = 3;
                }

                $formatted_result[$row['AUTOPROCPROGRAMID']]['SHELLS'][$row['SHELL']] = $shell;
            }

            $formatted_result[$row['AUTOPROCPROGRAMID']]['TYPE'] = $row['TYPE'];
            $formatted_result[$row['AUTOPROCPROGRAMID']]['AID'] = $row['AUTOPROCPROGRAMID'];
            $formatted_result[$row['AUTOPROCPROGRAMID']]['MESSAGES'] = array_key_exists($row['AUTOPROCPROGRAMID'], $messages_result)
                ? $messages_result[$row['AUTOPROCPROGRAMID']]
                : array();
            $formatted_result[$row['AUTOPROCPROGRAMID']]['AUTOMATIC'] = $row['AUTOMATIC'] != 0;
        }

        return $formatted_result;
    }
}
