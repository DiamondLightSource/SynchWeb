<?php


namespace SynchWeb;

class Utils
{
    public static function getValueOrDefault($value, $default = false)
    {
        return (isset($value)) ? $value : $default;
    }
}
