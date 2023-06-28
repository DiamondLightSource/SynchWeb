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

    public static function shouldLogUserActivityToDB($loginId): bool
    {
        global $log_activity_to_ispyb;
        $log_activity = isset($log_activity_to_ispyb) ? $log_activity_to_ispyb : true;

        return $log_activity && $loginId;
    }

    public static function getValueOrDefault($value, $default = false)
    {
        return (isset($value)) ? $value : $default;
    }

    public static function filterParamFromUrl($url, $param): string
    {
        // Removes search parameter from URL and returns encoded URL
        $redirect_url = preg_replace('/(&|\?)'.preg_quote($param).'=[^&]*$/', '', $url);
        return urlencode(preg_replace('/(&|\?)'.preg_quote($param).'=[^&]*&/', '$1', $redirect_url));
    }
}
