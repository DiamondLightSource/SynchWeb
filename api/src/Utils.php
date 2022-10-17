<?php

namespace SynchWeb;

class Utils
{
    public static $exitOnError = true;

    public static function returnError($title, $msg)
    {
        header('HTTP/1.1 503 Service Unavailable');
        print json_encode(array('title' => $title, 'msg' => $msg));
        error_log('Database Error: ' . $msg);

        if (Utils::$exitOnError) {
            exit();
        }
    }
}