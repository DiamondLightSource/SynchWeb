<?php

use Stomp\Stomp;
use Stomp\Exception\StompException;

class Queue
{
    function __construct()
    {
        global $loader;
        $loader->addNamespace('Stomp', __DIR__ . '/../../lib/Stomp');
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
