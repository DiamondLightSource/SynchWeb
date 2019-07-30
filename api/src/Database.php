<?php

namespace SynchWeb;

class Database
{
    public static function get()
    {
        global $dbtype, $isb;

        // Global variable is named $dbtype in config.php.
        $database_type = $dbtype;

        // Array of database types and corresponding database class names.
        // Value is class name in SynchWeb\Database\Type namespace.
        // Key is lower case representation of class name.
        $database_types = array(
            'mysql' => 'MySQL'
        );

        if (!$database_type) {
            error_log('Database type ($dbtype) is not specified in config.php.');

            $database_type = 'MySQL';
        }

        // Determine fully-qualified class name of database class corresponding to $database_type.

        $full_class_name = null;

        if (key_exists(strtolower($database_type), $database_types)) {
            $full_class_name = 'SynchWeb\\Database\\Type\\' . $database_types[$database_type];
        } else {
            error_log("Database type '$database_type' not configured.");
        }

        // Return instance of database class.

        if (class_exists($full_class_name)) {
            $port = array_key_exists('port', $isb) ? $isb['port'] : null;

            return new $full_class_name($isb['user'], $isb['pass'], $isb['db'], $port);
        } else {
            error_log("Database class '$full_class_name' does not exist.");
        }

        // $this->_error(500, 'Database connection not possible due to a configuration error.');
    }
}
