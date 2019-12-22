<?php

namespace SynchWeb\Database\Type;

class Result53 {

    function invoke($stmt) {
        $params = array();
        $row = array();
        $meta = $stmt->result_metadata();
        while ($field = $meta->fetch_field()) {
            array_push($params, &$row[$field->name]);
        }
        call_user_func_array(array($stmt, 'bind_result'), $params);
        $data = array();
        while ($stmt->fetch()) {
            $c = array();
            // Oracle returns all values as strings - Need to be consistent :(
            foreach ($row as $key => $val) {
                if ($val !== null) {
                    if (gettype($val) == gettype(0.1)) $val = round($val, 5);
                    $val = strval($val);
                }
                $c[strtoupper($key)] = $val;
            }
            $data[] = $c;
        }
        return $data;
    }

}
