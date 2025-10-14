<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class Dimple extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'Dimple';
    var $has_mapmodel = array(1, 2);

    var $_mrrun;

    function _get_blobs() {
        return $this->db->pq(
            "SELECT view1, view2, view3, filepath 
            FROM mxmrrunblob
            WHERE mxmrrunid = :1
            AND filepath is not NULL",
            array($this->_mrrun["MXMRRUNID"])
        );
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

    function results() {
        if (!$this->_find_mrrun()) {
            return;
        }

        $lfs = $this->_get_attachments(null, null, 'refmac5_restr.log');
        if (sizeof($lfs)) {
            $lf = $lfs[0]['FILE'];
        } else {
            $lf = '';
        }

        $dat = array();

        $blobs = $this->_get_blobs();
        $blob_count = 0;
        foreach ($blobs as $blob) {
            if (
                file_exists(
                    $blob['FILEPATH']. '/' . $blob['VIEW1']
                )
            ) {
                $blob_count++;
            }
        }

        $dat['BLOBS'] = $blob_count;
        $dat['STATS'] = array();
        $dat['PLOTS'] = array();
        $dat['PKLIST'] = array();

        $integrator = $this->_lookup_autoproc(
            null,
            $this->process['PARAMETERS']['scaling_id']
        );
        if ($integrator) {
            $dat['PARENTAUTOPROCPROGRAM'] = $integrator['PROCESSINGPROGRAMS'];
            $dat['PARENTAUTOPROCPROGRAMID'] = $integrator['AUTOPROCPROGRAMID'];
        }

        if (file_exists($lf)) {
            list($plts, $stats) = $this->_parse_ccp4_log(
                file_get_contents($lf)
            );

            $peaks = $this->_get_attachments(null, null, 'find-blobs.log');
            $pklist = array();
            if (sizeof($peaks)) {
                $pk = $peaks[0]['FILE'];
                if (file_exists($pk)) {
                    $pks = explode("\n", file_get_contents($pk));
                    foreach ($pks as $p) {
                        if (strpos($p, '#') === 0) {
                            array_push($pklist, array(
                                floatval(substr($p, 40, 7)),
                                floatval(substr($p, 48, 7)),
                                floatval(substr($p, 56, 7)),
                                floatval(substr($p, 29, 5)),
                            ));
                        }
                    }
                }
            }

            if (sizeof($stats) > 0) {
                array_unshift($stats[0], 'Parameter');
            }
            $dat['STATS'] = $stats;
            $dat['PLOTS'] = $plts;
            $dat['PKLIST'] = $pklist;
        }

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function images($n = 0) {
        if (!$this->_find_mrrun()) {
            return;
        }

        $blobs = $this->_get_blobs();
        if (sizeof($blobs)) {
            $views = array("VIEW1", "VIEW2", "VIEW3");
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

        if ($map) {
            $mtz = $this->_get_attachments('final.mtz');
            if (!$mtz) {
                return;
            }

            return $this->convert_mtz(
                $mtz['FILE'],
                $this->autoprocprogramid,
                $this->type,
                $pdb['FILE'],
                $map
            );
        } else {
            return $pdb['FILE'];
        }
    }
}
