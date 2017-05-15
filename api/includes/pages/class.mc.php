<?php

    require_once(dirname(__FILE__).'/../class.templateparser.php');

    class Mc extends Page {
    

        public static $arg_list = array('visit' => '\w+\d+-\d+', 
            's' => '\w+', 
            'd' => '([\w\/])+', 
            'id' => '\d+', 
            'ids' => '\d+', 
            'dcs' => '\d+',
            'sg' => '\w+', 
            'a' => '\d+(.\d+)?', 'b' => '\d+(.\d+)?', 'c' => '\d+(.\d+)?', 'alpha' => '\d+(.\d+)?', 'beta' => '\d+(.\d+)?', 'gamma' => '\d+(.\d+)?', 
            'res' => '\d+(.\d+)?', 'rfrac' => '\d+(.\d+)?', 'isigi' => '\d+(.\d+)?', 'run' => '\d+', 'type' => '\d+', 'local' => '\d+', 'user' => '\d+',
            'multi' => '\d',
            'recipes' => '\d+');


        public static $dispatch = array(array('/ints(/user/:user)', 'post', '_integration_statuses'),

                              array('/users/visit/:visit', 'get', '_get_users'),

                              array('/integrate', 'post', '_integrate'),

                              array('/blended/visit/:visit(/user/:user)', 'get', '_blended'),
                              array('/blended', 'post', '_blend'),
                              array('/blended/visit/:visit(/user/:user)/:run', 'delete', '_delete'),

                              array('/status', 'get', '_get_status')
        );
        

        function __construct() {
            call_user_func_array('parent::__construct', func_get_args());
            $this->tmp = new TemplateParser($this->db);
        }
        
        function _get_root($options) {
            global $reprocessing_root;
            return $this->tmp->interpolate($reprocessing_root, $options);
        }

        function _get_rp($dcid) {
            global $reprocessing_str;
            return $this->tmp->interpolate($reprocessing_str, array('DCID' => $dcid));
        }


        # ------------------------------------------------------------------------
        # Find out how many jobs are running
        function _get_status() {
            $cmd = exec('. /etc/profile.d/modules.sh;module load global/cluster;qstat -u dls_mxweb | grep x2');
            $jobs = explode("\n", $cmd);

            $ids = array();
            foreach ($jobs as $j) {
                if (preg_match('/x2(\d+)/', $j, $m)) array_push($ids, $m[1]);
            }

            $this->_output(array('NUMBER' => sizeof($jobs), 'IDS' => $ids));
        }


        # ------------------------------------------------------------------------
        # Get list of users
        function _get_users() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            $dirs = $this->dirs($this->_get_root(array('VISIT' => $this->arg('visit'))));

            $where = array(); $args = array();
            foreach ($dirs as $d) {
                array_push($where, 'personid=:'.(sizeof($args)+1));
                array_push($args, $d);
            }

            $people = $this->db->pq("SELECT CONCAT(CONCAT(p.givenname, ' '), p.familyname) as name, p.personid FROM person p WHERE ".implode(' OR ', $where), $args);
            $this->_output($people);
        }
        
        
        # ------------------------------------------------------------------------
        # Manual integration status for each data collection
        function _integration_statuses() {
            $where = array();

            if ($this->has_arg('ids')) {
                foreach ($this->arg('ids') as $i => $id) {
                    array_push($where,'dc.datacollectionid=:'.($i+1));
                }

            } else {
                $this->_output(array());
                return;
            }

            $where = '('.implode(' OR ', $where).')';

            $rows = $this->db->pq("SELECT dc.datacollectionid as id, dc.filetemplate as prefix, dc.imagedirectory as dir
                FROM datacollection dc 
                WHERE $where ORDER BY dc.imagedirectory, dc.starttime", $this->arg('ids'));
            
            $out = array();
            foreach ($rows as $i => &$ref) {
                // if (array_key_exists('INT', $r)) continue;
                $base = $this->_get_rp($ref['ID']);
                $ref['INT'] = 0;

                $runs = glob($base.'/run_*');
                if (!sizeof($runs)) array_push($out, $ref);

                foreach ($runs as $i => $d) {
                    if (preg_match('/run_(\d+)$/', $d, $m)) {
                        $r = $ref;
                        $root = $base.'/run_'.$m[1];
                        $r['RUN'] = $m[1];
                        $r['RID'] = $r['ID'].'-'.$r['RUN'];

                        if (file_exists($root)) $r['INT'] = 1;
                        if (file_exists($root.'/xia2-summary.dat')) {
                            $log = explode("\n", file_get_contents($root.'/xia2-summary.dat'));
                            $stats = array();
                            $r['INT'] = 2;

                            // $r['SHELLS'] = array('innerShell' => array(), 'outerShell' => array(), 'overall' => array());
                            $shs = array('overall', 'innerShell', 'outerShell');

                            foreach ($log as $l) {
                                $pat = preg_split('/\t/', $l);
                                $pats = preg_split('/\s+/', $l);

                                foreach($shs as $i => $s) {
                                    if (strpos($l, 'High resolution limit') !== false) $stats['SHELLS'][$s]['RESH'] = number_format($pat[$i+1],2);
                                    if (strpos($l, 'Low resolution limit') !== false) $stats['SHELLS'][$s]['RESL'] = number_format($pat[$i+1],2);
                                    if (strpos($l, 'Completeness') !== false) $stats['SHELLS'][$s]['COMPLETENESS'] = number_format($pat[$i+1],1);
                                    if (strpos($l, 'I/sigma') !== false) $stats['SHELLS'][$s]['ISIGI'] = number_format($pat[$i+1],1);
                                    if (strpos($l, 'Multiplicity') !== false) $stats['SHELLS'][$s]['MULTIPLICITY'] = number_format($pat[$i+1],1);
                                    if (strpos($l, 'Rmerge') !== false) $stats['SHELLS'][$s]['RMERGE'] = number_format($pat[$i+1],3);
                                    if (strpos($l, 'CC half') !== false) $stats['SHELLS'][$s]['CCHALF'] = number_format($pat[$i+1],3);
                                    if (strpos($l, 'Anomalous completeness') !== false) $stats['SHELLS'][$s]['ANOMCOMPLETENESS'] = number_format($pat[$i+1],1);
                                    if (strpos($l, 'Anomalous multiplicity') !== false) $stats['SHELLS'][$s]['ANOMMULTIPLICITY'] = number_format($pat[$i+1],1);
                                }


                                if (strpos($l, 'High resolution limit') !== false) $stats['RESH'] = number_format($pat[1],2);
                                if (strpos($l, 'Completeness') !== false) $stats['C'] = number_format($pat[1],1);
                                if (strpos($l, 'Rmerge') !== false) $stats['R'] = number_format($pat[1],3);
                                if (strpos($l, 'I/sigma') !== false) $stats['ISIGI'] = number_format($pat[1],1);
                                if (strpos($l, 'Cell:') !== false) $stats['CELL'] = array_slice($pats,1);
                                if (strpos($l, 'Spacegroup:') !== false) $stats['SG'] = implode(' ', array_slice($pats,1));
                            }
                            
                            $r['STATS'] = $stats;
                        }
                        
                        if (file_exists($root.'/xia2-xinfo.error') || file_exists($root.'/xia2.error')) $r['INT'] = 3;
                        
                        
                        $r['DIR'] = $this->tmp->relative($r['DIR'], array('DCID' => $r['ID']));
                        array_push($out, $r);
                    }
                }
            }
                                  
            $this->_output($out);
        }
                                  
                                  
        # ------------------------------------------------------------------------
        # Integrate multiple data sets
        function _integrate() {
            global $reprocess_script, $submit_script;
            if (!$this->has_arg('visit')) $this->_error('No visit specified');

            $ret = '';
            $args = array();
            $where = array();
            
            $running = array_map(function($i) { return intval(preg_replace('/.*x2(\d+).*/', '$1', $i)); }, explode("\n", exec('module load global/cluster;qstat -u dls_mxweb | grep x2')));
            
            $ranges = array();
            foreach ($_POST['int'] as $d) {
                if (is_numeric($d[0]) && is_numeric($d[1]) && is_numeric($d[2]) && !in_array($d[0], $running)) {
                    array_push($args, $d[0]);
                    array_push($where, 'dc.datacollectionid=:'.sizeof($args));
                    // $ranges[$d[0]] = array($d[1], $d[2]);
                    array_push($ranges, $d);
                }
            }
                                 
            if (sizeof($where)) {
                $where = implode(' OR ', $where);
                
                $rows = $this->db->pq("SELECT dc.datacollectionid as id, dc.wavelength,dc.filetemplate as prefix, dc.imagedirectory as dir, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit FROM datacollection dc INNER JOIN blsession s ON dc.sessionid = s.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
                $dict = array();
                foreach ($rows as $r) $dict[$r['ID']] = $r;
                                   
                $cell = $this->has_arg('a') ? "--unitcell ".$this->arg('a').",".$this->arg('b').",".$this->arg('c').",".$this->arg('alpha').",".$this->arg('beta').",".$this->arg('gamma') : '';
                $res = $this->has_arg('res') ? "-resolution ".$this->arg('res') : '';
                $sg = $this->has_arg('sg') ? "--spacegroup ".$this->arg('sg') : '';
                    
                $pipeline = '3dii';
                if ($this->has_arg('recipes')) {
                    if ($this->arg('recipes') < 3 && $this->arg('recipes') > 0) {
                        $pls = array('3dii', 'dials');
                        $pipeline = $pls[($this->arg('recipes')-1)];
                    }
                }

                $script = "#!/bin/sh\n$reprocess_script --workingdir {root} --pipeline $pipeline --dcid {dcid} $res $sg $cell";
                // Multi-xia2 mode   
                if ($this->has_arg('multi')) {
                    $root = $this->_get_next($this->_get_rp($r['ID']));

                    $sweeps = array();
                    foreach ($ranges as $i => $r) {
                        if (array_key_exists($r[0], $dict)) {
                            $row = $dict[$r[0]];
                            array_push($sweeps, "BEGIN SWEEP SWEEP".($i+1)."\nWAVELENGTH NATIVE\nDIRECTORY ".$row['DIR']."\nIMAGE ".str_replace('####.cbf', '0001.cbf', $row['PREFIX'])."\nSTART_END ".($r[1])." ".$r[2]."\nEND SWEEP SWEEP".($i+1));
                        }
                    }
                    
                    $sweeps = implode("\n", $sweeps);
                    $xinfo ="BEGIN PROJECT AUTOMATIC\nBEGIN CRYSTAL DEFAULT\nBEGIN WAVELENGTH NATIVE\nWAVELENGTH ".$row['WAVELENGTH']."\nEND WAVELENGTH NATIVE\n\n$sweeps\n\nEND CRYSTAL DEFAULT\nEND PROJECT AUTOMATIC";
                    
                    file_put_contents($root.'/xia.xinfo', $xinfo);
                    file_put_contents($root.'/x2'.$row['ID'].'.sh', str_replace('{root}', $root, str_replace('{dcid}', $row['ID'], $script)));
                    $ret = exec($submit_script.' x2'.$row['ID'].'.sh'); 

                // Run xia2 multiple times
                } else {
                    foreach ($ranges as $i => $r) {
                        $root = $this->_get_next($this->_get_rp($r[0]));
                        $row = $dict[$r[0]];
                        
                        $xinfo ="BEGIN PROJECT AUTOMATIC\nBEGIN CRYSTAL DEFAULT\nBEGIN WAVELENGTH NATIVE\nWAVELENGTH ".$row['WAVELENGTH']."\nEND WAVELENGTH NATIVE\n\nBEGIN SWEEP SWEEP1\nWAVELENGTH NATIVE\nDIRECTORY ".$row['DIR']."\nIMAGE ".str_replace('####.cbf', '0001.cbf', $row['PREFIX'])."\nSTART_END ".($r[1])." ".$r[2]."\nEND SWEEP SWEEP1\n\nEND CRYSTAL DEFAULT\nEND PROJECT AUTOMATIC";
                        file_put_contents($root.'/xia.xinfo', $xinfo);
                        file_put_contents($root.'/x2'.$row['ID'].'.sh', str_replace('{root}', $root, str_replace('{dcid}', $row['ID'], $script)));
                        
                        $ret = exec($submit_script.' x2'.$row['ID'].'.sh'); 
                    }

                }

            } else $ret = 'No data sets specified';
            
            $this->_output($ret);
        }


        function _get_next($root) {
            $last = 0;
            foreach (glob($root.'/run_*') as $d) {
                if (preg_match('/run_(\d+)$/', $d, $m)) {
                    if ($m[1] > $last) $last = $m[1];
                }
            }
            $last++;

            $root .= '/run_'.$last;
            if (!file_exists($root)) {
                try {
                    mkdir($root, 0777, true);
                } catch (Exception $e) {
                    $this->_error('No write access to: '.$root, 500);
                }
            }
            chdir($root);

            return $root;
        }
        
        # ------------------------------------------------------------------------
        # Blend analyse selected integrated data sets
        function _blend() {
            session_write_close();
            $ret = '';
            
            $args = array();
            $where = array();
            
            if (!$this->has_arg('dcs')) $this->_error('No data collections specified');
            
            foreach ($this->arg('dcs') as $d) {
                if (is_numeric($d)) {
                    array_push($args, $d);
                    array_push($where, 'dc.datacollectionid=:'.sizeof($args));
                }
            }
            
            if (sizeof($where)) {
                $where = implode(' OR ', $where);
                
                $rows = $this->db->pq("SELECT dc.datacollectionid as id, dc.wavelength,dc.filetemplate as prefix, dc.imagedirectory as dir, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit FROM datacollection dc INNER JOIN blsession s ON dc.sessionid = s.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
                
                $files = array();
                $ids = array();
                $blend = '';
                foreach ($rows as $i => $r) {
                    if (!$blend) $blend = $this->_get_root(array('DCID' => $r['ID'])).'/blend';
                    $root = $this->_get_rp($r['ID']);
                
                    #$hkl = $root.'/DEFAULT/NATIVE/SWEEP1/integrate/INTEGRATE.HKL';
                    $hkl = $root.'/DEFAULT/scale/NATIVE_SWEEP1.HKL';
                    if (file_exists($hkl)) {
                        array_push($files, $hkl);
                        array_push($ids, $r['ID']);
                    }
                    
                }
                
                if ($this->arg('type') == 1) {
                    $blend .= '/analyse';
                    if (file_exists($blend)) $this->rrmdir($blend);
                    $radfrac = 0.25;
                    
                } else {
                    $last = 0;
                    foreach (glob($blend.'/run_*') as $d) {
                        if (preg_match('/run_(\d+)$/', $d, $m)) {
                            if ($m[1] > $last) $last = $m[1];
                        }
                    }
                    $last++;
                    $blend .= '/run_'.$last;
                    $radfrac = $this->has_arg('rfrac') ? $this->arg('rfrac') : 0.25;
                }
                
                if (!file_exists($blend)) {
                    try {
                        mkdir($blend, 0777, true);
                    } catch (Exception $e) {
                        $this->_error('No write access to: '.$blend, 500);
                    }
                }
                chdir($blend);
                
                $isigi = $this->has_arg('isigi') ? $this->arg('isigi') : 1.5;
                $res = $this->has_arg('res') ? ('RESOLUTION HIGH '.$this->arg('res')) : '';
                
                $sets = array();
                for ($i = 0; $i < sizeof($args); $i++) array_push($sets, $i+1);
                
                file_put_contents($blend.'/files.dat', implode("\n", $files));
                file_put_contents($blend.'/ids.dat', implode("\n", $ids));
                
                $cmd = "blend -a files.dat 2> blend.elog";
                if ($this->arg('type') == 0) $cmd .= "\nblend -c ".implode(' ', $sets)." 2>> blend.elog";
                
                $envs = "export CLIBD=/dls_sw/apps/ccp4/64/6.5/update16/ccp4-6.5/lib/data\nexport CCP4_SCR=/dls/tmp/dls_mxweb\nexport CINCL=/dls_sw/apps/ccp4/64/6.5/update16/ccp4-6.5/include\nexport CCP4=/dls_sw/apps/ccp4/64/6.5/update16/ccp4-6.5\nexport R_HOME=/dls_sw/apps/R/3.0.0/RHEL6/x86_64/lib64/R\nexport BLEND_HOME=/dls_sw/apps/ccp4/64/6.5/update16/ccp4-6.5/share/blend;";
                file_put_contents($blend.'/blend.sh', "#!/bin/sh\n$envs\n. /etc/profile.d/modules.sh\nmodule load blend\n".$cmd);
                
                $sg = $this->has_arg('sg')  ? ("CHOOSE SPACEGROUP ".$this->arg('sg')) : '';
                file_put_contents($blend.'/BLEND_KEYWORDS.dat', "BLEND KEYWORDS\nNBIN	  20\nRADFRAC   $radfrac\nISIGI     $isigi\nCPARWT    1.000\nPOINTLESS KEYWORDS\n$sg\nAIMLESS KEYWORDS\n$res");
                
                # no x11 on cluster
                $ret = exec(". /etc/profile.d/modules.sh;module load global/cluster;qsub blend.sh");
                #$ret = exec("chmod +x blend.sh;./blend.sh &");
                
            } else $ret = 'No data sets specified';
            
            $this->_output($ret);
            
        }
                                  
                                      
        # ------------------------------------------------------------------------
        # List of blended data sets
        function _blended() {
            session_write_close();
            
            $info = $this->db->pq("SELECT TO_CHAR(s.startdate, 'YYYY') as yr, s.sessionid, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE  CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($info)) $this->_error('No such visit');
            $info = $info[0];
            
            $root = $this->_get_root(array('VISIT' => $this->arg('visit'))).'/blend';

            $runs = array();
            if (file_exists($root)) {
                foreach (glob($root.'/run_*') as $r) {
                    $id = preg_match('/run_(\d+)$/', $r, $m) ? $m[1] : 0;
                    $run = array('ID' => intval($id), 'STATE' => 0);
                    
                    $log = $r.'/blend.elog';
                    if (file_exists($log)) {
                        foreach (explode("\n", file_get_contents($log)) as $l) {
                            if (strpos($l, 'Execution halted') !== false) $run['STATE'] = 2;
                        }
                    }
                    
                    $prs = $r.'/BLEND_KEYWORDS.dat';
                    if (file_exists($prs)) {
                        foreach (explode("\n", file_get_contents($prs)) as $l) {
                            $pat = preg_split('/\s+/', $l);
                            if (strpos($l, 'RADFRAC') !== false) $run['RFRAC'] = $pat[1];
                            if (strpos($l, 'ISIGI') !== false) $run['ISIGI'] = $pat[1];
                        }
                    }
                    
                    $aim = $r.'/combined_files/aimless_001.log';
                    if (file_exists($aim)) {
                        $stats = array();
                        $run['STATE'] = 1;
                        $run['VISIT'] = $this->arg('visit');
                        
                        foreach (explode("\n", file_get_contents($aim)) as $l) {
                            if (strpos($l, 'Rmerge  (all I+ and I-)') !== false) $stats['RMERGE'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Rmeas (all I+ & I-)') !== false) $stats['RMEAS'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Rpim (all I+ & I-)') !== false) $stats['RPIM'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Mean((I)/sd(I))') !== false) $stats['ISIGI'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Completeness   ') !== false) $stats['C'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Multiplicity   ') !== false) $stats['M'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Low resolution limit') !== false) $stats['RESL'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'High resolution limit') !== false) $stats['RESH'] = array_slice(preg_split('/\s\s\s+/', $l), 0);
                            if (strpos($l, 'Space group: ') !== false) $run['SG'] = implode(' ',array_slice(preg_split('/\s/', $l), 2));
                            
                        }
                        
                        $run['STATS'] = $stats;
                    }
                    
                    $ids = array();
                    if (file_exists($r.'/ids.dat')) {
                        $ids = explode("\n", file_get_contents($r.'/ids.dat'));
                    }
                    
                    $run['IDS'] = $ids;
                    
                    array_push($runs, $run);
                }
            }
            
            usort($runs, function($a, $b) { return $a['ID'] - $b['ID'];});
                                  
            $this->_output($runs);
        }
                                  
        
        # ------------------------------------------------------------------------
        # Delete a blend run
        function _delete() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            if (!$this->has_arg('run')) $this->_error('No run specified');
                                  
            $info = $this->db->pq("SELECT TO_CHAR(s.startdate, 'YYYY') as yr, s.sessionid, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE  CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($info)) $this->_error('No such visit');
            $info = $info[0];
            
            $root = $this->_get_root(array('VISIT' => $this->arg('visit'))).'/blend/run_'.$this->arg('run');
            $this->rrmdir($root);
            $this->_output(1);    
        }
                                  
        function rrmdir($dir) {
            foreach(glob($dir . '/*') as $file) {
                if(is_dir($file))
                    $this->rrmdir($file);
                else
                    unlink($file);
            }
            rmdir($dir);
        }
        

        # ------------------------------------------------------------------------
        # Get data for blend dendrogram
        function _dendrogram() {
            session_write_close();
            
            $info = $this->db->pq("SELECT TO_CHAR(s.startdate, 'YYYY') as yr, s.sessionid, s.beamlinename as bl, vr.run, vr.runid FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($info)) $this->_error('No such visit');
            $info = $info[0];
            
            $root = $this->_get_root(array('VISIT' => $this->arg('visit'))).'/blend/analyse';
            $cf = $root.'/CLUSTERS.txt';
            
            $data = array();
            $raw = array();
            if (file_exists($cf)) {
                $log = explode("\n", file_get_contents($cf));
                
                foreach (array_slice($log,4) as $i => $l) {
                    if ($l) {
                        $parts = preg_split("/\s+/", $l);
                        array_push($raw, array($parts[3], array_slice($parts,4)));
                    }
                }
                
                $all = @array_map(intval, array_slice(end($raw),1));
                array_push($data, array($all, 0));
                foreach ($raw as $r) {
                    
                    foreach ($r[1] as $e) {
                        $idx = array_search($e, $all);
                        if ($idx > -1) unset($all[$idx]);
                        
                        foreach ($all as $i => $a) {
                            if (preg_match('/\+'.$e.'\+/', $a) || preg_match('/^'.$e.'\+/', $a)) {
                                unset($all[$i]);
                            }
                        }
                    }
                    
                    array_push($all, implode('+',$r[1]));
                    array_push($data, array(array_values($all), floatval($r[0])));
                }
                
                $ids = explode("\n", file_get_contents($root.'/ids.dat'));
                $this->_output(array($ids, array_reverse($data)));
            }
            
        }
    
        
        
    
        # ------------------------------------------------------------------------
        # Code for manual clustering and scaling with XSCALE
        # Not good enough yet!
    
        
        # ------------------------------------------------------------------------
        # Calculate CCI(i,j) for data sets with XSCALE
        function _xscale() {
            session_write_close();
            
            $ret = '';
            
            $args = array();
            $where = array();
            
            if (!array_key_exists('dcs', $_POST)) $this->_error('No data collections specified');
            
            foreach ($_POST['dcs'] as $d) {
                if (is_numeric($d)) {
                    array_push($args, $d);
                    array_push($where, 'dc.datacollectionid=:'.sizeof($args));
                }
            }
            
            if (sizeof($where)) {
                $where = implode(' OR ', $where);
                
                $rows = $this->db->pq("SELECT dc.datacollectionid as id, dc.wavelength,dc.filetemplate as prefix, dc.imagedirectory as dir, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit FROM datacollection dc INNER JOIN blsession s ON dc.sessionid = s.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
                
                $files = array();
                $xscale = '';
                $ids = array();
                foreach ($rows as $i => $r) {
                    if (!$xscale) {
                        $xscale = substr($r['DIR'], 0, strpos($r['DIR'], $r['VISIT'])).$r['VISIT'].'/processing/auto_mc/xscale/analyse';
                    }
                    
                    $root = str_replace($r['VISIT'], $r['VISIT'].'/processing/auto_mc',$r['DIR']) . str_replace('####.cbf', '', $r['PREFIX']);
                
                    $file = 'NATIVE_SWEEP1.HKL';
                    $file2 = 'SWEEP1.HKL';
                    
                    #$hkl = $root.'/DEFAULT/NATIVE/SWEEP1/integrate/XDS_ASCII.HKL';
                    $hkl = $root.'/DEFAULT/scale/'.$file;
                    if (file_exists($hkl)) {
                        if (!file_exists($root.'/'.$file2)) symlink($hkl, $root.'/'.$file2);
                        $rel = substr($root, strpos($root, 'auto_mc')+8);
                        array_push($files, '../../'.$rel.'/'.$file2);
                        array_push($ids, $r['ID']);
                    }
                    
                }
                
                #$last = 0;
                #foreach (glob($xscale.'/run_*') as $d) {
                #    if (preg_match('/run_(\d+)$/', $d, $m)) {
                #        if ($m[1] > $last) $last = $m[1];
                #    }
                #}
                #$last++;
                #$xscale .= '/run_'.$last;
                
                if (!file_exists($xscale)) mkdir($xscale, 0777, true);
                chdir($xscale);
                
                file_put_contents($xscale.'/ids.txt', implode("\n", $ids));
                
                file_put_contents($xscale.'/XSCALE.INP', "OUTPUT_FILE=temp.ahkl\nINPUT_FILE=".implode("\nINPUT_FILE=", $files));
                file_put_contents($xscale.'/xscale.sh', "#!/bin/sh\nmodule load xdsme\nxscale");
                
                # no x11 on cluster
                $ret = exec("module load global/cluster;qsub xscale.sh");
                #$ret = exec("chmod +x blend.sh;./blend.sh &");
                
            } else $ret = 'No data sets specified';
            
            $this->_output($ret);
            
        }
                                  
                                  
                                  
        function _cluster() {
            session_write_close();
            
            $info = $this->db->pq("SELECT TO_CHAR(s.startdate, 'YYYY') as yr, s.sessionid, s.beamlinename as bl, vr.run, vr.runid FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($info)) $this->_error('No such visit');
            $info = $info[0];
            
            $vis = '/dls/'.$info['BL'].'/data/'.$info['YR'].'/'.$this->arg('visit');
            $root = $vis.'/processing/auto_mc/xscale/analyse';
            $xsl = $root.'/XSCALE.LP';
            
            $data = array();
            $start = 99999999;
            $stop = false;
            if (file_exists($xsl)) {
                $log = explode("\n", file_get_contents($xsl));
                foreach ($log as $i => $l) {
                    if (strpos($l, 'CORRELATIONS BETWEEN INPUT DATA SETS AFTER CORRECTIONS') !== false) $start = $i + 4;

                    if ($i > $start && !$stop) {
                        if ($l) {
                            $row = preg_split('/\s+/', $l);

                            $a = (string)$row[1];
                            $b = (string)$row[2];
                            
                            if (!array_key_exists($a, $data)) $data[$a] = array();
                            if (!array_key_exists($b, $data)) $data[$b] = array();
                            
                            $data[$a][$b] = sqrt(1-pow($row[4],2));
                            $data[$b][$a] = sqrt(1-pow($row[4],2));
                            
                        } else $stop = true;
                    }
                }
                
                $init = $data;
                $ca = array(array(array_keys($data), 0));
                while (sizeof($data) > 1) {
                    list($data, $cluster) = $this->_iterate($data, $init);
                    array_push($ca, $cluster);
                }

                $ids = explode("\n", file_get_contents($root.'/ids.txt'));
                $this->_output(array($ids, array_reverse($ca)));
                
            } else {
                $this->_output('No xscale run');
            }
            
            /*
            $clusters = array();
            $children = &$clusters;
            $allocated = array();
            foreach (array_reverse($ca) as $c) {
                if (sizeof($children) == 0) {
                    array_push($children, array('children'=>array(), 'height'=>$c[1]));
                }
                
                foreach ($c[0] as $e) {
                    if (strlen($e) == 1 && !in_array($e, $allocated)) {
                        array_push($children, array('name' => $e, 'height' => 0));
                        array_push($allocated, $e);
                    }
                }
                
                $children = &$children[0]['children'];
            }
            
            print_r($clusters);
            $this->_output($clusters);
            */
        }
        
        
        
        function _iterate($data, $init) {
            $min = 2;
            $mk = array();
            foreach ($data as $i => $d) {
                $tmp = min($d);
                if ($tmp < $min) {
                    $min = $tmp;
                    $mk = array($i, array_slice(array_keys($d, $tmp),0));
                }
            }
            
            $k = $mk[0].'+'.$mk[1];
            $data[$k] = array();
            foreach ($data as $i => $d) {
                if ($i != $k && $mk[0] != $i && $mk[1] != $i) {
                    #$val = ($data[$mk[0]][$i]+$data[$mk[1]][$i])/2;
                    $val = $this->avg($k, $i, $init);
                    #$val = min($data[$mk[0]][$i],$data[$mk[1]][$i]);
                    
                    $data[$k][$i] = $val;
                    $data[$i][$k] = $val;
                }
            }
            
            unset($data[$mk[0]]);
            unset($data[$mk[1]]);
            
            foreach ($data as $i => $d) {
                unset($data[$i][$mk[0]]);
                unset($data[$i][$mk[1]]);
            }
            
            return array($data, array(array_keys($data), $min));
        }
        
        # average linkage
        function avg($a, $b, $data) {
            $aa = explode('+', $a);
            $ba = explode('+', $b);

            $tot = 0;
            foreach ($aa as $as) {
                foreach ($ba as $bs) {
                    $tot += $data[$as][$bs];
                }
            }
            
            return $tot / (sizeof($aa)*sizeof($ba));
            
        }
    }
    
    class Cluster {
        
        function __construct($k, $v) {
            $this->sequence = array($k);
            $this->data[$k] = $v;
        }
        
        function size() {
            return sizeof(array_keys($this->data));
        }
        
        function add($k, $v) {
            $this->data[$k] = $v;
            array_push($this->sequence, $k);
        }
        
        function avg() {
            return array_sum(array_values($this->data))/$this->size();
        }
        
        function key() {
            return implode('+', $this->sequence);
        }

    
    }

?>