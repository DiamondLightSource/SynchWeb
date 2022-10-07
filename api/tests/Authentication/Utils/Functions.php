<?php declare(strict_types=1);

namespace SynchWeb\Authentication;

// This class overrides the use of header() allowing code which uses this to be tested (it will fail if called again)
// - and for the contents of the headers to be tested.
abstract class Output
{
    public static $headers = array();
    public static $body;

    public static function reset()
    {
        self::$headers = array();
        self::$body = null;
    }
}

function headers_sent()
{
    return false;
}

function header($value)
{
    Output::$headers[] = $value;
}

function printf($text)
{
    Output::$body .= $text;
}