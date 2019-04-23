<?php

use Stomp\Stomp;
use Stomp\Exception\StompException;

class Queue
{
    function __construct()
    {
        global $loader;
        // Correct path to Stomp library i.e. as installed by Composer.
        // $loader->addNamespace('Stomp', __DIR__ . '/../../lib/Stomp');

        // Revert to legacy path i.e. as manually downloaded from GitHub.
        $loader->addNamespace('Stomp',  dirname(__FILE__).'/../../lib/stomp-php/src/Stomp');
    }

    function send($server, $username, $password, $queue, array $message, $persistent = false)
    {
        try {
            $connection = new Stomp($server);

            $connection->connect($username, $password);

            $connection->send(
                $queue,
                json_encode($message, JSON_UNESCAPED_SLASHES),
                array(
                    'persistent' => ($persistent === true)
                )
            );

            $connection->disconnect();
        } catch (StompException $e) {
            /** @noinspection PhpUnhandledExceptionInspection */

            throw $e;
        }
    }
}
