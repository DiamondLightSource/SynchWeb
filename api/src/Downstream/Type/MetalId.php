<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class MetalId extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'MetalId';
    var $has_mapmodel = array(1, 0);
    var $_mrrun;

    function results() {
        // TODO - Get values from MXMRRunBlob table rather than log file
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

    function _find_mrrun() {
        $mrrun = $this->db->pq(
            "SELECT m.mxmrrunid
            FROM mxmrrun m
            WHERE m.autoprocprogramid=:1",
            array($this->autoprocprogramid)
        );

        if (!sizeof($mrrun)) {
            return;
        }

        $this->_mrrun = $mrrun[0];
        return true;
    }

    function _get_blobs() {
        return $this->db->pq(
            "SELECT view1, filepath
            FROM mxmrrunblob
            WHERE mxmrrunid = :1
            AND filepath is not NULL",
            array($this->_mrrun["MXMRRUNID"])
        );
    }


    function images($n = 0) {
        if (!$this->_find_mrrun()) {
            return;
        }

        $blobs = $this->_get_blobs();
        if (sizeof($blobs)) {
            $views = array("VIEW1");
            if ($n < sizeof($views)) {
                return $blobs[0]["FILEPATH"] .
                    '/' .
                    $blobs[0][$views[$n]];
            }
        }
    }


    function mapmodel($n = 0, $map = false) {
        $pdb = $this->_get_attachments('final.pdb');
        if (!$pdb) {
            return;
        }
        if (true) {
            $mtz = $this->_get_attachments('diff.map');
            if (!$mtz) {
                return;
            }
            return $mtz['FILE'];
        } else {
            return $pdb['FILE'];
        }
    }
}
