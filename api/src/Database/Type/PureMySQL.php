<?php

namespace SynchWeb\Database\Type;

use SqlFormatter;
use SynchWeb\Database\DatabaseParent;

class MySQL extends DatabaseParent {
    /** @var string */
    protected $type = 'mysql';
    /** @var string */
    private $lastQuery = ''; // provide a way of retrieving the last query run - by storing the data - can then call getLastQuery() - primarily for testing
    /** @var array */
    private $lastArgs = array();
    /** @var bool */
    private $transaction = False;
    /** @var int */
    private $errors = 0;


    function __construct($conn)
    {
        parent::__construct($conn);

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // throw exceptions.

        if (mysqli_connect_errno())
        {
            $this->error('There was an error connecting to MySQL: ', htmlentities(mysqli_connect_errno()));
        }
    }

    // wsrep_sync_wait waits for cluster replication on a mariadb cluster
    function wait_rep_sync($state = false)
    {
        # Empty - DatabaseFactory checks this exists
    }

    function start_transaction()
    {
        $this->transaction = True;
        $this->conn->autocommit(False);
    }

    function end_transaction()
    {
        if ($this->errors > 0)
            $this->conn->rollback();
        else
            $this->conn->commit();

        $this->conn->autocommit(True);
        $this->transaction = False;

        if ($this->errors > 0)
            $this->error('There was an error with MySQL', $this->conn->error . __LINE__);
        $this->errors = 0;
    }

    function paginate($query, $args = array())
    {
        // MySQL is Limit Start Row, Number
        // Oracle subselect is Start Row, End Row
        if (sizeof($args))
            $args[sizeof($args) - 1] = $args[sizeof($args) - 1] - $args[sizeof($args) - 2];
        return $this->pq("$query LIMIT ?,?", $args);
    }



    // return the last SQL query executed in fully expanded form (i.e. including binded params) - this is mainly for testing purposes (so ideally would not be part of the actual class...)
    function getLastQuery()
    {
        echo '<br/>';
        $sql = $this->lastQuery;
        for ($i = 1; $i < count($this->lastArgs); $i++)
        {
            $val = $this->lastArgs[$i];
            if (is_string($val))
            {
                $val = "'" . $val . "'";
            }
            else if (is_null($val))
            {
                $val = 'null';
            }
            $sql = preg_replace('/\?/', $val, $sql, 1);
        }
        $sql = preg_replace('/\\n/', '', $sql); // replace newlines
        return preg_replace('/\s\s+/', ' ', $sql); // remove excess spaces
    }

    function pq($query, $args = array(), $upperCaseKeys = true)
    {
        list($query, $args) = $this->oracle2mysql($query, $args);
        $query = $this->tablelookup($query);

        if ($this->debug)
        {
            print '<h1 class="debug">MySQL Debug</h1>';
            print SqlFormatter::format($query);
            echo '<br/>';
        }

        $stmt = $this->conn->prepare($query);

        if (!$stmt)
        {
            if ($this->transaction)
                $this->errors++;
            else
            {
                $err = mysqli_error($this->conn);
                $this->error('There was an error with MySQL', $err);
                return;
            }
        }

        if (sizeof($args))
        {
            $vtypes = array('NULL' => 'i', 'integer' => 'i', 'double' => 'd', 'string' => 's');

            $strfs = '';
            foreach ($args as $a)
            {
                $t = gettype($a);
                $strfs .= $vtypes[$t];
            }

            array_unshift($args, $strfs);
            call_user_func_array(array(&$stmt, 'bind_param'), $this->refs($args));
        }

        $this->lastQuery = $query;
        $this->lastArgs = $args;
        if ($this->debug)
        {
            print_r("Full SQL query: " . $this->getLastQuery());
        }

        if (!$stmt->execute())
        {
            if ($this->transaction)
                $this->errors++;
            else
            {
                $err = mysqli_error($this->conn);
                $this->error('There was an error with MySQL', $err);
                return;
            }
        }

        $data = array();
        if (strpos($query, 'SELECT') !== false)
        {
            $result = $stmt->get_result();
            if ($result)
            {
                if ($result->num_rows > 0)
                {
                    while ($row = $result->fetch_assoc())
                    {
                        $c = array();
                        // oracle inheritance ;(
                        foreach ($row as $key => $val)
                        {
                            if ($val !== null)
                            {
                                if (gettype($val) == gettype(0.1))
                                    $val = round($val, 5);
                                $val = strval($val);
                            }
                            if ($upperCaseKeys)
                            {
                                $key = strtoupper($key);
                            }
                            $c[$key] = $val;
                        }
                        array_push($data, $c);
                    }
                }
            }
        }

        if ($this->debug)
        {
            echo '<br/>';
            print_r('row count: ' . sizeof($data));
            echo '<br/>';
        }

        // Need mysqlnd for this :(
        // $result = $stmt->get_result();

        // $data = array();

        // if ($result) {
        //     if($result->num_rows > 0) {
        //         while($row = $result->fetch_assoc()) {
        //             array_push($data, array_change_key_case($row, CASE_UPPER));
        //         }
        //     }
        // }

        $stmt->close();

        return $data;
    }

    // Union multiple queries that take the same arguments and return the same columns
    // Query can optionally be wrapped, where :QUERY will be replaced with the inner query:
    //  $wrapper = 'SELECT * FROM (:QUERY) GROUP BY id';
    function union($queries, $args, $all = false, $wrapper = null)
    {
        $nargs = sizeof($args);
        $all_args = array();
        $union_kw = $all ? 'UNION ALL' : 'UNION';
        foreach ($queries as $i => &$query)
        {
            $offset = $i * $nargs;
            $query = preg_replace_callback('/\:(\d+)/',
                function ($mat) use ($offset)
                {
                    return ':' . (intval($mat[1]) + $offset);
                },
                $query);
            $all_args = array_merge($all_args, $args);
        }

        $union = implode("\n$union_kw\n", $queries);
        if ($wrapper)
        {
            $union = preg_replace('/:QUERY/', $union, $wrapper);
        }

        return $this->pq($union, $all_args);
    }

    private function refs($arr)
    {
        $refs = array();
        foreach ($arr as $key => $value)
        {
            $refs[$key] = & $arr[$key];
        }
        return $refs;
    }

    function read($field)
    {
        return $field;
    }

    function id()
    {
        return mysqli_insert_id($this->conn);
    }

    function close()
    {
        if ($this->conn)
            $this->conn->close();
    }   
}