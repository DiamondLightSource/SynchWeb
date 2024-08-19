<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class Shelxt extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'Shelxt';
    var $has_mapmodel = array(1, 2);

    function _get_shelxt_results_json() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filePath from autoprocprogramattachment app where autoprocprogramid = :1 and filename = \"shelxt_results.json\" ", 
            $appid
        );
        return $filepath;
    }

    function _get_shelxt_results_png() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filepath, app.filename from autoprocprogramattachment app where autoprocprogramid = :1 and filename like \"%.png%\" ", 
            $appid
        );
        return $filepath;
    }

    function results() {
        $json_filepath = $this->_get_shelxt_results_json();
        $json_path = $json_filepath[0]["FILEPATH"] . "/shelxt_results.json" ;
        if (sizeof($json_filepath)) {
            $json_data = file_get_contents($json_path);
        } else {
            $json_data = file_get_contents("/dls/i19-1/data/2024/cm37266-1/processed/laserShaping/data/cryst7_after/EuSample_1/985d2624-9254-4d00-b122-5849f3af4462/shelxt/" . "shelxt_results2.json");
        }
        $dat = array();
        $dat['BLOBS'] = 1;
        $dat['STATS'] = array();
        $dat['PLOTS'] = array();
        $dat['PKLIST'] = array();
        $dat['PARENTAUTOPROCPROGRAM'] = "Shelxt";
        $dat['PARENTAUTOPROCPROGRAMID'] = "";
        $dat['SOLUTIONS'] = json_decode($json_data);

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function images($n = 0) {
        $png = $this->_get_shelxt_results_png();
        $the_actual_path = $png[0]["FILEPATH"] . "/" . $png[0]["FILENAME"];
        // TODO handle that being null
        return $the_actual_path;
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
