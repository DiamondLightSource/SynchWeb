<?php

namespace SynchWeb\Database;

use SynchWeb\Utils;
use Slim\Slim;

interface DatabaseInterface
{
    public function __construct($conn);

    // Prepared Query
    public function pq($query, $args = array());

    // Paginated Query
    public function paginate($query, $args);

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
    // Setting to true produces a text of the database call
    public bool $debug = False;
    
    // Setting to true should produce statistics output in $stat, if possible in the driver
    public bool $stats = False;
    public $stat = "";
    
    // Setting to true should produce the explain plan in $plan, if possible in the driver
    public bool $explain = False;
    public $plan = "";

    protected $conn;
    protected string $type = "Base"; // The sub-class should override this

    private ?Slim $app = NULL;

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
