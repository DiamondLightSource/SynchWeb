<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use Slim\Slim;
use SynchWeb\Database\DatabaseFactory;
use SynchWeb\Database\DatabaseConnectionFactory;

class Summary extends Page
{

    public static $arg_list = array(
        //proposal
        'TITLE' => '(\w|\s|\-|\(|\))+',
        'propid' => '(.*)',

        // visit
        'com' => '(\[[^\ \]]*\],(asc|desc))', //comment
        'PROPOSALID' => '(\[[^\ \]]*\],(asc|desc))',

        'BEAMLINENAME' => '(\[[^\ \]]*\],(asc|desc))',
        // 'VISITNUMBER' => '(\[[^\ \]]*\],(asc|desc))',

        // Filter Parameters - array of parameter orders e.g. ascending, descending and the comparison value
        'sample' => '(^(\w+),(asc|desc|)+$)', //sample name
        'filetemp' => '(^(\w+),(asc|desc|)+$)', //file template
        // 'dcid' => '(.*)', //data collection id 
        'pp' => '(\[[^\ \]]*\],(asc|desc))', // processing programs
        'sg' => '(\[[^\ \]]*\],(asc|desc))', // space group


        // Filter Parameters - array of parameter operands and orders such as greater than, equal to, between, less than, like, ascending, descending and the comparison value.
        'STARTDATE' => '(.*)', // visit start date
        'rca' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type a
        'rcb' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type b
        'rcc' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type c
        'rcal' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type alpha
        'rcbe' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type beta
        'rcga' => '(^(\d+),(.+),(asc|desc|)+$)', // refined cell type gamma
        'rlho' => '(^(\d+),(.+),(asc|desc|)+$)', // resolution limit high outer
        'rmpmi' => '(^(\d+),(.+),(asc|desc|)+$)', // rmeaswithiniplusiminus inner
        'riso' => '(^(\d+),(.+),(asc|desc|)+$)', // resioversigi2 overall
        'cci' => '(^(\d+),(.+),(asc|desc|)+$)', // ccanomalous inner
        'cco' => '(^(\d+),(.+),(asc|desc|)+$)', // ccanomalous overall
        'rfsi' => '(^(\d+),(.+),(asc|desc|)+$)', // rfreevaluestart inner
        'rfei' => '(^(\d+),(.+),(asc|desc|)+$)', // rfreevalueend inner
        'nobi' => '(^(\d+),(.+),(asc|desc|)+$)', //  noofblobs inner


    );

    public static $dispatch = array(
        array('/results', 'get', '_get_results'),
        array('/proposal', 'get', '_get_proposal'),
        array('/spacegroup', 'get', '_get_spacegroup'),
        array('/procprogram', 'get', '_get_processingprogram'),
        array('/bl', 'get', '_get_beamline')
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
        $args = array();

        $op_array = array(">", "LIKE", "=", "<");
        
        if (!$this->has_arg('propid')) $this->_error('No proposal defined');

        // $propid_array  = explode(',', $this->arg('propid'));
        $propid_args = preg_split('/[,]+(?![^\[]*\])/', urldecode($this->arg('propid')));
        $propid_array = explode(',', implode(str_replace(array('[',']'),'', $propid_args)));
        array_push($order_arr, 'sf.autoProcIntegrationId DESC');


        if (!$this->staff) {
            $person_id = $this->user->personId;

            $where_propid_personid_array = array();
            

            // # check user can see selected proposals and get all available visits if so
            foreach ($propid_array as $value) {
                array_push($where_propid_personid_array, '(sf.personid = ?');
                array_push($where_propid_personid_array, 'AND pt.proposalid = ? )');
                array_push($args, $person_id);
                array_push($args, $value);
            };

            array_push($where_arr, '('.implode(' OR ', $where_propid_personid_array).')');


        } else {
            $where_propid_array = array();

            foreach ($propid_array as $value) {
                array_push($where_propid_array, 'pt.proposalid = ?');
                array_push($args, $value);
            };

            array_push($where_arr, '('.implode(' OR ', $where_propid_array).')');

        }


        // [VALUE, ORDER]

        if ($this->has_arg('sample')) {
            $sample_args = explode(',', urldecode($this->arg('sample')));

            array_push($args, $sample_args[0]);
            array_push($where_arr, "lower(sf.name) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if (isset($sample_args[1]) == 'desc' || isset($sample_args[1]) == 'asc') {
                array_push($order_arr, 'sf.name '.$sample_args[2]);
            }

        }


        if ($this->has_arg('filetemp')) {
            $filetemp_args = explode(',', urldecode($this->arg('filetemp')));

            array_push($args, $filetemp_args[0]);
            array_push($where_arr, "lower(sf.fileTemplate) LIKE lower(CONCAT(CONCAT('%',?),'%')) ESCAPE '$' ");
            
            if (isset($filetemp_args[1]) == 'desc' || isset($filetemp_args[1]) == 'asc') {
                array_push($order_arr, 'sf.fileTemplate '.$filetemp_args[1]);
            }

        }


        // if ($this->has_arg('dcid')) {
        //     $dcid_args = explode(',', $this->arg('dcid'));

        //     array_push($args, $dcid_args[0]);
        //     array_push($where_arr, 'sf.dataCollectionId = ?');
            
        //     if (isset($dcid_args[1]) == 'desc' || isset($dcid_args[1]) == 'asc') {
        //         array_push($order_arr, 'sf.dataCollectionId '.$dcid_args[1]);
        //     }

        // }

        if ($this->has_arg('pp')) {

            $pp_array = array();

            $pp_args  = preg_split('/[,]+(?![^\[]*\])/', urldecode($this->arg('pp')));

            $pp_values = explode(',', str_replace(array('[',']'),'', $pp_args[0]));

            foreach ($pp_values as $value) {
                array_push($pp_array, "lower(ppt.processingPrograms) LIKE lower( ? ) ");
                array_push($args, $value);
            }

            array_push($where_arr, '('.implode(" OR ", $pp_array).')');
            
            if (isset($pp_args[1]) == 'desc' || isset($pp_args[1]) == 'asc') {
                array_push($order_arr, 'ppt.processingPrograms '.$pp_args[1]);
            }

        }

        if ($this->has_arg('sg')) {

            $sg_array = array();

            $sg_args  = preg_split('/[,]+(?![^\[]*\])/', urldecode($this->arg('sg')));

            $sg_values = explode(',', str_replace(array('[',']'),'', $sg_args[0]));

            foreach ($sg_values as $value) {
                array_push($sg_array, "lower(sgt.spaceGroup) LIKE lower( ? ) ");
                array_push($args, $value);
            };

            array_push($where_arr, '('.implode(" OR ", $sg_array).')');
            
            if (isset($sg_args[1]) == 'desc' || isset($sg_args[1]) == 'asc') {
                array_push($order_arr, 'sgt.spaceGroup '.$sg_args[1]);
            }

        }

        if ($this->has_arg('BEAMLINENAME')) {

            $BEAMLINENAME_array = array();

            $BEAMLINENAME_args = preg_split('/[,]+(?![^\[]*\])/', urldecode($this->arg('BEAMLINENAME')));

            $BEAMLINENAME_values = explode(',', str_replace(array('[',']'),'', $BEAMLINENAME_args[0]));

            foreach ($BEAMLINENAME_values as $value) {
                array_push($BEAMLINENAME_array, "lower(vt.beamLineName) LIKE lower( ? ) ");
                array_push($args, $value);
            };

            array_push($where_arr, '('.implode(" OR ", $BEAMLINENAME_array).')');
            
            if (isset($BEAMLINENAME_args[1]) == 'desc' || isset($BEAMLINENAME_args[1]) == 'asc') {
                array_push($order_arr, 'vt.beamLineName '.$BEAMLINENAME_args[1]);
            }

        }

        // [VALUE, OPERAND, ORDER]

        if ($this->has_arg('rca')) {
            $rca_args = explode(',', $this->arg('rca'));

            array_push($args, $rca_args[0]);
            
            if (in_array($rca_args[1], $op_array) ) {
                array_push($where_arr, 'sf.refinedCell_a '.$rca_args[1].' ?');
            }

            
            if (isset($rca_args[2]) == 'desc' || isset($rca_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_a '.$rca_args[2]);
            }

        }


        if ($this->has_arg('rcb')) {
            $rcb_args = explode(',', $this->arg('rcb'));

            array_push($args, $rcb_args[0]);
            
            if (in_array($rcb_args[1], $op_array)) {
                array_push($where_arr, 'sf.refinedCell_b '.$rcb_args[1].' ?');
            }
            
            
            if (isset($rcb_args[2]) == 'desc' || isset($rcb_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_b '.$rcb_args[2]);
            }

        }


        if ($this->has_arg('rcc')) {
            $rcc_args = explode(',', $this->arg('rcc'));

            array_push($args, $rcc_args[0]);
            
            if (in_array($rcc_args[1], $op_array)) {
                array_push($where_arr, 'sf.refinedCell_c '.$rcc_args[1].' ?');
            }
            
            
            if (isset($rcc_args[2]) == 'desc' || isset($rcc_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_c '.$rcc_args[2]);
            }

        }


        if ($this->has_arg('rcal')) {
            $rcal_args = explode(',', $this->arg('rcal'));

            array_push($args, $rcal_args[0]);
            
            if (in_array($rcal_args[1], $op_array)) {
                array_push($where_arr, 'sf.refinedCell_alpha '.$rcal_args[1].' ?');
            }
            
            
            if (isset($rcal_args[2]) == 'desc' || isset($rcal_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_alpha '.$rcal_args[2]);
            }

        }

        if ($this->has_arg('rcbe')) {
            $rcbe_args = explode(',', $this->arg('rcbe'));

            array_push($args, $rcbe_args[0]);
            
            if (in_array($rcbe_args[1], $op_array)) {
                array_push($where_arr, 'sf.refinedCell_beta '.$rcbe_args[1].' ?');
            }
            
            
            if (isset($rcbe_args[2]) == 'desc' || isset($rcbe_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_beta '.$rcbe_args[2]);
            }

        }

        if ($this->has_arg('rcga')) {
            $rcga_args = explode(',', $this->arg('rcga'));

            array_push($args, $rcga_args[0]);
            
            if (in_array($rcga_args[1], $op_array)) {
                array_push($where_arr, 'sf.refinedCell_gamma '.$rcga_args[1].' ?');
            }
            
            
            if (isset($rcga_args[2]) == 'desc' || isset($rcga_args[2]) == 'asc') {
                array_push($order_arr, 'sf.refinedCell_gamma '.$rcga_args[2]);
            }

        }

        if ($this->has_arg('rlho')) {
            $rlho_args = explode(',', $this->arg('rlho'));

            array_push($args, $rlho_args[0]);
            
            if (in_array($rlho_args[1], $op_array)) {
                array_push($where_arr, 'sf.resolutionLimitHighOuter '.$rlho_args[1].' ?');
            }
            
            
            if (isset($rlho_args[2]) == 'desc' || isset($rlho_args[2]) == 'asc') {
                array_push($order_arr, 'sf.resolutionLimitHighOuter '.$rlho_args[2]);
            }

        }

        if ($this->has_arg('rmpmi')) {
            $rmpmi_args = explode(',', $this->arg('rmpmi'));

            array_push($args, $rmpmi_args[0]);
            
            if (in_array($rmpmi_args[1], $op_array)) {
                array_push($where_arr, 'sf.rMeasWithinIPlusIMinusInner '.$rmpmi_args[1].' ?');
            }
            
            
            if (isset($rmpmi_args[2]) == 'desc' || isset($rmpmi_args[2]) == 'asc') {
                array_push($order_arr, 'sf.rMeasWithinIPlusIMinusInner '.$rmpmi_args[2]);
            }

        }

        if ($this->has_arg('riso')) {
            $riso_args = explode(',', $this->arg('riso'));

            array_push($args, $riso_args[0]);
            
            if (in_array($riso_args[1], $op_array)) {
                array_push($where_arr, 'sf.resIOverSigI2Overall '.$riso_args[1].' ?');
            }
            
            
            if (isset($riso_args[2]) == 'desc' || isset($riso_args[2]) == 'asc') {
                array_push($order_arr, 'sf.resIOverSigI2Overall '.$riso_args[2]);
            }

        }

        if ($this->has_arg('cci')) {
            $cci_args = explode(',', $this->arg('cci'));

            array_push($args, $cci_args[0]);
            
            if (in_array($cci_args[1], $op_array)) {
                array_push($where_arr, 'sf.ccAnomalousInner '.$cci_args[1].' ?');
            }
            
            
            if (isset($cci_args[2]) == 'desc' || isset($cci_args[2]) == 'asc') {
                array_push($order_arr, 'sf.ccAnomalousInner '.$cci_args[2]);
            }

        }

        if ($this->has_arg('cco')) {
            $cco_args = explode(',', $this->arg('cco'));

            array_push($args, $cco_args[0]);
            
            if (in_array($cco_args[1], $op_array)) {
                array_push($where_arr, 'sf.ccAnomalousOverall '.$cco_args[1].' ?');
            }
            
            
            if (isset($cco_args[2]) == 'desc' || isset($cco_args[2]) == 'asc') {
                array_push($order_arr, 'sf.ccAnomalousOverall '.$cco_args[2]);
            }

        }

        if ($this->has_arg('rfsi')) {
            $rfsi_args = explode(',', $this->arg('rfsi'));

            array_push($args, $rfsi_args[0]);
            
            if (in_array($rfsi_args[1], $op_array)) {
                array_push($where_arr, 'sf.rFreeValueStartInner '.$rfsi_args[1].' ?');
            }
            
            
            if (isset($rfsi_args[2]) == 'desc' || isset($rfsi_args[2]) == 'asc') {
                array_push($order_arr, 'sf.rFreeValueStartInner '.$rfsi_args[2]);
            }

        }

        if ($this->has_arg('rfei')) {
            $rfei_args = explode(',', $this->arg('rfei'));

            array_push($args, $rfei_args[0]);
            
            if (in_array($rfei_args[1], $op_array)) {
                array_push($where_arr, 'sf.rFreeValueEndInner '.$rfei_args[1].' ?');
            }
            
            
            if (isset($rfei_args[2]) == 'desc' || isset($rfei_args[2]) == 'asc') {
                array_push($order_arr, 'sf.rFreeValueEndInner '.$rfei_args[2]);
            }

        }

        if ($this->has_arg('nobi')) {
            $nobi_args = explode(',', $this->arg('nobi'));

            array_push($args, $nobi_args[0]);
            
            if (in_array($nobi_args[1], $op_array)) {
                array_push($where_arr, 'sf.noofblobs '.$nobi_args[1].' ?');
            }
            
            
            if (isset($nobi_args[2]) == 'desc' || isset($nobi_args[2]) == 'asc') {
                array_push($order_arr, 'sf.noofblobs '.$nobi_args[2]);
            }

        }
        

        // AND is the delimieter between seperate queries, converted to string
        $where = implode(" AND ", $where_arr);

        if (count($order_arr) > 0) {
            $order = implode(", ", $order_arr);
        }


        // add multiselect params to end of where clause. 
        // $where = $where.$pp_where.$sg_where.$BEAMLINENAME_where;

        // get tot query
        $tot_args = $args;

        $tot = $this->summarydb->pq(
            "SELECT COUNT(sf.autoProcIntegrationId) as TOT
            FROM SummaryFact sf
                JOIN ProposalDimension pt on pt.proposalDimId = sf.proposalDimId
                JOIN VisitDimension vt on vt.sessionDimId = sf.sessionDimId
                JOIN ProcessingProgramDimension ppt on ppt.processingProgramsDimId = sf.processingProgramsDimId
                JOIN SpaceGroupDimension sgt on sgt.spaceGroupDimId = sgt.spaceGroupDimId
            WHERE $where
            GROUP BY sf.datacollectionId"
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
                pt.prop,
                sf.autoProcIntegrationId,
                sf.dataCollectionId,
                sf.personId,
                sf.visit_number,
                sf.startTime,
                vt.beamLineName,
                sf.comments,
                GROUP_CONCAT(COALESCE(sf.fileTemplate, 'NULL')) as FILETEMPLATE,
                GROUP_CONCAT(COALESCE(sf.name, 'NULL')) as SAMPLENAME,
                GROUP_CONCAT(COALESCE(sgt.spaceGroup, 'NULL')) as SPACEGROUP,
                GROUP_CONCAT(COALESCE(ppt.processingPrograms, 'NULL')) as PROCESSINGPROGRAMS,
                GROUP_CONCAT(COALESCE(sf.refinedCell_a, 'NULL')) as REFINEDCELL_A,
                GROUP_CONCAT(COALESCE(sf.refinedCell_b, 'NULL')) as REFINEDCELL_B,
                GROUP_CONCAT(COALESCE(sf.refinedCell_c, 'NULL')) as REFINEDCELL_C,
                GROUP_CONCAT(COALESCE(sf.refinedCell_alpha, 'NULL')) as REFINEDCELL_ALPHA,
                GROUP_CONCAT(COALESCE(sf.refinedCell_beta, 'NULL')) as REFINEDCELL_BETA,
                GROUP_CONCAT(COALESCE(sf.refinedCell_gamma, 'NULL')) as REFINEDCELL_GAMMA,
                GROUP_CONCAT(COALESCE(sf.resolutionLimitHighOuter, 'NULL')) as RESOLUTIONLIMITHIGHOUTER,
                GROUP_CONCAT(COALESCE(sf.rMeasWithinIPlusIMinusInner, 'NULL')) as RMEASWITHINIPLUSIMINUSINNER,
                GROUP_CONCAT(COALESCE(sf.resIOverSigI2Overall, 'NULL')) as RESIOVERSIGI2OVERALL,
                GROUP_CONCAT(COALESCE(sf.ccAnomalousInner, 'NULL')) as CCANOMALOUSINNER,
                GROUP_CONCAT(COALESCE(sf.ccAnomalousOverall, 'NULL')) as CCANOMALOUSOVERALL,
                GROUP_CONCAT(COALESCE(sf.rFreeValueStartInner, 'NULL')) as RFREEVALUESTARTINNER,
                GROUP_CONCAT(COALESCE(sf.rFreeValueEndInner, 'NULL')) as RFREEVALUEENDINNER,
                GROUP_CONCAT(COALESCE(sf.noofblobs, 'NULL')) as NOOFBLOBS
            FROM SummaryFact sf
                JOIN ProposalDimension pt on pt.proposalDimId = sf.proposalDimId
                JOIN VisitDimension vt on vt.sessionDimId = sf.sessionDimId
                JOIN ProcessingProgramDimension ppt on ppt.processingProgramsDimId = sf.processingProgramsDimId
                JOIN SpaceGroupDimension sgt on sgt.spaceGroupDimId = sf.spaceGroupDimId
            WHERE $where
            GROUP BY sf.dataCollectionId
            ORDER BY $order "
            , $args);
        
            
        if (!$rows) {
        $this->_error($this->arg('TITLE') . ' could not be found anywhere!', 404);
        }

        
        
        // sql query output

        // $this->_output(array('data' => $where, 'args' => $args));
        $this->_output(array('data' => $rows, 'total' => $tot ));
        // $this->_output(array('data' => $rows, 'where' => $where, 'order' => $order, 'args' => $args));



    }

    function _get_proposal() {

        $args = array();
        $where = "WHERE 1=1";

        if (!$this->staff) {
            $person_id = $this->user->personId;

            // $person_id = 16565;

            $where_person = "sf.personId = ".$person_id;

            $rows = $this->summarydb->pq(
                "SELECT pt.prop, pt.proposalid
                FROM ProposalDimension pt
                JOIN SummaryFact sf on pt.proposalDimId = sf.proposalDimId
                WHERE $where_person
                GROUP BY pt.proposalid");

            $this->_output($rows);  

        } else {

            $tot = $this->summarydb->pq(
                "SELECT COUNT(proposalid) as TOT
                FROM ProposalDimension pt
                $where", $args);

    
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

            $order = 'p.proposalid DESC';

            $rows = $this->summarydb->paginate(
                "SELECT prop, proposalid
                FROM ProposalDimension pt
                $where", $args);

            $this->_output($rows); 

        }



    }

    function _get_spacegroup() {

        $rows = $this->summarydb->pq(
            "SELECT spaceGroup
            FROM SpaceGroupDimension sgt");

        $this->_output($rows);

    }

    function _get_processingprogram() {

        $rows = $this->summarydb->pq(
            "SELECT processingPrograms
            FROM ProcessingProgramDimension ppt");

        $this->_output($rows);

    }

    function _get_beamline() {

        $rows = $this->summarydb->pq(
            "SELECT beamLineName
            FROM VisitDimension vt");

        $this->_output($rows);

    }




}

