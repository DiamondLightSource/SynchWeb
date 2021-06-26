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
    );

    public static $arg_list = array(
        'id' => '\d+',
        'ids' => '\d+',
        'visit' => '\w+\d+-\d+',
        'map' => '\d+',
        'n' => '\d+',
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
        $rows = $this->db->pq(
            'SELECT apss.cchalf, apss.ccanomalous, apss.anomalous, dc.xbeam, dc.ybeam, api.refinedxbeam, api.refinedybeam, app.autoprocprogramid,app.processingprograms as type, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.scalingstatisticstype as shell, apss.rmeasalliplusiminus as rmeas, apss.rmerge, apss.completeness, apss.anomalouscompleteness as anomcompleteness, apss.anomalousmultiplicity as anommultiplicity, apss.multiplicity, apss.meanioversigi as isigi, ap.spacegroup as sg, ap.refinedcell_a as cell_a, ap.refinedcell_b as cell_b, ap.refinedcell_c as cell_c, ap.refinedcell_alpha as cell_al, ap.refinedcell_beta as cell_be, ap.refinedcell_gamma as cell_ga, 
                    (SELECT COUNT(api1.autoprocintegrationid) FROM autoprocintegration api1 WHERE api1.autoprocprogramid =  app.autoprocprogramid) as imagesweepcount, app.processingstatus, app.processingmessage, count(distinct pjis.datacollectionid) as dccount, max(pjis.processingjobid) as processingjobid, pj.automatic
                FROM autoprocintegration api 
                LEFT OUTER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                LEFT OUTER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                LEFT OUTER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                LEFT OUTER JOIN processingjob pj ON app.processingjobid = pj.processingjobid
                LEFT OUTER JOIN processingjobimagesweep pjis ON pjis.processingjobid = pj.processingjobid
                INNER JOIN datacollection dc ON api.datacollectionid = dc.datacollectionid
                WHERE api.datacollectionid = :1 AND app.processingstatus IS NOT NULL
                GROUP BY app.autoprocprogramid, apss.autoprocscalingstatisticsid
                ORDER BY apss.scalingstatisticstype DESC',
            array($id)
        );

        $msg_tmp = $this->db->pq(
            "SELECT api.autoprocprogramid, appm.recordtimestamp, appm.severity, appm.message, appm.description
                FROM autoprocprogrammessage appm
                INNER JOIN autoprocintegration api ON api.autoprocprogramid = appm.autoprocprogramid
                WHERE api.datacollectionid=:1",
            array($id)
        );

        $messages = array();
        foreach ($msg_tmp as $m) {
            if (!array_key_exists($m['AUTOPROCPROGRAMID'], $messages)) {
                $messages[$m['AUTOPROCPROGRAMID']] = array();
            }
            array_push($messages[$m['AUTOPROCPROGRAMID']], $m);
        }

        $dts = array(
            'cell_a',
            'cell_b',
            'cell_c',
            'cell_al',
            'cell_be',
            'cell_ga',
        );
        $dts2 = array('rlow', 'rhigh');

        $output = array();
        foreach ($rows as &$r) {
            if (!array_key_exists($r['AUTOPROCPROGRAMID'], $output)) {
                $output[$r['AUTOPROCPROGRAMID']] = array(
                    'BEAM' => array(),
                    'SHELLS' => array(),
                    'CELL' => array(),
                );
            }

            if ($r['PROCESSINGSTATUS'] == '1') {
                $shell = array();
                foreach ($r as $k => &$v) {
                    if ($k == 'TYPE') {
                        if ($r['DCCOUNT'] > 1) {
                            $prefix = preg_match('/multi/', $v) ? '' : 'multi-';
                            $v = $r['DCCOUNT'] . 'x ' . $prefix . $v;
                        }
                    }

                    if ($k == 'ISIGI') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'RMERGE') {
                        $v = number_format($v, 3);
                    }
                    if ($k == 'RMEAS') {
                        $v = number_format($v, 3);
                    }
                    if ($k == 'COMPLETENESS') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'MULTIPLICITY') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'ANOMCOMPLETENESS') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'ANOMMULTIPLICITY') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'CCHALF') {
                        $v = number_format($v, 1);
                    }
                    if ($k == 'CCANOMALOUS') {
                        $v = number_format($v, 1);
                    }

                    $beam = array(
                        'XBEAM',
                        'YBEAM',
                        'REFINEDXBEAM',
                        'REFINEDYBEAM',
                    );

                    // We need to discriminate between NULL values from the database and when the value is a zero
                    if (in_array($k, $beam) && is_numeric($v)) {
                        $v = number_format($v, 2);
                    }

                    if (
                        $k == 'AUTOPROCPROGRAMID' ||
                        $k == 'SHELL' ||
                        $k == 'PROCESSINGJOBID' ||
                        $k == 'IMAGESWEEPCOUNT'
                    ) {
                        continue;
                    } elseif ($k == 'SG') {
                        $output[$r['AUTOPROCPROGRAMID']]['SG'] = $v;
                    } elseif (in_array(strtolower($k), $dts2)) {
                        $shell[$k] = number_format($v, 2);
                    } elseif (in_array(strtolower($k), $dts)) {
                        $v = number_format($v, 2);
                        $output[$r['AUTOPROCPROGRAMID']]['CELL'][$k] = $v;
                    } elseif (in_array($k, $beam)) {
                        $output[$r['AUTOPROCPROGRAMID']]['BEAM'][$k] = $v;
                    } else {
                        $shell[$k] = $v;
                    }
                }
                $output[$r['AUTOPROCPROGRAMID']]['SHELLS'][
                    $r['SHELL']
                ] = $shell;
            }

            $output[$r['AUTOPROCPROGRAMID']]['PROCESSINGJOBID'] =
                $r['PROCESSINGJOBID'];
            $output[$r['AUTOPROCPROGRAMID']]['IMAGESWEEPCOUNT'] =
                $r['IMAGESWEEPCOUNT'];
            $output[$r['AUTOPROCPROGRAMID']]['DCCOUNT'] = $r['DCCOUNT'];

            $output[$r['AUTOPROCPROGRAMID']]['TYPE'] = $r['TYPE'];
            $output[$r['AUTOPROCPROGRAMID']]['AID'] = $r['AUTOPROCPROGRAMID'];
            $output[$r['AUTOPROCPROGRAMID']]['PROCESSINGSTATUS'] =
                $r['PROCESSINGSTATUS'];
            $output[$r['AUTOPROCPROGRAMID']]['PROCESSINGMESSAGE'] =
                $r['PROCESSINGMESSAGE'];
            $output[$r['AUTOPROCPROGRAMID']]['MESSAGES'] = array_key_exists(
                $r['AUTOPROCPROGRAMID'],
                $messages
            )
                ? $messages[$r['AUTOPROCPROGRAMID']]
                : array();
            $output[$r['AUTOPROCPROGRAMID']]['AUTOMATIC'] =
                $r['AUTOMATIC'] != 0;
        }

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
}
