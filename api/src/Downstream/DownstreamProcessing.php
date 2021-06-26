<?php

namespace SynchWeb\Downstream;

/**
 * Retrieve downstream processing for a specific plugin
 */
class DownstreamProcessing {
    function __construct($db, $page) {
        $this->db = $db;
        $this->page = $page;
    }

    function generate($type, $autoprocprogramid, $process) {
        // To load a plugin auotprocprogram.processingprograms should match the downstream classname
        $inst = $this->load_plugin($type, $autoprocprogramid, $process);
        if ($inst) {
            return $inst->results();

            // If no plugin is registered return the base results and processing information
        } else {
            $empty = new DefaultPlugin(
                $this->db,
                $type,
                $autoprocprogramid,
                $process
            );
            $empty->friendlyname = $type;

            $result = new DownstreamResult($empty);
            return $result;
        }
    }

    function load_plugin($plugin, $autoprocprogramid, $process) {
        $plugin_pascal = implode(
            '',
            array_map('ucfirst', explode('_', $plugin))
        );
        $plugin_class = 'SynchWeb\\Downstream\\Type\\' . $plugin_pascal;
        if (class_exists($plugin_class)) {
            return new $plugin_class(
                $this->db,
                $plugin,
                $autoprocprogramid,
                $process
            );
        }
        // error_log("Downstream plugin class $plugin_class does not exist.");
    }
}

/**
 * DownstreamPlugin
 *   Represents a type of downstream process
 */
interface DownstreamPluginInterface {
    function __construct($db, $type, $autoprocprogramid, $process = null);
    /**
     * @return DownstreamResult
     */
    public function results();
    public function images($n = null);
    public function mapmodel($n = null);
}

abstract class DownstreamPlugin implements DownstreamPluginInterface {
    // Whether this plugin provides images
    var $has_images = false;
    // Whether this plugin provides map/models
    //   Should return array(nmodels, nmaps);
    var $has_mapmodel = false;
    // UI display name for plugin
    var $friendlyname;

    function images($n = 0) {
    }

    function mapmodel($n = 0, $map = false) {
    }

    function __construct($db, $type, $appid, $process = null) {
        $this->db = $db;
        $this->autoprocprogramid = $appid;
        $this->type = $type;
        $this->process = $process;
    }

    function _get_attachments(
        $filename = null,
        $filetype = null,
        $glob = null
    ) {
        $where = "";
        $args = array($this->autoprocprogramid);

        if ($filename) {
            $where .= " AND appa.filename LIKE :" . (sizeof($args) + 1);
            array_push($args, $filename);
        }

        if ($glob) {
            $where .=
                " AND appa.filename LIKE CONCAT('%', :" .
                (sizeof($args) + 1) .
                ",'%')";
            array_push($args, $glob);
        }

        if ($filetype) {
            $where .= " AND appa.filetype LIKE :" . (sizeof($args) + 1);
            array_push($args, $filetype);
        }

        $rows = $this->db->pq(
            "SELECT appa.filename, appa.filepath, appa.filetype, CONCAT(appa.filepath, '/', appa.filename) as file
            FROM autoprocprogramattachment appa
            WHERE appa.autoprocprogramid = :1 $where
            ORDER BY appa.importancerank,appa.filename",
            $args
        );

        if ($filename) {
            if (sizeof($rows)) {
                return $rows[0];
            }
        } else {
            return $rows;
        }
    }

    function _parse_ccp4_log($log) {
        $refmac = 0;
        $stats = array();
        $plot = 0;
        $plots = array();
        //print $log;
        foreach (explode("\n", $log) as $l) {
            if ($plot == 1) {
                $plot++;
                continue;
            }

            if (
                strpos(trim($l), '$TEXT:Result: $$ Final results $$') !== false
            ) {
                $refmac = 1;
                $stats = array();
                continue;
            }
            if (strpos(trim($l), '$$') !== false) {
                $refmac = 0;
            }

            if ($refmac) {
                array_push($stats, preg_split('/\s\s+/', trim($l)));
            }

            if (preg_match('/Ncyc\s+Rfact\s+Rfree/', trim($l))) {
                $plot = 1;
                $plots = array();
                continue;
            }

            if (strpos(trim($l), '$$') !== false) {
                $plot = 0;
            }

            if ($plot) {
                array_push($plots, preg_split('/\s+/', trim($l)));
            }
        }

        $plts = array('RVC' => array(), 'FVC' => array(), 'RVR' => array());
        foreach ($plots as $p) {
            $p = array_map('floatval', $p);
            array_push($plts['RVC'], array($p[0], $p[1]));
            array_push($plts['FVC'], array($p[0], $p[2]));
        }

        return array($plts, $stats);
    }

    function _lookup_autoproc($aid, $scalingid = null) {
        if ($aid) {
            $where = 'app.autoprocprogramid=:1';
            $args = array($aid);
        }

        if ($scalingid) {
            $where = 'aps.autoprocscalingid=:1';
            $args = array($scalingid);
        }

        $app = $this->db->pq(
            "SELECT app.autoprocprogramid, app.processingprograms
            FROM autoprocscaling aps
            INNER JOIN autoproc ap ON ap.autoprocid = aps.autoprocid
            INNER JOIN autoprocprogram app ON app.autoprocprogramid = ap.autoprocprogramid
            WHERE $where",
            $args
        );

        if (sizeof($app)) {
            return $app[0];
        }
    }

    /**
     * Convert an mtz to a map and compress it
     *   If $program if dimple or mrbump then an fofc and 2fofc map will be generated
     *   otherwise a single map will be generated. See `scripts/mtz2map.sh` for more details
     *
     * @param string $mtz The input mtz file
     * @param integer $aid The downstream autoprocprogramid (needs to be unique)
     * @param string $program The processing program (dimple, mrbump, ...)
     * @param string $pdb The input pdb file to generate the map around
     */
    function convert_mtz($mtz, $aid, $program, $pdb, $map = 0) {
        exec(
            '/bin/bash ./scripts/mtz2map.sh ' .
                $mtz .
                ' ' .
                $aid .
                ' ' .
                $program .
                ' ' .
                $pdb,
            $output,
            $res
        );

        if (in_array($program, array('dimple', 'mrbump'))) {
            $map = $map == 1 ? '2fofc' : 'fofc';
            $out = '/tmp/' . $aid . '_' . $program . '_' . $map . '.map.gz';
        } else {
            $out = '/tmp/' . $aid . '_' . $program . '.map.gz';
        }

        return $out;
    }
}

/**
 * DownstreamResult wrapper class
 *   All downstream plugins should return results wrapped in this class
 */
class DownstreamResult {
    var $autoprocprogramid;
    var $type;
    var $friendlyname;
    var $processingstatus;
    var $data = array();

    function __construct($plugin) {
        foreach (
            array(
                'autoprocprogramid',
                'type',
                'friendlyname',
                'has_mapmodel',
                'has_images',
            )
            as $k
        ) {
            $this->$k = $plugin->$k;
        }

        $this->processingstatus = $plugin->process['PROCESSINGSTATUS'];
        $this->processingmessage = $plugin->process['PROCESSINGMESSAGE'];
        $this->automatic = $plugin->process['AUTOMATIC'] != 0;
        $this->process = $plugin->process;
    }

    /**
     * Return legacy response
     */
    function legacy() {
        $resp = $this->data;
        $resp['AID'] = $this->autoprocprogramid;
        $resp['AUTOMATIC'] = $this->automatic;
        $resp['TYPE'] = $this->friendlyname;
        $resp['PROCESS'] = $this->process;
        $resp['MESSAGES'] = $this->process['MESSAGES'];
        $resp['FEATURES'] = array(
            'MAPMODEL' => $this->has_mapmodel,
            'IMAGES' => $this->has_images,
        );

        return $resp;
    }
}

class DefaultPlugin extends DownstreamPlugin {
    function results() {
    }
}
