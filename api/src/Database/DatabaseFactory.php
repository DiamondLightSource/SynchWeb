<?php

namespace SynchWeb\Database;

class DatabaseFactory
{

    // Array of database types and corresponding database class names.
    // Value is class name in SynchWeb\Database\Type namespace.
    // Key is lower case representation of class name.
    public $database_types = array(
        'mysql' => 'MySQL'
    );

    function __construct($databaseConnectionFactory)
    {
        $this->databaseConnectionFactory = $databaseConnectionFactory;
    }

    private $databaseConnectionFactory;

    public function get()
    {
        // Global variable is named $dbtype in config.php.
        global $dbtype;
        $database_type = $dbtype;

        if (!$database_type) {
            error_log('Database type variable, dbtype, is not specified in config.php - defaulting to MySql.');
            $database_type = 'MySQL';
        }

        // Determine fully-qualified class name of database class corresponding to $database_type.
        if (key_exists(strtolower($database_type), $this->database_types)) {
            $dbClassName = $this->database_types[strtolower($database_type)];

            $full_class_name = 'SynchWeb\\Database\\Type\\' . $dbClassName;

            if (class_exists($full_class_name)) {
                $conn = $this->databaseConnectionFactory->get($dbClassName);
                return new $full_class_name($conn);
            }
            else {
                error_log("Database class '$full_class_name' does not exist.");
            }

        }
        else {
            error_log("Database type '$database_type' not configured.");
        }
    }
}