<?php

namespace SynchWeb\Database;

class DatabaseParent
{
    public $debug = False;
    public $stats = False;
    public $stat;
    private $app;

    function type()
    {
        return $this->type;
    }

    public function set_app($app)
    {
        $this->app = $app;
    }

    public function set_stats($st)
    {
        $this->stats = $st;
    }

    public function set_debug($debug)
    {
        if ($this->app) $this->app->contentType('text/html');
        $this->debug = $debug;
    }

    public function error($title, $msg)
    {
        header('HTTP/1.1 503 Service Unavailable');
        // header('Content-type:application/json');
        print json_encode(array('title' => $title, 'msg' => $msg));
        error_log('Database Error: ' . $msg);
        exit();
    }


    function __destruct()
    {
        // $this->close();
    }
}

interface DatabaseInterface
{
    public function __construct($user, $pass, $db, $port);

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
