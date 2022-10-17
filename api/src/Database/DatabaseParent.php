<?php

namespace SynchWeb\Database;

use SynchWeb\Utils;

class DatabaseParent
{
    public $debug = False;
    public $stats = False;
    public $stat;

    protected $conn;

    function type()
    {
        return $this->type;
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

    public function error($title, $msg)
    {
        Utils::returnError($title, $msg);
    }

    function __destruct()
    {
    // $this->close();
    }
}

interface DatabaseInterface
{
    public function __construct($conn);

    // Prepared Query
    public function pq($query, $args);

    // Paginated Query
    public function paginate($query, $args);

    // Read binary
    public function read($field);

    // Return last insert id
    public function id();

    // Close connection
    public function close();
}