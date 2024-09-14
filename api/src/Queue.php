<?php

namespace SynchWeb;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class Queue
{
    private $host, $port, $username, $password, $vhost;

    function __construct($host, $port, $username, $password, $vhost)
    {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->vhost = $vhost;
    }

    function send(array $message, $routing_key)
    {
        $connection = new AMQPStreamConnection($this->host, $this->port, $this->username, $this->password, $this->vhost);
        $channel = $connection->channel();

        $msg = new AMQPMessage(
            json_encode($message, JSON_UNESCAPED_SLASHES)
        );

        $channel->basic_publish($msg, null, $routing_key);

        $channel->close();
        $connection->close();
    }
}
