<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class LigandFit extends DownstreamPlugin {
    var $has_images = true;
    var $friendlyname = 'LigandFit';
    var $has_mapmodel = array(1, 0);

    function _get_ligandfit_results_json() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filePath, app.filename from autoprocprogramattachment app where autoprocprogramid = :1 and filename like '%.json' ",
            $appid
        );
        return $filepath;
    }

    function _get_ligandfit_results_png() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.filepath, app.filename from autoprocprogramattachment app where autoprocprogramid = :1 and filename like '%.png' ",
            $appid
        );
        return $filepath;
    }

    function _get_model_appaid() {
        $appid = array($this->autoprocprogramid);
        $filepath = $this->db->pq(
            "SELECT app.autoprocprogramattachmentid from autoprocprogramattachment app where autoprocprogramid = :1 and filename like '%.html' ",
            $appid
        );
        if (sizeof($filepath)) {
            return $filepath[0]["AUTOPROCPROGRAMATTACHMENTID"];
        } else {
            return;
        }
    }

    function results() {
        $json_data = "[]";
        $json_filepath = $this->_get_ligandfit_results_json();
        if (sizeof($json_filepath)) {
            $json_path = $json_filepath[0]["FILEPATH"] . "/" . $json_filepath[0]["FILENAME"];
            if (file_exists($json_path)) {
                $json_data = file_get_contents($json_path);
            }
        }
        $dat = array();
        $appaid = $this->_get_model_appaid();
        $dat['BLOBS'] = $appaid ? 1 : 0;
        $dat['MODEL_APPAID'] = $appaid;
        $dat['SOLUTIONS'] = json_decode($json_data);
        $dat['PARENTAUTOPROCPROGRAM'] = $this->process['PROCESSINGCOMMENTS'];

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function images($n = 0) {
        $png = $this->_get_ligandfit_results_png();
        if (sizeof($png)) {
            return $png[0]["FILEPATH"] . "/" . $png[0]["FILENAME"];
        } else {
            return;
        }
    }
}
