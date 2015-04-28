<?php

    class Cell extends Page {


        var $arg_list = array('page' => '\d+',
                              'a' => '\d+(.\d+)?',
                              'b' => '\d+(.\d+)?',
                              'c' => '\d+(.\d+)?',
                              'al' => '\d+(.\d+)?',
                              'be' => '\d+(.\d+)?',
                              'ga' => '\d+(.\d+)?',
                              'tol' => '\d+(.\d+)?',
                              'res' => '\d+(.\d+)?',
                              'sg' => '(\w|\s)+',
                              'id' => '\d+',
                              'pdb' => '\w+',
                              'title' => '.*',
                              'author' => '.*',
                              'bl' => '.*',
                              'year' => '\d\d\d\d-\d\d-\d\d',
                              's' => '[\w|\s|-|,]+',
                              't' => '\w+',
                              'pp' => '\d+',
                              'page' => '\d+',
                              'dist' => '\d+(.\d+)?',
                              );
        

        var $dispatch = array(array('', 'get', '_cells'),
                              array('/analysed', 'get', '_analysed'),
                              array('/process', 'post', '_process_pdbs'),
                              array('/pdbs', 'get', '_get_processed'),

                              array('/ap', 'get', '_autoproc'),
                              array('/state', 'get', '_state'),
                              array('/bl', 'get', '_beamlines'),
        );
        
        
        # ------------------------------------------------------------------------
        # List data collections / visits for a particular cell
        function _cells($output=true) {
            session_write_close();
            
            $tol = $this->has_arg('tol') ? $this->arg('tol') : 0.01;
            
            $args = array();
            foreach (array('a', 'b', 'c', 'al', 'be', 'ga') as $p) {
                if (!$this->has_arg($p)) $this->_error('One or more unit cell parameters are missing');
                
                array_push($args, $this->arg($p)*(1-$tol));
                array_push($args, $this->arg($p)*(1+$tol));
            }
            
            $tot_args = $args;
            foreach (array('a', 'b', 'c', 'al', 'be', 'ga') as $p) array_push($args, $this->arg($p));
            
            if ($this->has_arg('year')) {
                array_push($args, '00:01 '.$this->arg('year'));
            } else {
                array_push($args, strftime('%H:%M %Y-%m-%d'));
            }
            array_push($tot_args, $args[sizeof($args)-1]);
            
            $rest = '';
            $sgt = '';
            
            if ($this->has_arg('res')) {
                $res = 'AND apss.resolutionlimithigh <= :'.(sizeof($args)+1);
                array_push($args, $this->arg('res'));
                $rest = 'AND apss.resolutionlimithigh <= :'.(sizeof($tot_args)+1);
                array_push($tot_args, $this->arg('res'));
            } else $res = '';
            
            if ($this->has_arg('sg')) {
                $sg = "AND REPLACE(ap.spacegroup, ' ', '') LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('sg'));
                $sgt = "AND REPLACE(ap.spacegroup, ' ', '') LIKE :".(sizeof($tot_args)+1);
                //$sgt = 'AND ap.spacegroup LIKE :'.(sizeof($tot_args)+1);
                array_push($tot_args, $this->arg('sg'));
            } else $sg = '';
            
            $nostafft = '';
            if (!$this->staff) {
                $nostaff = "INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) = p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id INNER JOIN user_@DICAT_RO u on (u.id = iu.user_id AND u.name=:".(sizeof($args)+1).")";
                array_push($args, $this->user);
                
                $nostafft = "INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) = p.proposalcode || p.proposalnumber || '-' || s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id INNER JOIN user_@DICAT_RO u on (u.id = iu.user_id AND u.name=:".(sizeof($tot_args)+1).")";
                array_push($tot_args, $this->user);
            } else $nostaff = '';
            
            
            $tot = $this->db->pq("SELECT count(ap.refinedcell_a) as tot FROM autoprocintegration api INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid INNER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid INNER JOIN datacollection dc ON api.datacollectionid = dc.datacollectionid INNER JOIN blsession s ON s.sessionid = dc.sessionid INNER JOIN proposal p ON s.proposalid = p.proposalid $nostafft WHERE p.proposalcode != 'in' AND apss.scalingstatisticstype LIKE 'overall' AND (ap.refinedcell_a BETWEEN :1 AND :2) AND (ap.refinedcell_b BETWEEN :3 AND :4) AND (ap.refinedcell_c BETWEEN :5 AND :6) AND (ap.refinedcell_alpha BETWEEN :7 AND :8) AND (ap.refinedcell_beta BETWEEN :9 AND :10) AND (ap.refinedcell_gamma BETWEEN :11 AND :12) AND to_date(:13, 'HH24:MI YYYY-MM-DD') >= dc.starttime $rest $sgt", $tot_args);
            
            if (sizeof($tot)) $tot = $tot[0]['TOT'];
            else $tot = 0;
            
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('pp') ? $this->arg('pp') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $pgs = intval($tot/$pp);
            if ($tot % $pp != 0) $pgs++;
            
            $rows = $this->db->pq("SELECT outer.* FROM (
                SELECT ROWNUM rn, inner.* FROM (
                    SELECT api.autoprocprogramid, api.autoprocintegrationid, sqrt(power(ap.refinedcell_a-:13,2)+power(ap.refinedcell_b-:14,2)+power(ap.refinedcell_c-:15,2)+power(ap.refinedcell_alpha-:16,2)+power(ap.refinedcell_beta-:17,2)+power(ap.refinedcell_gamma-:18,2)) as dist, s.beamlinename as bl, app.processingcommandline as type, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.scalingstatisticstype as shell, apss.rmerge, apss.completeness, apss.multiplicity, apss.meanioversigi as isigi, ap.spacegroup as sg, ap.refinedcell_a as cell_a, ap.refinedcell_b as cell_b, ap.refinedcell_c as cell_c, ap.refinedcell_alpha as cell_al, ap.refinedcell_beta as cell_be, ap.refinedcell_gamma as cell_ga, dc.datacollectionid as id, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, dc.imagedirectory as dir, dc.filetemplate, p.proposalcode || p.proposalnumber || '-' || s.visit_number as visit, dc.numberofimages as numimg, dc.axisrange, dc.axisstart, dc.wavelength, dc.transmission, dc.exposuretime 
                    FROM autoprocintegration api 
                    INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                    INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                    INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                    INNER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid 
                    INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                    INNER JOIN datacollection dc ON api.datacollectionid = dc.datacollectionid 
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid 
                    INNER JOIN proposal p ON s.proposalid = p.proposalid $nostaff 
                    WHERE p.proposalcode != 'in' AND apss.scalingstatisticstype LIKE 'overall' AND (ap.refinedcell_a BETWEEN :1 AND :2) AND (ap.refinedcell_b BETWEEN :3 AND :4) AND (ap.refinedcell_c BETWEEN :5 AND :6) AND (ap.refinedcell_alpha BETWEEN :7 AND :8) AND (ap.refinedcell_beta BETWEEN :9 AND :10) AND (ap.refinedcell_gamma BETWEEN :11 AND :12) AND to_date(:19, 'HH24:MI YYYY-MM-DD') >= dc.starttime $res $sg 
                    ORDER BY dist) inner) outer 
                    WHERE outer.rn > :$st AND outer.rn <= :$en", $args);
                        
            $types = array('fast_dp' => 'Fast DP', '-3d' => 'XIA2 3d', '-3dii' => 'XIA2 3dii', '-3da ' => 'XIA2 3da', '-2da ' => 'XIA2 2da', '-2d' => 'XIA2 2d', '-2dr' => 'XIA2 2dr', '-3daii ' => 'XIA2 3daii', '-blend' => 'MultiXIA2');
                                  
            foreach ($rows as &$dc) {
                foreach ($types as $id => $name) {
                    if (strpos($dc['TYPE'], $id) !== false) {
                        $dc['TYPE'] = $name;
                        break;
                    }
                }
                
                $users = $this->db->pq("SELECT u.name,u.fullname FROM investigation@DICAT_RO i INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id INNER JOIN user_@DICAT_RO u on u.id = iu.user_id WHERE lower(i.visit_id)=:1", array($dc['VISIT']));
                
                $dc['USERS'] = array();
                foreach ($users as $u) {
                    array_push($dc['USERS'], $u['FULLNAME']);
                }
                
                $dc['DIR'] = $this->ads($dc['DIR']);
                $dc['DIR'] = substr($dc['DIR'], strpos($dc['DIR'], $dc['VISIT'])+strlen($dc['VISIT'])+1);
                
                $dc['WAVELENGTH'] = number_format($dc['WAVELENGTH'], 3);
                $dc['TRANSMISSION'] = number_format($dc['TRANSMISSION'], 3);
            }
            
            if ($output) $this->_output(array($tot, $pgs, $rows));
            else return array($tot, $rows);
        }
        

        # ------------------------------------------------------------------------
        # Autoprocesing stats
        function _autoproc() {
            $stats = $this->db->pq("SELECT TO_CHAR(pdbdate, 'YYYY') as year, count(pdbentryid) as tot, count(case when (beamlinematch=1 OR (autoproccount > 0 and authormatch=1)) and distance < :1 then 1 end) as ap
                FROM pdbentry
                WHERE pdbdate > TO_DATE('2010-05', 'YYYY-MM')
                GROUP BY TO_CHAR(pdbdate, 'YYYY')
                ORDER BY TO_CHAR(pdbdate, 'YYYY')", array($this->has_arg('dist') ? $this->arg('dist') : 0.2));

            $tot = array('AP' => 0, 'MAN' => 0);
            foreach ($stats as $i => &$s) {
                $s['TOT'] = intval($s['TOT']);
                $s['AP'] = intval($s['AP']);
                $s['MAN'] = $s['TOT'] - $s['AP'];

                $tot['MAN'] += $s['MAN'];
                $tot['AP'] += $s['AP'];
            }

            $this->_output(array($tot, $stats));
        }


        # ------------------------------------------------------------------------
        # State stats
        function _state() {
            $stats = $this->db->pq("SELECT 
                count(case when (beamlinematch=1) then 1 end) as match, 
                count(case when (autoproccount>0 and beamlinematch != 1 and authormatch!=1) then 1 end) as nomatch, 
                count(case when (autoproccount=0) then 1 end) as noresults, 
                count(case when (autoproccount>0 and beamlinematch!=1 and authormatch=1) then 1 end) as mismatch 
                FROM pdbentry
                WHERE pdbdate > TO_DATE('2010-05', 'YYYY-MM')");

            $stats = $stats[0];
            foreach ($stats as $i => &$v) {
                $v = intval($v);
            }

            $this->_output($stats);
        }



        # ------------------------------------------------------------------------
        # Beamline stats
        function _beamlines() {
            $pdb = $this->db->pq("SELECT TO_CHAR(p.pdbdate, 'YYYY') as year, REPLACE(REPLACE(p.pdbbeamlinename, 'DIAMOND LIGHT SOURCE BEAMLINE ', ''), 'DIAMOND BEAMLINE ', '') as bl, count(p.pdbentryid) as count
                FROM pdbentry p
                WHERE p.pdbdate > TO_DATE('2010-05', 'YYYY-MM')
                GROUP BY REPLACE(REPLACE(p.pdbbeamlinename, 'DIAMOND LIGHT SOURCE BEAMLINE ', ''), 'DIAMOND BEAMLINE ', ''), TO_CHAR(p.pdbdate, 'YYYY')
                ORDER BY TO_CHAR(p.pdbdate, 'YYYY')");

            $isp = $this->db->pq("SELECT TO_CHAR(p.pdbdate, 'YYYY') as year, CASE WHEN p.autoprocprogramid > 0 THEN UPPER(s.beamlinename) ELSE REPLACE(REPLACE(p.pdbbeamlinename, 'DIAMOND LIGHT SOURCE BEAMLINE ', ''), 'DIAMOND BEAMLINE ', '') END as bl, count(p.pdbentryid) as count
                FROM pdbentry p
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = p.autoprocprogramid
                LEFT OUTER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                LEFT OUTER JOIN blsession s ON s.sessionid = dc.sessionid
                WHERE p.pdbdate > TO_DATE('2010-05', 'YYYY-MM')
                GROUP BY CASE WHEN p.autoprocprogramid > 0 THEN UPPER(s.beamlinename) ELSE REPLACE(REPLACE(p.pdbbeamlinename, 'DIAMOND LIGHT SOURCE BEAMLINE ', ''), 'DIAMOND BEAMLINE ', '') END, TO_CHAR(p.pdbdate, 'YYYY')
                ORDER BY TO_CHAR(p.pdbdate, 'YYYY')");

            foreach ($pdb as $i => &$s) {
                $s['COUNT'] = intval(($s['COUNT']));
            }

            foreach ($isp as $i => &$s) {
                $s['COUNT'] = intval(($s['COUNT']));
            }

            $this->_output(array($pdb, $isp));
        }

           
        # ------------------------------------------------------------------------
        # List pdb codes that have been analysed
        function _analysed() {
            $args = array();
            $where = '';

            if ($this->has_arg('t')) {                
                if ($this->arg('t') == 'match' ) {
                    $where .= ' AND p.beamlinematch=1';
                }

                if ($this->arg('t') == 'mismatch' ) {
                    $where .= ' AND p.autoproccount > 0 AND p.authormatch=1 AND p.beamlinematch!=1';
                }

                if ($this->arg('t') == 'noresults' ) {
                    $where .= ' AND p.autoproccount < 1';
                }

                if ($this->arg('t') == 'nomatch' ) {
                    $where .= ' AND p.autoproccount > 0 and p.authormatch=0 and p.beamlinematch=0';
                }
            }


            if ($this->has_arg('s')) {
                $s = str_replace('_', '$_', $this->arg('s'));

                $st = sizeof($args) + 1;
                $where .= " AND (lower(p.code) LIKE lower('%'||:$st||'%') ESCAPE '$' OR lower(p.pdbauthors) LIKE lower('%'||:".($st+1)."||'%') ESCAPE '$' OR lower(p.pdbbeamlinename) LIKE lower('%'||:".($st+2)."||'%') ESCAPE '$')";

                for ($i = 0; $i < 3; $i++) array_push($args, $s);
            }

            $tot = $this->db->pq("SELECT count(p.pdbentryid) as tot FROM pdbentry p WHERE 1=1 $where", $args);
            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $end = 10;
            $pp = $this->has_arg('pp') ? $this->arg('pp') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }

            $st = sizeof($args) + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                SELECT p.pdbentryid, p.autoprocprogramid, p.code, p.resolution, p.pdbbeamlinename, p.beamlines, p.distance, p.autoproccount, p.beamlinematch, p.authormatch, dc.datacollectionid, s.beamlinename, TO_CHAR(p.pdbdate, 'YYYY-MM-DD') as pdbdate
                FROM pdbentry p 
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = p.autoprocprogramid
                LEFT OUTER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                LEFT OUTER JOIN blsession s ON s.sessionid = dc.sessionid
                WHERE 1=1 $where
                ORDER BY p.pdbdate DESC
                ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);

            foreach ($rows as $i => &$r) {
                $r['BEAMLINEMATCH'] = intval($r['BEAMLINEMATCH']);
                $r['AUTHORMATCH'] = intval($r['AUTHORMATCH']);
            }

            $this->_output(array($tot, $rows));
        }


        # ------------------------------------------------------------------------
        # Process a pdb from RCSB
        function _process_pdbs() {
            if (!$this->has_arg('bl')) $this->_error('No beamline specified');

            list($tot, $rows) = $this->_cells(false);

            $blmatch = 0;
            $umatch = 0;
            $bls = array();
            foreach ($rows as $r) {
                $bls[$r['BL']] = 1;
                
                if (str_replace('DIAMOND BEAMLINE ', '', $this->arg('bl')) ==  strtoupper($r['BL'])) $blmatch = 1;
                
                foreach ($r['USERS'] as $u) {
                    $parts = explode(' ', $u);
                    
                    if (stripos($this->arg('author'), end($parts)) !== false) {
                        $umatch = 1;
                    }
                }
            }

            $bls = implode(', ', array_keys($bls));
            $aid = sizeof($rows) ? $rows[0]['AUTOPROCPROGRAMID'] : '';
            $dist = sizeof($rows) ? $rows[0]['DIST'] : '';

            $title = $this->has_arg('title') ? $this->arg('title') : '';
            $author = $this->has_arg('author') ? $this->arg('author') : '';

            $this->db->pq("INSERT INTO pdbentry (pdbentryid, autoprocprogramid, code, cell_a, cell_b, cell_c, cell_alpha, cell_beta, cell_gamma, resolution, pdbtitle, pdbauthors, pdbdate, pdbbeamlinename, beamlines, distance, autoproccount, beamlinematch, authormatch) VALUES (s_pdbentry.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, TO_DATE(:12, 'YYYY-MM-DD'), :13, :14, :15, :16, :17, :18)", array($aid, $this->arg('pdb'), $this->arg('a'), $this->arg('b'), $this->arg('c'), $this->arg('al'), $this->arg('be'), $this->arg('ga'), $this->arg('res')/1.25, $title, $author, $this->arg('year'), $this->arg('bl'), $bls, $dist, $tot, $blmatch, $umatch));
                
            $this->_output(1);
        }



        function _get_processed() {
            $rows = $this->db->pq("SELECT code from pdbentry");
            $this->_output($rows);
        }




    }

?>