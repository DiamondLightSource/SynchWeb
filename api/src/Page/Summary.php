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
        'pp' => '(\[[^\ \]]*\],(asc|desc|))', // processing programs
        'sg' => '(\[[^\ \]]*\],(asc|desc|))', // space group


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

    public $string_arg_types = array(
        'pp' => ["order" =>'ppt.processingPrograms ', "where" => 'lower(ppt.processingPrograms) = lower( ? ) '],
        'sg' => ["order" =>'sgt.spaceGroup ', "where" => 'lower(sgt.spaceGroup) = lower( ? ) '],
        'BEAMLINENAME' => ["order" =>'vt.beamLineName ', "where" => 'lower(vt.beamLineName) LIKE lower( ? ) ']
    );


    public $val_arg_types = array(
        'rca' => ["arg" => 'sf.refinedCell_a '],
        'rcb' => ["arg" => 'sf.refinedCell_b '],
        'rcc' => ["arg" => 'sf.refinedCell_c '],
        'rcal' => ["arg" => 'sf.refinedCell_alpha '],
        'rcbe' => ["arg" => 'sf.refinedCell_beta '],
        'rcga' => ["arg" => 'sf.refinedCell_gamma '],
        'rlho' => ["arg" => 'sf.resolutionLimitHighOuter '],
        'rmpmi' => ["arg" => 'sf.rMeasWithinIPlusIMinusInner '],
        'riso' => ["arg" => 'sf.resIOverSigI2Overall '],
        'cci' => ["arg" => 'sf.ccAnomalousInner '],
        'cco' => ["arg" => 'sf.ccAnomalousOverall '],
        'rfsi' => ["arg" => 'sf.rFreeValueStartInner '],
        'rfei' => ["arg" => 'sf.rFreeValueEndInner '],
        'nobi' => ["arg" => 'sf.noofblobs ']

    );


    private $summarydb;


    function __construct(Slim $app, $db, $user)
    {   
        global $summarydbconfig;

        parent::__construct($app, $db, $user);

        if ($summarydbconfig) {
            $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
            $db = $dbFactory->get("summary");
            $this->summarydb = $db;
        }

    }

    private function error_on_no_summary_db(){
        global $summarydbconfig;
        if (!$summarydbconfig) {
            $this->_error("Not valid when summary database not configured.");
        }
    }

    function _get_results() {
        $this->error_on_no_summary_db();
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


        foreach ($this->string_arg_types as $key => $value) {

            if ($this->has_arg($key)) {

                $temp_array = array();
    
                $temp_args  = preg_split('/[,]+(?![^\[]*\])/', urldecode($this->arg($key)));
    
                $temp_values = explode(',', str_replace(array('[',']'),'', $temp_args[0]));
    
                foreach ($temp_values as $temp_value) {
                    array_push($temp_array, $value['where']);
                    array_push($args, $temp_value);
                }
    
                array_push($where_arr, '('.implode(" OR ", $temp_array).')');
                
                if (isset($temp_args[1]) == 'desc' || isset($temp_args[1]) == 'asc') {
                    array_push($order_arr, $value['order'].$temp_args[1]);
                }
            }
        }


        // [VALUE, OPERAND, ORDER]

        foreach ($this->val_arg_types as $key => $value) {

            if ($this->has_arg($key)) {
                $temp_args = explode(',', $this->arg($key));
    
                array_push($args, $temp_args[0]);
                
                if (in_array($temp_args[1], $op_array) ) {
                    array_push($where_arr, $value['arg'].$temp_args[1].' ?');
                }
    
                
                if (isset($temp_args[2]) == 'desc' || isset($temp_args[2]) == 'asc') {
                    array_push($order_arr, $value['arg'].$temp_args[2]);
                }
    
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
        $this->error_on_no_summary_db();
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
        $this->error_on_no_summary_db();
        $rows = $this->summarydb->pq(
            "SELECT spaceGroup
            FROM SpaceGroupDimension sgt");

        $this->_output($rows);

    }

    function _get_processingprogram() {
        $this->error_on_no_summary_db();
        $rows = $this->summarydb->pq(
            "SELECT processingPrograms
            FROM ProcessingProgramDimension ppt");

        $this->_output($rows);

    }

    function _get_beamline() {
        $this->error_on_no_summary_db();
        $rows = $this->summarydb->pq(
            "SELECT beamLineName
            FROM VisitDimension vt");

        $this->_output($rows);

    }




}

