<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class Mrbump extends DownstreamPlugin {
    var $friendlyname = "MrBUMP";
    var $has_mapmodel = array(1, 2);

    function results() {
        $log = $this->_get_attachments(null, "Log");
        if (sizeof($log)) {
            $log = $log[0];

            if (file_exists($log["FILE"])) {
                $dat = array();

                $integrator = $this->_lookup_autoproc(
                    null,
                    $this->process['PARAMETERS']['scaling_id']
                );
                if ($integrator) {
                    $dat['PARENTAUTOPROCPROGRAM'] =
                        $integrator['PROCESSINGPROGRAMS'];
                    $dat['PARENTAUTOPROCPROGRAMID'] =
                        $integrator['AUTOPROCPROGRAMID'];
                }

                list($plots, $stats) = $this->_parse_ccp4_log(
                    file_get_contents($log["FILE"])
                );
                $dat['PLOTS'] = $plots;
                $dat['STATS'] = $stats;

                $results = new DownstreamResult($this);
                $results->data = $dat;

                return $results;
            }
        }
    }

    function mapmodel($n = 0, $map = false) {
        $pdb = $this->_get_attachments('PostMRRefine.pdb');
        if (!$pdb) {
            return;
        }

        if ($map) {
            $mtz = $this->_get_attachments('PostMRRefine.mtz');
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
