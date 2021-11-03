<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Queue;

trait Zocalo
{
    private function zocaloEnqueue($zocalo_queue, $zocalo_message)
    {
        global $zocalo_server, $zocalo_username, $zocalo_password;

        if (empty($zocalo_server) || empty($zocalo_queue)) {
            $message = 'Zocalo server not specified.';
            error_log($message);
            $this->_error($message, 500);
        }

        try {
            $queue = new Queue($zocalo_server, $zocalo_username, $zocalo_password);
            $queue->send($zocalo_queue, $zocalo_message, true, $this->user->login);
        } catch (Exception $e) {
            $this->_error($e->getMessage(), 500);
        }
    }
}
