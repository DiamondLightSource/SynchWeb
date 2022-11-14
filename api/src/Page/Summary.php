<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Summary extends Page
{

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
        'sg' => '(\w|\s|\-|\/)+|^$', // space group
        'res' => '\d+', // resid
        'frg' => '\d+', // frag
        'mfrg' => '\d+', // max frag
        'db' => '\d+', // num dimple blobs
        'com' => '\w+', //comment


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

        //Filter Parameters (Overall, Outer, Inner) - Greater (g)/Less(l) than
        'grlhou' => '\d+(.\d+)?', // (g) - resolution limit high outer
        'lrlhou' => '\d+(.\d+)?', // (l) - resolution limit high outer
        'grmou' => '\d+(.\d+)?', // (g) - rmeas within i plus i minus outer
        'lrmou' => '\d+(.\d+)?', // (l) - rmeas within i plus i minus outer
        'gccou' => '\d+(.\d+)?', // (g) - cc anomalous outer
        'lccou' => '\d+(.\d+)?', // (l) - cc anomalous outer 
        'gmccou' => '\d+(.\d+)?', // (g) - best map cc outer 
        'lmccou' => '\d+(.\d+)?', // (l) - best map cc outer 
        'gresolou' => '\d+(.\d+)?', // (g) - resol outer
        'lresolou' => '\d+(.\d+)?', // (l) - resol outer
        'grffou' =>  '\d+(.\d+)?', // (g) - r free final outer 
        'lrffou' =>  '\d+(.\d+)?', // (l) - r free final outer 
        'grfiou' =>  '\d+(.\d+)?', // (g) - r free initial outer 
        'lrfiou' =>  '\d+(.\d+)?', // (l) - r free initial outer

        'grlhov' => '\d+(.\d+)?', // (g) - resolution limit high overall
        'lrlhov' => '\d+(.\d+)?', // (l) - resolution limit high overall
        'grmov' => '\d+(.\d+)?', // (g) - rmeas within i plus i minus overall
        'lrmov' => '\d+(.\d+)?', // (l) - rmeas within i plus i minus overall
        'gccov' => '\d+(.\d+)?', // (g) - cc anomalous overall
        'lccov' => '\d+(.\d+)?', // (l) - cc anomalous overall
        'gmccov' => '\d+(.\d+)?', // (g) - best map cc overall 
        'lmccov' => '\d+(.\d+)?', // (l) - best map cc overall 
        'gresolov' => '\d+(.\d+)?', // (g) - resol overall
        'lresolov' => '\d+(.\d+)?', // (l) - resol overall
        'grffov' =>  '\d+(.\d+)?', // (g) - r free final overall 
        'lrffov' =>  '\d+(.\d+)?', // (l) - r free final overall 
        'grfiov' =>  '\d+(.\d+)?', // (g) - r free initial overall 
        'lrfiov' =>  '\d+(.\d+)?', // (l) - r free initial overall

        'grlhin' => '\d+(.\d+)?', // (g) - resolution limit high inner
        'lrlhin' => '\d+(.\d+)?', // (l) - resolution limit high inner
        'grmin' => '\d+(.\d+)?', // (g) - rmeas within i plus i minus inner
        'lrmin' => '\d+(.\d+)?', // (l) - rmeas within i plus i minus inner
        'gccin' => '\d+(.\d+)?', // (g) - cc anomalous inner
        'lccin' => '\d+(.\d+)?', // (l) - cc anomalous inner
        'gmccin' => '\d+(.\d+)?', // (g) - best map cc inner 
        'lmccin' => '\d+(.\d+)?', // (l) - best map cc inner 
        'gresolin' => '\d+(.\d+)?', // (g) - resol inner
        'lresolin' => '\d+(.\d+)?', // (l) - resol inner
        'grffin' =>  '\d+(.\d+)?', // (g) - r free final inner 
        'lrffin' =>  '\d+(.\d+)?', // (l) - r free final inner
        'grfiin' =>  '\d+(.\d+)?', // (g) - r free initial inner 
        'lrfiin' =>  '\d+(.\d+)?', // (l) - r free initial inner

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

        //Asc and Desc Outer, Inner, Overall
        'descrmeasou' => '\w+', // desc rmeas
        'ascrmeasou' => '\w+', // asc rmeas
        'descrlhou' => '\w+', // desc resolution limit high
        'ascrlhou' => '\w+', // asc resolution limit high
        'descccaou' => '\w+', // desc cc anomalous
        'ascccaou' => '\w+', // asc cc anomalous
        'descrfsou' => '\w+', // desc rfree value start
        'ascrfsou' => '\w+', // asc rfree value start
        'descrfeou' => '\w+', // desc rfree value end
        'ascrfeou' => '\w+', // asc rfree value end

        'descrmeasin' => '\w+', // desc rmeas
        'ascrmeasin' => '\w+', // asc rmeas
        'descrlhin' => '\w+', // desc resolution limit high
        'ascrlhin' => '\w+', // asc resolution limit high
        'descccain' => '\w+', // desc cc anomalous
        'ascccain' => '\w+', // asc cc anomalous
        'descrfsin' => '\w+', // desc rfree value start
        'ascrfsin' => '\w+', // asc rfree value start
        'descrfein' => '\w+', // desc rfree value end
        'ascrfein' => '\w+', // asc rfree value end

        'descrmeasov' => '\w+', // desc rmeas
        'ascrmeasov' => '\w+', // asc rmeas
        'descrlhov' => '\w+', // desc resolution limit high
        'ascrlhov' => '\w+', // asc resolution limit high
        'descccaov' => '\w+', // desc cc anomalous
        'ascccaov' => '\w+', // asc cc anomalous
        'descrfsov' => '\w+', // desc rfree value start
        'ascrfsov' => '\w+', // asc rfree value start
        'descrfeov' => '\w+', // desc rfree value end
        'ascrfeov' => '\w+', // asc rfree value end

);

    public static $dispatch = array(
        array('/results', 'get', '_get_results')
    );

    function _get_results() {
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
            array_push($order_arr, 'dc.startTime DESC');
        }
        if ($this->has_arg('ascstdt')) {
            array_push($order_arr, 'dc.startTime ASC');
        }
        // processing programs
        if ($this->has_arg('descpp')) {
            array_push($order_arr, 'app.processingPrograms DESC');
        }
        if ($this->has_arg('ascpp')) {
            array_push($order_arr, 'app.processingPrograms ASC');
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


        // ASCENDING and DESCENDING with Outer, Inner, Overall
        // rmeas outer
        if ($this->has_arg('descrmeasou')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 DESC');
        }
        if ($this->has_arg('ascrmeasou')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 ASC');
        }
        // resolution limit high outer
        if ($this->has_arg('descrlhou')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 DESC');
        }
        if ($this->has_arg('ascrlhou')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 ASC');
        }
        // cc anomalous outer
        if ($this->has_arg('descccaou')) {
            array_push($order_arr, 'CCANOMALOUS_OUTER_1 DESC');
        }
        if ($this->has_arg('ascccaou')) {
            array_push($order_arr, 'CCANOMALOUS_OUTER_1 ASC');
        }
        // rfree start outer
        if ($this->has_arg('descrfsou')) {
            array_push($order_arr, 'RFREEVALUESTART_OUTER_1 DESC');
        }
        if ($this->has_arg('ascrfsou')) {
            array_push($order_arr, 'RFREEVALUESTART_OUTER_1 ASC');
        }
        // rfree end outer
        if ($this->has_arg('descrfeou')) {
            array_push($order_arr, 'RFREEVALUEEND_OUTER_1 DESC');
        }
        if ($this->has_arg('ascrfeou')) {
            array_push($order_arr, 'RFREEVALUEEND_OUTER_1 ASC');
        }

        // rmeas inner
        if ($this->has_arg('descrmeasin')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_INNER_1 DESC');
        }
        if ($this->has_arg('ascrmeasin')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_INNER_1 ASC');
        }
        // resolution limit high inner
        if ($this->has_arg('descrlhin')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_INNER_1 DESC');
        }
        if ($this->has_arg('ascrlhin')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_INNER_1 ASC');
        }
        // cc anomalous inner
        if ($this->has_arg('descccain')) {
            array_push($order_arr, 'CCANOMALOUS_INNER_1 DESC');
        }
        if ($this->has_arg('ascccain')) {
            array_push($order_arr, 'CCANOMALOUS_INNER_1 ASC');
        }
        // rfree start inner
        if ($this->has_arg('descrfsin')) {
            array_push($order_arr, 'RFREEVALUESTART_INNER_1 DESC');
        }
        if ($this->has_arg('ascrfsin')) {
            array_push($order_arr, 'RFREEVALUESTART_INNER_1 ASC');
        }
        // rfree end inner
        if ($this->has_arg('descrfein')) {
            array_push($order_arr, 'RFREEVALUEEND_INNER_1 DESC');
        }
        if ($this->has_arg('ascrfein')) {
            array_push($order_arr, 'RFREEVALUEEND_INNER_1 ASC');
        }

        // rmeas overall
        if ($this->has_arg('descrmeasov')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OVERALL_1 DESC');
        }
        if ($this->has_arg('ascrmeasov')) {
            array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OVERALL_1 ASC');
        }
        // resolution limit high overall
        if ($this->has_arg('descrlhov')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_OVERALL_1 DESC');
        }
        if ($this->has_arg('ascrlhov')) {
            array_push($order_arr, 'RESOLUTIONLIMITHIGH_OVERALL_1 ASC');
        }
        // cc anomalous overall
        if ($this->has_arg('descccaov')) {
            array_push($order_arr, 'CCANOMALOUS_OVERALL_1 DESC');
        }
        if ($this->has_arg('ascccaov')) {
            array_push($order_arr, 'CCANOMALOUS_OVERALL_1 ASC');
        }
        // rfree start overall
        if ($this->has_arg('descrfsov')) {
            array_push($order_arr, 'RFREEVALUESTART_OVERALL_1 DESC');
        }
        if ($this->has_arg('ascrfsov')) {
            array_push($order_arr, 'RFREEVALUESTART_OVERALL_1 ASC');
        }
        // rfree end overall
        if ($this->has_arg('descrfeov')) {
            array_push($order_arr, 'RFREEVALUEEND_OVERALL_1 DESC');
        }
        if ($this->has_arg('ascrfeov')) {
            array_push($order_arr, 'RFREEVALUEEND_OVERALL_1 ASC');
        }


        // Filter Params
        // dc id
        if ($this->has_arg('dcid')) {
            array_push($where_arr, 'dc.dataCollectionId = :'.(sizeof($args)+1));
            array_push($args, $this->arg('dcid'));
        }
        // if has comment
        if ($this->has_arg('com')) {
            array_push($where_arr, "dcc.comments LIKE '%_FLAG_%' ");
        }
        // space group
        if ($this->has_arg('sg')) {
            array_push($where_arr, 'ap.spaceGroup = :'.(sizeof($args)+1));
            array_push($args, $this->arg('sg'));
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

        // Filter Params Greater/Less than Overall, Outer, Inner
        // resolution limit high outer
        if ($this->has_arg('grlhou')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grlhou'));
        }
        if ($this->has_arg('lrlhou')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrlhou'));
        }
        // rmeas within i plus i minus outer
        if ($this->has_arg('grmou')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grmou'));
        }
        if ($this->has_arg('lrmou')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrmou'));
        }
        // cc anomalous outer
        if ($this->has_arg('gccou')) {
            array_push($where_arr, 'CCANOMALOUS_OUTER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gccou'));
        }
        if ($this->has_arg('lccou')) {
            array_push($where_arr, 'CCANOMALOUS_OUTER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lccou'));
        }
        // r free final outer
        if ($this->has_arg('grffou')) {
            array_push($where_arr, 'RFREEVALUEEND_OUTER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grffou'));
        }
        if ($this->has_arg('lrffou')) {
            array_push($where_arr, 'RFREEVALUEEND_OUTER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrffou'));
        }
        // r free initial outer
        if ($this->has_arg('grfiou')) {
            array_push($where_arr, 'RFREEVALUESTART_OUTER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grfiou'));
        }
        if ($this->has_arg('lrfiou')) {
            array_push($where_arr, 'RFREEVALUESTART_OUTER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrfiou'));
        }


        // resolution limit high inner
        if ($this->has_arg('grlhin')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_INNER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grlhin'));
        }
        if ($this->has_arg('lrlhin')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_INNER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrlhin'));
        }
        // rmeas within i plus i minus inner
        if ($this->has_arg('grmin')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_INNER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grmin'));
        }
        if ($this->has_arg('lrmin')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_INNER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrmin'));
        }
        // cc anomalous inner
        if ($this->has_arg('gccin')) {
            array_push($where_arr, 'CCANOMALOUS_INNER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gccin'));
        }
        if ($this->has_arg('lccin')) {
            array_push($where_arr, 'CCANOMALOUS_INNER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lccin'));
        }
        // r free final inner
        if ($this->has_arg('grffin')) {
            array_push($where_arr, 'RFREEVALUEEND_INNER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grffin'));
        }
        if ($this->has_arg('lrffin')) {
            array_push($where_arr, 'RFREEVALUEEND_INNER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrffin'));
        }
        // r free initial inner
        if ($this->has_arg('grfiin')) {
            array_push($where_arr, 'RFREEVALUESTART_INNER_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grfiin'));
        }
        if ($this->has_arg('lrfiin')) {
            array_push($where_arr, 'RFREEVALUESTART_INNER_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrfiin'));
        }


        // resolution limit high overall
        if ($this->has_arg('grlhov')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_OVERALL_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grlhov'));
        }
        if ($this->has_arg('lrlhov')) {
            array_push($where_arr, 'RESOLUTIONLIMITHIGH_OVERALL_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrlhov'));
        }
        // rmeas within i plus i minus overall
        if ($this->has_arg('grmov')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OVERALL_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grmov'));
        }
        if ($this->has_arg('lrmov')) {
            array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OVERALL_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrmov'));
        }
        // cc anomalous overall
        if ($this->has_arg('gccov')) {
            array_push($where_arr, 'CCANOMALOUS_OVERALL_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('gccov'));
        }
        if ($this->has_arg('lccov')) {
            array_push($where_arr, 'CCANOMALOUS_OVERALL_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lccov'));
        }
        // r free final overall
        if ($this->has_arg('grffov')) {
            array_push($where_arr, 'RFREEVALUEEND_OVERALL_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grffov'));
        }
        if ($this->has_arg('lrffov')) {
            array_push($where_arr, 'RFREEVALUEEND_OVERALL_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrffov'));
        }
        // r free initial overall
        if ($this->has_arg('grfiov')) {
            array_push($where_arr, 'RFREEVALUESTART_OVERALL_1 >= :'.(sizeof($args)+1));
            array_push($args, $this->arg('grfiov'));
        }
        if ($this->has_arg('lrfiov')) {
            array_push($where_arr, 'RFREEVALUESTART_OVERALL_1 <= :'.(sizeof($args)+1));
            array_push($args, $this->arg('lrfiov'));
        }



        // AND is the delimieter between seperate queries, converted to string
        $where = implode(" AND ", $where_arr);

        if (count($order_arr) > 0) {
            $order = implode(", ", $order_arr);
        }
        

        // get tot query
        $tot_args = $args;

        $tot = $this->db->pq(
            "SELECT COUNT(DISTINCT(dc.dataCollectionId)) as tot 
            FROM DataCollection dc
                LEFT JOIN AutoProcIntegration api ON api.dataCollectionId = dc.dataCollectionId
                LEFT JOIN AutoProcProgram app ON app.autoProcProgramId = api.autoProcProgramId
                LEFT JOIN ProcessingJob pj ON pj.processingJobId = app.processingJobId 
                LEFT JOIN AutoProc ap ON ap.autoProcProgramId = app.autoProcProgramId
                LEFT JOIN AutoProcScaling aps ON aps.autoProcId = ap.autoProcId  
                LEFT JOIN DataCollectionGroup dcg ON dc.dataCollectionGroupId = dcg.dataCollectionGroupId
                LEFT JOIN DataCollectionComment dcc ON dcc.dataCollectionId = dc.dataCollectionId
                LEFT JOIN BLSession b ON dcg.sessionId = b.sessionId
                LEFT JOIN Container c ON c.sessionId = b.sessionId
                LEFT JOIN BLSample b2 ON b2.containerId = c.containerId
                LEFT JOIN Proposal p ON b.proposalId = p.proposalId
                LEFT JOIN Person p2 on p2.personId = p.personId
                LEFT JOIN (
                    SELECT GROUP_CONCAT(apss.scalingStatisticsType) as temp, apss.autoProcScalingId as autoProcScalingId_2,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') + 10)
                            )
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') + 13)
                        )
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') + 13) 
                        ) 
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') + 10)
                        )
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') + 13) 
                        )
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') + 13)  
                        ) 
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') + 10)   
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') + 13)    
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') + 13)     
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') + 10) 
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') + 13) 
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') + 13)  
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') + 10)  
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') + 13)   
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') + 13)   
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_OUTER_1
                    FROM AutoProcScalingStatistics apss
                        LEFT JOIN MXMRRun m ON m.autoProcScalingId = apss.autoProcScalingId
                    GROUP BY apss.autoProcScalingId
                ) as detail 
                    ON aps.autoProcScalingId = detail.autoProcScalingId_2
            WHERE $where AND b.beamLineName IN ('i02', 'i02-1', 'i02-2', 'i03', 'i04-1', 'i23', 'i24', 'i19-1' 'i19-2')
                         AND ap.spaceGroup is NOT NULL"
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
            "SELECT dc.dataCollectionId, 
            GROUP_CONCAT(dc.fileTemplate) as FILETEMPLATE, 
            GROUP_CONCAT(dc.startTime) as STARTTIME, 
            GROUP_CONCAT(app.processingPrograms) as PROCESSINGPROGRAMS,
            GROUP_CONCAT(ap.spaceGroup) as SPACEGROUP,
            GROUP_CONCAT(ap.refinedCell_a) as REFINEDCELL_A, 
            GROUP_CONCAT(ap.refinedCell_b) as REFINEDCELL_B,
            GROUP_CONCAT(ap.refinedCell_c) as REFINEDCELL_C,
            GROUP_CONCAT(ap.refinedCell_alpha) as REFINEDCELL_ALPHA, 
            GROUP_CONCAT(ap.refinedCell_beta) as REFINEDCELL_BETA, 
            GROUP_CONCAT(ap.refinedCell_gamma) as REFINEDCELL_GAMMA,
            GROUP_CONCAT(RESOLUTIONLIMITHIGH_OVERALL_1) as RESOLUTIONLIMITHIGH_OVERALL,
            GROUP_CONCAT(RESOLUTIONLIMITHIGH_INNER_1) as RESOLUTIONLIMITHIGH_INNER,
            GROUP_CONCAT(RESOLUTIONLIMITHIGH_OUTER_1) as RESOLUTIONLIMITHIGH_OUTER,
            GROUP_CONCAT(RMEASWITHINIPLUSIMINUS_OVERALL_1) as RMEASWITHINIPLUSIMINUS_OVERALL,
            GROUP_CONCAT(RMEASWITHINIPLUSIMINUS_INNER_1) as RMEASWITHINIPLUSIMINUS_INNER,
            GROUP_CONCAT(RMEASWITHINIPLUSIMINUS_OUTER_1) as RMEASWITHINIPLUSIMINUS_OUTER,
            GROUP_CONCAT(CCANOMALOUS_OVERALL_1) as CCANOMALOUS_OVERALL,
            GROUP_CONCAT(CCANOMALOUS_INNER_1) as CCANOMALOUS_INNER,
            GROUP_CONCAT(CCANOMALOUS_OUTER_1) as CCANOMALOUS_OUTER,
            GROUP_CONCAT(RFREEVALUESTART_OVERALL_1) as RFREEVALUESTART_OVERALL,
            GROUP_CONCAT(RFREEVALUESTART_INNER_1) as RFREEVALUESTART_INNER,
            GROUP_CONCAT(RFREEVALUESTART_OUTER_1) as RFREEVALUESTART_OUTER,
            GROUP_CONCAT(RFREEVALUEEND_OVERALL_1) as RFREEVALUEEND_OVERALL,
            GROUP_CONCAT(RFREEVALUEEND_INNER_1) as RFREEVALUEEND_INNER,
            GROUP_CONCAT(RFREEVALUEEND_OUTER_1) as RFREEVALUEEND_OUTER,
            b.visit_number as VISIT_NUMBER,
            dcc.comments as DC_COMMENTS,
            p2.personId,
            p.proposalId, CONCAT(p.proposalCode, p.proposalNumber) as prop
            FROM DataCollection dc
                LEFT JOIN AutoProcIntegration api ON api.dataCollectionId = dc.dataCollectionId
                LEFT JOIN AutoProcProgram app ON app.autoProcProgramId = api.autoProcProgramId
                LEFT JOIN ProcessingJob pj ON pj.processingJobId = app.processingJobId 
                LEFT JOIN AutoProc ap ON ap.autoProcProgramId = app.autoProcProgramId
                LEFT JOIN AutoProcScaling aps ON aps.autoProcId = ap.autoProcId  
                LEFT JOIN DataCollectionGroup dcg ON dc.dataCollectionGroupId = dcg.dataCollectionGroupId
                LEFT JOIN DataCollectionComment dcc ON dcc.dataCollectionId = dc.dataCollectionId
                LEFT JOIN BLSession b ON dcg.sessionId = b.sessionId
                LEFT JOIN Container c ON c.sessionId = b.sessionId
                LEFT JOIN BLSample b2 ON b2.containerId = c.containerId
                LEFT JOIN Proposal p ON b.proposalId = p.proposalId
                LEFT JOIN Person p2 on p2.personId = p.personId
                LEFT JOIN (
                    SELECT GROUP_CONCAT(apss.scalingStatisticsType) as temp, apss.autoProcScalingId as autoProcScalingId_2,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{overall') + 10)
                            )
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{innerShell') + 13)
                        )
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.resolutionLimitHigh, '}'), '{outerShell') + 13) 
                        ) 
                    , 'NULL')
                    as RESOLUTIONLIMITHIGH_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{overall') + 10)
                        )
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{innerShell') + 13) 
                        )
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.rMeasWithinIPlusIMinus, '}'), '{outerShell') + 13)  
                        ) 
                    , 'NULL')
                    as RMEASWITHINIPLUSIMINUS_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{overall') + 10)   
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{innerShell') + 13)    
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', apss.ccAnomalous, '}'), '{outerShell') + 13)     
                        ) 
                    , 'NULL')
                    as CCANOMALOUS_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{overall') + 10) 
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{innerShell') + 13) 
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueStart, '}'), '{outerShell') + 13)  
                        ) 
                    , 'NULL')
                    as RFREEVALUESTART_OUTER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') + 10, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{overall') + 10)  
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_OVERALL_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{innerShell') + 13)   
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_INNER_1,
                    IFNULL(
                    SUBSTR( 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') + 13, 
                        LOCATE( '}', 
                        GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'),
                        INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') ) -
                        (INSTR( GROUP_CONCAT( '{', apss.scalingStatisticsType, ': ', m.rFreeValueEnd, '}'), '{outerShell') + 13)   
                        ) 
                    , 'NULL')
                    as RFREEVALUEEND_OUTER_1
                    FROM AutoProcScalingStatistics apss
                        LEFT JOIN MXMRRun m ON m.autoProcScalingId = apss.autoProcScalingId
                    GROUP BY apss.autoProcScalingId
                ) as detail 
                    ON aps.autoProcScalingId = detail.autoProcScalingId_2
        WHERE $where AND b.beamLineName IN ('i02', 'i02-1', 'i02-2', 'i03', 'i04-1', 'i23', 'i24', 'i19-1' 'i19-2')
                     AND ap.spaceGroup is NOT NULL
        GROUP BY dc.dataCollectionId
        ORDER BY $order"
        , $args);

        // if (!$rows) {
        // $this->_error($this->arg('TITLE') . ' could not be found anywhere!', 404);
        // }
        
        // sql query output
        $this->_output(array('data' => $rows, 'total' => $tot ));


    }



}