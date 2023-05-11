<?php

namespace SynchWeb\Database;

use SynchWeb\Utils;
use Slim\Slim;

interface DatabaseInterface
{
    // Prepared Query
    public function pq($query, $args = array());

    // Paginated Query
    public function paginate($query, $args);

    // Union multiple queries that take the same arguments and return the same columns
    // Query can optionally be wrapped, where :QUERY will be replaced with the inner query:
    //  $wrapper = 'SELECT * FROM (:QUERY) GROUP BY id';
    public function union($queries, $args, $all = false, $wrapper = null);

    // Read binary
    public function read($field);

    // Return last insert id
    public function id();

    // Close connection
    public function close();

    // Start a transaction
    function start_transaction();

    // End a transaction
    function end_transaction();

    // Use to wait for any replication synchronisation in the db cluster
    // For non-cluster databases no-op
    function wait_rep_sync($state = false);
}

abstract class DatabaseParent implements DatabaseInterface
{
    /**
     *  Setting to true produces a text of the database call
     * @var bool
     */
    public $debug = False;
    
    /** Setting to true should produce statistics output in $stat, if possible in the driver
     * @var bool
     */
    public $stats = False;
    public $stat = "";
    
    /**
     * Setting to true should produce the explain plan in $plan, if possible in the driver
     * @var bool
     */
    public $explain = False;
    public $plan = "";

    protected $conn;
    /* @var string */
    protected $type = "Base"; // The sub-class should override this

    /* @var ?Slim */
    private  $app = NULL;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    function type()
    {
        return $this->type;
    }

    public function set_app(Slim $app) {
        $this->app = $app;
    }

    public function set_stats($st)
    {
        $this->stats = $st;
    }

    public function set_debug($debug)
    {
        if ($this->app)
            $this->app->contentType('text/html');
        $this->debug = $debug;
    }

    function set_explain(bool $explain)
    {
        $this->$explain = $explain;
    }

    public function error($title, $msg)
    {
        Utils::returnError($title, $msg);
    }

    function __destruct()
    {
    // $this->close();
    }
}
