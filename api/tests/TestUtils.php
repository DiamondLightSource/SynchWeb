<?php

namespace Tests;

/**
 * Selection of utilities to help testing
 */
class TestUtils
{

    /**
     * Use the statment mock to return results
     * @param stmtStub Statement stub that prepare executes
     * @param returnRows array of rows, a row is an array with key/value paits for the return values
     *                     NB keys should probably be upper case
     */
    static public function mockDBReturnsResult($stmtStub, $returnRows){

        $stmtStub->method('get_result')->willReturn(new MockTestResult($returnRows)); 
    }
    
}

/**
 * Class to help with returning mock results from sql
 */
class MockTestResult
{
    public $num_rows;
    private $returnRows;
    private $row_index = -1;
    function __construct($returnRows){
        $this->returnRows = $returnRows;
        $this->num_rows = $returnRows? count($returnRows) : 0;
    }

    function fetch_assoc() {
        
        $this->row_index++;
        if ($this->row_index < $this->num_rows) {
            return $this->returnRows[$this->row_index];            
        }
        return null;
        
    }
}