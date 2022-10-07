<?php

namespace SynchWeb;

class Database
{

    // Array of database types and corresponding database class names.
    // Value is class name in SynchWeb\Database\Type namespace.
    // Key is lower case representation of class name.
    static $database_types = array(
        'mysql' => 'MySQL'
    );

    public static function get()
    {
        global $dbtype, $isb, $app;

        // Global variable is named $dbtype in config.php.
        $database_type = $dbtype;

        if (!$database_type) {
            error_log('Database type variable, dbtype, is not specified in config.php - defaulting to MySql.');

            $database_type = 'MySQL';
        }

        // Determine fully-qualified class name of database class corresponding to $database_type.
        if (key_exists(strtolower($database_type), Database::$database_types)) {
            $dbClassName = Database::$database_types[strtolower($database_type)];

            $full_class_name = 'SynchWeb\\Database\\Type\\'.$dbClassName;
            
            if (class_exists($full_class_name)) {
                $port = array_key_exists('port', $isb) ? $isb['port'] : null;

                // Return instance of database class.    
                return new $full_class_name($app, $isb['user'], $isb['pass'], $isb['db'], $port);
            } else {
                error_log("Database class '$full_class_name' does not exist.");
            }
    
        } else {
            error_log("Database type '$database_type' not configured.");
        }
    }
}
