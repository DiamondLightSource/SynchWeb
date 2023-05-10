<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use Slim\Slim;
use SynchWeb\Database\DatabaseFactory;
use SynchWeb\Database\DatabaseConnectionFactory;

class SummaryNew extends Page
{

    public static $arg_list = array(
        //proposal
        'TITLE' => '(\w|\s|\-|\(|\))+',

        // visit
        'com' => '(.*)', //comment
        'PROPOSALID' => '(.*)',

        'BEAMLINENAME' => '(.*)',
        'VISITNUMBER' => '(.*)',

        // Filter Parameters - array of parameter orders e.g. ascending, descending and the comparison value
        'sample' => '(.*)', //sample name
        'filetemp' => '(.*)', //file template
        'dcid' => '(.*)', //data collection id 
        'pp' => '(.*)', // processing programs
        'sg' => '(.*)', // space group


        // Filter Parameters - array of parameter operands and orders such as greater than, equal to, between, less than, like, ascending, descending and the comparison value.
        'STARTDATE' => '(.*)', // visit start date
        'rca' => '(.*)', // refined cell type a
        'rcb' => '(.*)', // refined cell type b
        'rcc' => '(.*)', // refined cell type c
        'rcal' => '(.*)', // refined cell type alpha
        'rcbe' => '(.*)', // refined cell type beta
        'rcga' => '(.*)', // refined cell type gamma
        'rlho' => '(.*)', // resolution limit high outer
        'rmpmi' => '(.*)', // rmeaswithiniplusiminus inner
        'riso' => '(.*)', // resioversigi2 overall
        'cci' => '(.*)', // ccanomalous inner
        'cco' => '(.*)', // ccanomalous overall
        'rfsi' => '(.*)', // rfreevaluestart inner
        'rfei' => '(.*)', // rfreevalueend inner

        //Filter Parameters - No of Blobs
        'nobi' => '(.*)', //  noofblobs inner
        'nobo' => '(.*)', //  noofblobs inner parameter operands e.g. greater than, equal to, between, less than, like, ascending, descending
        'nobv' => '(.*)', //  noofblobs inner comparison value


    );

    public static $dispatch = array(
        array('/results', 'get', '_get_results')
    );

    private $summarydb;


    function __construct(Slim $app, $db, $user)
    {   
        parent::__construct($app, $db, $user);
        $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
        $db = $dbFactory->get("summary");
        $this->summarydb = $db;
    }

    function _get_results() {
        $where = '';
        $where_arr = array();
        $order = '';
        $order_arr = array();
        
        if (!$this->has_arg('prop')) $this->_error('No proposal defined');

        // $args = array($this->proposalid);
        // array_push($where_arr, 'p.proposalid = ?');


        $args = array($this->arg('prop'));
        array_push($where_arr, 'pt.prop = ?');
        array_push($order_arr, 'sf.autoProcIntegrationId DESC');


        // [VALUE, ORDER]

        if ($this->has_arg('sample')) {
            $sample_args = explode(',', $this->arg('sample'));

            array_push($args, $sample_args[0]);
            array_push($where_arr, "lower(sf.name) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if ($sample_args[1] != null) {
                array_push($order_arr, 'sf.name '.$sample_args[2]);
            }

        }


        if ($this->has_arg('filetemp')) {
            $filetemp_args = explode(',', $this->arg('filetemp'));

            array_push($args, $filetemp_args[0]);
            array_push($where_arr, "lower(sf.fileTemplate) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if ($filetemp_args[1] != null) {
                array_push($order_arr, 'sf.fileTemplate '.$filetemp_args[1]);
            }

        }


        if ($this->has_arg('dcid')) {
            $dcid_args = explode(',', $this->arg('dcid'));

            array_push($args, $dcid_args[0]);
            array_push($where_arr, 'sf.dataCollectionId = ?');
            
            if ($dcid_args[1] != null) {
                array_push($order_arr, 'sf.dataCollectionId '.$dcid_args[1]);
            }

        }

        if ($this->has_arg('pp')) {
            $pp_args = explode(',', $this->arg('pp'));

            array_push($args, $pp_args[0]);
            array_push($where_arr, "lower(ppt.processingPrograms) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if ($pp_args[1] != null) {
                array_push($order_arr, 'ppt.processingPrograms '.$pp_args[1]);
            }

        }

        if ($this->has_arg('sg')) {
            $sg_args = explode(',', $this->arg('sg'));

            array_push($args, $sg_args[0]);
            array_push($where_arr, "lower(sgt.spaceGroup) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if ($sg_args[1] != null) {
                array_push($order_arr, 'sgt.spaceGroup '.$sg_args[1]);
            }

        }

        if ($this->has_arg('BEAMLINENAME')) {
            $BEAMLINENAME_args = explode(',', $this->arg('BEAMLINENAME'));

            array_push($args, $BEAMLINENAME_args[0]);
            array_push($where_arr, "lower(vt.beamLineName) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if ($BEAMLINENAME_args[1] != null) {
                array_push($order_arr, 'vt.beamLineName '.$BEAMLINENAME_args[1]);
            }

        }

        // [OPERAND, VALUE, ORDER]

        if ($this->has_arg('rca')) {
            $rca_args = explode(',', $this->arg('rca'));

            array_push($args, $rca_args[0]);
            array_push($where_arr, 'sf.refinedCell_a '.$rca_args[1].' ?');
            
            if ($rca_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_a '.$rca_args[2]);
            }

        }


        if ($this->has_arg('rcb')) {
            $rcb_args = explode(',', $this->arg('rcb'));

            array_push($args, $rcb_args[0]);
            array_push($where_arr, 'sf.refinedCell_b '.$rcb_args[1].' ?');
            
            if ($rcb_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_b '.$rcb_args[2]);
            }

        }


        if ($this->has_arg('rcc')) {
            $rcc_args = explode(',', $this->arg('rcc'));

            array_push($args, $rcc_args[0]);
            array_push($where_arr, 'sf.refinedCell_c '.$rcc_args[1].' ?');
            
            if ($rcc_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_c '.$rcc_args[2]);
            }

        }


        if ($this->has_arg('rcal')) {
            $rcal_args = explode(',', $this->arg('rcal'));

            array_push($args, $rcal_args[0]);
            array_push($where_arr, 'sf.refinedCell_alpha '.$rcal_args[1].' ?');
            
            if ($rcal_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_alpha '.$rcal_args[2]);
            }

        }

        if ($this->has_arg('rcbe')) {
            $rcbe_args = explode(',', $this->arg('rcbe'));

            array_push($args, $rcbe_args[0]);
            array_push($where_arr, 'sf.refinedCell_beta '.$rcbe_args[1].' ?');
            
            if ($rcbe_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_beta '.$rcbe_args[2]);
            }

        }

        if ($this->has_arg('rcga')) {
            $rcga_args = explode(',', $this->arg('rcga'));

            array_push($args, $rcga_args[0]);
            array_push($where_arr, 'sf.refinedCell_gamma '.$rcga_args[1].' ?');
            
            if ($rcga_args[2] != null) {
                array_push($order_arr, 'sf.refinedCell_gamma '.$rcga_args[2]);
            }

        }

        if ($this->has_arg('rlho')) {
            $rlho_args = explode(',', $this->arg('rlho'));

            array_push($args, $rlho_args[0]);
            array_push($where_arr, 'sf.resolutionLimitHighOuter '.$rlho_args[1].' ?');
            
            if ($rlho_args[2] != null) {
                array_push($order_arr, 'sf.resolutionLimitHighOuter '.$rlho_args[2]);
            }

        }

        if ($this->has_arg('rmpmi')) {
            $rmpmi_args = explode(',', $this->arg('rmpmi'));

            array_push($args, $rmpmi_args[0]);
            array_push($where_arr, 'sf.rMeasWithinIPlusIMinusInner '.$rmpmi_args[1].' ?');
            
            if ($rmpmi_args[2] != null) {
                array_push($order_arr, 'sf.rMeasWithinIPlusIMinusInner '.$rmpmi_args[2]);
            }

        }

        if ($this->has_arg('riso')) {
            $riso_args = explode(',', $this->arg('riso'));

            array_push($args, $riso_args[0]);
            array_push($where_arr, 'sf.resIOverSigI2Overall '.$riso_args[1].' ?');
            
            if ($riso_args[2] != null) {
                array_push($order_arr, 'sf.resIOverSigI2Overall '.$riso_args[2]);
            }

        }

        if ($this->has_arg('cci')) {
            $cci_args = explode(',', $this->arg('cci'));

            array_push($args, $cci_args[0]);
            array_push($where_arr, 'sf.ccAnomalousInner '.$cci_args[1].' ?');
            
            if ($cci_args[2] != null) {
                array_push($order_arr, 'sf.ccAnomalousInner '.$cci_args[2]);
            }

        }

        if ($this->has_arg('cco')) {
            $cco_args = explode(',', $this->arg('cco'));

            array_push($args, $cco_args[0]);
            array_push($where_arr, 'sf.ccAnomalousOverall '.$cco_args[1].' ?');
            
            if ($cco_args[2] != null) {
                array_push($order_arr, 'sf.ccAnomalousOverall '.$cco_args[2]);
            }

        }

        if ($this->has_arg('rfsi')) {
            $rfsi_args = explode(',', $this->arg('rfsi'));

            array_push($args, $rfsi_args[0]);
            array_push($where_arr, 'sf.rFreeValueStartInner '.$rfsi_args[1].' ?');
            
            if ($rfsi_args[2] != null) {
                array_push($order_arr, 'sf.rFreeValueStartInner '.$rfsi_args[2]);
            }

        }

        if ($this->has_arg('rfei')) {
            $rfei_args = explode(',', $this->arg('rfei'));

            array_push($args, $rfei_args[0]);
            array_push($where_arr, 'sf.rFreeValueEndInner '.$rfei_args[1].' ?');
            
            if ($rfei_args[2] != null) {
                array_push($order_arr, 'sf.rFreeValueEndInner '.$rfei_args[2]);
            }

        }

        if ($this->has_arg('nobi')) {
            $nobi_args = explode(',', $this->arg('nobi'));

            array_push($args, $nobi_args[0]);
            array_push($where_arr, 'sf.noofblobs '.$nobi_args[1].' ?');
            
            if ($nobi_args[2] != null) {
                array_push($order_arr, 'sf.noofblobs '.$nobi_args[2]);
            }

        }
        

        // AND is the delimieter between seperate queries, converted to string
        $where = implode(" AND ", $where_arr);

        if (count($order_arr) > 0) {
            $order = implode(", ", $order_arr);
        }

        // get tot query
        $tot_args = $args;

        $tot = $this->summarydb->pq(
            "SELECT sf.autoProcIntegrationId
             FROM SummaryFact sf
                JOIN ProposalDimension pt on pt.proposalDimId = sf.proposalDimId
             WHERE $where"
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


        $rows = $this->summarydb->paginate(
            "SELECT 
                sf.autoProcIntegrationId,
                sf.dataCollectionId,
                sf.personId,
                sf.visit_number,
                sf.startTime,
                sf.fileTemplate,
                sf.name,
                sf.comments,
                sgt.spaceGroup,
                ppt.processingPrograms,
                vt.beamLineName,
                sf.refinedCell_a,
                sf.refinedCell_b,
                sf.refinedCell_c,
                sf.refinedCell_alpha,
                sf.refinedCell_beta,
                sf.refinedCell_gamma,
                sf.resolutionLimitHighOuter,
                sf.rMeasWithinIPlusIMinusInner,
                sf.resIOverSigI2Overall,
                sf.ccAnomalousInner,
                sf.ccAnomalousOverall,
                sf.rFreeValueStartInner,
                sf.rFreeValueEndInner,
                sf.noofblobs
             FROM SummaryFact sf
                JOIN ProposalDimension pt on pt.proposalDimId = sf.proposalDimId
                JOIN VisitDimension vt on vt.sessionDimId = sf.sessionDimId
                JOIN ProcessingProgramDimension ppt on ppt.processingProgramsDimId = sf.processingProgramsDimId
                JOIN SpaceGroupDimension sgt on sgt.spaceGroupDimId = sgt.spaceGroupDimId
             WHERE $where
             ORDER BY $order "
            , $args);

        // if (!$rows) {
        // $this->_error($this->arg('TITLE') . ' could not be found anywhere!', 404);
        // }
        
        // sql query output
        // $this->_output(array('data' => $rows, 'total' => $tot ));
        $this->_output(array('data' => $rows, 'where' => $where, 'order' => $order, 'args' => $args));


    }



}



// // ASCENDING and DESCENDING
        // // dc id
        // if ($this->has_arg('descdcid')) {
        //     array_push($order_arr, 'dc.dataCollectionId DESC');
        // }
        // if ($this->has_arg('ascdcid')) {
        //     array_push($order_arr, 'dc.dataCollectionId ASC');
        // }

        // // ASCENDING and DESCENDING with Outer, Inner, Overall
        // // rmeas outer
        // if ($this->has_arg('descrmeasou')) {
        //     array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 DESC');
        // }
        // if ($this->has_arg('ascrmeasou')) {
        //     array_push($order_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 ASC');
        // }


        // // Filter Params
        // // dc id
        // if ($this->has_arg('dcid')) {
        //     array_push($where_arr, 'dc.dataCollectionId = :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('dcid'));
        // }
        // // if has comment
        // if ($this->has_arg('com')) {
        //     array_push($where_arr, "dcc.comments LIKE '%_FLAG_%' ");
        // }
        // // processing programs
        // if ($this->has_arg('pp')) {
        //     $st = sizeof($args) + 1;
        //     array_push($where_arr, "lower(app.processingPrograms) LIKE lower(CONCAT(CONCAT('%',:$st),'%')) ESCAPE '$' ");
        //     array_push($args, $this->arg('pp'));
        // }
        //   // refined cell a
        // if ($this->has_arg('gca')) {
        //     array_push($where_arr, 'ap.refinedCell_a >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('gca'));
        // }
        // // refined cell beta
        // if ($this->has_arg('gcbe')) {
        //     array_push($where_arr, 'ap.refinedCell_beta >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('gcbe'));
        // }
        // if ($this->has_arg('lcbe')) {
        //     array_push($where_arr, 'ap.refinedCell_beta <= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('lcbe'));
        // }
        // // Filter Params Greater/Less than Overall, Outer, Inner
        // // resolution limit high outer
        // if ($this->has_arg('grlhou')) {
        //     array_push($where_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('grlhou'));
        // }
        // if ($this->has_arg('lrlhou')) {
        //     array_push($where_arr, 'RESOLUTIONLIMITHIGH_OUTER_1 <= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('lrlhou'));
        // }
        // // rmeas within i plus i minus outer
        // if ($this->has_arg('grmou')) {
        //     array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 >= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('grmou'));
        // }
        // if ($this->has_arg('lrmou')) {
        //     array_push($where_arr, 'RMEASWITHINIPLUSIMINUS_OUTER_1 <= :'.(sizeof($args)+1));
        //     array_push($args, $this->arg('lrmou'));
        // }
