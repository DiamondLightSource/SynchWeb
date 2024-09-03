<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class Shelxt extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'Shelxt';
    var $has_mapmodel = array(1, 0);

    function _get_shelxt_results_json() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filePath from autoprocprogramattachment app where autoprocprogramid = :1 and filename = 'shelxt_results.json' ", 
            $appid
        );
        return $filepath;
    }

    function _get_shelxt_results_png() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filepath, app.filename from autoprocprogramattachment app where autoprocprogramid = :1 and filename like '%.png%' ", 
            $appid
        );
        return $filepath;
    }

    function _get_pdb() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filepath, app.filename from autoprocprogramattachment app where autoprocprogramid = :1 and filename like '%.pdb%' ", 
            $appid
        );
        if (sizeof($filepath)) {
            return $filepath[0]["FILEPATH"] . "/" . $filepath[0]["FILENAME"];
        } else {
            return;
        }
    }

    function results() {
        $json_filepath = $this->_get_shelxt_results_json();
        if (sizeof($json_filepath)) {
            $json_path = $json_filepath[0]["FILEPATH"] . "/shelxt_results.json" ;
            $json_data = file_get_contents($json_path);
        } else {
            $json_data = "[]";
        }
        $dat = array();
        $dat['BLOBS'] = 1;
        $dat['SOLUTIONS'] = json_decode($json_data);

        // scaling_id should always be present, but just in case...
        if (in_array('scaling_id', $this->process['PARAMETERS'])) {
            $integrator = $this->_lookup_autoproc(
                null,
                $this->process['PARAMETERS']['scaling_id']
            );
            if ($integrator) {
                $dat['PARENTAUTOPROCPROGRAM'] = $integrator['PROCESSINGPROGRAMS'];
                $dat['PARENTAUTOPROCPROGRAMID'] = $integrator['AUTOPROCPROGRAMID'];
            }
        }
        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function images($n = 0) {
        $png = $this->_get_shelxt_results_png();
        if (sizeof($png)) {
            return $png[0]["FILEPATH"] . "/" . $png[0]["FILENAME"];
        } else {
            return;
        }

    }

    function mapmodel($n = 0, $map = false) {
        $pdb = $this->_get_pdb();
        if (!$pdb) {
            return;
        } else {
            return $pdb;
        }
    }
}
