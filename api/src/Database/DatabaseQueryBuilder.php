<?php

namespace SynchWeb\Database;

use SynchWeb\Database\DatabaseParent;

/**
 * Database query helper to help split up scripts in to their parts. It automatically keeps track of bound parameters.
 * There is no sql injection checking so make sure everything, apart from bound variables are safe.
 * 
 * Usege: to update the database
 * (new DatabaseQueryBuilder($db))
 *     ->patch("FAMILYNAME", $familyName)
 *     ->patch("GIVENNAME", $givenName)
 *     ->where("personid", $personId)
 *     ->update("person");
 * runs $db->pq(UPDATE person SET FAMILYNAME=:1, GIVENNAME=:2 WHERE personid=:3, array($familyName, $givenName, $personid))
 */
class DatabaseQueryBuilder
{
    /** @var array values in update statement*/
    private $update_values = [];
    /** @var array bound values*/
    private $query_bound_values = [];
    /** @var ?string where clause column name */
    private $where_columnName = Null;
    /** @var ?mixed where vlause value */
    private $where_value = Null;
    /**
     * @var DatabaseParent database parent to use
     */
    private $db;

    public function __construct(DatabaseParent $db) {
        $this->db = $db;
    }

    /**
     * Patch paramters, values to set in an update but they are only added if they are not null
     * to enable records to be patched.
     * 
     * @param string $columnName the db column name
     * @param mixed $value the value to set it to
     * @return DatabaseQueryBuilder this to make a fluent interface
     */
    public function patch($columnName, $value) 
    {
        if (is_null($value)) {
            return $this;
        }
        $this->update_values[$columnName] = $value;

      return $this;
    }

    /**
     * Add a where caluse based on an id
     * 
     * @param string $columnName The column name of the identity
     * @param mixed $value The value for the identity, i.e. which return to update
     * @return DatabaseQueryBuilder this to make a fluent interface
     */
    public function whereIdEquals($columnName, $value) {
        $this->where_columnName  = $columnName;
        $this->where_value = $value;
        return $this;
    }

    /**
     * Run the update if any patch parameters have been set 
     * 
     * @param string $expectedTable Table name
     */
    public function update($expectedTable) {

        if (sizeof($this->update_values) < 1) 
            return null;
        $set = $this->bindArray($this->update_values);

        $where = $this->where_columnName . "=:" . $this->addBoundVariable($this->where_value);

        return $this->db->pq("UPDATE {$expectedTable} SET {$set} WHERE {$where}", $this->query_bound_values);
    }

    private function bindArray($values)
    {
        $bound_list_sql = "";
        foreach ($values as $fieldname => $fieldvalue){
            $bound_list_sql .= ", {$fieldname}=:" . $this->addBoundVariable($fieldvalue);
        }
        return substr($bound_list_sql, 2); // remove first comma
    }

    private function addBoundVariable($value)
    {
        array_push($this->query_bound_values, $value);
        return sizeof($this->query_bound_values);
    }

}
