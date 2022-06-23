<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\TemplateParser;

class Status extends Page
{
        
        public static $arg_list = array('bl' => '[\w-]+',
                              'p' => '\d+',
                              'st' => '\d\d-\d\d-\d\d\d\d',
                              'en' => '\d\d-\d\d-\d\d\d\d',
                              'c' => '\d+',
                              'mmsg' => '\d+', // Used for fetching only the Machine Status Message for Beamline PVs
                              );
        
        public static $dispatch = array(array('/pvs/:bl', 'get', '_get_pvs'),
                              array('/log/:bl', 'get', '_get_server_log'),
                              array('/ep/:bl', 'get', '_epics_pages'),
                              array('/epics/:bl/c/:c', 'get', '_get_component'),
        );

        /*
        var $dispatch = array('pvs' => '_get_pvs',
                              'log' => '_get_server_log',
                              'epics' => '_get_component',
                              'ep' => '_epics_pages',
                              );
        
        var $def = 'pvs';
        #var $profile = True;
        //var $debug = True;
        */
        
        # ------------------------------------------------------------------------
        # Return beam / ring status pvs for a beamline
        function _get_pvs() {
            global $bl_pvs;
            session_write_close();
            $this->db->close();
            
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');
            
            $ring_pvs = array(
                'Ring Current' => 'SR-DI-DCCT-01:SIGNAL',
                //'Ring State' => 'CS-CS-MSTAT-01:MODE',
                'Refill' => 'SR-CS-FILL-01:COUNTDOWN',
            );

            $messages_pvs = array(
                'Machine Status 1' => 'CS-CS-MSTAT-01:MESS01',
                'Machine Status 2' => 'CS-CS-MSTAT-01:MESS02',
            );

            if (!array_key_exists($this->arg('bl'), $bl_pvs)) $this->_error('No such beamline');

            $return = array();

            if ($this->has_arg('mmsg')) {
                $messages_val = $this->pv(array_values($messages_pvs), false, true);

                foreach ($messages_pvs as $k => $v) {
                    $return[$k] = $messages_val[$v];
                }
            } else {
                $pvs = array_merge($ring_pvs, $bl_pvs[$this->arg('bl')]);
                $vals = $this->pv(array_values($pvs), false, false);

                foreach ($pvs as $k => $pv) {
                    if ($k == 'Hutch') $return[$k] = $vals[$pv] == 7 ? 'Open' : 'Locked';
                    else $return[$k] = $vals[$pv];
                }
            }

            $this->_output($return);
        }
        
        
        function _get_component() {
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');
            
            if (!file_exists('tables/motors.json')) $this->_error('Couldn\'t find motors file');
            $json = preg_replace("/(\s\s+|\n)/", '', file_get_contents('tables/motors.json'));
            $pages = json_decode($json, true);
            
            $bls = array('i03' => 'BL03I', 'i02' => 'BL02I', 'i04' => 'BL04I');
            $vals = array('RBV','VAL','HLS', 'LLS','DMOV', 'SEVR', 'LVIO', 'MSTA');
            
            $k = array_keys($pages);
            $output = array();

            $c = $this->has_arg('c') ? $this->arg('c') : 0;

            if ($c < sizeof($k)) {
                $pvp = $pages[$k[$c]];
                $pvs = array();
                foreach ($pvp as $pt) {
                    list($p, $t) = $pt;
                    
                    # Motors
                    if ($t == 1) {
                        foreach ($vals as $i => $s) {
                            array_push($pvs, $bls[$this->arg('bl')].'-'.$p.'.'.$s);
                        }
                        
                    # Toggles
                    } else if ($t == 2) {
                        array_push($pvs, $bls[$this->arg('bl')].'-'.$p);
                    }
                }

                $pvv = $this->pv($pvs);
                
                foreach ($pvp as $n => $pt) {
                    list($pv, $t) = $pt;
                    $output[$n] = array('t' => $t, 'val' => array());
                    # Motors
                    if ($t == 1) {
                        foreach ($vals as $i => $s) {
                            $p = $bls[$this->arg('bl')].'-'.$pv.'.'.$s;
                            $output[$n]['val'][$s] = $pvv[$p];
                        }
                        
                    # Toggles
                    } else if ($t == 2) {
                        $p = $bls[$this->arg('bl')].'-'.$pv;
                        $output[$n]['val'] = $pvv[$p] == $pt[2];
                    }
                }
            }
            
            $this->_output($output);
        }
        
        
        function _epics_pages() {
            if (!file_exists('tables/motors.json')) $this->_error('Couldn\'t find motors file');
            $json = preg_replace("/(\s\s+|\n)/", '', file_get_contents('tables/motors.json'));
            $this->_output(array_keys(json_decode($json, true)));
        }
        
        
        
        # ------------------------------------------------------------------------
        # Return last n lines of gda log file
        function _get_server_log() {
            if (!$this->staff) return $this->_error('No access');
            
            session_write_close();
            global $server_log;
            
            $pp = 100;
            
            if ($this->has_arg('p')) $num_lines = $this->arg('p') * $pp;
            else $num_lines = 100;
            
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');
            
            $tmp = new TemplateParser($this->db);
            $filename = $tmp->interpolate($server_log, array('BEAMLINENAME' => $this->arg('bl')));

            $file = fopen($filename, 'r');
            fseek($file, -1, SEEK_END);

            for ($line = 0, $lines = array(); $line < $num_lines && false !== ($char = fgetc($file));) {
                if ($char === "\n"){
                    if(isset($lines[$line])){
                        //$lines[$line][] = $char;
                        $lines[$line] = implode('', array_reverse($lines[$line]));
                        $line++;
                    }
                } else
                    $lines[$line][] = $char;
                fseek($file, -2, SEEK_CUR);
            }

            if($line < $num_lines && sizeof($lines) != 0)
                $lines[$line] = implode('', array_reverse($lines[$line]));
            
            if ($this->has_arg('p')) $lines = array_slice($lines,$pp*($this->arg('p')-1),$pp);
            
            foreach ($lines as &$l) $l = htmlentities($l, ENT_QUOTES);
            
            $this->_output(array_reverse($lines));
        }
}
