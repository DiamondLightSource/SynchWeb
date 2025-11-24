<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class MetalId extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'Metal Id';
    var $has_mapmodel = array(0, 0);
    var $_mrrun;

    function results() {
        $blobs = $this->_get_blobs();
        if (sizeof($blobs)) {
            $headings = array('Peak', 'Height', 'XYZ');
        } else {
            $headings = array('No peaks found');
        }
        $peaks = array($headings);
        foreach($blobs as $n => $blob) {
            $peak = array($n+1, $blob['HEIGHT'], '('.$blob['X'].', '.$blob['Y'].', '.$blob['Z'].')');
            array_push($peaks, $peak);
        }
        $dat = array();
        $dat['BLOBS'] = sizeof($blobs);
        $dat['PEAKS'] = $peaks;

        $integrator = $this->_lookup_autoproc(
            null,
            $this->process['PARAMETERS']['scaling_id']
        );
        if ($integrator) {
            $dat['PARENTAUTOPROCPROGRAM'] = $integrator['PROCESSINGPROGRAMS'];
            $dat['PARENTAUTOPROCPROGRAMID'] = $integrator['AUTOPROCPROGRAMID'];
        }

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
        if (!$this->_find_mrrun()) {
            return array();
        }
        return $this->db->pq(
            "SELECT view1, filepath, x, y, z, height
            FROM mxmrrunblob
            WHERE mxmrrunid = :1
            AND filepath is not NULL",
            array($this->_mrrun["MXMRRUNID"])
        );
    }

    function images($n = 0) {
        $blobs = $this->_get_blobs();
        if ($n < sizeof($blobs)) {
            return $blobs[$n]["FILEPATH"] . '/' . $blobs[$n]["VIEW1"];
        }
    }
}
