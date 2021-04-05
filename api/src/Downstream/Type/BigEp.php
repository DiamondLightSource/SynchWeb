<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class big_ep extends DownstreamPlugin {
    var $friendlyname = "BigEP";

    function results() {
        // $files = $this->_get_attachments();
        // print_r(array($this->type, $files));
        $settings = $this->_get_attachments('big_ep_settings.json');
        if ($settings) {
            if (file_exists($settings['FILE'])) {
                $json_str = file_get_contents($settings['FILE']);
                $dat = array();
                $dat['SETTINGS'] = json_decode($json_str, true);

                $results = new DownstreamResult($this);
                $results->data = $dat;

                return $results;
            }
        }
    }
}
