<?php

    class Robot extends Page {
        

        public static $arg_list = array('bl' => '[\w-]+',
                              'run' => '\d+',
                              'visit' => '\w+\d+-\d+',
                              'year' => '\d\d\d\d',
                              );
            
        public static $dispatch = array(array('/averages', 'get', '_averages'),
                              array('/totals', 'get', '_totals'),
                              array('/errors', 'get', '_errors'),
                              array('/profile/:visit', 'get', '_visit_profile'),
        );

        //var $require_staff = True;

        
        # Show list of beamlines & runs
        function _averages() {
            $rows = $this->db->pq("SELECT vr.run || '-' || s.beamlinename as rbl, min(vr.run) as run, min(vr.runid) as runid, min(s.beamlinename) as bl, count(r.robotactionid) as num, MEDIAN(CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE))*86400 as avgt FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE r.robotactionid > 1 AND p.proposalcode <> 'cm' AND r.status='SUCCESS' AND (r.actiontype = 'LOAD') GROUP BY vr.run || '-' || s.beamlinename ORDER BY min(s.beamlinename), min(vr.runid)");
            
            $tvs = $this->db->pq("SELECT distinct vr.run,vr.runid FROM v_run vr INNER JOIN blsession bl ON (bl.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN robotaction r ON (r.blsessionid = bl.sessionid) WHERE robotactionid != 1 ORDER BY vr.runid");
            
            $rids = array();$rvl = array();
            $ticks = array();
            foreach ($tvs as $i => $t) {
                array_push($ticks, array($i, $t['RUN']));
                $rids[$t['RUN']] = $t['RUNID'];
                $rvl[$t['RUN']] = $i;
            }
                                 
            $bls = array();
            foreach ($rows as $r) {
                if (!array_key_exists($r['BL'], $bls)) $bls[$r['BL']] = array();
                                 
                array_push($bls[$r['BL']], $r);
            }
                                 
            $bld = array();
            foreach ($bls as $bl => $d) {
                $rd = array();
                foreach ($d as $i => $dat) {
                    array_push($rd, array($rvl[$dat['RUN']], floatval($dat['AVGT'])));
                }
                
                $bld[$bl] = $rd;
            }

            $this->_output(array('details' => $bls, 'data' => $bld, 'ticks' => $ticks, 'rids' => $rids));
        }
        
        
        # List of robot errors for beamline / run / visit
        function _errors() {
            $args = array();
            $where = array();
            
            if ($this->has_arg('bl')) {
                array_push($where, 's.beamlinename LIKE :'. (sizeof($args)+1));
                array_push($args, $this->arg('bl'));
            }
            if ($this->has_arg('run')) {
                array_push($where, 'vr.runid = :' . (sizeof($args)+1));
                array_push($args, $this->arg('run'));
            }
            if ($this->has_arg('visit')) {
                array_push($where, "p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :" . (sizeof($args)+1));
                array_push($args, $this->arg('visit'));
            }
            if ($this->has_arg('s')) {
                array_push($where, "(lower(r.status) LIKE lower('%'||:".(sizeof($args)+1)."||'%') OR lower(r.message) LIKE lower('%'||:".(sizeof($args)+2)."||'%'))");
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }
            
            $where = implode(' AND ', $where);
            if ($where) $where = 'AND '.$where;

            $tot = $this->db->pq("SELECT count(r.robotactionid) as tot FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE r.status != 'SUCCESS' AND  (r.actiontype = 'LOAD' OR r.actiontype='UNLOAD') $where ORDER BY r.starttimestamp DESC", $args);
            
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            array_push($args, $start);
            array_push($args, $end);
            
            $errors = $this->db->pq("SELECT outer.* FROM (SELECT rownum rn, inner.* FROM (SELECT r.samplebarcode, r.actiontype, r.dewarlocation, r.containerlocation, r.message, TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, p.proposalcode || p.proposalnumber || '-' || s.visit_number as vis, s.beamlinename as bl, r.status, (CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE))*86400 as time FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE r.status != 'SUCCESS' AND (r.actiontype = 'LOAD' OR r.actiontype='UNLOAD') $where ORDER BY r.starttimestamp DESC) inner) outer WHERE outer.rn > :".(sizeof($args)-1)." AND outer.rn <= :".sizeof($args), $args);
            
            foreach ($errors as $i => &$e) {
                $e['TIME'] = number_format($e['TIME'], 1);
            }
            
            $this->_output(array(intval($tot[0]['TOT']), $errors));
            
        }
        
        
        # Dewar profile for visit
        function _visit_profile() {
            $dp = $this->db->pq("SELECT count(case when r.status='CRITICAL' then 1 end) as ccount, count(case when r.status!='SUCCESS' then 1 end) as ecount, count(case when r.status!='SUCCESS' then 1 end)/count(r.status)*100 as epc, count(case when r.status='CRITICAL' then 1 end)/count(r.status)*100 as cpc, count(r.status) as total, r.dewarlocation FROM robotaction r INNER JOIN blsession s on r.blsessionid=s.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode||p.proposalnumber||'-'||s.visit_number LIKE :1 AND r.actiontype LIKE 'LOAD' AND r.dewarlocation != 99 GROUP BY r.dewarlocation ORDER BY r.dewarlocation", array($this->arg('visit')));
            
            
            $profile = array(array(
                                   array('label' => 'Total Loads',  'data' => array()),
                                   array('label' => '% Errors',  'data' => array(), 'yaxis' => 2),
                                   array('label' => '% Critical',  'data' => array(), 'yaxis' => 2),
                                   ),
                             array());
            
            foreach ($dp as $e) {
                array_push($profile[0][0]['data'], array($e['DEWARLOCATION'], $e['TOTAL']));
                array_push($profile[0][2]['data'], array($e['DEWARLOCATION'], $e['CPC']));
                array_push($profile[0][1]['data'], array($e['DEWARLOCATION'], $e['EPC']));
            }
            
            $this->_output($profile);
        }
        
        
        
        
        # Show totals for beamline / run / year
        function _totals() {
            $where = array('1=1');
            $args = array();
            
            if ($this->has_arg('bl')) {
                array_push($where, 's.beamlinename LIKE :'. (sizeof($args)+1));
                array_push($args, $this->arg('bl'));
            }
            if ($this->has_arg('run')) {
                array_push($where, 'vr.runid = :' . (sizeof($args)+1));
                array_push($args, $this->arg('run'));
            }
            
            if ($this->has_arg('year')) {
                array_push($where, "r.starttimestamp > TO_DATE(:".(sizeof($args)+1).", 'HH24:MI DD-MM-YYYY')");
                array_push($where, "r.starttimestamp < TO_DATE(:".(sizeof($args)+2).", 'HH24:MI DD-MM-YYYY')");
                array_push($args, '00:01 01-01-'.$this->arg('year'));
                array_push($args, '23:59 31-12-'.($this->arg('year')));
            }

            $where = implode(' AND ', $where);

            $totals = $this->db->pq("SELECT 'TOTAL' as vis, count(r.robotactionid) as num, count(CASE WHEN r.status='SUCCESS' then 1 end) as success, count(CASE WHEN r.status='ERROR' then 1 end) as error, count(CASE WHEN r.status='CRITICAL' then 1 end) as critical, count(CASE WHEN r.status='WARNING' then 1 end) as warning, count(CASE WHEN r.status='EPICSFAIL' then 1 end) as epicsfail, count(CASE WHEN r.status='COMMANDNOTSENT' then 1 end) as commandnotsent, ROUND(MEDIAN(CASE WHEN r.status='SUCCESS' then CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE) end)*86400,1) as avgt FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE p.proposalcode <> 'cm' AND $where AND r.actiontype = 'LOAD'", $args);

            $tot = $this->db->pq("SELECT count(num) as tot FROM (SELECT count(r.robotactionid) as num FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE p.proposalcode <> 'cm' AND $where AND (r.actiontype = 'LOAD') GROUP BY p.proposalcode || p.proposalnumber || '-' || s.visit_number)", $args);
            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $q = "SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                    SELECT TO_CHAR(min(r.starttimestamp), 'DD-MM-YYYY HH24:MI:SS') as st, p.proposalcode || p.proposalnumber || '-' || s.visit_number as vis, s.beamlinename as bl, count(r.robotactionid) as num, count(CASE WHEN r.status='SUCCESS' then 1 end) as success, count(CASE WHEN r.status='ERROR' then 1 end) as error, count(CASE WHEN r.status='CRITICAL' then 1 end) as critical, count(CASE WHEN r.status='WARNING' then 1 end) as warning, count(CASE WHEN r.status='EPICSFAIL' then 1 end) as epicsfail, count(CASE WHEN r.status='COMMANDNOTSENT' then 1 end) as commandnotsent, ROUND(MEDIAN(CASE WHEN r.status='SUCCESS' then CAST(r.endtimestamp AS DATE)-CAST(r.starttimestamp AS DATE) end)*86400,1) as avgt FROM v_run vr INNER JOIN blsession s ON (s.startdate BETWEEN vr.startdate AND vr.enddate) INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN robotaction r ON (r.blsessionid = s.sessionid) WHERE p.proposalcode <> 'cm' AND $where AND r.actiontype = 'LOAD' GROUP BY p.proposalcode || p.proposalnumber || '-' || s.visit_number, s.beamlinename ORDER BY min(r.starttimestamp) DESC
                ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1);
            
            $rows = $this->db->pq($q, $args);
            $this->_output(array($totals[0], $tot, $rows));
        }
        

    }    

?>
