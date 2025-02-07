<?php

namespace SynchWeb;

use InvalidArgumentException;

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

    /**
     * Generate a random 32 hex md5 string from a random byteString. Utilises openssl_random_pseudo_bytes under the hood.
     * @uses [open_ssl_random_pseudo_bytes](https://www.php.net/manual/en/function.openssl-random-pseudo-bytes.php)
     * @param int $length = 13 Specify the bytes of the random val. defaults to 13 as per uniqID(). This is likely enough for most uses.
     * @return string
     * @throws InvalidArgumentException if $length <= 0 
     * @throws \Exception if openSSL fails
     */
    public static function generateRandomMd5(int $length = 13):  string {
        if ($length <= 0) throw new InvalidArgumentException('byteLength must be > 0');
        $bytes = openssl_random_pseudo_bytes($length);
        return md5(bin2hex($bytes));
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
        return preg_replace('/(&|\?)'.preg_quote($param).'=[^&]*&/', '$1', $redirect_url);
    }
}
