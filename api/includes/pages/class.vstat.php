<?php
    
    class Vstat extends Page {
    

        public static $arg_list = array('visit' => '\w+\d+-\d+',
        
        );


        public static $dispatch = array(array('/breakdown/:visit', 'get', '_visit_breakdown'),
                              array('/hrs(/:visit)', 'get', '_hourlies'),
                              array('/pies(/:visit)', 'get', '_pies'),
                              array('/ehc/:visit', 'get', '_ehc_log'),
                              array('/call/:visit', 'get', '_callouts'),
        );

        
        function _visit_breakdown() {
            $info = $this->_check_visit();
            
            $dc = $this->db->pq("SELECT dc.kappastart, dc.phistart, dc.wavelength, dc.beamsizeatsamplex, dc.beamsizeatsampley, dc.datacollectionid as id, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(dc.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, (dc.endtime - dc.starttime)*86400 as dctime, dc.runstatus 
                FROM datacollection dc 
                WHERE dc.sessionid=:1 ORDER BY dc.starttime DESC", array($info['SID']));
            
            $dcf = $this->db->pq("SELECT COUNT(dc.datacollectionid) as count FROM datacollection dc WHERE dc.sessionid=:1 AND dc.overlap = 0 AND dc.axisrange > 0", array($info['SID']));
            $dcs = $this->db->pq("SELECT COUNT(dc.datacollectionid) as count FROM datacollection dc WHERE dc.sessionid=:1 AND dc.overlap != 0", array($info['SID']));
            
            $robot = $this->db->pq("SELECT r.status, r.actiontype, TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as en, (CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE))*86400 as dctime FROM robotaction r WHERE r.blsessionid=:1 AND r.actiontype='LOAD' ORDER BY r.endtimestamp DESC", array($info['SID']));

            $edge = $this->db->pq("SELECT e.energyscanid as id, TO_CHAR(e.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(e.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, (e.endtime - e.starttime)*86400 as dctime FROM energyscan e WHERE e.sessionid=:1 ORDER BY e.endtime DESC", array($info['SID']));

            $fl = $this->db->pq("SELECT f.xfefluorescencespectrumid as id, TO_CHAR(f.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(f.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, (f.endtime - f.starttime)*86400 as dctime FROM xfefluorescencespectrum f WHERE f.sessionid=:1 ORDER BY f.endtime DESC", array($info['SID']));
            
            $ai = $this->db->pq("SELECT dc.datacollectionid as id, TO_CHAR(dc.endtime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(max(s.bltimestamp), 'DD-MM-YYYY HH24:MI:SS') as en, (max(s.bltimestamp) - dc.endtime)*86400 as dctime FROM datacollection dc INNER JOIN screening s ON s.datacollectionid = dc.datacollectionid WHERE dc.sessionid=:1 GROUP BY dc.datacollectionid, dc.endtime ORDER BY dc.endtime DESC", array($info['SID']));
            
            $cent = $this->db->pq("SELECT * FROM (SELECT TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as en, (min(dc.starttime) - CAST(r.endtimestamp AS DATE))*86400 as dctime FROM robotaction r INNER JOIN datacollection dc ON r.blsampleid = dc.blsampleid AND r.endtimestamp < dc.starttime WHERE dc.sessionid=:1 GROUP BY r.endtimestamp ORDER BY r.endtimestamp) WHERE dctime < 1000", array($info['SID']));
            
            #$cent = $this->db->pq("SELECT distinct en,st,dctime FROM (SELECT TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as en, (min(dc.starttime) - CAST(r.endtimestamp AS DATE))*86400 as dctime FROM robotaction r INNER JOIN datacollection dc ON r.endtimestamp < dc.starttime WHERE dc.sessionid=:1 GROUP BY r.endtimestamp ORDER BY r.endtimestamp) WHERE dctime < 1000", array($info['SID']));
            
            #print_r($cent);
            

            # Get Faults
            $faultl = $this->db->pq("SELECT f.faultid, bl.beamlinename as beamline, f.owner, s.name as system, c.name as component, sc.name as subcomponent, TO_CHAR(f.starttime, 'DD-MM-YYYY HH24:MI') as starttime, f.beamtimelost, round((f.beamtimelost_endtime-f.beamtimelost_starttime)*24,2) as lost, f.title, f.resolved, TO_CHAR(f.beamtimelost_starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(f.beamtimelost_endtime, 'DD-MM-YYYY HH24:MI:SS') as en
                FROM bf_fault f INNER JOIN blsession bl ON f.sessionid = bl.sessionid
                INNER JOIN bf_subcomponent sc ON f.subcomponentid = sc.subcomponentid
                INNER JOIN bf_component c ON sc.componentid = c.componentid
                INNER JOIN bf_system s ON c.systemid = s.systemid
                WHERE f.sessionid = :1", array($info['SID']));
            
            $info['DC_FULL'] = sizeof($dcf) ? $dcf[0]['COUNT'] : 0;
            $info['DC_SCREEN'] = sizeof($dcs) ? $dcs[0]['COUNT'] : 0;
            $info['DC_TOT'] = sizeof($dc);
            $info['DC_STOPPED'] = 0;
            $info['E_TOT'] = sizeof($edge);
            $info['FL_TOT'] = sizeof($fl);
            $info['R_TOT'] = sizeof($robot);
            $info['F_TOT'] = sizeof($faultl);
            
            if ($info['DC_TOT'] + $info['E_TOT'] + $info['R_TOT'] == 0) $this->_error('No Data');
            
            $data = array();
            $lines = array(array('data' => array()),
                           array('data' => array()),
                           array('data' => array()),
                           array('data' => array()),
                           array('data' => array()),
                           );

            foreach ($dc as $d) {
                if (strpos($d['RUNSTATUS'], 'Successful') === false) $info['DC_STOPPED']++;
                                    
                if ($d['ST'] && $d['EN']) {
                    array_push($data, array('data' => array(
                        array($this->jst($d['ST']), 1, $this->jst($d['ST'])),
                        array($this->jst($d['EN']), 1, $this->jst($d['ST']))), 'color' => 'green', 'id' => intval($d['ID']), 'type' => 'dc'));

                    $d['ENERGY'] = (1.98644568e-25/($d['WAVELENGTH']*1e-10))/1.60217646e-19;

                    foreach (array('ENERGY', 'BEAMSIZEATSAMPLEX', 'BEAMSIZEATSAMPLEY', 'KAPPASTART', 'PHISTART') as $i => $f) {
                        $lines[$i]['label'] = $f;
                        if ($i > 0) $lines[$i]['yaxis'] = $i > 2 ? 3 : ($i > 0 ? 2 : 1);
                        array_push($lines[$i]['data'], array($this->jst($d['ST']), floatval(round($d[$f],4))));
                    }
                }
            }
            
            foreach ($robot as $r) {
                array_push($data, array('data' => array(
                        array($this->jst($r['ST']), 2, $this->jst($r['ST'])),
                        array($this->jst($r['EN']), 2, $this->jst($r['ST']))), 'color' => $r['STATUS'] != 'SUCCESS' ? 'purple' : 'blue', 'status' => ' ' . $r['ACTIONTYPE'] . ' (' . $r['STATUS'] . ')', 'type' => 'robot'));
            }
            
            foreach ($edge as $e) {
                array_push($data, array('data' => array(
                        array($this->jst($e['ST']), 3, $this->jst($e['ST'])),
                        array($this->jst($e['EN']), 3, $this->jst($e['ST']))), 'color' => 'orange', 'id' => $e['ID'], 'type' => 'ed'));
            }

            foreach ($fl as $e) {
                array_push($data, array('data' => array(
                        array($this->jst($e['ST']), 3, $this->jst($e['ST'])),
                        array($this->jst($e['EN']), 3, $this->jst($e['ST']))), 'color' => 'red', 'type' => 'mca', 'id' => $e['ID'], 'type' => 'mca'));
            }
                                    
            foreach ($faultl as $f) {
                if ($f['BEAMTIMELOST']) {
                    array_push($data, array('data' => array(
                        array($this->jst($f['ST']), 4, $this->jst($f['ST'])),
                        array($this->jst($f['EN']), 4, $this->jst($f['ST']))), 'color' => 'grey', 'type' => 'fault', 'status' => ' Fault: '.$f['TITLE']));
                    
                }
            }
                                    
            foreach ($ai as $d) {
                if ($d['ST'] && $d['EN'])
                    array_push($data, array('data' => array(
                        array($this->jst($d['ST']), 1, $this->jst($d['ST'])),
                        array($this->jst($d['EN']), 1, $this->jst($d['ST']))), 'color' => '#93db70', 'id' => intval($d['ID']), 'type' => 'ai'));
            }

            foreach ($cent as $c) {
                if ($c['ST'] && $c['EN'])
                    array_push($data, array('data' => array(
                        array($this->jst($c['ST']), 1.5, $this->jst($c['ST'])),
                        array($this->jst($c['EN']), 1.5, $this->jst($c['ST']))), 'color' => 'cyan', 'type' => 'cent'));
            }
                                    
            // Beam status 
            //$bs = $this->_get_archive('SR-DI-DCCT-01:SIGNAL', strtotime($info['ST']), strtotime($info['EN']), 200);
            $bs = $this->_get_archive('CS-CS-MSTAT-01:MODE', strtotime($info['ST']), strtotime($info['EN']), 2000);
                                    
            if (!sizeof($bs)) $bs = array();
                                    
            $lastv = 0;
            $ex = 3600*1000;
            $bd = False;
            foreach ($bs as $i => $b) {
                //$v = $b[1] < 5 ? 1 : 0;
                $v = $b[1] != 4;
                $c = $b[0]*1000;
                
                if (($v != $lastv) && $v) {
                    $bd = True;
                    $st = $c;
                }
                           
                if ($lastv && ($v != $lastv)) {
                    array_push($data, array('data' => array(
                            array($st+$ex, 4, $st+$ex),
                            array($c+$ex, 4, $st+$ex)), 'color' => 'black', 'status' => ' Beam Dump', 'type' => 'nobeam'));
                    $bd = False;
                }
                
                $lastv = $v;
            }
                    
            
            $first = $info['ST'];
            $last = $info['EN'];
            if (sizeof($dc)) {
                $f = $dc[0];
                $l = end($dc);
                if (strtotime($f['EN'] ? $f['EN'] : $f['ST']) > strtotime($info['EN'])) $last = $f['EN'] ? $f['EN'] : $f['ST'];
                if (strtotime($l['ST']) < strtotime($info['ST'])) $first = $l['ST'];
                $info['LAST'] = $dc[0]['ST'];
            } else $info['LAST'] = '';
                                    
            $info['start'] = $this->jst($first);
            $info['end'] = $this->jst($last);
                                    
            $this->_output(array('info' => $info, 'data' => $data, 'lines' => $lines));
        }
        
       
        function _pies() {
            $args = array($this->proposalid);
            $where = ' WHERE p.proposalid=:1';
                                    
            if ($this->has_arg('visit')) {
                $info = $this->_check_visit();
                $where .= ' AND s.sessionid=:'.(sizeof($args)+1);
                array_push($args, $info['SID']);
            }
            
            $dc = $this->db->pq("SELECT max(p.title) as title, TO_CHAR(MAX(dc.endtime), 'DD-MM-YYYY HH24:MI') as last, SUM(dc.endtime - dc.starttime)*24 as dctime, GREATEST((min(dc.starttime)-min(s.startdate))*24,0) as sup, GREATEST((max(s.enddate)-max(dc.endtime))*24,0) as rem, s.visit_number as visit, TO_CHAR(min(s.startdate), 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(max(s.enddate), 'DD-MM-YYYY HH24:MI') as en, (max(s.enddate) - min(s.startdate))*24 as len FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN datacollection dc ON (dc.sessionid = s.sessionid) $where GROUP BY s.visit_number ORDER BY min(s.startdate) DESC", $args);
            
            $robot = $this->db->pq("SELECT SUM(CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE))*24 as dctime, s.visit_number as visit FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) $where GROUP BY s.visit_number", $args);

            $edge = $this->db->pq("SELECT SUM(e.endtime-e.starttime)*24 as dctime, s.visit_number as visit FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN energyscan e ON (e.sessionid = s.sessionid) $where GROUP BY s.visit_number", $args);
            
            $ai = $this->db->pq("SELECT SUM(ai) as aitime, visit FROM (
                    SELECT (max(sc.bltimestamp) - dc.endtime)*24 as ai, s.visit_number as visit FROM datacollection dc INNER JOIN screening sc ON sc.datacollectionid = dc.datacollectionid INNER JOIN blsession s ON s.sessionid = dc.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid $where GROUP BY dc.datacollectionid, s.visit_number, dc.endtime
                ) GROUP BY visit", $args);
            
            $cent = $this->db->pq("SELECT SUM(cent) as centtime, visit FROM (SELECT (min(dc.starttime) - CAST(r.endtimestamp AS DATE))*24 as cent, s.visit_number as visit FROM robotaction r INNER JOIN datacollection dc ON (r.blsampleid = dc.blsampleid AND r.endtimestamp < dc.starttime) INNER JOIN blsession s ON s.sessionid = dc.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid $where GROUP BY r.endtimestamp, s.visit_number) WHERE cent < 0.25 GROUP BY visit", $args);
                                    
            $fault = $this->db->pq("SELECT SUM((f.beamtimelost_endtime-f.beamtimelost_starttime)*24) as lost, s.visit_number as visit FROM bf_fault f INNER JOIN blsession s ON f.sessionid = s.sessionid INNER JOIN proposal p ON (p.proposalid = s.proposalid) $where GROUP BY s.visit_number", $args);
            
            foreach ($robot as $r) {
                foreach ($dc as &$d) {
                    if ($r['VISIT'] == $d['VISIT']) $d['R'] = $r['DCTIME'];
                }
            }

            foreach ($edge as $e) {
                foreach ($dc as &$d) {
                    if ($e['VISIT'] == $d['VISIT']) $d['EDGE'] = $e['DCTIME'];
                }
            }

            foreach ($ai as $a) {
                foreach ($dc as &$d) {
                    if ($a['VISIT'] == $d['VISIT']) $d['AITIME'] = $a['AITIME'] ? $a['AITIME'] : 0;
                }
            }

            foreach ($cent as $a) {
                foreach ($dc as &$d) {
                    if ($a['VISIT'] == $d['VISIT']) $d['CENTTIME'] = $a['CENTTIME'] ? $a['CENTTIME'] : 0;
                }
            }
                                    
            foreach ($fault as $f) {
                foreach ($dc as &$d) {
                    if ($f['VISIT'] == $d['VISIT']) $d['FAULT'] = $f['LOST'] ? $f['LOST'] : 0;
                }
            }
            
            $i = 0;
            foreach ($dc as &$d) {
                if (!array_key_exists('R', $d)) $d['R'] = 0;
                if (!array_key_exists('EDGE', $d)) $d['EDGE'] = 0;
                if (!array_key_exists('AITIME', $d)) $d['AITIME'] = 0;
                if (!array_key_exists('CENTTIME', $d)) $d['CENTTIME'] = 0;
                if (!array_key_exists('FAULT', $d)) $d['FAULT'] = 0;
                                    
                // Beam status
                $bs = $this->_get_archive('CS-CS-MSTAT-01:MODE', strtotime($d['ST']), strtotime($d['EN']), 2000);
                if (!sizeof($bs)) $bs = array();
                
                $lastv = 0;
                $ex = 3600*1000;
                $bd = False;
                $total_no_beam = 0;
                foreach ($bs as $i => $b) {
                    //$v = $b[1] < 5 ? 1 : 0;
                    $v = $b[1] != 4;
                    $c = $b[0]*1000;
                    
                    if (($v != $lastv) && $v) {
                        $bd = True;
                        $st = $c;
                    }
                    
                    if ($lastv && ($v != $lastv)) {
                        $total_no_beam += ($c - $st) / 1000;
                        $bd = False;
                    }
                    
                    $lastv = $v;
                }
                                    
                $d['NOBEAM'] = $total_no_beam/3600;
                                    
                $d['T'] = max($d['LEN'] - $d['SUP'] - $d['DCTIME'] - $d['R'] - $d['REM'] - $d['EDGE'] - $d['AITIME'] - $d['CENTTIME'] - $d['FAULT'] - $d['NOBEAM'],0);
                
                foreach (array('SUP', 'DCTIME', 'LEN', 'R', 'REM', 'T', 'EDGE') as $nf) $d[$nf] = number_format($d[$nf], 2, '.', '');
                
                $d['ID'] = $i;
                
                $i++;
            }
            
            # Averages
            $avgs = array();
            foreach (array('T', 'SUP', 'DCTIME', 'R', 'REM', 'EDGE', 'AITIME', 'CENTTIME', 'FAULT', 'NOBEAM') as $i => $col) {
                $arr = array_map(function($d) use ($col) { return $d[$col]; }, $dc);
                $avgs[$col] = sizeof($arr) ? array_sum($arr) / count($arr) : 0;
            }
            #foreach ($plot as $p) {
            #    $arr = array_map(function($i) { return $i[1]; }, $p);
            #    array_push($avgs, sizeof($arr) ? array_sum($arr) / count($arr) : 0);
            #}
                                    
            if ($this->has_arg('visit')) $this->_output(sizeof($dc) ? $dc[0] : array());
            else $this->_output(array('VISITS' => $dc, 'AVERAGE' => $avgs));
        }
        
        
        function _hourlies() {
            $args = array($this->proposalid);
            $where = '';
                                    
            if ($this->has_arg('visit')) {
                $info = $this->_check_visit();
                $where .= ' AND s.sessionid=:'.(sizeof($args)+1);
                array_push($args, $info['SID']);
            }
                                    
            # Data Collections / Hour
            $dch_tmp = $this->db->pq("SELECT AVG(datacollections) as dcs, TO_CHAR(dh, 'HH24') as hour FROM (
                    SELECT count(dc.datacollectionid) as datacollections, TRUNC(dc.starttime, 'HH24') as dh
                    FROM datacollection dc
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    WHERE dc.axisrange > 0 AND dc.overlap = 0 AND p.proposalid=:1 $where
                    GROUP BY TRUNC(dc.starttime, 'HH24')
                ) GROUP BY TO_CHAR(dh, 'HH24') ORDER BY hour
            ", $args);
            $dch = array();
            foreach ($dch_tmp as $d) {
                array_push($dch, array($d['HOUR'], $d['DCS']));
            }
            
                                    
            # Samples Loaded / Hour
            $slh_tmp = $this->db->pq("SELECT AVG(samples) as SLH, TO_CHAR(dh, 'HH24') as hour FROM (
                    SELECT count(r.robotactionid) as samples, TRUNC(r.starttimestamp, 'HH24') as dh
                    FROM robotaction r
                    INNER JOIN blsession s ON s.sessionid = r.blsessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    WHERE r.actiontype='LOAD' AND p.proposalid=:1 $where
                    GROUP BY TRUNC(r.starttimestamp, 'HH24')
                ) GROUP BY TO_CHAR(dh, 'HH24') ORDER BY hour
            ", $args);
            $slh = array();
            foreach ($slh_tmp as $d) {
                array_push($slh, array($d['HOUR'], $d['SLH']));
            }
                                    
            $this->_output(array('samples' => $slh, 'dcs' => $dch));
        }
        
        
        function _ehc_log() {
            $info = $this->_check_visit();
                
            $en = strtotime($info['EN']);
            $ehc_tmp = $this->_get_remote_xml('https://rdb.pri.diamond.ac.uk/php/elog/cs_logwscontentinfo.php?startdate='.date('d/m/Y', $en));
            if (!$ehc_tmp) $ehc_tmp = array();
                     
            $ehcs = array();
            foreach ($ehc_tmp as $e) {
                //if (strpos($e->title, 'shift') !== False) 
                array_push($ehcs, $e);
            }
                                    
            $this->_output($ehcs);
        }
        
        
        function _callouts() {
            $info = $this->_check_visit();
                                    
            $st = strtotime($info['ST']);
            $en = strtotime($info['EN']);
                                    
            $bls =  array('i02' => 'BLI02', 'i03' => 'BLI03', 'i04' => 'BLI04', 'i04-1' => 'BLI04J', 'i24' => 'BLI24', 'i23' => 'BLI23',
                          'i11-1' => 'BLI11',
                          'b21' => 'BLB21',
                          'i12' => 'BLI12', 'i13' => 'BLI13', 'i13-1' => 'BLI13J',
                          );
            $calls = $this->_get_remote_xml('https://rdb.pri.diamond.ac.uk/php/elog/cs_logwscalloutinfo.php?startdate='.date('d/m/Y', $st).'&enddate='.date('d/m/Y', $en).'selgroupid='.$bls[$info['BL']]);
            if (!$calls) $calls = array();
                                    
            $this->_output($calls);
        }

                                    
                                    
        
        function _check_visit() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            
            $args = array($this->arg('visit'));
            $where = "WHERE p.proposalcode || p.proposalnumber || '-' || s.visit_number LIKE :1";
            
            if (!$this->staff) {
                if (!$this->has_arg('prop')) $this->_error('No proposal selected', 'You need to select a proposal before viewing this page');
                
                $where .= ' AND p.proposalid LIKE :2';
                array_push($args, $this->proposalid);
            }
            
            $info = $this->db->pq("SELECT p.proposalcode || p.proposalnumber as prop, s.beamlinename as bl, s.sessionid as sid, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en, round((s.enddate - s.startdate)*24,1) as len FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) $where", $args);
            
            if (!sizeof($info)) {
                $this->_error('No such visit');
            } else return $info[0];
        }
            
                                    
                                    
        // Return xml from external link without using url_fopen
        function _get_remote_xml($url) {
            libxml_use_internal_errors(true);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $xml = curl_exec($ch);
            curl_close($ch);
                                    
            return simplexml_load_string($xml);
        }
    
    }

?>
