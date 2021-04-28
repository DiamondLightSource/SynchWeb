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
            "SELECT view1, view2, view3 
            FROM mxmrrunblob
            WHERE mxmrrunid = :1",
            array($this->_mrrun["MXMRRUNID"])
        );
    }

    # This will break if dimple is run more than once on the same scalingid
    # TODO: Change structure of MXMRRun to link to autoprocprogram
    # https://jira.diamond.ac.uk/browse/SCI-7941
    function _find_mrrun() {
        if (!array_key_exists("scaling_id", $this->process['PARAMETERS'])) {
            return;
        }

        $mrrun = $this->db->pq(
            "SELECT mxmrrunid, success, message, inputcoordfile, rundirectory, logfile, 
            rvaluestart, rvalueend, rfreevaluestart, rfreevalueend
            FROM mxmrrun 
            WHERE autoprocscalingid=:1",
            array($this->process['PARAMETERS']["scaling_id"])
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
            if (file_exists($this->_mrrun['RUNDIRECTORY'] . $blob['VIEW1'])) {
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
            if ($n < sizeof($blobs)) {
                return $this->_mrrun['RUNDIRECTORY'] .
                    '/' .
                    $blobs[$n]["VIEW1"];
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
