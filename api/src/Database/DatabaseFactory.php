<?php

namespace SynchWeb\Database;

class DatabaseFactory
{

    // Array of database types and corresponding database class names.
    // Value is class name in SynchWeb\Database\Type namespace.
    // Key is lower case representation of class name.
    public $database_types = array(
        'mysql' => ["dbClassName" =>'MySQL', "dataConnectionName" => 'MySQL'],
        'summary' => ["dbClassName" =>'PureMySQL', "dataConnectionName" => 'PureMySQL']
    );

    function __construct($databaseConnectionFactory)
    {
        $this->databaseConnectionFactory = $databaseConnectionFactory;
    }

    private $databaseConnectionFactory;

    public function get($databaseType = null)
    {   
        if ( $databaseType == null) {
            // Global variable is named $dbtype in config.php.
            global $dbtype;
            $databaseType = $dbtype;
        }

        if (!$databaseType) {
            error_log('Database type variable, dbtype, is not specified in config.php - defaulting to MySql.');
            $database_type = 'MySQL';
        }

        // Determine fully-qualified class name of database class corresponding to $database_type.
        if (key_exists(strtolower($databaseType), $this->database_types)) {
            $dbType = $this->database_types[strtolower($databaseType)];

            $full_class_name = 'SynchWeb\\Database\\Type\\' . $dbType["dbClassName"];;

            if (class_exists($full_class_name)) {
                $conn = $this->databaseConnectionFactory->get($dbType["dataConnectionName"]);
                return new $full_class_name($conn);
            }
            else {
                error_log("Database class '$full_class_name' does not exist.");
            }

        }
        else {
            error_log("Database type '$databaseType' not configured.");
        }
        return null;
    }
}