<?php
    // phpinfo();

    require_once('includes/class.db.php');

    class MySQL extends DatabaseParent implements DatabaseInterface {
        
        var $debug = False;
        var $stat = '';
        var $stats = False;
        
        function __construct($user, $pass, $db, $app=null) {
            $this->app = $app;

            list($host, $dbn) = explode('/', $db);
            $this->conn = new mysqli($host, $user, $pass, $dbn);
            
            if (mysqli_connect_errno()) {
                $this->error('There was an error connecting to MySQL: ', htmlentities(mysqli_connect_errno()));
            }
        }


        function paginate($query, $args=array()) {
            // MySQL is Limit Start Row, Number
            // Oracle subselect is Start Row, End Row
            if (sizeof($args)) $args[sizeof($args)-1] = $args[sizeof($args)-1] - $args[sizeof($args)-2];
            return $this->pq("$query LIMIT ?,?", $args);
        }
        

        function oracle2mysql($query, $args) {
            // Allow for Oracle style :1, :2 out of order
            preg_match_all('/\:(\d+)/', $query, $mat);
            $rearranged_args = array();
            if ($this->debug) print_r(array('old', $args));
            foreach ($mat[1] as $id) {
                $aid = $id-1;
                $val = $args[$aid];
                array_push($rearranged_args, $val);
                unset($args[$aid]);
            }

            foreach ($args as $remain) {
                array_push($rearranged_args, $remain);
            }

            if ($this->debug) print_r(array('rearr', $rearranged_args));
            $args = $rearranged_args;

            // Replace oracle :1 placeholder with ?
            $query = preg_replace('/\:\d+/', '?', $query);

            // Date to string conversion
            $query = preg_replace('/TO_CHAR\((.+?)MM(.+?)\)/', 'TO_CHAR(\1%m\2)', $query);
            $query = preg_replace('/TO_DATE\((.+?)MM(.+?)\)/', 'TO_DATE(\1%m\2)', $query);

            $query = preg_replace('/TO_CHAR/', 'DATE_FORMAT', $query);
            $query = preg_replace('/TO_DATE/', 'STR_TO_DATE', $query);
            $query = preg_replace('/DD/', '%d', $query);
            
            $query = preg_replace('/YYYY/', '%Y', $query);
            $query = preg_replace('/HH24/', '%H', $query);
            $query = preg_replace('/:MI/', ':%i', $query);
            $query = preg_replace('/:SS/', ':%s', $query);
            $query = preg_replace('/"T"/', 'T', $query);

            // String aggregation
            $query = preg_replace('/string_agg\(.?\)/', "GROUP_CONCAT(\1 SEPARATOR ',')", $query);

            // Timestamps
            $query = preg_replace('/SYSDATE/i', 'CURDATE()', $query);

            // Replace sequences with auto increments
            $query = preg_replace('/s_\w+\.nextval/', 'NULL', $query);

            // Replace Returning, mysql provides last insert id
            $query = preg_replace('/ RETURNING \w+ INTO :id/', '', $query);

            return array($query, $args);
        }


        function tablelookup($query) {
            $tables = array('AdminActivity',
                            'Log4Stat',
                            'PHPSession',

                            'Person',
                            'Permission',
                            'UserGroup_has_Permission',
                            'UserGroup',
                            'UserGroup_has_Person',

                            'Proposal',
                            'BLSession',
                            'Session_has_Person',

                            'DataCollection',
                            'EnergyScan',
                            'BLSample_has_EnergyScan',
                            'XFEFluorescenceSpectrum',
                            'RobotAction',
                            'DataCollectionGroup',
                            'DataCollectionComment',
                            'ImageQualityIndicators',
                            '',
                            'AutoProcIntegration',
                            'AutoProcScaling_has_Int',
                            'AutoProcScaling',
                            'AutoProc',
                            'AutoProcScalingStatistics',
                            'AutoProcProgram',
                            '',
                            'Screening',
                            'ScreeningOutput',
                            'ScreeningStrategy',
                            'ScreeningStrategyWedge',
                            '',
                            '',

                            'BLSample',
                            'DiffractionPlan',
                            'BLSampleImage',
                            'Protein',
                            'Crystal',
                            'Container',
                            'Dewar',
                            'Shipping',
                            '',
                            'BLSubSample',
                            '',
                            'BF_fault',
                            'BF_component',
                            'BF_subcomponent',
                            'BF_system',
                            '',
                            '',
                            '',
                );

            foreach ($tables as $table) {
                $query = str_replace(" ".strtolower($table)." ", " $table ", $query);
                $query = str_replace(" ".strtolower($table)."\n", " $table\n", $query);
            }

            return $query;
        }
        
        
        function pq($query, $args=array()) {
            list($query, $args) = $this->oracle2mysql($query, $args);
            $query = $this->tablelookup($query);

            if ($this->debug) {
                print '<h1 class="debug">MySQL Debug</h1>';
                print SqlFormatter::format($query);
                print_r($args);
                // error_log($query);
                // error_log(print_R($args));
            }

            $stmt = $this->conn->prepare($query);
            
            if (!$stmt) {
                $this->error('There was an error with MySQL', $this->conn->error.__LINE__);
            }
            
            if (sizeof($args)) {
                $vtypes = array('NULL' => 'i', 'integer' => 'i', 'double' => 'd', 'string' => 's');
                
                
                $strfs = '';
                foreach ($args as $a) {
                    $t = gettype($a);
                    $strfs .= $vtypes[$t];
                }
                
                array_unshift($args, $strfs);
                call_user_func_array(array(&$stmt,'bind_param'),$this->refs($args));
            }
            
            if (!$stmt->execute()) {
                $this->error('There was an error with MySQL', $this->conn->error.__LINE__);
            }

            $data = array();
            if (strpos($query, 'SELECT') !== false) {
                $params = array();
                $row = array();
                $meta = $stmt->result_metadata();
                while ($field = $meta->fetch_field()) {
                    array_push($params, &$row[$field->name]);
                }
                call_user_func_array(array($stmt, 'bind_result'), $params);

                while ($stmt->fetch()) {
                    $c = array();
                    foreach ($row as $key => $val) $c[strtoupper($key)] = $val;
                    $data[] = $c;
                }
            }

            if ($this->debug) print_r(array('rows', sizeof($data)));

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

        function set_explain($exp) {

        }
        
        function get_result( $Statement ) {
            $RESULT = array();
            $Statement->store_result();
            for ( $i = 0; $i < $Statement->num_rows; $i++ ) {
                $Metadata = $Statement->result_metadata();
                $PARAMS = array();
                while ( $Field = $Metadata->fetch_field() ) {
                    $PARAMS[] = &$RESULT[ $i ][ $Field->name ];
                }
                call_user_func_array( array( $Statement, 'bind_result' ), $PARAMS );
                $Statement->fetch();
            }
            return $RESULT;
        }
        
        function refs($arr) {
            $refs = array();
            foreach ($arr as $key => $value) {
                $refs[$key] = &$arr[$key];
            }
            return $refs;
        }

        
        function read($field) {
            return $field;
        }
        
        
        function id() {
            return $this->conn->insert_id;
        }

        
        function close() {
            // if (!$this->conn->connect_error) $this->conn->close();
            if ($this->conn) $this->conn->close();
        }

        
    }
    
?>
