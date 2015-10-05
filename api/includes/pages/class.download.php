<?php

    class Download extends Page {
        
        public static $arg_list = array('id' => '\d+',
                              'aid' => '\d+',
                              'run' => '\d+',
                              'visit' => '\w+\d+-\d+',
                              'u' => '\w+\d+',
                              's' => '\d',
                              'log' => '\d',
                              'LogFiles' => '([\w|\.])+',
                              'ty' => '\w+',
                              'pdb' => '\d',
                              'map' => '\d',
                              );

    
        public static $dispatch = array(array('/map(/pdb/:pdb)(/ty/:ty)(/id/:id)(/map/:map)', 'get', '_map'),
                              array('/id/:id/aid/:aid(/log/:log)(/1)(/LogFiles/:LogFiles)', 'get', '_auto_processing'),
                              array('/ep/id/:id(/log/:log)', 'get', '_ep_mtz'),
                              array('/dimple/id/:id(/log/:log)', 'get', '_dimple_mtz'),
                              array('/mrbump/id/:id(/log/:log)', 'get', '_mrbump_mtz'),
                              array('/csv/visit/:visit', 'get', '_csv_report'),
                              array('/bl/visit/:visit/run/:run', 'get', '_blend_mtz'),
            );

        
        # ------------------------------------------------------------------------
        # Download mtz/log file for Fast DP / XIA2
        function _auto_processing() {
            if (!$this->has_arg('id')) $this->_error('No data collection', 'No data collection id specified');
            if (!$this->has_arg('aid')) $this->_error('No auto processing id', 'No auto processing id specified');
            
            $rows = $this->db->pq('SELECT appa.filename,appa.filepath,appa.filetype FROM autoprocintegration api INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid WHERE api.datacollectionid = :1 AND api.autoprocprogramid=:2', array($this->arg('id'), $this->arg('aid')));
            
            $this->db->close();

            // print_r($rows);

            if (!sizeof($rows)) $this->_error('No such auto processing');
            // else $r = $rows[0];
        

            foreach ($rows as $r) {
                if ($this->has_arg('log')) {
                    if ($r['FILETYPE'] == 'Log') {
                        if ($this->has_arg('LogFiles')) {
                            $f = $r['FILEPATH'].'/LogFiles/'.$this->arg('LogFiles');
                            $this->app->contentType("text/plain");
                            
                        } else {
                        
                            $f = $r['FILEPATH'].'/'.$r['FILENAME'];
                            if ($r['FILENAME'] == 'fast_dp.log') $this->app->contentType("text/plain");
                        }
                            
                        readfile($f);
                    }
                
                } else {
                    // XIA2
                    if ($r['FILETYPE'] == 'Result') {
                        $f = $r['FILEPATH'].'/'.$r['FILENAME'];
                        if (file_exists($f)) {
                            $this->_header($r['FILENAME']);
                            readfile($f);
                            exit;
                            
                        } $this->_error('No such file', 'The specified auto processing file doesnt exist');
                        
                    // FastDP
                    } else if ($r['FILETYPE'] == 'Log' && $r['FILENAME'] == 'fast_dp.log') {
                        $f = $r['FILEPATH'].'/fast_dp.mtz';
                        if (file_exists($f)) {
                            $this->_header($this->arg('aid').'_fast_dp.mtz');
                            readfile($f);
                            exit;
                            
                        } $this->_error('No such file', 'The specified auto processing file doesnt exist');
                    }
                }
            }
        }
        
        
        # ------------------------------------------------------------------------
        # Return a blended mtz file
        function _blend_mtz() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified', 'No visit was specified');
            if (!$this->has_arg('run')) $this->_error('No run specified', 'No blend run number was specified');            
            
            $visit = $this->db->pq("SELECT TO_CHAR(startdate, 'YYYY') as y, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON p.proposalid=s.proposalid WHERE p.proposalcode || p.proposalnumber || '-' ||s.visit_number LIKE :1", array($this->arg('visit')));

            if (!sizeof($visit)) $this->_error('No such visit', 'The specified visit does not exist');
            else $visit = $visit[0];
            $this->db->close();
            
            $u = $this->has_arg('u') ? $this->arg('u') : $this->user->login;
            
            $root = '/dls/'.$visit['BL'].'/data/'.$visit['Y'].'/'.$this->arg('visit').'/processing/auto_mc/'.$u.'/blend/run_'.$this->arg('run');
            
            if (file_exists($root)) {
                $file = $this->has_arg('s') ? 'scaled_001.mtz' : 'merged_001.mtz';
                $f = $root.'/combined_files/'.$file;
                if (file_exists($f)) {
                    $this->_header('run_'.$this->arg('run').'_'.$file);
                    readfile($f);
                    exit;
                }
            }
        }
        
        
        # ------------------------------------------------------------------------
        # Return pdb/mtz/log file for fast_ep and dimple
        function _ep_mtz() {
            $this->_mtzmap('FastEP');
        }
        
        function _dimple_mtz() {
            $this->_mtzmap('Dimple');
        }

        function _mrbump_mtz() {
            $this->_mtzmap('MrBUMP');
        }


        function _mtzmap($type) {
            $types = array('MrBUMP' => array('root' => 'auto_mrbump/', 'files' => array('PostMRRefine.pdb', 'PostMRRefine.mtz'), 'log' => 'MRBUMP.log'),
                           'Dimple' => array('root' => 'fast_dp/dimple/', 'files' => array('final.pdb', 'final.mtz'), 'log' => 'dimple.log'),
                           'FastEP' => array('root' => 'fast_ep/', 'files' => array('sad.mtz', 'sad_fa.pdb'), 'log' => 'fast_ep.log'),
            );

            if (!array_key_exists($type, $types)) $this->_error('No such downstream type');
            else $t = $types[$type];

            $info = $this->db->pq('SELECT dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, p.proposalcode || p.proposalnumber || \'-\' || s.visit_number as vis FROM datacollection dc INNER JOIN blsession s ON s.sessionid=dc.sessionid INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE dc.datacollectionid=:1', array($this->arg('id')));
            
            if (!sizeof($info)) $this->_error('No such data collection', 'The specified data collection does not exist');
            else $info = $info[0];
            $this->db->close();
            
            $info['DIR'] = $this->ads($info['DIR']);

            $root = str_replace($info['VIS'], $info['VIS'] . '/processed', $info['DIR']).$info['IMP'].'_'.$info['RUN'].'_/'.$t['root'];
            $file = $root.$t['files'][0];
            
            if (file_exists($file)) {
                if ($this->has_arg('log')) {
                    if (file_exists($root.$t['log'])) {
                        $this->app->contentType("text/plain");
                        readfile($root.$t['log']);

                    } else $this->_error('Not found', 'That file couldnt be found');
                    
                } else {
                    if (!file_exists('/tmp/'.$this->arg('id').'_'.$type.'.tar.gz')) {
                        $a = new PharData('/tmp/'.$this->arg('id').'_'.$type.'.tar');

                        $a->addFile($file, $t['files'][0]);
                        $a->addFile($root.$t['files'][1], $t['files'][1]);
                        $a->compress(Phar::GZ);

                        unlink('/tmp/'.$this->arg('id').'_'.$type.'.tar');
                    }
                    
                    $this->_header($this->arg('id').'_'.$type.'.tar.gz');
                    readfile('/tmp/'.$this->arg('id').'_'.$type.'.tar.gz');
                    exit;
                }
                
                
            } else $this->_error('File not found', $type.' files were not found');

        }
        
        
        # ------------------------------------------------------------------------
        # Return maps and pdbs for dimple / fast ep
        function _map() {
            if (!$this->has_arg('id')) $this->_error('No id specified', 'No id was specified');
            if (!$this->has_arg('ty')) $this->_error('No type specified', 'No type was specified');
            
            $info = $this->db->pq('SELECT dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, p.proposalcode || p.proposalnumber || \'-\' || s.visit_number as vis FROM datacollection dc INNER JOIN blsession s ON s.sessionid=dc.sessionid INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE dc.datacollectionid=:1', array($this->arg('id')));
            
            if (!sizeof($info)) $this->_error('No such data collection', 'The specified data collection does not exist');
            else $info = $info[0];
            $this->db->close();
            
            $info['DIR'] = $this->ads($info['DIR']);

            if ($this->arg('ty') == 'ep') {
                $root = preg_replace('/'.$info['VIS'].'/', $info['VIS'].'/processed', $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_/fast_ep/';
                $file_name = 'sad';
                
            } else if ($this->arg('ty') == 'dimple') {
                $root = preg_replace('/'.$info['VIS'].'/', $info['VIS'].'/processed', $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_/fast_dp/dimple/';
                $file_name = 'final';
                
            } else if ($this->arg('ty') == 'mrbump') {
                $root = preg_replace('/'.$info['VIS'].'/', $info['VIS'].'/processed', $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_/auto_mrbump/';
                $file_name = 'PostMRRefine';
                
            } else $this->_error('No file type specified');
            
            $file = $root . $file_name;
            $ext = $this->has_arg('pdb') ? 'pdb' : 'mtz';
            
            if ($this->has_arg('pdb')) {
                $out = $file.'.'.$ext;
            } else {
                if ($this->arg('ty') == 'dimple' || $this->arg('ty') == 'mrbump') {
                    $map = $this->has_arg('map') ? 'fofc' : '2fofc';
                    $out = '/tmp/'.$this->arg('id').'_'.$this->arg('ty').'_'.$map.'.map.gz';
                    
                } else $out = '/tmp/'.$this->arg('id').'_'.$this->arg('ty').'.map.gz';
            }
 
            if ($ext == 'mtz') {
                # convert mtz to map
                if (!file_exists($out)) {
                    #print './scripts/mtz2map.sh '.$file.'.'.$ext.' '.$this->arg('id').' '.$this->arg('ty').' '.$file.'.pdb';
                    exec('./scripts/mtz2map.sh '.$file.'.'.$ext.' '.$this->arg('id').' '.$this->arg('ty').' '.$file.'.pdb');
                }
                
                $ext = 'map';
            }
            
            if (file_exists($out)) {
                if ($this->arg('ty') == 'ep' && $this->has_arg('pdb')) {
                    $lines = explode("\n", file_get_contents($out));
                    
                    foreach ($lines as $l) {
                        #$l = str_replace('PDB= PDB  ', ' S   ALA A', $l);
                        $l = str_replace('ATOM  ', 'HETATM', $l);
                        print $l."\n";
                    }
                    
                    
                    
                    
                } else {
                    $size = filesize($out);
                    $this->app->response->headers->set("Content-length", $size);
                    readfile($out);
                }
            } //else $this->_error('File not found', 'Fast EP / Dimple files were not found');
        }
        
        
        # ------------------------------------------------------------------------
        # CSV Report of Data Collections
        function _csv_report() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified', 'You must specify a visit to download a report for');
            
            $vis = $this->db->pq("SELECT s.sessionid,s.beamlinename,TO_CHAR(s.startdate, 'DD_MM_YYYY') as st FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($vis)) $this->_error('No such visit', 'The specified visit doesnt exist');
            else $vis = $vis[0];
            
            $rows = $this->db->pq("SELECT dc.imageprefix,s.beamlinename,dc.datacollectionnumber,TO_CHAR(dc.starttime, 'DD/MM/YYYY HH24:MI:SS'), sa.name, p.name as protein, dc.numberofimages, dc.wavelength, dc.detectordistance, dc.exposuretime, dc.axisstart, dc.axisrange, dc.xbeam, dc.ybeam, dc.resolution, dc.comments FROM datacollection dc INNER JOIN blsession s ON s.sessionid = dc.sessionid LEFT OUTER JOIN blsample sa ON dc.blsampleid = sa.blsampleid LEFT OUTER JOIN crystal c ON sa.crystalid = c.crystalid LEFT OUTER JOIN protein p ON c.proteinid = p.proteinid WHERE dc.sessionid=:1 ORDER BY dc.starttime", array($vis['SESSIONID']));
            
            $this->app->response->headers->set("Content-type", "application/vnd.ms-excel");
            $this->app->response->headers->set("Content-disposition", "attachment; filename=".$vis['ST']."_".$vis['BEAMLINENAME']."_".$this->arg('visit').".csv");
            print "Image prefix,Beamline,Run no,Start Time,Sample Name,Protein Acronym,# images, Wavelength (angstrom), Distance (mm), Exp. Time (sec), Phi start (deg), Phi range (deg), Xbeam (mm), Ybeam (mm), Detector resol. (angstrom), Comments\n";
            foreach ($rows as $r) {
                $r['COMMENTS'] = '"'.$r['COMMENTS'].'"';
                print implode(',', array_values($r))."\n";
            }
        }
        
        
        # ------------------------------------------------------------------------
        # Force browser to download file
        function _header($f) {
            /*$this->app->contentType("application/octet-stream");
            $this->app->response->headers->set('Content-Description', 'File Transfer');
            $this->app->response->headers->set("Content-Transfer-Encoding", "Binary");
            $this->app->response->headers->set("Content-disposition", "attachment; filename=\"$f\"");
            */
            
            header("Content-Type: application/octet-stream");
            header("Content-Transfer-Encoding: Binary");
            header("Content-disposition: attachment; filename=\"$f\"");
        }
        
    }
?>