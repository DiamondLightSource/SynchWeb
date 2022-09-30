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
        'gcc' => '\d+(.\d+)?', // (g) - c
        'lcc' => '\d+(.\d+)?', // (l) - c
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

);

    public static $dispatch = array(
        array('/results', 'get', '_get_results'),
        array('/proposal', 'get', '_get_proposal'),
        array('/example', 'get', '_get_example'),
    );

    function _get_example() {
        $where = '';
        $where_arr = array();
        $args = array();
        $order = 'p.proposalid ASC';


        //proposal id
        if ($this->has_arg('PROPOSALID')) {
            // $where .= ' p.proposalId = :'.(sizeof($args)+1);
            array_push($where_arr, 'p.proposalId = :'.(sizeof($args)+1));
            array_push($args, $this->arg('PROPOSALID'));
        }

        // processing programs
        if ($this->has_arg('pp')) {
            array_push($where_arr, 'app.processingPrograms LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('pp').'%');
        }
        // space group
        if ($this->has_arg('sg')) {
            array_push($where_arr, 'ap.spaceGroup LIKE :'.(sizeof($args)+1));
            array_push($args, '%'.$this->arg('sg').'%');
        }

        if ($this->has_arg('gca')) {
            array_push($where_arr, 'ap.refinedCell_a >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gca'));
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
        "SELECT p.proposalId, b.beamLineName, b.startDate, b.endDate,
        app.processingPrograms, ap.spaceGroup, apss.scalingStatisticsType,
        ap.refinedCell_a, ap.refinedCell_b, ap.refinedCell_c, ap.refinedCell_alpha, ap.refinedCell_beta, ap.refinedCell_gamma
        FROM Proposal p
        LEFT JOIN BLSession b ON b.proposalId = p.proposalId 
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