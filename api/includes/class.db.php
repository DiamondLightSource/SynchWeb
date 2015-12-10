<?php

    require_once('config.php');
    require_once('lib/SqlFormatter.php');

    class Database {

        private static $instance;

        public static function get($app=null) {
            // if (self::$instance === null) {
                global $dbtype, $isb;
                if (!$dbtype) $dbtype = 'oracle';

                $dbclassfile = 'includes/class.'.$dbtype.'.php';
                $dbclass = ucwords($dbtype);
                if (file_exists($dbclassfile)) include_once($dbclassfile);

                return new $dbclass($isb['user'], $isb['pass'], $isb['db'], $app);
            
            //     self::$instance = new $dbclass($isb['user'], $isb['pass'], $isb['db'], $app);
            // } else {
            //     self::$instance->set_app($app);
            // }

            // return self::$instance;
        }
    }


    class DatabaseParent {
        public $debug = False;
        public $stats = False;
        public $stat;


        public function set_app($app) {
            $this->app = $app;
        }
        
        public function set_stats($st) {
            $this->stats = $st;
        }
        
        public function set_debug($debug) {
            if ($this->app) $this->app->contentType('text/html');
            $this->debug = $debug;
        }

        public function error($title, $msg) {
            header('HTTP/1.1 400 Bad Request');
            header('Content-type:application/json');
            print json_encode(array('title' => $title, 'msg' => $msg));
            exit();
        }


        function __destruct() {
            $this->close();
        }
    }


    interface DatabaseInterface {
        public function __construct($user, $pass, $db, $app);

        // Prepared Query
        public function pq($query, $arguments);

        // Paginated Query
        public function paginate($query, $arguments);

        // Read binary
        public function read($field);

        // Return last insert id
        public function id();

        // Close connection
        public function close();
    }
    
?>
