<?php

// 1. The Polyfill for CI/CLI environments
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$name] = $value;
            }
        }
        return $headers;
    }
}

// 2. Ensure your Composer autoloader is still loaded
// Since we are in /tests, we go up one level to /api/vendor
require_once __DIR__ . '/../vendor/autoload.php';
