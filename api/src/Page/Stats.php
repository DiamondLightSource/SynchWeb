<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Stats extends Page
{
        

        public static $arg_list = array(
            't' => '\w+',
            'download' => '\d',
        );
        

        public static $dispatch = array(array('/online', 'get', '_online_users'),
                              array('/last', 'get', '_last_actions'),
                              array('/logon(/:t)', 'get', '_logons'),
                              array('/bl(/:t)', 'get', '_beamline'),
                              array('/pl(/:t)', 'get', '_pipelines'),
                              array('/pc', 'get', '_processing'),
        );

        var $def = 'online';
        var $require_staff = True;
        
        # Whos online list
        function _online_users() {
            $rows = $this->db->pq("SELECT a.username, a.comments, TO_CHAR(a.datetime, 'DD-MM-YYYY HH24:MI:SS') as time, CONCAT(CONCAT(p.givenname, ' '), p.familyname) as name  
                FROM adminactivity a
                LEFT OUTER JOIN person p ON p.login = a.username
                WHERE TIMESTAMPDIFF('MINUTE', a.datetime, CURRENT_TIMESTAMP) < 15 ORDER BY a.datetime DESC");

            $this->_output($rows);
        }
        
        
        function _last_actions() {
            $rows = $this->db->paginate("SELECT a.username, a.comments, TO_CHAR(a.datetime, 'DD-MM-YYYY HH24:MI:SS') as time, CONCAT(CONCAT(p.givenname, ' '), p.familyname) as name 
                FROM adminactivity a 
                LEFT OUTER JOIN person p ON p.login = a.username
                WHERE comments LIKE 'ISPyB2%' 
                ORDER BY a.datetime DESC", array(0,25));
            
            $this->_output($rows);            
        }
        
        
        function _logons() {
            $days = array('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
            
            $ty = $this->has_arg('t') ? $this->arg('t') : 'hour';
            
            $types = array('hour' => array('hour', 'hour'), 'wd' => array('day', 'weekday'), 'week' => array('week', 'week'), 'md' => array('day', 'monthday'));
            
            $k = array_key_exists($ty, $types) ? $ty : 'hour';
            $t = $types[$k];
            
            $rows = $this->db->pq("SELECT $t[0] as k, \"Total logins\" as t, \"Distinct logins\" as d FROM v_logonby${t[1]}2");
            
            $out = array(array('label' => 'Total (ISPyB)', 'color' => 'red', 'data' => array()), array('label' => 'Unique (ISPyB)', 'color' => 'orange', 'data' => array()),
                         array('label' => 'Total (ISPyB2)', 'color' => 'blue', 'data' => array()), array('label' => 'Unique (ISPyB2)', 'color' => 'cyan', 'data' => array())
                         );
            
            foreach ($rows as $r) {
                if ($k == 'wd') $r['K'] = array_search($r['K'], $days);
                
                array_push($out[2]['data'], array(intval($r['K']), intval($r['T'])));
                array_push($out[3]['data'], array(intval($r['K']), intval($r['D'])));
            }
            
            // $rows = $this->db->pq("SELECT $t[0] as k, \"Total logins\" as t, \"Distinct logins\" as d FROM v_logonby${t[1]}");
            // foreach ($rows as $r) {
            //     if ($k == 'wd') $r['K'] = array_search($r['K'], $days);
                
            //     array_push($out[0]['data'], array(intval($r['K']), intval($r['T'])));
            //     array_push($out[1]['data'], array(intval($r['K']), intval($r['D'])));
            // }
            
            $this->_output($out);
            
        }
        
        
        
        
        // Dispatch to beamline stats
        function _beamline() {
            $types = array('dc' => '_all_dcs',
                           'fc' => '_data_collections',
                           'im' => '_images',
                           'sc' => '_screenings',
                           'smp' => '_samples_loaded',
                           'dct' => '_data_collection_time',
                           'dl' => '_daily_usage',
                           );
            
            $t = $this->has_arg('t') ? $this->arg('t') : 'dc';
            
            if (array_key_exists($t, $types)) $this->$types[$t]();
            else $this->_error('No such stat type');
        }
        
        
        function _all_dcs() {
            $this->_data_collections(False,True);
        }
        
        
        function _screenings() {
            $this->_data_collections(True);
        }
        
        // Data collections / Hour
        function _data_collections($sc=False,$all=False) {
            $where = $sc ? 'dc.overlap != 0' : 'dc.axisrange > 0 AND dc.overlap = 0';
            $where = $all ? '1=1' : $where;

            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));
            
            $dcs = $this->db->pq("SELECT AVG(datacollections) as avg, sum(datacollections) as count, run, bl FROM (
                    SELECT count(dc.datacollectionid) as datacollections, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24') as dh, vr.run, ses.beamlinename as bl
                    FROM datacollection dc
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                    INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                    INNER JOIN proposal p ON p.proposalid = ses.proposalid
                    WHERE $where AND p.proposalcode not in ('cm', 'nt') AND ses.beamlinename in ('$bls')
                    GROUP BY TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24'), run, ses.beamlinename
                ) inq GROUP BY run, bl ORDER BY run, bl
            ");
            
            $json = $this->_format_data($dcs, 'RUN', 'BL', array('AVG'), array('Average (Phase I)' => 'lines', 'Average' => 'lines'), array('Average (Phase I)' => array('i02', 'i03', 'i04'), 'Average' => array()));
            
            $dct = $sc ? 'Screenings' : 'Full Data Collections';
            $dct = $all ? 'Data Collections (Screening + Full)' : $dct;
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average No. '.$dct.' / Hour';
            $json['title'] = 'Average Number of '.$dct.' / Hour vs. Run Number';
            
            $this->has_arg('download') ? $this->_write_csv($json, 'number_'.($sc?'screening':($all?'alldc':'fulldc'))) : $this->_output($json);
        }

        
        // Images / Hour
        function _images() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT AVG(images) as avg, run, bl FROM (
                    SELECT sum(dc.numberofimages) as images, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24') as dh, vr.run, ses.beamlinename as bl
                    FROM datacollection dc
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                    INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                    INNER JOIN proposal p ON p.proposalid = ses.proposalid
                    WHERE p.proposalcode not in ('cm', 'nt') AND ses.beamlinename in ('$bls')
                    GROUP BY TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24'), run, ses.beamlinename
                ) inq GROUP BY run, bl ORDER BY run, bl
            ");
            
            $json = $this->_format_data($dcs, 'RUN', 'BL', array('AVG'), array('Average (Phase I)' => 'lines', 'Average' => 'lines'), array('Average (Phase I)' => array('i02', 'i03', 'i04'), 'Average' => array()));
            
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Number of Images / Hour';
            $json['title'] = 'Average Number of Images Collected / Hour vs. Run Number';
            
            $this->has_arg('download') ? $this->_write_csv($json, 'images') : $this->_output($json);
        }        
        
        // Data collection times
        function _data_collection_time() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT avg(TIMESTAMPDIFF('SECOND', dc.starttime, dc.endtime)/60) as dctime, vr.run, ses.beamlinename as bl
                                 FROM datacollection dc
                                 INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                                 INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                                 INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                                 INNER JOIN proposal p ON p.proposalid = ses.proposalid
                                 WHERE dc.axisrange > 0 AND dc.overlap = 0
                                 AND p.proposalcode not in ('cm', 'nt')
                                 AND (TIMESTAMPDIFF('SECOND', dc.starttime, dc.endtime)/60) < 20
                                 AND ses.beamlinename in ('$bls')
                                 GROUP BY vr.run, ses.beamlinename
                                 ORDER BY run, bl
            ");
            
            $json = $this->_format_data($dcs, 'RUN', 'BL', array('DCTIME'));
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Data Collection Time (Minutes)';
            $json['title'] = 'Average Full Data Collection Time vs. Run Number';
                                 
            $this->has_arg('download') ? $this->_write_csv($json, 'dctimes') : $this->_output($json);
        }
        
        
        // Samples Loaded / Hour
        function _samples_loaded() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT AVG(count) as avg, count(count) as count, run, bl FROM (
                    SELECT count(r.robotactionid) as count, TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24') as dh, vr.run, ses.beamlinename as bl
                    FROM robotaction r
                    INNER JOIN blsession ses ON r.blsessionid = ses.sessionid
                    INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                    INNER JOIN proposal p ON p.proposalid = ses.proposalid
                    WHERE r.actiontype = 'LOAD'
                    AND p.proposalcode not in ('cm', 'nt') AND ses.beamlinename in ('$bls')
                    /*AND CAST(TO_CHAR(vr.startdate, 'YYYY') as NUMBER) > 2010*/
                    GROUP BY TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24'), run, ses.beamlinename
                ) inq WHERE count > 0 GROUP BY run, bl ORDER BY run, bl
            ");
            
            $json = $this->_format_data($dcs, 'RUN', 'BL', array('AVG'), array('Average (Phase I)' => 'lines', 'Average (Phase II)' => 'lines'), array('Average (Phase I)' => array('i02', 'i03', 'i04'), 'Average (Phase II)' => array('i04-1', 'i24')));
                                 
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Number of Samples Loaded / Hour';
            $json['title'] = 'Average Number of Samples Loaded / Hour by Robot vs. Run Number';                                 
                                 
            $this->has_arg('download') ? $this->_write_csv($json, 'samples_loaded') : $this->_output($json);
        }
        
                                 
                                 
        function _daily_usage() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT AVG(datacollections) as avg, sum(datacollections) as count, dh as hour, bl FROM (
                    SELECT count(dc.datacollectionid) as datacollections, HOUR(dc.starttime) as dh, ses.beamlinename as bl
                    FROM datacollection dc
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                    INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                    INNER JOIN proposal p ON p.proposalid = ses.proposalid
                    WHERE dc.axisrange > 0 AND dc.overlap = 0
                    AND p.proposalcode not in ('cm', 'nt')
                    AND ses.beamlinename in ('$bls')
                    GROUP BY TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24'), run, ses.beamlinename
                ) inq WHERE datacollections > 0 GROUP BY dh, bl ORDER BY hour, bl
            ");
            
            $json = $this->_format_data($dcs, 'HOUR', 'BL', array('AVG'), array('Average' => 'lines'), array('Average' => array()));
            $json['xaxis'] = 'Hour of the Day';
            $json['yaxis'] = 'Average Number of Data Collections';
            $json['title'] = 'Average Number of Full Data Collections vs. Hour of the Day';
                                 
            $this->has_arg('download') ? $this->_write_csv($json, 'daily_usage') : $this->_output($json);
        }
                                 
                                 
                                 
                                 
        function _pipelines() {
            $types = array('ai' => '_auto_indexing',
                           'ap' => '_auto_integration',
                           );
            
            $t = $this->has_arg('t') ? $this->arg('t') : 'ai';
            
            if (array_key_exists($t, $types)) $this->$types[$t]();
            else $this->_error('No such stat type');                 
        }
                                 
                                 
                                 
        function _auto_indexing() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT avg(TIMESTAMPDIFF('SECOND', dc.endtime, s.bltimestamp)) as duration, count(s.screeningid) as count, s.shortcomments as ty, vr.run
                FROM screening s
                INNER JOIN datacollection dc ON dc.datacollectionid = s.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                WHERE s.shortcomments LIKE 'EDNA%' AND TIMESTAMPDIFF('SECOND', dc.endtime, s.bltimestamp) < 10000
                AND ses.beamlinename in ('$bls')
                GROUP BY s.shortcomments, vr.run
                ORDER BY vr.run
            ");
            $json = $this->_format_data($dcs, 'RUN', 'TY', array('DURATION'));
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Process Time (seconds)';
            $json['title'] = 'Average Run Time for EDNA vs. Run Number';
                                 
            $this->has_arg('download') ? $this->_write_csv($json, 'autoindexing_times') : $this->_output($json);
        }
    
                                 
        function _auto_integration() {
            global $ap_types;
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $ty_tmp = array();
            foreach ($ap_types as $search => $replace) {
                array_push($ty_tmp, "WHEN app.processingcommandline LIKE '%$search%' THEN '$replace'");
            }
            $whens = implode("\n", $ty_tmp);

            $dcs = $this->db->pq("SELECT AVG(duration) as avg, AVG(numberofimages) as nimg, count(duration) as count, type as ty, run FROM (
                    SELECT TIMESTAMPDIFF('SECOND', dc.endtime, ap.recordtimestamp) as duration, vr.run, dc.numberofimages, (CASE
                    $whens
                    ELSE 'N/A' END) as type
                    FROM autoprocintegration ap
                    INNER JOIN autoprocprogram app ON ap.autoprocprogramid = app.autoprocprogramid
                    INNER JOIN datacollection dc ON dc.datacollectionid = ap.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                    INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                    WHERE TIMESTAMPDIFF('SECOND', dc.endtime, ap.recordtimestamp) < 3500 AND TIMESTAMPDIFF('SECOND', dc.endtime, ap.recordtimestamp) > 0
                    AND ses.beamlinename in ('$bls')
                ) inq
                GROUP BY type, run
                ORDER BY run
            ");
            
            $json = $this->_format_data($dcs, 'RUN', 'TY', array('AVG'));
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Process Time (Seconds)';
            $json['title'] = 'Average Run Time for Auto Integration vs. Run Number';
             
            $this->has_arg('download') ? $this->_write_csv($json, 'autointegration_times') : $this->_output($json);
        }

    
        function _processing() {
            $bls = implode('\', \'', $this->_get_beamlines_from_type($this->ty));

            $dcs = $this->db->pq("SELECT vr.run, COUNT(rp.processingjobid) as jobs, AVG(app.processingendtime - app.processingstarttime)/60 as time, 1 as ty
                FROM processingjob rp
                INNER JOIN datacollection dc ON dc.datacollectionid = rp.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                INNER JOIN v_run vr ON (ses.startdate BETWEEN vr.startdate AND vr.enddate)
                LEFT OUTER JOIN autoprocprogram app ON app.processingjobid = rp.processingjobid
                GROUP BY run
            ");

            $json = $this->_format_data($dcs, 'RUN', 'TY', array('JOBS', 'TIME'));
            $json['xaxis'] = 'Run Number';
            $json['yaxis'] = 'Average Process Time (seconds)';
            $json['title'] = 'Reprocessing vs. Run Number';
                                 
            $this->has_arg('download') ? $this->_write_csv($json, 'reprocessing_times') : $this->_output($json);
        }
            

        function _format_data($dcs, $tick_col, $type_col, $data_cols, $plot_types=array(), $averages = array()) {
            $ticks = array();
            foreach ($dcs as $d) {
                if (!in_array($d[$tick_col], $ticks)) array_push($ticks, $d[$tick_col]);
            }
            
            $tys = array();
            foreach ($dcs as $d) {
                if (!in_array($d[$type_col], $tys)) array_push($tys, $d[$type_col]);
            }
            $w = (1/max(1, sizeof($tys)))* 0.85;
            
            $data = array();
            $avgs = array();
            foreach ($dcs as $d) {
                if (!array_key_exists($d[$type_col], $data)) {
                    $pt = 'bars';
                    if (array_key_exists($d[$type_col], $plot_types)) $pt = $plot_types[$d[$type_col]];
                                 
                    $data[$d[$type_col]] = array();
                    for ($i = 0; $i < sizeof($data_cols); $i++) array_push($data[$d[$type_col]], array('data' => array(), 'series' => $pt));
                }
                
                foreach ($data_cols as $i => $k) {
                    $pos = $this->has_arg('download') 
                        ? array_search($d[$tick_col], $ticks)
                        : array_search($d[$tick_col], $ticks)+array_search($d[$type_col], $tys)*$w-0.5;
                    array_push($data[$d[$type_col]][$i]['data'], array($pos, floatval($d[$k])));
                }
                                 
                                 
                foreach ($averages as $n => $ser) {
                    if (!array_key_exists($n, $avgs)) $avgs[$n] = array();
                    if (!array_key_exists($d[$tick_col], $avgs[$n])) $avgs[$n][$d[$tick_col]] = array();
                                 
                    if (sizeof($ser)) {
                        if (in_array($d[$type_col], $ser)) array_push($avgs[$n][$d[$tick_col]], floatval($d[$data_cols[0]]));
                    } else array_push($avgs[$n][$d[$tick_col]], floatval($d[$data_cols[0]]));
                }
            }
                                 
            foreach ($averages as $n => $ser) {
                if (!array_key_exists($n, $data)) {
                    $pt = 'bars';
                    if (array_key_exists($n, $plot_types)) $pt = $plot_types[$n];
                    $data[$n] = array(array('data' => array(), 'series' => $pt));
                }
                                 
                if (array_key_exists($n, $avgs)) {
                    foreach($avgs[$n] as $tick => $vals) {
                        if (sizeof($vals)) array_push($data[$n][0]['data'], array(array_search($tick, $ticks), array_sum($vals)/count($vals)));
                    }
                }
            }
            
            $ta = array();
            foreach ($ticks as $i => $t) array_push($ta, array($i, $t));
            
            return array('ticks' => $ta, 'data' => $data);
        }


        function _write_csv($json, $filename) {
            header('Content-Type:application/csv'); 
            header("Content-Disposition:attachment;filename=$filename.csv"); 

            print $json['title']."\n";
            print 'Run,'.implode(',',array_keys($json['data']))."\n";

            foreach ($json['ticks'] as $t) {
                $row = array($t[1]);
                foreach ($json['data'] as $k => $d) {
                    $found = false;
                    foreach ($d[0]['data'] as $pt) {
                        if ($pt[0] == $t[0]) {
                            array_push($row, $pt[1]);
                            $found = true;
                        }
                    }

                    if (!$found) array_push($row, '');
                }

                print implode(',', $row)."\n";
            }
        }
}
