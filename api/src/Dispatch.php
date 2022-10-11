<?php

namespace SynchWeb;

use Slim\Slim;

class Dispatch
{
    protected $app, $db, $user;

    function __construct(Slim $app, $db, $user)
    {
        $this->app = $app;
        $this->db = $db;
        $this->user = $user;
    }

    // Generate routes for Slim
    function dispatch()
    {
        $app = $this->app;
        $db = $this->db;
        $user = $this->user;

        // Get names of all files in pages directory
        foreach (glob(__DIR__ . '/Page/*.php') as $file_path) {

            // Determine class name from file path
            $class_name = basename($file_path, '.php');

            // Determine routes for each class, where base URL is /
            $app->group('/' . strtolower($class_name), function () use ($app, $db, $user, $class_name) {
                $full_class_name = 'SynchWeb\\Page\\' . $class_name;

                // Instantiate each class if class has been defined
                // This merges the routes from all classes
                if (class_exists($full_class_name)) {
                    new $full_class_name($app, $db, $user);
                }
            });
        }

        $this->app->notFound(function () use ($app) {
            $app->halt(404, json_encode(array('status' => 404, 'message' => 'not found')));
        });

        $app->run();
    }
}