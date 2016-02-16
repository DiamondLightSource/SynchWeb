<?php

    require_once('includes/class.db.php');
    // require_once('lib/SqlFormatter.php');
    
    class Oracle extends DatabaseParent implements DatabaseInterface {

        protected $type = 'oracle';

        protected $id;
        public $explain = False;
        public $plan = '';
        // var $stat = '';
        // var $stats = False;
        // var $debug = False;
        

        # Initialise database connection
        function __construct($user, $pass, $db, $app=null) {
            $this->app = $app;
            #ini_set('oci8.persistent_timeout', 60);
            #ini_set('oci8.max_persistent', 3);
            #ini_set('oci8.statement_cache_size', 450);
            
            $this->tz = new DateTimeZone('UTC');

            $this->conn = @oci_connect($user, $pass, $db, 'AL32UTF8');
            #$this->conn = @oci_pconnect($user, $pass, $db, 'AL32UTF8');
            if (!$this->conn) {
                $e = oci_error();
                $this->error('There was an error connecting to Oracle', htmlentities($e['message']));
                //trigger_error(, ENT_QUOTES), E_USER_ERROR);
            }
        
        }
        

        public function set_explain($exp) {
            $this->explain = $exp;
        }
        
        # Return :id variable
        function id() {
            return $this->id;
        }
        

        function paginate($query, $args=array()) {
            $st = sizeof($args) - 1;
            $en = sizeof($args) - 0;

            return $this->pq("
                SELECT outer.*
                    FROM (
                        SELECT ROWNUM rn, inner.*
                        FROM ($query) inner
                    ) outer
                WHERE outer.rn > :$st AND outer.rn <= :$en
            ", $args);
        }

        
        # Perform a database query
        function pq($query, $args=array()) {
            if ($this->debug) {
                print '<h1 class="debug">Debug: Oracle</h1>';
                print SqlFormatter::format($query);
                print_r($args);
            }

            if ($this->stats) {
                $query = preg_replace('/SELECT /', 'SELECT /*+ gather_plan_statistics */ ', $query, 1);
            }
            
            $stid = oci_parse($this->conn, $query);
            if (!$stid) {
                $e = oci_error($this->conn);
                $this->error('There was an error with Oracle', htmlentities($e['message']));
            }
            
            oci_set_prefetch($stid, 100);
            
            // Get variables for prepared query
            $arg_count = preg_match_all('/:\d+/', $query, $mat);
            for ($i = 0; $i < $arg_count; $i++) {
                oci_bind_by_name($stid, ':'.($i+1), $args[$i]);
            }
            
            
            // Add a bound variable incase we need it
            if (strpos($query, ':id') !== false) oci_bind_by_name($stid, ":id", $this->id, 8);
            

            // Add Explain Plan if requested
            if ($this->explain) {
                $exp = oci_parse($this->conn, 'EXPLAIN PLAN FOR '.$query);
                $arg_count = preg_match_all('/:\d+/', $query, $mat);
                $r = oci_execute($exp);
                oci_free_statement($exp);
                
                $plan = oci_parse($this->conn, 'SELECT * FROM TABLE(dbms_xplan.display)');
                $pl = oci_execute($plan);
                $this->plan .= "$query\n".implode(', ', $args)."\n";
                while ($row = oci_fetch_array($plan, OCI_ASSOC+OCI_RETURN_NULLS)) {
                    $this->plan .= $row['PLAN_TABLE_OUTPUT']."\n";
                }
                oci_free_statement($plan);
            }
            
            // Perform the logic of the query
            $r = oci_execute($stid);
            if (!$r) {
                $e = oci_error($stid);
                //trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
                $this->error('There was an error with Oracle', htmlentities($e['message']));
            }
            
            $data = array();
            
            if (strpos($query, 'SELECT') !== false) {
                while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
                    #array_push($data, json_decode(json_encode($row), FALSE));
                    array_push($data, $row);
                }
            }
            
            oci_free_statement($stid);
            
            if ($this->stats) {
                $stat = oci_parse($this->conn, "select * from table(dbms_xplan.display_cursor(null,null,'ALLSTATS LAST'))");
                $pl = oci_execute($stat);
                $this->stat .= "$query\n".implode(', ', $args)."\n";
                while ($row = oci_fetch_array($stat, OCI_ASSOC+OCI_RETURN_NULLS)) {
                    $this->stat .= $row['PLAN_TABLE_OUTPUT']."\n";
                }
                oci_free_statement($stat);
            }
            
            return sizeof($data) == 0 ? array() : $data;
        }        
        
        
        function close() {
            if ($this->conn) oci_close($this->conn);
        }
        
        # Read clob
        function read($field) {
            return $field ? $field->read($field->size()) : '';
        }
        
        
        # Convert oracle date to unix timestamp
        function ut($date) {
            $dt = DateTime::createFromFormat("d#M#y H#i#s*A", $date, $this->tz);
            return $dt->getTimestamp();
        }
        
    }
    
?>
