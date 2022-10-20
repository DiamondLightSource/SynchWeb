<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Summary extends Page
{
    // localhost:8082/api/summary/proposal?prop=nt488&TITLE=resolutino&page=1&per_page=5

    public static $arg_list = array(
        //proposal
        'TITLE' => '(\w|\s|\-|\(|\))+',

        // visit
        'PROPOSALID' => '\d+',
        'STARTDATE' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
        'ENDDATE' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',
        'BEAMLINENAME' => '[\w-]+',
        'VISITNUMBER' => '\d+',

        // Filter Parameters - Search
        'sample' => '\w+', //sample name
        'sprefix' => '\w+', //sample prefix
        'dcid' => '\w+', //data
        'pp' => '\w+', // processing programs
        'sg' => '\w+', // space group
        'res' => '\d+', // resid
        'frg' => '\d+', // frag
        'mfrg' => '\d+', // max frag
        'db' => '\d+', // num dimple blobs


        // Filter Parameters - Refined Cell - Greater (g)/Less(l) than
        'gca' => '\d+(.\d+)?', // (g) - a
        'lca' => '\d+(.\d+)?', // (l) - a
        'gcb' => '\d+(.\d+)?', // (g) - b
        'lcb' => '\d+(.\d+)?', // (l) - b
        'gc' => '\d+(.\d+)?', // (g) - c
        'lc' => '\d+(.\d+)?', // (l) - c
        'gcal' => '\d+(.\d+)?', // (g) - aplha
        'lcal' => '\d+(.\d+)?', // (l) - aplha
        'gcbe' => '\d+(.\d+)?', // (g)- beta
        'lcbe' => '\d+(.\d+)?', // (l) - beta
        'gcga' => '\d+(.\d+)?', // (g)- gamma
        'lcga' => '\d+(.\d+)?', // (l)- gamma

        //Filter Parameters - Greater (g)/Less(l) than
        'grlh' => '\d+(.\d+)?', // (g) - resolution limit high
        'lrlh' => '\d+(.\d+)?', // (l) - resolution limit high
        'grm' => '\d+(.\d+)?', // (g) - rmeas within i plus i minus
        'lrm' => '\d+(.\d+)?', // (l) - rmeas within i plus i minus
        'gcc' => '\d+(.\d+)?', // (g) - cc anomalous 
        'lcc' => '\d+(.\d+)?', // (l) - cc anomalous 
        'gmcc' => '\d+(.\d+)?', // (g) - best map cc 
        'lmcc' => '\d+(.\d+)?', // (l) - best map cc 
        'gresol' => '\d+(.\d+)?', // (g) - resol
        'lresol' => '\d+(.\d+)?', // (l) - resol
        'grff' =>  '\d+(.\d+)?', // (g) - r free final 
        'lrff' =>  '\d+(.\d+)?', // (l) - r free final 
        'grfi' =>  '\d+(.\d+)?', // (g) - r free initial 
        'lrfi' =>  '\d+(.\d+)?', // (l) - r free initial

        //Asc and Desc Params
        'descdcid' => '\w+', // desc dc id
        'ascdcid' => '\w+', // asc dc id
        'descpref' => '\w+', // desc  file template
        'ascpref' => '\w+', // asc file template
        'descsmpl' => '\w+', // desc sample name
        'ascsmpl' => '\w+', // asc sample name
        'descstdt' => '\w+', // desc start date
        'ascstdt' => '\w+', // asc start date
        'descendt' => '\w+', // desc end date
        'ascendt' => '\w+', // asc end date
        'descsg' => '\w+', // desc space group
        'ascsg' => '\w+', // asc space group
        'descrca' => '\w+', // desc refined cell a
        'ascrca' => '\w+', // asc refined cell a
        'descrcb' => '\w+', // desc refined cell b
        'ascrcb' => '\w+', // asc refined cell b
        'descrcc' => '\w+', // desc  refined cell c
        'ascrcc' => '\w+', // asc refined cell c
        'descrmeas' => '\w+', // desc rmeas
        'ascrmeas' => '\w+', // asc rmeas
        'descrlh' => '\w+', // desc resolution limit high
        'ascrlh' => '\w+', // asc resolution limit high
        'desccca' => '\w+', // desc cc anomalous
        'asccca' => '\w+', // asc cc anomalous
        'descrfs' => '\w+', // desc rfree value start
        'ascrfs' => '\w+', // asc rfree value start
        'descrfe' => '\w+', // desc rfree value end
        'ascrfe' => '\w+', // asc rfree value end

);

    public static $dispatch = array(
        array('/results', 'get', '_get_results'),
        array('/proposal', 'get', '_get_proposal'),
        array('/example', 'get', '_get_example'),
    );

    function _get_example() {
        $where = '';
        $where_arr = array();
        $order = 'p.proposalid ASC';
        $order_arr = array();
  

        if (!$this->has_arg('prop')) $this->_error('No proposal specified');

        $args = array($this->proposalid);
        array_push($where_arr, 'p.proposalid = :1');


        // ASCENDING and DESCENDING
        // dc id
        if ($this->has_arg('descdcid')) {
            array_push($order_arr, 'dc.dataCollectionId DESC');
        }
        if ($this->has_arg('ascdcid')) {
            array_push($order_arr, 'dc.dataCollectionId ASC');
        }
        // file template
        if ($this->has_arg('descpref')) {
            array_push($order_arr, 'dc.fileTemplate DESC');
        }
        if ($this->has_arg('ascpref')) {
            array_push($order_arr, 'dc.fileTemplate ASC');
        }
        // sample name
        if ($this->has_arg('descsmpl')) {
            array_push($order_arr, 'b2.name DESC');
        }
        if ($this->has_arg('ascsmpl')) {
            array_push($order_arr, 'b2.name ASC');
        }
        // start date
        if ($this->has_arg('descstdt')) {
            array_push($order_arr, 'b.startDate DESC');
        }
        if ($this->has_arg('ascstdt')) {
            array_push($order_arr, 'b.startDate ASC');
        }
        // end date
        if ($this->has_arg('descendt')) {
            array_push($order_arr, 'b.endDate DESC');
        }
        if ($this->has_arg('ascendt')) {
            array_push($order_arr, 'b.endDate ASC');
        }
        // space group
        if ($this->has_arg('descsg')) {
            array_push($order_arr, 'ap.spaceGroup DESC');
        }
        if ($this->has_arg('ascsg')) {
            array_push($order_arr, 'ap.spaceGroup ASC');
        }
        // refined cell a
        if ($this->has_arg('descrca')) {
            array_push($order_arr, 'ap.refinedCell_a DESC');
        }
        if ($this->has_arg('ascrca')) {
            array_push($order_arr, 'ap.refinedCell_a ASC');
        }
        // refined cell b
        if ($this->has_arg('descrcb')) {
            array_push($order_arr, 'ap.refinedCell_b DESC');
        }
        if ($this->has_arg('ascrcb')) {
            array_push($order_arr, 'ap.refinedCell_b ASC');
        }
        // refined cell c
        if ($this->has_arg('descrcc')) {
            array_push($order_arr, 'ap.refinedCell_c DESC');
        }
        if ($this->has_arg('ascrcc')) {
            array_push($order_arr, 'ap.refinedCell_c ASC');
        }
        // rmeas
        if ($this->has_arg('descrmeas')) {
            array_push($order_arr, 'apss.rMeasWithinIPlusIMinus DESC');
        }
        if ($this->has_arg('ascrmeas')) {
            array_push($order_arr, 'apss.rMeasWithinIPlusIMinus ASC');
        }
        // resolution limit high
        if ($this->has_arg('descrlh')) {
            array_push($order_arr, 'apss.resolutionLimitHigh DESC');
        }
        if ($this->has_arg('ascrlh')) {
            array_push($order_arr, 'apss.resolutionLimitHigh ASC');
        }
        // cc anomalous
        if ($this->has_arg('desccca')) {
            array_push($order_arr, 'apss.ccAnomalous DESC');
        }
        if ($this->has_arg('asccca')) {
            array_push($order_arr, 'apss.ccAnomalous ASC');
        }
        // rfree start
        if ($this->has_arg('descrfs')) {
            array_push($order_arr, 'm.rFreeValueStart DESC');
        }
        if ($this->has_arg('ascrfs')) {
            array_push($order_arr, 'm.rFreeValueStart ASC');
        }
        // rfree end
        if ($this->has_arg('descrfe')) {
            array_push($order_arr, 'm.rFreeValueEnd DESC');
        }
        if ($this->has_arg('ascrfe')) {
            array_push($order_arr, 'm.rFreeValueEnd ASC');
        }


        // dc id
        if ($this->has_arg('dcid')) {
            array_push($where_arr, 'dc.dataCollectionId = :'.(sizeof($args)+1));
            array_push($args, $this->arg('dcid'));
        }

        // space group
        if ($this->has_arg('sg')) {
            array_push($where_arr, 'ap.spaceGroup LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('sg').'%');
        }
          // refined cell a
        if ($this->has_arg('gca')) {
            array_push($where_arr, 'ap.refinedCell_a >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gca'));
        }
        if ($this->has_arg('lca')) {
            array_push($where_arr, 'ap.refinedCell_a <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lca'));
        }
        // refined cell b
        if ($this->has_arg('gcb')) {
            array_push($where_arr, 'ap.refinedCell_b >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcb'));
        }
        if ($this->has_arg('lcb')) {
            array_push($where_arr, 'ap.refinedCell_b <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcb'));
        }
        // refined cell c
        if ($this->has_arg('gc')) {
            array_push($where_arr, 'ap.refinedCell_c >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gc'));
        }
        if ($this->has_arg('lc')) {
            array_push($where_arr, 'ap.refinedCell_c <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lc'));
        }
        // refined cell alpha
        if ($this->has_arg('gcal')) {
            array_push($where_arr, 'ap.refinedCell_alpha >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcal'));
        }
        if ($this->has_arg('lcal')) {
            array_push($where_arr, 'ap.refinedCell_alpha <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcal'));
        }
        // refined cell beta
        if ($this->has_arg('gcbe')) {
            array_push($where_arr, 'ap.refinedCell_beta >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcbe'));
        }
        if ($this->has_arg('lcbe')) {
            array_push($where_arr, 'ap.refinedCell_beta <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcbe'));
        }
        // refined cell gamma
        if ($this->has_arg('gcga')) {
            array_push($where_arr, 'ap.refinedCell_gamma >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcga'));
        }
        if ($this->has_arg('lcga')) {
            array_push($where_arr, 'ap.refinedCell_gamma <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcga'));
        }
        // resolution limit high
        if ($this->has_arg('grlh')) {
            array_push($where_arr, 'apss.resolutionLimitHigh >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grlh'));
        }
        if ($this->has_arg('lrlh')) {
            array_push($where_arr, 'apss.resolutionLimitHigh <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrlh'));
        }
        // rmeas within i plus i minus
        if ($this->has_arg('grm')) {
            array_push($where_arr, 'apss.rMeasWithinIPlusIMinus >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grm'));
        }
        if ($this->has_arg('lrm')) {
            array_push($where_arr, 'apss.rMeasWithinIPlusIMinus <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrm'));
        }
        // cc anomalous 
        if ($this->has_arg('gcc')) {
            array_push($where_arr, 'apss.ccAnomalous >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcc'));
        }
        if ($this->has_arg('lcc')) {
            array_push($where_arr, 'apss.ccAnomalous <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcc'));
        }
        // r free final
        if ($this->has_arg('grff')) {
            array_push($where_arr, 'm.rFreeValueEnd >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grff'));
        }
        if ($this->has_arg('lrff')) {
            array_push($where_arr, 'm.rFreeValueEnd <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrff'));
        }
        // r free initial 
        if ($this->has_arg('grfi')) {
            array_push($where_arr, 'm.rFreeValueStart >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grfi'));
        }
        if ($this->has_arg('lrfi')) {
            array_push($where_arr, 'm.rFreeValueStart <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrfi'));
        }

        // AND is the delimieter between seperate queries, converted to string
        $where = implode(" AND ", $where_arr);

        if (count($order_arr) > 0) {
            $order = implode(", ", $order_arr);
        }
        

        // get tot query
        $tot_args = $args;

        $tot = $this->db->pq(
            "SELECT count(ap.refinedcell_a) as tot 
            FROM Proposal p
                LEFT JOIN BLSession b ON b.proposalId = p.proposalId 
                LEFT JOIN Container c ON c.sessionId = b.sessionId
                LEFT JOIN BLSample b2 ON b2.containerId = c.containerId
                LEFT JOIN DataCollectionGroup dcg ON dcg.sessionId = b.sessionId 
                LEFT JOIN DataCollection dc ON dc.dataCollectionGroupId = dcg.dataCollectionGroupId
                LEFT JOIN AutoProcIntegration api ON api.dataCollectionId = dc.dataCollectionId
                LEFT JOIN AutoProcProgram app ON app.autoProcProgramId = api.autoProcProgramId
                LEFT JOIN ProcessingJob pj ON pj.processingJobId = app.processingJobId 
                LEFT JOIN AutoProc ap ON ap.autoProcProgramId = app.autoProcProgramId 
                LEFT JOIN AutoProcScaling aps ON aps.autoProcId = ap.autoProcId 
                LEFT JOIN AutoProcScalingStatistics apss ON apss.autoProcScalingId = aps.autoProcScalingId 
                LEFT JOIN MXMRRun m ON m.autoProcScalingId = apss.autoProcScalingId
            WHERE $where AND b.beamLineName IN ('i02', 'i02-1', 'i02-2', 'i03', 'i04-1', 'i23', 'i24', 'i19-1' 'i19-2')
                         AND ap.spaceGroup is NOT NULL
            ORDER BY $order"
            , $tot_args);
    
        $tot = sizeof($tot) ? intval($tot[0]['TOT']) : 0;

        // paginate
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
        $start = $pg*$pp;
        $end = $pg*$pp+$pp;
        
        $st = sizeof($args)+1;
        $en = $st + 1;
        array_push($args, $start);
        array_push($args, $end);

        $pgs = intval($tot/$pp);
        if ($tot % $pp != 0) $pgs++;

        // sql query
        $rows = $this->db->paginate(
        "SELECT p.proposalId, CONCAT(p.proposalCode, p.proposalNumber) as prop, 
        dc.dataCollectionId, b.visit_number, dc.fileTemplate, b2.name, b.beamLineName, 
        b.startDate, b.endDate, app.processingPrograms, ap.spaceGroup, apss.scalingStatisticsType,
        ap.refinedCell_a, ap.refinedCell_b, ap.refinedCell_c, ap.refinedCell_alpha, ap.refinedCell_beta, ap.refinedCell_gamma,
        apss.resolutionLimitHigh, apss.rMeasWithinIPlusIMinus, apss.ccAnomalous, m.rFreeValueStart, m.rFreeValueEnd
        FROM Proposal p
                LEFT JOIN BLSession b ON b.proposalId = p.proposalId 
                LEFT JOIN Container c ON c.sessionId = b.sessionId
                LEFT JOIN BLSample b2 ON b2.containerId = c.containerId
                LEFT JOIN DataCollectionGroup dcg ON dcg.sessionId = b.sessionId 
                LEFT JOIN DataCollection dc ON dc.dataCollectionGroupId = dcg.dataCollectionGroupId
                LEFT JOIN AutoProcIntegration api ON api.dataCollectionId = dc.dataCollectionId
                LEFT JOIN AutoProcProgram app ON app.autoProcProgramId = api.autoProcProgramId
                LEFT JOIN ProcessingJob pj ON pj.processingJobId = app.processingJobId 
                LEFT JOIN AutoProc ap ON ap.autoProcProgramId = app.autoProcProgramId 
                LEFT JOIN AutoProcScaling aps ON aps.autoProcId = ap.autoProcId 
                LEFT JOIN AutoProcScalingStatistics apss ON apss.autoProcScalingId = aps.autoProcScalingId 
                LEFT JOIN MXMRRun m ON m.autoProcScalingId = apss.autoProcScalingId
        WHERE $where AND b.beamLineName IN ('i02', 'i02-1', 'i02-2', 'i03', 'i04-1', 'i23', 'i24', 'i19-1' 'i19-2')
                     AND ap.spaceGroup is NOT NULL
        ORDER BY $order"
        , $args);

        if (!$rows) {
        $this->_error($this->arg('TITLE') . ' could not be found anywhere!', 404);
        }
        
        // sql query output
        $this->_output(array('data' => $rows, 'total' => $tot ));


    }

    function _get_proposal() {
        $where = '';
        $where_arr = array();
        $args = array();
        $order = 'p.proposalid ASC';

        // Search
        // proposal code and number
        if ($this->has_arg('prop')) {
            array_push($where_arr, 'CONCAT(p.proposalCode, p.proposalNumber) = :'.(sizeof($args)+1));
            array_push($args, $this->arg('prop'));
        }
        // proposal title
        if ($this->has_arg('TITLE')) {
            array_push($where_arr, 'p.title LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('title').'%');
        }
        
        // AND is the delimieter between seperate queries, converted to string
        $where = implode(" AND ", $where_arr);


        // paginate
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
        $start = $pg*$pp;
        $end = $pg*$pp+$pp;
        
        $st = sizeof($args)+1;
        $en = $st + 1;
        array_push($args, $start);
        array_push($args, $end);

        // sql query
        $rows = $this->db->paginate(
            "SELECT p.proposalId, p.title, p.proposalCode, p.proposalNumber
            FROM proposal p
            WHERE $where
            ORDER BY $order"
            , $args);

        if (!$rows) {
        $this->_error($this->arg('TITLE') . ' could not be found anywhere!', 404);
        }
        
        // sql query output
        $this->_output(array(
            'data' =>  $rows,
            'where' => $where,
            'args' => $args

        ));

    }

    function _get_results() {
        $where = '';
        $where_arr = array();
        $args = array();
        $param_args = array();
        $order = 'sr.startDate ASC';


        //proposal id
        if ($this->has_arg('PROPOSALID')) {
            array_push($where_arr, 'sr.proposalId = :'.(sizeof($args)+1));
            array_push($args, $this->arg('PROPOSALID'));
        }
        
        // // Search
        // // sample name
        // if ($this->has_arg('sample')) {
        //     array_push($where_arr, 'sample LIKE :'.(sizeof($args)+1));
        //     array_push($args, '%'.$this->arg('sample').'%');
        // }
        // // sample prefix name
        // if ($this->has_arg('sprefix')) {
        //     array_push($where_arr, 'sprefix LIKE :'.(sizeof($args)+1));
        //     array_push($args, '%'.$this->arg('sprefix').'%');
        // }
        // processing programs
        if ($this->has_arg('pp')) {
            array_push($where_arr, 'sr.processingPrograms LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('pp').'%');
        }
        // space group
        if ($this->has_arg('sg')) {
            array_push($where_arr, 'sr.spaceGroup LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('sg').'%');
        }
        // // resid
        // if ($this->has_arg('res')) {
        //     array_push($where_arr, 'res = :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('res'));
        // }
        // // frag
        // if ($this->has_arg('frg')) {
        //     array_push($where_arr, 'frg = :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('frg'));
        // }
        // // max frag
        // if ($this->has_arg('mfrg')) {
        //     array_push($where_arr, 'mfrg = :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('mfrg'));
        // }
        // // num dimple blobs
        // if ($this->has_arg('db')) {
        //     array_push($where_arr, 'db = :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('db'));
        // }

        //Greater than less than
        // refined cell a
        if ($this->has_arg('gca')) {
            array_push($where_arr, 'sr.refinedCell_a >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gca'));
        }
        if ($this->has_arg('lca')) {
            array_push($where_arr, 'sr.refinedCell_a <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lca'));
        }
        // refined cell b
        if ($this->has_arg('gcb')) {
            array_push($where_arr, 'sr.refinedCell_b >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcb'));
        }
        if ($this->has_arg('lcb')) {
            array_push($where_arr, 'sr.refinedCell_b <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcb'));
        }
        // refined cell c
        if ($this->has_arg('gcc')) {
            array_push($where_arr, 'sr.refinedCell_c >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcc'));
        }
        if ($this->has_arg('lcc')) {
            array_push($where_arr, 'sr.refinedCell_c <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcc'));
        }
        // refined cell alpha
        if ($this->has_arg('gcal')) {
            array_push($where_arr, 'sr.refinedCell_alpha >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcal'));
        }
        if ($this->has_arg('lcal')) {
            array_push($where_arr, 'sr.refinedCell_alpha <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcal'));
        }
        // refined cell beta
        if ($this->has_arg('gcbe')) {
            array_push($where_arr, 'sr.refinedCell_beta >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcbe'));
        }
        if ($this->has_arg('lcbe')) {
            array_push($where_arr, 'sr.refinedCell_beta <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcbe'));
        }
        // refined cell gamma
        if ($this->has_arg('gcga')) {
            array_push($where_arr, 'sr.refinedCell_gamma >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcga'));
        }
        if ($this->has_arg('lcga')) {
            array_push($where_arr, 'sr.refinedCell_gamma <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcga'));
        }
        // resolution limit high
        if ($this->has_arg('grlh')) {
            array_push($where_arr, 'sr.resolutionLimitHigh >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grlh'));
        }
        if ($this->has_arg('lrlh')) {
            array_push($where_arr, 'sr.resolutionLimitHigh <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrlh'));
        }
        // rmeas within i plus i minus
        if ($this->has_arg('grm')) {
            array_push($where_arr, 'sr.rMeasWithinIPlusIMinus >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grm'));
        }
        if ($this->has_arg('lrm')) {
            array_push($where_arr, 'sr.rMeasWithinIPlusIMinus <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrm'));
        }
        // cc anomalous 
        if ($this->has_arg('gcc')) {
            array_push($where_arr, 'sr.ccAnomalous >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gcc'));
        }
        if ($this->has_arg('lcc')) {
            array_push($where_arr, 'sr.ccAnomalous <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lcc'));
        }
        // // best map cc 
        // if ($this->has_arg('gmcc')) {
        //     array_push($where_arr, 'gmcc >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('gmcc'));
        // }
        // if ($this->has_arg('lmcc')) {
        //     array_push($where_arr, 'lmcc <= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('lmcc'));
        // }
        // // resol
        // if ($this->has_arg('gresol')) {
        //     array_push($where_arr, 'gresol >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('gresol'));
        // }
        // if ($this->has_arg('lresol')) {
        //     array_push($where_arr, 'lresol <= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('lresol'));
        // }
        // r free final 
        if ($this->has_arg('grff')) {
            array_push($where_arr, 'sr.rFreeValueEnd >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grff'));
        }
        if ($this->has_arg('lrff')) {
            array_push($where_arr, 'sr.rFreeValueEnd <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrff'));
        }
        // r free initial 
        if ($this->has_arg('grfi')) {
            array_push($where_arr, 'sr.rFreeValueStart >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grfi'));
        }
        if ($this->has_arg('lrfi')) {
            array_push($where_arr, 'sr.rFreeValueStart <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrfi'));
        }


        $where = implode(" AND ", $where_arr);

        // paginate
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
        $start = $pg*$pp;
        $end = $pg*$pp+$pp;
        
        $st = sizeof($args)+1;
        $en = $st + 1;
        array_push($args, $start);
        array_push($args, $end);


        // sql query
        $rows = $this->db->paginate(
            "SELECT sr.processingPrograms, sr.scalingStatisticsType, sr.spaceGroup, sr.refinedCell_a, sr.refinedCell_b, sr.refinedCell_c, sr.refinedCell_alpha, sr.refinedCell_beta, sr.refinedCell_gamma, sr.resolutionLimitHigh, rMeasWithinIPlusIMinus, sr.ccAnomalous, sr.rFreeValueStart, sr.rFreeValueEnd 
            FROM SummaryResults sr
            WHERE $where
            ORDER BY $order"
            , $args);
        
        // sql query output
        $this->_output(array(
            'data' =>  $rows,
            'where' => $where,
            'args' => $args

        ));

    }

}






        // if ($this->has_arg('name')) {
        //     $name = $this->arg('name');
        // }
        // else{
        //     $name = 'world';
        // }
        // $data = array('hello '.$name);
        // $this->_output($data);