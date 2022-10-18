<?php

namespace SynchWeb\Database\Type;

use SynchWeb\Database\DatabaseParent;
use SynchWeb\Database\DatabaseInterface;
use SqlFormatter;

class MySQL extends DatabaseParent implements DatabaseInterface
{
    protected $type = 'mysql';

    var $lastQuery = ''; // provide a way of retrieving the last query run - by storing the data - can then call getLastQuery() - primarily for testing
    var $lastArgs = array();
    var $debug = false;
    var $stat = '';
    var $stats = False;
    var $transaction = False;
    var $errors = 0;
    var $wsrep_sync = False;

    const TABLES = array(
        'AdminActivity',
        'Log4Stat',
        'PHPSession',

        'Person',
        'Permission',
        'UserGroup_has_Permission',
        'UserGroup',
        'UserGroup_has_Person',

        'Proposal',
        'ProposalHasPerson',
        'BLSession',
        'Session_has_Person',
        'SessionType',

        'DataCollection',
        'EnergyScan',
        'XFEFluorescenceSpectrum',
        'RobotAction',
        'DataCollectionGroup',
        'DataCollectionComment',
        'ImageQualityIndicators',
        'GridInfo',
        'Detector',

        'AutoProcIntegration',
        'AutoProcScaling_has_Int',
        'AutoProcScaling',
        'AutoProc',
        'AutoProcScalingStatistics',
        'AutoProcProgram',
        'AutoProcProgramAttachment',
        'AutoProcProgramMessage',

        'Screening',
        'ScreeningOutput',
        'ScreeningStrategy',
        'ScreeningStrategyWedge',
        'ScreeningStrategySubWedge',
        'ScreeningOutputLattice',

        'BLSample',
        'Position',
        'DiffractionPlan',
        'Protein',
        'Crystal',
        'Container',
        'Dewar',
        'Shipping',
        'ShippingHasSession',
        'DewarTransportHistory',
        'DewarRegistry',
        'DewarRegistry_has_Proposal',
        'DewarReport',
        'CourierTermsAccepted',

        'BLSubSample',
        'PDB',
        'Protein_has_PDB',

        // Stat Views
        'v_logonByHour',
        'v_logonByMonthDay',
        'v_logonByWeek',
        'v_logonByWeekDay',
        'v_logonByHour2',
        'v_logonByMonthDay2',
        'v_logonByWeek2',
        'v_logonByWeekDay2',

        // Projects
        'Project',
        'Project_has_User',
        'Project_has_Person',
        'Project_has_DCGroup',
        'Project_has_EnergyScan',
        'Project_has_XFEFSpectrum',
        'Project_has_Protein',
        'Project_has_BLSample',
        'Project_has_Session',

        // Calendar
        'CalendarHash',

        // Faults
        'BF_fault',
        'BF_component',
        'BF_subcomponent',
        'BF_system',
        'BF_system_beamline',
        'BF_component_beamline',
        'BF_subcomponent_beamline',

        // Lab Contact
        'LabContact',
        'Laboratory',

        // PDBStats
        'PDBEntry',
        'PDBEntry_has_AutoProcProgram',

        // Protein -> Component
        'ConcentrationType',
        'ComponentType',
        'Component_has_SubType',
        'ComponentSubType',
        'BLSampleType_has_Component',

        // VMXi
        'ContainerInspection',
        'Imager',
        'Screen',
        'ScreenComponentGroup',
        'ScreenComponent',
        'Schedule',
        'ScheduleComponent',
        'InspectionType',
        'BLSampleImage',
        'BLSampleImageScore',
        'BLSampleImageAutoScoreSchema',
        'BLSampleImageAutoScoreClass',
        'BLSampleImage_has_AutoScoreClass',

        // Queuing
        'ContainerQueueSample',
        'ContainerQueue',

        // Container DB
        'ContainerHistory',
        'ContainerRegistry',
        'ContainerRegistry_has_Proposal',
        'ContainerReport',


        'ComponentLattice',

        // To be removed
        'Image',

        // Exp Planning
        'Detector',
        'DataCollectionPlan_has_Detector',
        'ScanParametersService',
        'ScanParametersModel',
        'BLSample_has_DataCollectionPlan',


        'DataCollectionFileAttachment',

        // Fl maps
        'XRFFluorescenceMapping',
        'XRFFluorescenceMappingROI',

        'GridImageMap',

        // EM
        'MotionCorrection',
        'MotionCorrectionDrift',
        'CTF',
        'Movie',

        // Sample groups
        'BLSampleGroup',
        'BLSampleGroup_has_BLSample',

        // Processing
        'ProcessingJob',
        'ProcessingJobParameter',
        'ProcessingJobImageSweep',
        'ProcessingPipeline',
        'ProcessingPipelineCategory',

        'BeamLineSetup',

        // Phasing
        'Phasing',
        'Phasing_has_Scaling',
        'PhasingProgramRun',
        'PhasingProgramAttachment',

        // Xray Centring
        'XrayCentringResult',

        'BeamCalendar',
        'SpaceGroup',

        // MR
        'MXMRRun',
        'MXMRRunBlob',
    );

    function __construct($conn)
    {
        $this->conn = $conn;

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // throw exceptions.

        if (mysqli_connect_errno())
        {
            $this->error('There was an error connecting to MySQL: ', htmlentities(mysqli_connect_errno()));
        }
    }

    // wsrep_sync_wait waits for cluster replication on a mariadb cluster
    function wait_rep_sync($state = false)
    {
        $ver = $this->conn->server_info;
        if (stripos($ver, 'maria'))
        {
            $this->pq("SET SESSION wsrep_sync_wait=:1", array($state ? 1 : 0));
        }
    }

    function start_transaction()
    {
        $this->transaction = True;
        $this->conn->autocommit(False);
    }

    function end_transaction()
    {
        if ($this->errors > 0)
            $this->conn->rollback();
        else
            $this->conn->commit();

        $this->conn->autocommit(True);
        $this->transaction = False;

        if ($this->errors > 0)
            $this->error('There was an error with MySQL', $this->conn->error . __LINE__);
        $this->errors = 0;
    }

    function paginate($query, $args = array())
    {
        // MySQL is Limit Start Row, Number
        // Oracle subselect is Start Row, End Row
        if (sizeof($args))
            $args[sizeof($args) - 1] = $args[sizeof($args) - 1] - $args[sizeof($args) - 2];
        return $this->pq("$query LIMIT ?,?", $args);
    }


    function oracle2mysql($query, $args)
    {
        // Allow for Oracle style :1, :2 out of order
        preg_match_all('/\:(\d+)/', $query, $mat);
        $rearranged_args = array();
        if ($this->debug)
        {
            print_r('Old ordering:');
            var_dump($args);
        }

        // TODO: would be nice to include this check - the danger is, is that there are existing queries where args are specified but not fully used - which would now break
        // - on initial inspection, this appears to be the case - e.g. see the /current page (which suggests we should be fixing these things...)
        // if (sizeof($args) != sizeof($mat[0])) {
        //     $this->error("Error preparing SQL query", "Incomplete parameter set supplied with SQL query: expected " . sizeof($mat) . " parameters, received " . sizeof($args));
        // }

        foreach ($mat[1] as $id)
        {
            $aid = $id - 1;
            $val = $args[$aid];
            array_push($rearranged_args, $val);
            unset($args[$aid]);
        }

        foreach ($args as $remain)
        {
            array_push($rearranged_args, $remain);
        }

        if ($this->debug)
        {
            print_r('Rearranged ordering:');
            var_dump($rearranged_args);
        }
        $args = $rearranged_args;

        // Replace oracle :1 placeholder with ?
        $query = preg_replace('/\:\d+/', '?', $query);

        // Date to string conversion
        $query = preg_replace('/TO_CHAR\((.+?)MM(.+?)\)/', 'TO_CHAR(\1%m\2)', $query);
        $query = preg_replace('/TO_DATE\((.+?)MM(.+?)\)/', 'TO_DATE(\1%m\2)', $query);

        $query = preg_replace('/TO_CHAR\((.+?)DD(.+?)\)/', 'TO_CHAR(\1%d\2)', $query);
        $query = preg_replace('/TO_DATE\((.+?)DD(.+?)\)/', 'TO_DATE(\1%d\2)', $query);

        $query = preg_replace('/TO_CHAR/', 'DATE_FORMAT', $query);
        $query = preg_replace('/TO_DATE/', 'STR_TO_DATE', $query);
        // $query = preg_replace('/DD/', '%d', $query);

        $query = preg_replace('/YYYY/', '%Y', $query);
        $query = preg_replace('/HH24/', '%H', $query);
        $query = preg_replace('/:MI/', ':%i', $query);
        $query = preg_replace('/:SS/', ':%s', $query);
        $query = preg_replace('/"T"/', 'T', $query);

        // String aggregation
        $query = preg_replace('/string_agg\((.+?)\)/', 'GROUP_CONCAT(\1 SEPARATOR \',\')', $query);

        // Timestamps
        $query = preg_replace('/SYSDATE/i', 'CURRENT_TIMESTAMP', $query);

        // Replace sequences with auto increments
        $query = preg_replace('/s_\w+\.nextval/', 'NULL', $query);

        // Replace Returning, mysql provides last insert id
        $query = preg_replace('/ RETURNING \w+ INTO :id/', '', $query);

        // Replace Oracle CAST to Date to DateTime
        $query = preg_replace('/CAST\((.+?) as DATE\)/i', 'CAST(\1 AS DATETIME)', $query);

        // Months between
        // $query = preg_replace('/MONTHS_BETWEEN\((.+?),(.+?)\)/', 'TIMESTAMPDIFF(MONTH, \2, \1)', $query);
        $query = preg_replace('/TIMESTAMPDIFF\(\'(\w+)\'/', 'TIMESTAMPDIFF(\1', $query);

        // Replace TO_NUMBER to CAST
        $query = preg_replace('/TO_NUMBER\(([\w|\.]+)\)/', 'CAST(\1 AS SIGNED)', $query);

        return array($query, $args);
    }

    function tablelookup($query)
    {
        foreach (self::TABLES as $table)
        {
            $lowerCaseTable = strtolower($table);
            $query = str_replace(" " . $lowerCaseTable . " ", " $table ", $query);
            $query = str_replace(" " . $lowerCaseTable . "\n", " $table\n", $query);
            $query = preg_replace("/ " . $lowerCaseTable . '$/', " $table", $query);
        }

        return $query;
    }

    // return the last SQL query executed in fully expanded form (i.e. including binded params) - this is mainly for testing purposes (so ideally would not be part of the actual class...)
    function getLastQuery()
    {
        echo '<br/>';
        $sql = $this->lastQuery;
        for ($i = 1; $i < count($this->lastArgs); $i++)
        {
            $val = $this->lastArgs[$i];
            if (is_string($val))
            {
                $val = "'" . $val . "'";
            }
            $sql = preg_replace('/\?/', $val, $sql, 1);
        }
        return $sql;
    }

    function pq($query, $args = array(), $upperCaseKeys = true)
    {
        list($query, $args) = $this->oracle2mysql($query, $args);
        $query = $this->tablelookup($query);

        if ($this->debug)
        {
            print '<h1 class="debug">MySQL Debug</h1>';
            print SqlFormatter::format($query);
            echo '<br/>';
        }

        $stmt = $this->conn->prepare($query);

        if (!$stmt)
        {
            if ($this->transaction)
                $this->errors++;
            else
            {
                $err = mysqli_error($this->conn);
                $this->error('There was an error with MySQL', $err);
                return;
            }
        }

        if (sizeof($args))
        {
            $vtypes = array('NULL' => 'i', 'integer' => 'i', 'double' => 'd', 'string' => 's');

            $strfs = '';
            foreach ($args as $a)
            {
                $t = gettype($a);
                $strfs .= $vtypes[$t];
            }

            array_unshift($args, $strfs);
            call_user_func_array(array(&$stmt, 'bind_param'), $this->refs($args));
        }

        $this->lastQuery = $query;
        $this->lastArgs = $args;
        if ($this->debug)
        {
            print_r("Full SQL query: " . $this->getLastQuery());
        }

        if (!$stmt->execute())
        {
            if ($this->transaction)
                $this->errors++;
            else
            {
                $err = mysqli_error($this->conn);
                $this->error('There was an error with MySQL', $err);
                return;
            }
        }

        $data = array();
        if (strpos($query, 'SELECT') !== false)
        {
            $result = $stmt->get_result();
            if ($result)
            {
                if ($result->num_rows > 0)
                {
                    while ($row = $result->fetch_assoc())
                    {
                        $c = array();
                        // oracle inheritance ;(
                        foreach ($row as $key => $val)
                        {
                            if ($val !== null)
                            {
                                if (gettype($val) == gettype(0.1))
                                    $val = round($val, 5);
                                $val = strval($val);
                            }
                            if ($upperCaseKeys)
                            {
                                $key = strtoupper($key);
                            }
                            $c[$key] = $val;
                        }
                        array_push($data, $c);
                    }
                }
            }
        }

        if ($this->debug)
        {
            echo '<br/>';
            print_r('row count: ' . sizeof($data));
            echo '<br/>';
        }

        // Need mysqlnd for this :(
        // $result = $stmt->get_result();

        // $data = array();

        // if ($result) {
        //     if($result->num_rows > 0) {
        //         while($row = $result->fetch_assoc()) {
        //             array_push($data, array_change_key_case($row, CASE_UPPER));
        //         }
        //     }
        // }

        $stmt->close();

        return $data;
    }

    // Union multiple queries that take the same arguments and return the same columns
    // Query can optionally be wrapped, where :QUERY will be replaced with the inner query:
    //  $wrapper = 'SELECT * FROM (:QUERY) GROUP BY id';
    function union($queries, $args, $all = false, $wrapper = null)
    {
        $nargs = sizeof($args);
        $all_args = array();
        $union_kw = $all ? 'UNION ALL' : 'UNION';
        foreach ($queries as $i => &$query)
        {
            $offset = $i * $nargs;
            $query = preg_replace_callback('/\:(\d+)/',
                function ($mat) use ($offset)
                {
                    return ':' . (intval($mat[1]) + $offset);
                },
                $query);
            $all_args = array_merge($all_args, $args);
        }

        $union = implode("\n$union_kw\n", $queries);
        if ($wrapper)
        {
            $union = preg_replace('/:QUERY/', $union, $wrapper);
        }

        return $this->pq($union, $all_args);
    }

    function set_explain($exp)
    {

    }

    function get_result($Statement)
    {
        $RESULT = array();
        $Statement->store_result();
        for ($i = 0; $i < $Statement->num_rows; $i++)
        {
            $Metadata = $Statement->result_metadata();
            $PARAMS = array();
            while ($Field = $Metadata->fetch_field())
            {
                $PARAMS[] = & $RESULT[$i][$Field->name];
            }
            call_user_func_array(array($Statement, 'bind_result'), $PARAMS);
            $Statement->fetch();
        }
        return $RESULT;
    }

    function refs($arr)
    {
        $refs = array();
        foreach ($arr as $key => $value)
        {
            $refs[$key] = & $arr[$key];
        }
        return $refs;
    }

    function read($field)
    {
        return $field;
    }

    function id()
    {
        return mysqli_insert_id($this->conn);
    }

    function close()
    {
        if ($this->conn)
            $this->conn->close();
    }
}