<?php

    namespace em;

    require_once('includes/pages/gen/class.dc.php');

    class Dc extends \gen\Dc {
        public static $dispatch = array(
                array('/drift/:id', 'get', '_drift_plot'),
                array('/aps', 'post', '_ap_status'),
                array('/dp', 'get', '_get_downstream'),
        );

        public static $arg_list = array('ids' => '\d+');


        # ------------------------------------------------------------------------
        # EM Drift Plot
        function _drift_plot() {
            session_write_close();
            if (!$this->has_arg('id')) {
                $this->_error('No data collection id specified');
                return;
            }
            
            $info = $this->db->pq('SELECT datfullpath as pth FROM datacollection WHERE datacollectionid=:1', array($this->arg('id')));
            if (!sizeof($info)) $this->_error('No such data collection');
            else $info = $info[0];
            
            $data = array();
            if (file_exists($info['PTH'])) {
                $dat = explode("\n",file_get_contents($info['PTH']));
                foreach ($dat as $i => $d) {
                    if ($d) {
                        list($x, $y) = preg_split('/\s+/', trim($d));
                        array_push($data, array(floatval($x), intval($y)));
                    }
                }
            }
            
            $this->_output($data);
        }

        # ------------------------------------------------------------------------
        # Return proc status - Particle finding & subsequent reconstruction
        function _ap_status() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $ids = '';
            $args = array();
            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    $ids = implode(',', $this->arg('ids'));
                    $args = $this->arg('ids');
                }
            }

            $tmp = $this->db->pq("SELECT api.datacollectionid, app.processingprograms, app.processingstatus 
                FROM autoprocprogram app
                INNER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                WHERE api.datacollectionid in ($ids)",
                $args);

            $statuses = array();
            foreach ($tmp as $i => $s) {
                if (!array_key_exists($s['DATACOLLECTIONID'], $statuses)) $statuses[$s['DATACOLLECTIONID']] = array();
                $statuses[$s['DATACOLLECTIONID']][$s['PROCESSINGPROGRAMS']] = $s['PROCESSINGSTATUS'];
            }

            $tmp = $this->db->pq("SELECT count(p.particleid) as particles, p.datacollectionid
                FROM particle p
                WHERE p.datacollectionid in ($ids)
                GROUP BY p.datacollectionid",
                $args);

            foreach ($tmp as $i => $p) {
                if (!array_key_exists($p['DATACOLLECTIONID'], $statuses)) $statuses[$p['DATACOLLECTIONID']] = array();
                $statuses[$p['DATACOLLECTIONID']]['PARTICLES'] = intval($p['PARTICLES']);
            }

            $out = array();
            foreach ($statuses as $id => $s) {
                // Last arg is compat for mx so we can use the same backbone model
                array_push($out, array(strval($id),$s,array()));
            }

            $this->_output($out);
        }


        # ------------------------------------------------------------------------
        # Return downstream results
        function _get_downstream() {

        }
    }

?>