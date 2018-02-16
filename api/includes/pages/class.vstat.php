<?php
    
    class Vstat extends Page {
    

        public static $arg_list = array(
            'visit' => '\w+\d+-\d+',
            'ty' => '\w+',
            'runid' => '\d+',
            'group_by' => '\w+',
            'proposalcode' => '\w+',
            'proposal' => '\w+',
            'scheduled' => '\d',
            'bl' => '[\w-]+',
            'download' => '\d',
        );


        public static $dispatch = array(array('/breakdown(/:visit)', 'get', '_visit_breakdown'),
                              array('/hrs(/:visit)', 'get', '_hourlies'),
                              array('/pies(/:visit)', 'get', '_pies'),
                              array('/ehc/:visit', 'get', '_ehc_log'),
                              array('/call/:visit', 'get', '_callouts'),
                              array('/overview', 'get', '_overview'),
                              array('/runs', 'get', '_runs'),
                              array('/histogram', 'get', '_parameter_histogram'),
        );

        
        function _visit_breakdown() {
            ini_set('memory_limit', '512M'); 

            if ($this->has_arg('visit')) {
                $info = $this->_check_visit();
                $where = 'AND s.sessionid=:1';
                $args = array($info['SID']);

            } else if ($this->user->has('all_breakdown')) {
                if (!$this->has_arg('runid')) $this->_error('No run specified');
                if (!$this->has_arg('bl')) $this->_error('No beamline specified');

                $info = $this->db->pq("SELECT TO_CHAR(vr.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(vr.enddate, 'DD-MM-YYYY HH24:MI') as en
                    FROM v_run vr 
                    WHERE runid=:1", array($this->arg('runid')));

                if (!sizeof($info)) $this->_error('No such run');
                $info = $info[0];

                $where = "AND vr.runid=:1 AND s.beamlinename=:2 AND p.proposalcode <> 'cm'";
                $args = array($this->arg('runid'), $this->arg('bl'));

            } else $this->_error('No visit specified');

            $dc = $this->db->pq("SELECT IF(dc.chistart IS NULL, 0, dc.chistart) as chistart, dc.kappastart, dc.phistart, dc.wavelength, dc.beamsizeatsamplex, dc.beamsizeatsampley, dc.datacollectionid as id, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(dc.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, dc.runstatus, CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) as visit, pr.proteinid, pr.acronym as protein, smp.name as sample
                FROM datacollection dc 
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                LEFT OUTER JOIN blsample smp ON smp.blsampleid = dc.blsampleid
                LEFT OUTER JOIN crystal c ON c.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = c.proteinid
                WHERE 1=1 $where ORDER BY dc.starttime", $args);
            
            $dcf = $this->db->pq("SELECT COUNT(dc.datacollectionid) as count 
                FROM datacollection dc 
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE dc.overlap = 0 AND dc.axisrange > 0 $where", $args);
            $dcs = $this->db->pq("SELECT COUNT(dc.datacollectionid) as count 
                FROM datacollection dc 
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE dc.overlap != 0 $where", $args);
            
            $robot = $this->db->pq("SELECT r.status, r.actiontype, TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as en, pr.acronym as protein, smp.name as sample
                FROM robotaction r 
                INNER JOIN blsession s ON s.sessionid = r.blsessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                LEFT OUTER JOIN blsample smp ON r.blsampleid = smp.blsampleid
                LEFT OUTER JOIN crystal c ON c.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = c.proteinid
                WHERE r.actiontype='LOAD' $where ORDER BY r.endtimestamp DESC", $args);

            $edge = $this->db->pq("SELECT e.energyscanid as id, TO_CHAR(e.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(e.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, CONCAT(p.proposalnumber, p.proposalcode) as prop, pr.acronym as protein, smp.name as sample
                FROM energyscan e
                INNER JOIN blsession s ON s.sessionid = e.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                LEFT OUTER JOIN blsample smp ON e.blsampleid = smp.blsampleid
                LEFT OUTER JOIN crystal c ON c.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = c.proteinid
                WHERE 1=1 $where ORDER BY e.endtime DESC", $args);

            $fl = $this->db->pq("SELECT f.xfefluorescencespectrumid as id, TO_CHAR(f.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(f.endtime, 'DD-MM-YYYY HH24:MI:SS') as en, CONCAT(p.proposalnumber, p.proposalcode) as prop, pr.acronym as protein, smp.name as sample
                FROM xfefluorescencespectrum f 
                INNER JOIN blsession s ON s.sessionid = f.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                LEFT OUTER JOIN blsample smp ON f.blsampleid = smp.blsampleid
                LEFT OUTER JOIN crystal c ON c.crystalid = smp.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = c.proteinid
                WHERE 1=1 $where ORDER BY f.endtime DESC", $args);
            
            if ($this->has_arg('visit')) {
                $ai = $this->db->pq("SELECT dc.datacollectionid as id, TO_CHAR(dc.endtime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(max(sc.bltimestamp), 'DD-MM-YYYY HH24:MI:SS') as en
                    FROM datacollection dc 
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN screening sc ON sc.datacollectionid = dc.datacollectionid 
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where
                    GROUP BY dc.datacollectionid, dc.endtime ORDER BY dc.endtime DESC", $args);
                
                $cent = $this->db->pq("SELECT * FROM (SELECT TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as en, TIMESTAMPDIFF('SECOND', CAST(r.endtimestamp as DATE), min(dc.starttime)) as dctime
                    FROM robotaction r 
                    INNER JOIN datacollection dc ON r.blsampleid = dc.blsampleid AND r.endtimestamp < dc.starttime 
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where 
                    GROUP BY r.endtimestamp ORDER BY r.endtimestamp) inq WHERE dctime < 1000", $args);

                $sched = array();

                $ctf = $this->db->pq("SELECT TO_CHAR(m.createdtimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, c.astigmatism, c.estimatedresolution, c.estimateddefocus
                    FROM ctf c
                    INNER JOIN autoprocprogram app ON app.autoprocprogramid = c.autoprocprogramid
                    INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                    INNER JOIN movie m ON m.movieid = mc.movieid
                    INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where ORDER BY m.createdtimestamp", $args);

            } else {
                $ai = array();
                $cent = array();
                $ctf = array();

                $sched = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI:SS') as en, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI:SS') as st, p.title, s.scheduled, p.proposalcode
                    FROM blsession s
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where
                    ORDER BY p.proposalcode, s.startdate", $args);
            }
            
            #$cent = $this->db->pq("SELECT distinct en,st,dctime FROM (SELECT TO_CHAR(r.endtimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as en, (min(dc.starttime) - CAST(r.endtimestamp AS DATE))*86400 as dctime FROM robotaction r INNER JOIN datacollection dc ON r.endtimestamp < dc.starttime WHERE dc.sessionid=:1 GROUP BY r.endtimestamp ORDER BY r.endtimestamp) WHERE dctime < 1000", array($info['SID']));
            
            #print_r($cent);
            

            # Get Faults
            $faultl = $this->db->pq("SELECT f.faultid, f.beamtimelost, f.title, TO_CHAR(f.beamtimelost_starttime, 'DD-MM-YYYY HH24:MI:SS') as st, TO_CHAR(f.beamtimelost_endtime, 'DD-MM-YYYY HH24:MI:SS') as en
                FROM bf_fault f 
                INNER JOIN blsession s ON f.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE f.beamtimelost=1 $where", $args);
            
            $info['DC_FULL'] = sizeof($dcf) ? $dcf[0]['COUNT'] : 0;
            $info['DC_SCREEN'] = sizeof($dcs) ? $dcs[0]['COUNT'] : 0;
            $info['DC_TOT'] = sizeof($dc);
            $info['DC_GRID'] = $info['DC_TOT'] - $info['DC_SCREEN'] - $info['DC_FULL'];
            $info['DC_STOPPED'] = 0;
            $info['E_TOT'] = sizeof($edge);
            $info['FL_TOT'] = sizeof($fl);
            $info['R_TOT'] = sizeof($robot);
            $info['F_TOT'] = sizeof($faultl);
            
            if ($info['DC_TOT'] + $info['E_TOT'] + $info['R_TOT'] == 0) $this->_error('No Data');
            
            $data = array();

            $linecols = array('ENERGY', 'BEAMSIZEATSAMPLEX', 'BEAMSIZEATSAMPLEY', 'KAPPASTART', 'PHISTART', 'CHISTART');
            $lines = array();
            foreach ($linecols as $c) array_push($lines, array('data' => array()));

            $scattercols = array('ASTIGMATISM', 'ESTIMATEDDEFOCUS', 'ESTIMATEDRESOLUTION');
            $scatters = array();
            foreach ($scattercols as $c) array_push($scatters, array('data' => array()));

            foreach ($ctf as $c) {
                foreach ($scattercols as $i => $f) {
                    $scatters[$i]['label'] = $f;
                    if ($i > 0) $scatters[$i]['yaxis'] = $i+1;
                    if (floatval($c[$f]) < 1e38) array_push($scatters[$i]['data'], array($this->jst($c['ST']), floatval(round($c[$f],4))));
                }
            }

            $queued = 0;
            $vis_map = array();
            foreach ($sched as $s) {
                if ($s['SCHEDULED'] != '1' || $s['PROPOSALCODE'] == 'lb' || $s['PROPOSALCODE'] == 'nr') {
                    $vis_map[$s['VISIT']] = $s;
                    $queued++;
                    continue;
                }
                array_push($data, array('data' => array(
                    array($this->jst($s['ST']), 6, $this->jst($s['ST'])),
                    array($this->jst($s['EN']), 6, $this->jst($s['ST']))), 'color' => 'purple', 'type' => 'visit', 'status' => $s['VISIT'].': '.$s['TITLE'], 'visit' => $s['VISIT']));
            }

            $lastend = null;
            $lastvisit = null;
            $startvisit = null;
            foreach ($dc as $d) {
                
                if ($lastvisit && ($d['VISIT'] != $lastvisit)) {
                    if (array_key_exists($lastvisit, $vis_map)) {
                        $s = $vis_map[$lastvisit];
                        // print_r(array($startvisit, $lastend, $s));
                        array_push($data, array('data' => array(
                        array($this->jst($startvisit), 7, $this->jst($startvisit)),
                        array($this->jst($lastend), 7, $this->jst($startvisit))), 'color' => 'purple', 'type' => 'visit_ns', 'status' => $s['VISIT'].': '.$s['TITLE'], 'visit' => $s['VISIT']));
                    }

                    $startvisit = null;
                }

                if (strpos($d['RUNSTATUS'], 'Successful') === false) $info['DC_STOPPED']++;
                                    
                if ($d['ST'] && $d['EN']) {
                    array_push($data, array('data' => array(
                        array($this->jst($d['ST']), 1, $this->jst($d['ST'])),
                        array($this->jst($d['EN']), 1, $this->jst($d['ST']))), 'color' => 'green', 'id' => intval($d['ID']), 'type' => 'dc', 'visit' => $d['VISIT'], 'pid' => $d['PROTEINID'], 'status' => 'Protein: '.$d['PROTEIN']));

                    $d['ENERGY'] = $d['WAVELENGTH'] ? (1.98644568e-25/($d['WAVELENGTH']*1e-10))/1.60217646e-19 : '';

                    foreach ($linecols as $i => $f) {
                        $lines[$i]['label'] = $f;
                        if ($i > 0) $lines[$i]['yaxis'] = $i > 2 ? 3 : ($i > 0 ? 2 : 1);
                        array_push($lines[$i]['data'], array($this->jst($d['ST']), floatval(round($d[$f],4))));
                    }
                }

                $lastvisit = $d['VISIT'];
                if (!$startvisit) $startvisit = $d['ST'];
                $lastend = $d['EN'] ? $d['EN'] : $d['ST'];
            }

            if (array_key_exists($lastvisit, $vis_map)) {
                $s = $vis_map[$lastvisit];
                // print_r(array($startvisit, $lastend, $s));
                array_push($data, array('data' => array(
                array($this->jst($startvisit), 7, $this->jst($startvisit)),
                array($this->jst($lastend), 7, $this->jst($startvisit))), 'color' => 'purple', 'type' => 'visit_ns', 'status' => $s['VISIT'].': '.$s['TITLE'], 'visit' => $s['VISIT']));
            }
            
            // return;
            foreach ($robot as $r) {
                array_push($data, array('data' => array(
                        array($this->jst($r['ST']), 2, $this->jst($r['ST'])),
                        array($this->jst($r['EN']), 2, $this->jst($r['ST']))), 'color' => $r['STATUS'] != 'SUCCESS' ? 'purple' : 'blue', 'status' => ' ' . $r['ACTIONTYPE'] . ' (' . $r['STATUS'] . ')', 'type' => 'robot'));
            }
            
            foreach ($edge as $e) {
                array_push($data, array('data' => array(
                        array($this->jst($e['ST']), 3, $this->jst($e['ST'])),
                        array($this->jst($e['EN']), 3, $this->jst($e['ST']))), 'color' => 'orange', 'id' => $e['ID'], 'type' => 'ed', 'pid' => $d['PROTEINID'], 'status' => 'Protein: '.$d['PROTEIN']));
            }

            foreach ($fl as $e) {
                array_push($data, array('data' => array(
                        array($this->jst($e['ST']), 3, $this->jst($e['ST'])),
                        array($this->jst($e['EN']), 3, $this->jst($e['ST']))), 'color' => 'red', 'type' => 'mca', 'id' => $e['ID'], 'type' => 'mca', 'pid' => $d['PROTEINID'], 'status' => 'Protein: '.$d['PROTEIN']));
            }
                                    
            foreach ($faultl as $f) {
                array_push($data, array('data' => array(
                    array($this->jst($f['ST']), 4, $this->jst($f['ST'])),
                    array($this->jst($f['EN']), 4, $this->jst($f['ST']))), 'color' => 'grey', 'type' => 'fault', 'status' => ' Fault: '.$f['TITLE']));
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
                            array($st+$ex, 5, $st+$ex),
                            array($c+$ex, 5, $st+$ex)), 'color' => 'black', 'status' => ' Beam Dump', 'type' => 'nobeam'));
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
                $info['LAST'] = $l['ST'];
            } else $info['LAST'] = '';
                                    
            $info['start'] = $this->jst($first);
            $info['end'] = $this->jst($last);
                                    
            $this->_output(array('info' => $info, 'data' => $data, 'lines' => $lines, 'scatters' => $scatters));
        }
        
       
        function _pies() {
            $args = array($this->proposalid);
            $where = ' WHERE p.proposalid=:1';
                                    
            if ($this->has_arg('visit')) {
                $info = $this->_check_visit();
                $where .= ' AND s.sessionid=:'.(sizeof($args)+1);
                array_push($args, $info['SID']);
            }
            
            $dc = $this->db->pq("SELECT max(p.title) as title, TO_CHAR(MAX(dc.endtime), 'DD-MM-YYYY HH24:MI') as last, SUM(TIMESTAMPDIFF('SECOND', dc.starttime, dc.endtime))/3600 as dctime, GREATEST(TIMESTAMPDIFF('SECOND', min(s.startdate), min(dc.starttime))/3600,0) as sup, GREATEST(TIMESTAMPDIFF('SECOND', max(dc.endtime), max(s.enddate))/3600,0) as rem, s.visit_number as visit, TO_CHAR(min(s.startdate), 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(max(s.enddate), 'DD-MM-YYYY HH24:MI') as en, TIMESTAMPDIFF('SECOND', min(s.startdate), max(s.enddate))/3600 as len 
                FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) 
                INNER JOIN datacollection dc ON (dc.sessionid = s.sessionid) $where GROUP BY s.visit_number ORDER BY min(s.startdate) DESC", $args);
            
            $robot = $this->db->pq("SELECT SUM(TIMESTAMPDIFF('SECOND', CAST(r.starttimestamp AS DATE), CAST(r.endtimestamp AS DATE)))/3600 as dctime, s.visit_number as visit FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) $where GROUP BY s.visit_number", $args);

            $edge = $this->db->pq("SELECT SUM(TIMESTAMPDIFF('SECOND', e.starttime, e.endtime))/3600 as dctime, s.visit_number as visit FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN energyscan e ON (e.sessionid = s.sessionid) $where GROUP BY s.visit_number", $args);
            
            $ai = $this->db->pq("SELECT SUM(ai) as aitime, visit FROM (
                    SELECT TIMESTAMPDIFF('SECOND', dc.endtime, max(sc.bltimestamp))/3600 as ai, s.visit_number as visit 
                    FROM datacollection dc INNER JOIN screening sc ON sc.datacollectionid = dc.datacollectionid 
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid $where GROUP BY dc.datacollectionid, s.visit_number, dc.endtime
                ) inq GROUP BY visit", $args);
            
            $cent = $this->db->pq("SELECT SUM(cent) as centtime, visit FROM (
                    SELECT TIMESTAMPDIFF('SECOND', CAST(r.endtimestamp AS DATE), min(dc.starttime))/3600 as cent, s.visit_number as visit 
                    FROM robotaction r 
                    INNER JOIN datacollection dc ON (r.blsampleid = dc.blsampleid AND r.endtimestamp < dc.starttime) 
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid $where 
                    GROUP BY r.endtimestamp, s.visit_number) inq WHERE cent < 0.25 GROUP BY visit", $args);
                                    
            $fault = $this->db->pq("SELECT SUM(TIMESTAMPDIFF('SECOND', f.beamtimelost_starttime, f.beamtimelost_endtime))/3600 as lost, s.visit_number as visit FROM bf_fault f INNER JOIN blsession s ON f.sessionid = s.sessionid INNER JOIN proposal p ON (p.proposalid = s.proposalid) $where GROUP BY s.visit_number", $args);
            
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
            $dch_tmp = $this->db->pq("SELECT AVG(datacollections) as dcs, dh as hour FROM (
                    SELECT count(dc.datacollectionid) as datacollections, TO_CHAR(dc.starttime, 'HH24') as dh
                    FROM datacollection dc
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    WHERE dc.axisrange > 0 AND dc.overlap = 0 AND p.proposalid=:1 $where
                    GROUP BY TO_CHAR(dc.starttime, 'DDHH24'), s.visit_number
                ) inq GROUP BY dh ORDER BY hour
            ", $args);
            $dch = array();
            foreach ($dch_tmp as $d) {
                array_push($dch, array($d['HOUR'], $d['DCS']));
            }
            
                                    
            # Samples Loaded / Hour
            $slh_tmp = $this->db->pq("SELECT AVG(samples) as SLH, dh as hour FROM (
                    SELECT count(r.robotactionid) as samples, TO_CHAR(r.starttimestamp, 'HH24') as dh
                    FROM robotaction r
                    INNER JOIN blsession s ON s.sessionid = r.blsessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    WHERE r.actiontype='LOAD' AND p.proposalid=:1 $where
                    GROUP BY TO_CHAR(r.starttimestamp, 'DDHH24'), s.visit_number
                ) inq GROUP BY dh ORDER BY hour
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
            $where = "WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1";
            
            if (!$this->staff) {
                if (!$this->has_arg('prop')) $this->_error('No proposal selected', 'You need to select a proposal before viewing this page');
                
                $where .= ' AND p.proposalid LIKE :2';
                array_push($args, $this->proposalid);
            }
            
            $info = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename as bl, s.sessionid as sid, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en, TIMESTAMPDIFF('HOUR', s.startdate, s.enddate) as len FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) $where", $args);
            
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




        // BAG Overview Stats
        function _overview() {
            $this->user->can('all_prop_stats');

            global $bl_types;
            $bls = implode("', '", $bl_types[$this->ty]);

            $where = " AND p.proposalcode NOT IN ('cm') AND s.beamlinename in ('$bls')";
            $args = array();

            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'yearly') $where .= " AND TIMESTAMPDIFF('MONTH', s.startdate, CURRENT_TIMESTAMP) <= 12";
                if ($this->arg('ty') == 'monthly') $where .= " AND TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) <= 28";
                if ($this->arg('ty') == 'weekly') $where .= " AND TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) <= 7";
            }

            if ($this->has_arg('runid')) {
                $where .= " AND vr.runid=:".(sizeof($args)+1);
                array_push($args, $this->arg('runid'));
            }

            if ($this->has_arg('scheduled')) {
                $where .= " AND s.scheduled=1";
            }

            if ($this->has_arg('proposalcode')) {
                $where .= " AND p.proposalcode=:".(sizeof($args)+1);
                array_push($args, $this->arg('proposalcode'));
            }

            if ($this->has_arg('proposal')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('proposal'));
            }

            if ($this->has_arg('bl')) {
                $where .= " AND s.beamlinename=:".(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND ( CONCAT(p.proposalcode, p.proposalnumber) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) )";
                array_push($args, $this->arg('s'));
            }

            $match = 'PROP';
            if ($this->has_arg('group_by')) {
                if ($this->arg('group_by') == 'run') {
                    $group = 'GROUP BY run';
                    $match = 'RUN';
                }

                if ($this->arg('group_by') == 'beamline') {
                    $group = 'GROUP BY beamlinename';
                    $match = 'BEAMLINENAME';
                }

                if ($this->arg('group_by') == 'type') {
                    $group = 'GROUP BY typename';
                    $match = 'TYPENAME';
                }

                if ($this->arg('group_by') == 'total') {
                    $group = '';
                    $match = 'TOTAL';
                }

            } else $group = 'GROUP BY prop';


            $dc = $this->db->pq("
                SELECT COUNT(visit_number) as visits, prop, SUM(rem) as rem, SUM(len) as len, ((SUM(len) - SUM(rem)) / SUM(len))*100 as used, beamlinename, 1 as total, typename, run, runid FROM (
                    SELECT GREATEST(TIMESTAMPDIFF('SECOND', MAX(dc.endtime), MAX(s.enddate))/3600,0) as rem, TIMESTAMPDIFF('SECOND', MAX(s.startdate), MAX(s.enddate))/3600 as len, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.visit_number, s.beamlinename, IF(st.typename IS NOT NULL, st.typename, 'Normal') as typename, vr.run, vr.runid
                    FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid)
                    LEFT OUTER JOIN sessiontype st ON st.sessionid = s.sessionid 
                    LEFT OUTER JOIN datacollection dc ON dc.sessionid = s.sessionid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where 
                    GROUP BY p.proposalid, s.visit_number
                    ) inq
                $group
                ORDER BY runid DESC", $args);


            $dch = $this->db->pq("SELECT MAX(datacollections) as mdch, AVG(datacollections) as dch, SUM(datacollections) as dc, MAX(screenings) as msch, AVG(screenings) as sch, SUM(screenings) as sc, prop, beamlinename, 1 as total, typename, run, runid, sum(multiaxis) as mx
                FROM (
                    SELECT SUM(IF(dc.axisrange > 0 AND dc.overlap = 0, 1, 0)) as datacollections, SUM(IF(dc.overlap != 0, 1, 0)) as screenings, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename, IF(st.typename IS NOT NULL, st.typename, 'Normal') as typename, vr.run, vr.runid,
                        SUM(IF(dc.axisrange > 0 AND dc.overlap = 0 AND ((dc.kappastart is not NULL AND dc.kappastart != 0) OR (dc.chistart is not NULL AND dc.chistart != 0) OR (dc.phistart is not NULL AND dc.phistart != 0)), 1, 0)) as multiaxis
                    FROM datacollection dc
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
                    LEFT OUTER JOIN sessiontype st ON st.sessionid = s.sessionid 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where
                    GROUP BY TO_CHAR(dc.starttime, 'DDHH24'), s.visit_number, p.proposalid
                ) inq 
                $group
                ORDER BY runid DESC", $args);
                                    
            $slh = $this->db->pq("SELECT MAX(samples) as mslh, AVG(samples) as slh, SUM(samples) as sl, prop, beamlinename, 1 as total, typename, run, runid FROM (
                    SELECT count(r.robotactionid) as samples, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename, IF(st.typename IS NOT NULL, st.typename, 'Normal') as typename, vr.run, vr.runid
                    FROM robotaction r
                    INNER JOIN blsession s ON s.sessionid = r.blsessionid
                    LEFT OUTER JOIN sessiontype st ON st.sessionid = s.sessionid 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE r.actiontype='LOAD' $where
                    GROUP BY TO_CHAR(r.starttimestamp, 'DDHH24'), s.visit_number, p.proposalid
                ) inq
                $group
                ORDER BY runid DESC", $args);


            foreach ($dc as &$d) {
                foreach (array('DCH', 'MDCH', 'DC', 'SCH', 'MSCH', 'SC', 'MSLH', 'SLH', 'SL', 'MX') as $k)
                    if (!array_key_exists($k, $d)) $d[$k] = 0;

                foreach ($dch as $dh) 
                    if ($dh[$match] == $d[$match]) 
                        foreach (array('DCH', 'MDCH', 'DC', 'SCH', 'MSCH', 'SC', 'MX') as $k)
                            $d[$k] = $dh[$k];

                foreach ($slh as $sh) 
                    if ($sh[$match] == $d[$match]) 
                        foreach (array('SLH', 'MSLH', 'SL') as $k)
                            $d[$k] = $sh[$k];

                foreach(array('USED', 'REM', 'LEN', 'DCH', 'MDCH', 'DC', 'SCH', 'MSCH', 'SC', 'MSLH', 'SLH', 'SL', 'MX') as $t) if ($d[$t]) $d[$t] = round(floatval($d[$t]), 1);
            }

            if ($this->has_arg('download')) {
                $data = array();
                array_push($data, array_keys($dc[0]));
                foreach ($dc as $d) {
                    array_push($data, array_values($d));
                }
                $group = $this->has_arg('group_by') ? $this->arg('group_by') : 'prop';
                $run = $this->has_arg('runid') ? ('_runid_'.$this->arg('runid')) : '';
                $bl = $this->has_arg('bl') ? ('_'.$this->arg('bl')) : '';
                $prop = $this->has_arg('proposal') ? ('_'.$this->arg('proposal')) : '';

                $this->_write_csv($data, 'groupby_'.$group.$bl.$prop.$run);

            } else $this->_output($dc);
        }
    


        // Histogram of beamline parameters
        function _parameter_histogram() {
            global $bl_types;
            $bls = implode('\', \'', $bl_types[$this->ty]);

            $types = array(
                'energy' => array('unit' => 'eV', 'st' => 5000, 'en' => 25000, 'bin_size' => 200, 'col' => '(1.98644568e-25/(dc.wavelength*1e-10))/1.60217646e-19', 'count' => 'dc.wavelength'),
                'beamsizex' => array('unit' => 'um', 'st' => 0, 'en' => 150, 'bin_size' => 5, 'col' => 'dc.beamsizeatsamplex*1000', 'count' => 'dc.beamsizeatsamplex'),
                'beamsizey' => array('unit' => 'um', 'st' => 0, 'en' => 150, 'bin_size' => 5, 'col' => 'dc.beamsizeatsampley*1000', 'count' => 'dc.beamsizeatsampley'),
                'exposuretime' => array('unit' => 'ms', 'st' => 0, 'en' => 5000, 'bin_size' => 50, 'col' => 'dc.exposuretime*1000', 'count' => 'dc.exposuretime'),
            );

            $k = 'energy';
            $t = $types[$k];
            if ($this->has_arg('ty')) {
                if (array_key_exists($this->arg('ty'), $types)) {
                    $k = $this->arg('ty');
                    $t = $types[$k];
                }
            }

            $where = '';
            $args = array();

            if ($this->has_arg('bl')) {
                $where .= ' AND s.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('runid')) {
                $where .= ' AND vr.runid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('runid'));
            }

            $col = $t['col'];
            $ct = $t['count'];
            $bs = $t['bin_size'];

            $hist = $this->db->pq("SELECT ($col div $bs) * $bs as x, count($ct) as y, s.beamlinename
                FROM datacollection dc 
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE 1=1 $where AND s.beamlinename in ('$bls')
                GROUP BY s.beamlinename,x
                ORDER BY s.beamlinename", $args);

            $bls = array();
            foreach ($hist as $h) $bls[$h['BEAMLINENAME']] = 1;

            $data = array();
            foreach ($bls as $bl => $y) {
                $ha = array();
                foreach ($hist as &$h) {
                    if ($h['BEAMLINENAME'] != $bl) continue;
                    $ha[$h['X']] = floatval($h['Y']);
                }

                $gram = array();
                for($bin = $t['st']; $bin <= $t['en']; $bin += $t['bin_size']) {
                    $gram[$bin] = array_key_exists($bin, $ha) ? $ha[$bin] : 0;
                }

                $lab = ucfirst($k).' ('.$t['unit'].')';
                if (!$this->has_arg('bl')) $lab = $bl.': '.$lab;

                array_push($data, array('label' => $lab, 'data' => $gram));
            }

            $this->_output(array('histograms' => $data));
        }


        // Return a list of runs
        function _runs() {
            $runs = $this->db->pq("SELECT runid,run 
                FROM v_run 
                WHERE startdate < CURRENT_TIMESTAMP
                ORDER BY startdate DESC");
            $this->_output($runs);
        }



        function _write_csv($data, $filename) {
            header('Content-Type:application/csv'); 
            header("Content-Disposition:attachment;filename=$filename.csv"); 
            foreach($data as $d) {
                print implode(',', $d)."\n";
            }
        }

    }

?>
