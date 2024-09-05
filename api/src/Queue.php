<?php

namespace SynchWeb;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class Queue
{
    private $host, $port, $username, $password;

    function __construct($host, $port, $username, $password)
    {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
    }

    function send($vhost, array $message)
    {
        try {
            $connection = new AMQPStreamConnection($this->host, $this->port, $this->username, $this->password);
            $channel = $connection->channel();

            $msg = new AMQPMessage(
                json_encode($message, JSON_UNESCAPED_SLASHES)
            );

            $channel->basic_publish($msg, '', $vhost);

            $channel->close();
            $connection->close();
        } catch (AMQPException $e) {
            /** @noinspection PhpUnhandledExceptionInspection */

            throw $e;
        }
    }
}
