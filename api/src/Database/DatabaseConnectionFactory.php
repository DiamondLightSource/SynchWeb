<?php

namespace SynchWeb\Database;

use SynchWeb\Utils;

class DatabaseConnectionFactory
{
    public function get($databaseType)
    {
        global $isb;

        if (!$databaseType) {
            error_log('Database type variable, dbtype, is not specified in config.php - defaulting to MySql.');
            $databaseType = 'MySQL';
        }
        $conn = null;
        if ($databaseType == 'MySQL') {
            $port = array_key_exists('port', $isb) ? $isb['port'] : null;
            if (!$port) {
                $port = ini_get("mysqli.default_port");
            }
            list($host, $dbn) = explode('/', $isb['db']);
            $conn = new \mysqli($host, $isb['user'], $isb['pass'], $dbn, $port);
            $conn->set_charset("utf8mb4");
        }

        if ($conn == null) {
            Utils::returnError("Database Configuration Error", "Database connection for type '$databaseType' does not exist.");
        }
        return $conn;
    }
}