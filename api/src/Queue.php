<?php

namespace SynchWeb;

use Stomp\Exception\StompException;
use Stomp\Stomp;

class Queue
{
    private $server, $username, $password;

    function __construct($server, $username, $password)
    {
        $this->server = $server;
        $this->username = $username;
        $this->password = $password;
    }

    function send($queue, array $message, $persistent = false)
    {
        try {
            $connection = new Stomp($this->server);

            $connection->connect($this->username, $this->password);

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
