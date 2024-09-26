<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class MetalId extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'MetalId';
    var $has_mapmodel = array(1, 0);

    function results() {
        $log = $this->_get_attachments('metal_id.log');
        $headings = array('Peak', 'Height', 'RMSD', 'XYZ');
        $peaks = array($headings);
        if ($log) {
            $log_contents = file_get_contents($log['FILE']);
            $rows = explode('\n', $log_contents);
            $pattern = '/\s*(\d+) dv: ([\d.]+) n-rmsd: ([\d.]+) xyz = (\(.*\))/';
            foreach($rows as $row => $data) {
                preg_match($pattern, $data, $matches);
                if ($matches) {
                    array_shift($matches);
                    $matches[0] += 1; // start with peak 1
                    array_push($peaks, $matches);
                }
            }
        } else {
            $matches = array('No peaks found');
            array_push($peaks, $matches);
        }

        $dat = array();
        $dat['BLOBS'] = 1;
        $dat['PEAKS'] = $peaks;

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function images($n = 0) {
        $png = $this->_get_attachments(null, null, '.png');
        if ($png) {
            return $png[$n]['FILE'];
        } else {
            return '';
        }
    }

    function mapmodel($n = 0, $map = false) {
        $pdb = $this->_get_attachments('final.pdb');
        if (!$pdb) {
            return;
        } else {
            return $pdb['FILE'];
        }
    }
}
