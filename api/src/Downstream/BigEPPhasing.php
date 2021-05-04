<?php

namespace SynchWeb\Downstream;

use SynchWeb\Downstream\DownstreamPlugin;
use SynchWeb\Downstream\DownstreamResult;

class BigEPPhasing extends DownstreamPlugin {
    var $has_images = true;
    var $has_mapmodel = array(1, 1);

    function results() {
        $dat = array();

        if (array_key_exists('program_id', $this->process['PARAMETERS'])) {
            $integrator = $this->_lookup_autoproc(
                $this->process['PARAMETERS']['program_id']
            );
            if ($integrator) {
                $dat['PARENTAUTOPROCPROGRAM'] =
                    $integrator['PROCESSINGPROGRAMS'];
                $dat['PARENTAUTOPROCPROGRAMID'] =
                    $integrator['AUTOPROCPROGRAMID'];
            }
        }

        $image = $this->_get_image();
        $dat['IMAGE'] = file_exists($image);

        $model = $this->_get_attachments('big_ep_model_ispyb.json');
        $dat['HASMODEL'] = $model && file_exists($model['FILE']);
        if ($model) {
            if (file_exists($model['FILE'])) {
                $json_str = file_get_contents($model['FILE']);
                $json_data = json_decode($json_str, true);
                foreach (
                    array(
                        'RESID' => array('total', 0),
                        'FRAGM' => array('fragments', 0),
                        'MAXLEN' => array('max', 0),
                        'MAPCC' => array('mapcc', 2),
                        'MAPRESOL' => array('mapcc_dmin', 2),
                    )
                    as $k => $v
                ) {
                    if (array_key_exists($v[0], $json_data)) {
                        $dat[$k] = number_format($json_data[$v[0]], $v[1]);
                    } else {
                        $dat[$k] = null;
                    }
                }
            }
        }

        # Read SHELXC logs
        $shx_log = $this->_get_attachments(null, null, "shelxc.log");
        if (sizeof($shx_log)) {
            $shx_log = $shx_log[0]['FILE'];
            $graph_patterns = array(
                'CHISQ' => array('Chi-sq', 2),
                'ISIGI' => array('<I/sig>', 2),
                'DSIG' => array('<d"/sig>', 2),
                'CC12' => array('CC(1/2)', 2),
                'RESO' => array('Resl.', 3),
            );

            
            if (file_exists($shx_log)) {
                $lst = explode("\n", file_get_contents($shx_log));
                $graphs = array();
                foreach ($lst as $l) {
                    foreach ($graph_patterns as $k => $gr) {
                        if (strpos($l, $gr[0]) == 1) {
                            $graphs[$k] = array_map(
                                'floatval',
                                array_slice(preg_split('/\s+/', $l), $gr[1])
                            );
                        }
                    }
                }
            
                $dat['SHELXC'] = array();
                foreach (array_keys($graph_patterns) as $k) {
                    if ($k != 'RESO' and array_key_exists($k, $graphs)) {
                        $dat['SHELXC'][$k] = array();
                    }
                }
                if (array_key_exists('RESO', $graphs)) {
                    foreach ($graphs['RESO'] as $i => $r) {
                        foreach (array_keys($dat['SHELXC']) as $k) {
                            if (array_key_exists($i, $graphs[$k])) {
                                array_push($dat['SHELXC'][$k], array(
                                    1.0 / pow($r, 2),
                                    $graphs[$k][$i],
                                ));
                            }
                        }
                    }
                }
            }
        }

        $results = new DownstreamResult($this);
        $results->data = $dat;

        return $results;
    }

    function _get_image() {
        $images = $this->_get_attachments(null, null, '.png');
        if (sizeof($images)) {
            return $images[0]['FILEPATH'] . '/' . $images[0]['FILENAME'];
        }
    }

    function images($n = 0) {
        return $this->_get_image();
    }

    function mapmodel($n = 0, $map = false) {
        if ($map) {
            $maps = $this->_get_attachments(null, null, '.map');
            if (!sizeof($maps)) {
                return;
            }
            $map = $maps[0];

            $out =
                '/tmp/' .
                $this->autoprocprogramid .
                '_' .
                $this->type .
                '_map.gz';
            if (!file_exists($out) && file_exists($map['FILE'])) {
                file_put_contents(
                    $out,
                    gzencode(file_get_contents($map['FILE']))
                );
            }

            return $out;
        } else {
            $pdbs = $this->_get_attachments(null, null, '.pdb');
            if (!sizeof($pdbs)) {
                return;
            }
            return $pdbs[0]['FILE'];
        }
    }
}
