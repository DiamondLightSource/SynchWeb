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

    private function setupControllerClasses($filesWildCard, $app, $db, $user, $namespaceName)
    {

        // Get names of all files in pages directory
        foreach (glob(__DIR__ . $filesWildCard) as $file_path)
        {

            // Determine class name from file path
            $class_name = basename($file_path, '.php');

            // Determine routes for each class, where base URL is /
            $app->group('/' . strtolower($class_name), function () use ($app, $db, $user, $class_name, $namespaceName)
            {
                $full_class_name = $namespaceName . $class_name;
                if (class_exists($full_class_name))
                {
                    new $full_class_name($app, $db, $user);
                }
            });
        }

    }

    // Generate routes for Slim
    function dispatch()
    {
        $app = $this->app;
        $db = $this->db;
        $user = $this->user;
        $this->setupControllerClasses('/Page/*.php', $app, $db, $user, 'SynchWeb\\Page\\');

        // add specific routes which break the old convention
        $app->group('/users', function () use ($app)
        {
            $app->container['userController'];
        });

        $app->group('/assign', function () use ($app)
        {
            $app->container['assignController'];
        });

        $app->group('/cal', function () use ($app)
        {
            $app->container['calendarController'];
        });

        $this->app->notFound(function () use ($app)
        {
            $app->halt(404, json_encode(array('status' => 404, 'message' => 'not found')));
        });

        $app->run();
    }
}