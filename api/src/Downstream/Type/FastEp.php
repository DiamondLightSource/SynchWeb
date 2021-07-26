<?php

namespace SynchWeb\Downstream\Type;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class FastEp extends DownstreamPlugin {
    var $friendlyname = "Fast EP";
    var $has_mapmodel = array(1, 1);

    function results() {
        $dat = array();

        $ats = array();
        $pdb = $this->_get_attachments("sad_fa.pdb");
        if ($pdb) {
            if (file_exists($pdb["FILE"])) {
                $pdb = file_get_contents($pdb["FILE"]);
                foreach (explode("\n", $pdb) as $l) {
                    if (strpos($l, 'HETATM') !== false) {
                        $parts = preg_split('/\s+/', $l);
                        array_push($ats, array(
                            $parts[1],
                            $parts[5],
                            $parts[6],
                            $parts[7],
                            $parts[8],
                        ));
                    }
                }

                $dat['ATOMS'] = array_slice($ats, 0, 5);
            }
        }

        $lst = $this->_get_attachments("sad.lst");
        if ($lst) {
            if (file_exists($lst['FILE'])) {
                $p1 = array();
                $p2 = array();

                $lst = file_get_contents($lst['FILE']);
                $graph_vals = 0;
                $gvals = array();
                foreach (explode("\n", $lst) as $l) {
                    if (
                        strpos(
                            $l,
                            'Estimated mean FOM and mapCC as a function of resolution'
                        ) !== false
                    ) {
                        $graph_vals = 1;
                    }

                    if ($graph_vals && $graph_vals < 5) {
                        array_push($gvals, $l);
                        $graph_vals++;
                    }

                    if (
                        preg_match(
                            '/ Estimated mean FOM = (\d+.\d+)\s+Pseudo-free CC = (\d+.\d+)/',
                            $l,
                            $mat
                        )
                    ) {
                        $dat['FOM'] = floatval($mat[1]);
                        $dat['CC'] = floatval($mat[2]);
                    }
                }

                if (sizeof($gvals) > 0) {
                    $x = array_map(
                        'floatval',
                        array_slice(explode(' - ', $gvals[1]), 1)
                    );
                    $y = array_map(
                        'floatval',
                        array_slice(preg_split('/\s+/', $gvals[2]), 2)
                    );
                    $y2 = array_map(
                        'floatval',
                        array_slice(preg_split('/\s+/', $gvals[3]), 2)
                    );

                    foreach ($x as $i => $v) {
                        array_push($p1, array(1.0 / pow($v, 2), $y[$i]));
                        array_push($p2, array(1.0 / pow($v, 2), $y2[$i]));
                    }
                }

                $dat['PLOTS']['FOM'] = $p1;
                $dat['PLOTS']['CC'] = $p2;
            }
        }

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function mapmodel($n = 0, $map = false) {
        $pdb = $this->_get_attachments('sad.pdb');
        if (!$pdb) {
            return;
        }

        if ($map) {
            $mtz = $this->_get_attachments('sad.mtz');
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
