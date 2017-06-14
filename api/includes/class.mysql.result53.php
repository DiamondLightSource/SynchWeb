<?php

    function mysql_result53($stmt) {
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
                // $c[strtoupper($key)] = $val === null ? null : strval($val);
                $c[strtoupper($key)] = $val;
            }
            // foreach ($row as $key => $val) $c[strtoupper($key)] = $val;// === null ? null : strval($val);
            $data[] = $c;
        }

        return $data;
    }
