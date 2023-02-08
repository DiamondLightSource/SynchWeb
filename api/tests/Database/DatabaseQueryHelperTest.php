<?php

namespace SynchWeb\Database;

use PHPUnit\Framework\TestCase;
use SynchWeb\Database\DatabaseParent;
use SynchWeb\Database\DatabaseQueryBuilder;

final class DatabaseHelperTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private function create_database_helper($fields, $expected_id_value, $expected_sql) 
    {
        $expected_values = [];
        foreach($fields as $field){
            if (!is_null($field[1])) 
                array_push($expected_values, $field[1]);
        }
        array_push($expected_values, $expected_id_value);


        $db = $this->getMockForAbstractClass(DatabaseParent::class, [""]);

        if ($expected_sql) 
        {
            $db->expects($this->once())
                ->method('pq')
                ->with(
                    $this->equalTo($expected_sql), 
                    $this->equalTo($expected_values)
                );
        } else {
            $db->expects($this->never())
                ->method('pq');
        }

        return new DatabaseQueryBuilder($db);
    }

    public function testForASingleSetWithIDDBUpdateIsCorrect()
    {
        $expected_table = "table";

        $fields = [["fieldname", "value"]];
        $expected_id_name = "id";
        $expected_id_value = 3;

        $expected_sql = "UPDATE {$expected_table} SET {$fields[0][0]}=:1 WHERE {$expected_id_name}=:2";

        $dbh = $this->create_database_helper($fields, $expected_id_value, $expected_sql);
        foreach ($fields as $field) {
            $dbh->patch($field[0], $field[1]);
        }
        $dbh->whereIdEquals($expected_id_name, $expected_id_value)
            ->update($expected_table);
    }

    public function testForASingleDoubleSetWithIDDBUpdateIsCorrect()
    {
        $expected_table = "table2";

        $fields = [["fieldname", "value"],
                   ["fieldname2", 32]];
        $expected_id_name = "id";
        $expected_id_value = 3;

        $expected_sql = "UPDATE {$expected_table} SET {$fields[0][0]}=:1, {$fields[1][0]}=:2 WHERE {$expected_id_name}=:3";

        $dbh = $this->create_database_helper($fields, $expected_id_value, $expected_sql);
        foreach ($fields as $field) {
            $dbh->patch($field[0], $field[1]);
        }
        $dbh->whereIdEquals($expected_id_name, $expected_id_value)
            ->update($expected_table);
    }

    public function testForANullPatchValueValueIsNotSetInDBandFluentInterfaceForPatch()
    {
        $expected_table = "table2";

        $fields = [["fieldname", "value"],
                   ["null_field", null],
                   ["fieldname2", 32]];
        $expected_id_name = "id";
        $expected_id_value = 3;

        $expected_sql = "UPDATE {$expected_table} SET {$fields[0][0]}=:1, {$fields[2][0]}=:2 WHERE {$expected_id_name}=:3";

        $dbh = $this->create_database_helper($fields, $expected_id_value, $expected_sql);
        foreach ($fields as $field) {
            $dbh = $dbh->patch($field[0], $field[1]);
        }
        $dbh->whereIdEquals($expected_id_name, $expected_id_value)
            ->update($expected_table);
    }

    public function testWithNoFieldsNoDatabasepushIsDone()
    {
        $expected_table = "table2";

        $fields = [];
        $expected_id_name = "id";
        $expected_id_value = 3;

        $dbh = $this->create_database_helper($fields, $expected_id_value, null);
        $dbh->whereIdEquals($expected_id_name, $expected_id_value)
            ->update($expected_table);
    }

}
