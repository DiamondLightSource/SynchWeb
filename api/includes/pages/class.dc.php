<?php

    class Dc extends Page {
        

        public static $arg_list = array('id' => '\d+', 'ids' => '\d+', 'visit' => '\w+\d+-\d+', 's' => '[\w\d-\/]+', 't' => '\w+', 'value' => '.*', 'sid' => '\d+', 'aid' => '\d+', 'pjid' => '\d+', 'imp' => '\d', 'pid' => '\d+', 'h' => '\d\d', 'dmy' => '\d\d\d\d\d\d\d\d',
                              'ssid' => '\d+',
                              'dcg' => '\d+',
                              'a' => '\d+(.\d+)?',
                              'b' => '\d+(.\d+)?',
                              'c' => '\d+(.\d+)?',
                              'al' => '\d+(.\d+)?',
                              'be' => '\d+(.\d+)?',
                              'ga' => '\d+(.\d+)?',
                              'sg' => '\w+',
                              'single' => '\d',
                              'COMMENTS' => '.*',

                              'dcid' => '\d+',
                              'DATACOLLECTIONID' => '\d+',
                              'PERSONID' => '\d+',
                              'AUTOPROCPROGRAMMESSAGEID' => '\d+',

                              'debug' => '\d',

                              );
        

        public static $dispatch = array(array('(/sing:le)(/:id)', 'get', '_data_collections', array('le' => '\w+', 'id' => '\d+')),
                              array('/aps', 'post', '_ap_status'),
                              array('/chi', 'post', '_chk_image'),
                              array('/imq/:id', 'get', '_image_qi'),
                              array('/grid/:id', 'get', '_grid_info'),
                              array('/grid/xrc/:id', 'get', '_grid_xrc'),
                              array('/grid/map', 'get', '_grid_map'),
                              array('/ed/:id', 'get', '_edge', array('id' => '\d+'), 'edge'),
                              array('/mca/:id', 'get', '_mca', array('id' => '\d+'), 'mca'),
                              array('/dp/:id', 'get', '_dc_downstream'),
                              array('/strat/:id', 'get', '_dc_strategies'),
                              array('/ap/:id', 'get', '_dc_auto_processing'),
                              array('/rd/aid/:aid/:id', 'get', '_rd'),
                              array('/single/t/:t/:id', 'patch', '_set_comment'),
                              array('/sym', 'get', '_get_symmetry'),
                              array('/xfm/:id', 'get', '_fluo_map'),

                              array('/comments(/:dcid)', 'get', '_get_comments'),
                              array('/comments', 'post', '_add_comment'),

                              array('/dat/:id', 'get', '_plot'),

                              array('/apms', 'post', '_ap_message_status'),
                              array('/apm', 'get', '_ap_message'),
                            );


        
        # ------------------------------------------------------------------------
        # Data Collection AJAX Requests
        #   This is pretty crazy, it will return unioned data collections, energy
        #   scans, xfe spectra, and robot/sample actions as a single array ordered
        #   by start time descending for:
        #   - a proposal /
        #   - a visit /visit/
        #   - a particular sample id /sid/
        #   - a project (explicit or implicit) /pjid/(imp/1/)
        #   - a protein /pid/
        #   Its also searchable (A-z0-9-/) and filterable
        function _data_collections($single=null) {
            session_write_close();
            // $this->db->set_debug(True);

            $this->profile('starting dc page');
            #if (!$this->has_arg('visit') &&
            #    !($this->has_arg('sid') && $this->arg('prop')) &&
            #    !($this->has_arg('pjid') && $this->arg('prop')))
            #        $this->_error('No visit, sample, or project specified');
            
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $args = array();
            
            $where = '';
            $where2 = '';
            $where3 = '';
            $where4 = '';
            
            $sess = array();
            
            # Extra joins
            $extj = array('','','','');
            # Extra columns
            $extc = '';
            $extcg = '';
            
            //$this->db->set_debug(True);
            # Filter by types
            if ($this->has_arg('t')) {
                $where = ' AND dc.datacollectionid < 0';
                $where2 = ' AND es.energyscanid < 0';
                $where3 = ' AND r.robotactionid < 0';
                $where4 = ' AND xrf.xfefluorescencespectrumid < 0';
                
                if ($this->arg('t') == 'dc' || $this->arg('t') == 'sc' || $this->arg('t') == 'fc' || $this->arg('t') == 'gr') {
                    
                    $where = '';
                    if ($this->arg('t') == 'sc') $where = ' AND dc.overlap != 0';
                    else if ($this->arg('t') == 'gr') $where = ' AND dc.axisrange = 0';
                    else if ($this->arg('t') == 'fc') $where = ' AND dc.overlap = 0 AND dc.axisrange > 0';
                    
                } else if ($this->arg('t') == 'edge') {
                    $where2 = '';
                    
                } else if ($this->arg('t') == 'mca') {
                    $where4 = '';
                    
                } else if ($this->arg('t') == 'rb') {
                    $where3 = " AND (r.actiontype LIKE 'LOAD' OR r.actiontype LIKE 'UNLOAD' OR r.actiontype LIKE 'DISPOSE')";
                    
                } else if ($this->arg('t') == 'ac') {
                    $where3 = " AND (r.actiontype NOT LIKE 'LOAD' AND r.actiontype NOT LIKE 'UNLOAD' AND r.actiontype NOT LIKE 'DISPOSE')";
                    
                } else if ($this->arg('t') == 'flag') {
                    $where = " AND dc.comments LIKE '%_FLAG_%'";
                    $where2 = " AND es.comments LIKE '%_FLAG_%'";
                    $where4 = " AND xrf.comments LIKE '%_FLAG_%'";
                    
                } else if ($this->arg('t') == 'ap') {
                    $where = ' AND app.processingstatus = 1';
                    $extj[0] .= "INNER JOIN autoprocintegration ap ON dc.datacollectionid = ap.datacollectionid
                        INNER JOIN autoprocprogram app ON app.autoprocprogramid = ap.autoprocprogramid";

                } else if ($this->arg('t') == 'err') {
                    $where = " AND appm.autoprocprogrammessageid IS NOT NULL AND (appm.severity = 'WARNING' OR appm.severity = 'ERROR')";
                    $extj[0] .= "LEFT OUTER JOIN autoprocintegration api ON dc.datacollectionid = api.datacollectionid
                        LEFT OUTER JOIN autoprocprogram app ON (app.autoprocprogramid = api.autoprocprogramid OR dc.datacollectionid = app.datacollectionid)
                        INNER JOIN autoprocprogrammessage appm ON appm.autoprocprogramid = app.autoprocprogramid";
                }
            }
            
            # Pagination
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }

            
            # Check that whatever we are looking for actually exists
            $info = array();
            # Visits
            if ($this->has_arg('visit')) {
                $info = $this->db->pq("SELECT TO_CHAR(s.startdate, 'HH24') as sh, TO_CHAR(s.startdate, 'DDMMYYYY') as dmy, s.sessionid, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE  CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
                if (!sizeof($info)) {
                    $this->_error('No such visit');
                } else $info = $info[0];
                
                $sess = array('dc.sessionid=:1', 'es.sessionid=:2', 'r.blsessionid=:3', 'xrf.sessionid=:4');
                for ($i = 0; $i < 4; $i++) array_push($args, $info['SESSIONID']);
            
            # Subsamples
            } else if ($this->has_arg('ssid') && $this->has_arg('prop')) {
                $info = $this->db->pq("SELECT ss.blsubsampleid FROM blsubsample ss INNER JOIN blsample s ON s.blsampleid = ss.blsampleid INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid INNER JOIN proposal p ON p.proposalid = pr.proposalid WHERE ss.blsubsampleid=:1 AND CONCAT(p.proposalcode, p.proposalnumber) LIKE :2", array($this->arg('ssid'), $this->arg('prop')));
                
                $tables2 = array('dc', 'es', 'r', 'xrf');
                $ct = 0;
                foreach ($tables2 as $i => $t) {
                    if ($t == 'r') $sess[$i] = 'r.robotactionid<1';
                    else {
                        $sess[$i] = $t.'.blsubsampleid=:'.($ct+1);
                        $ct++;
                    }
                }
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('ssid'));

            # Samples
            } else if ($this->has_arg('sid') && $this->has_arg('prop')) {
                $info = $this->db->pq("SELECT s.blsampleid FROM blsample s INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid INNER JOIN proposal p ON p.proposalid = pr.proposalid WHERE s.blsampleid=:1 AND CONCAT(p.proposalcode, p.proposalnumber) LIKE :2", array($this->arg('sid'), $this->arg('prop')));
                
                $tables2 = array('dc', 'es', 'r', 'xrf');
                foreach ($tables2 as $i => $t) $sess[$i] = $t.'.blsampleid=:'.($i+1);
                for ($i = 0; $i < 4; $i++) array_push($args, $this->arg('sid'));
                 
            # Projects
            } else if ($this->has_arg('pjid')) {
                $info = $this->db->pq('SELECT p.title FROM project p LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid WHERE p.projectid=:1 AND (p.personid=:2 or php.personid=:3)', array($this->arg('pjid'), $this->user->personid, $this->user->personid));
                
                $tables = array(array('project_has_dcgroup', 'dc', 'datacollectiongroupid'),
                                array('project_has_energyscan', 'es', 'energyscanid'),
                                array('project_has_session', 'r', 'blsessionid', 'sessionid'),
                                array('project_has_xfefspectrum', 'xrf', 'xfefluorescencespectrumid'),
                                );

                $extc = "CONCAT(CONCAT(CONCAT(prop.proposalcode,prop.proposalnumber), '-'), ses.visit_number) as vis, CONCAT(prop.proposalcode, prop.proposalnumber) as prop, ";
                $extcg = "max(CONCAT(CONCAT(CONCAT(prop.proposalcode,prop.proposalnumber), '-'), ses.visit_number)) as vis, max(CONCAT(prop.proposalcode, prop.proposalnumber)) as prop, ";
                if ($this->has_arg('dcg')) $extcg = $extc;

                foreach ($tables as $i => $t) {
                    $ct = sizeof($t) == 4 ? $t[3] : $t[2];
                    
                    $extj[$i] .= " LEFT OUTER JOIN $t[0] prj ON $t[1].$t[2] = prj.$ct INNER JOIN proposal prop ON ses.proposalid = prop.proposalid";
                    $sess[$i] = 'prj.projectid=:'.($i+1);
                    
                    if ($this->has_arg('imp')) {
                        if ($this->arg('imp')) {
                            $extj[$i] .= " LEFT OUTER JOIN crystal cr ON cr.crystalid = smp.crystalid LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid LEFT OUTER JOIN project_has_protein prj2 ON prj2.proteinid = pr.proteinid LEFT OUTER JOIN project_has_blsample prj3 ON prj3.blsampleid = smp.blsampleid";
                            $sess[$i] = '(prj.projectid=:'.($i*3+1).' OR prj2.projectid=:'.($i*3+2).' OR prj3.projectid=:'.($i*3+3).')';
                        }
                    }
                }
                
                
                $n = 4;
                if ($this->has_arg('imp'))
                    if ($this->arg('imp')) $n = 12;
                for ($i = 0; $i < $n; $i++) array_push($args, $this->arg('pjid'));
        
                
            # Proteins
            } else if ($this->has_arg('pid')) {
                $info = $this->db->pq("SELECT proteinid FROM protein p WHERE p.proteinid=:1", array($this->arg('pid')));

                foreach (array('dc', 'es', 'r', 'xrf') as $i => $t) {
                    $extj[$i] .= " INNER JOIN crystal cr ON cr.crystalid = smp.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid";
                    $sess[$i] = 'pr.proteinid=:'.(sizeof($args)+1);
                    array_push($args, $this->arg('pid'));
                }
                
            # Proposal
            } else if ($this->has_arg('prop')) {
                $info = $this->db->pq('SELECT proposalid FROM proposal p WHERE CONCAT(p.proposalcode, p.proposalnumber) LIKE :1', array($this->arg('prop')));
                
                for ($i = 0; $i < 4; $i++) {
                    $sess[$i] = 'ses.proposalid=:'.($i+1);
                    array_push($args, $this->proposalid);
                }
            }
            
            if (!sizeof($info)) $this->_error('The specified visit, sample, or project doesnt exist');
            
            
            # Filter by time for visits
            if (($this->has_arg('h') && ($this->has_arg('visit') || $this->has_arg('dmy'))) || $this->has_arg('dmy')) {
                $where .= "AND dc.starttime > TO_DATE(:".(sizeof($args)+1).", 'HH24:MI:SS DDMMYYYY') AND dc.starttime < TO_DATE(:".(sizeof($args)+2).", 'HH24:MI:SS DDMMYYYY')";
                $where2 .= "AND es.starttime > TO_DATE(:".(sizeof($args)+3).", 'HH24:MI:SS DDMMYYYY') AND es.starttime < TO_DATE(:".(sizeof($args)+4).", 'HH24:MI:SS DDMMYYYY')";
                $where3 .= "AND r.starttimestamp > TO_DATE(:".(sizeof($args)+5).", 'HH24:MI:SS DDMMYYYY') AND r.starttimestamp < TO_DATE(:".(sizeof($args)+6).", 'HH24:MI:SS DDMMYYYY')";
                $where4 .= "AND xrf.starttime > TO_DATE(:".(sizeof($args)+7).", 'HH24:MI:SS DDMMYYYY') AND xrf.starttime < TO_DATE(:".(sizeof($args)+8).", 'HH24:MI:SS DDMMYYYY')";
                
                if ($this->has_arg('dmy')) {
                    $my = $this->arg('dmy');
                } else {
                    $my = $info['DMY'];
                    if ($this->arg('h') < $info['SH']) {
                        $sd = mktime(0,0,0,substr($my,2,2), substr($my,0,2), substr($my,4,4))+(3600*24);
                        $my = date('dmY', $sd);
                    }
                }
                
                
                if ($this->has_arg('h')) {
                    $st = $this->arg('h').':00:00 ';
                    $en = $this->arg('h').':59:59 ';
                } else {
                    $st = '00:00:00';
                    $en = '23:59:59 ';
                }
                
                for ($i = 0; $i < 4; $i++) {
                    array_push($args, $st.$my);
                    array_push($args, $en.$my);
                }
            }
            
            
            # If not staff check they have access to data collection
            if (!$this->has_arg('visit') && !$this->staff) {
                for ($i = 0; $i < 4; $i++) {
                    $extj[$i] .= " INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);
                    array_push($args, $this->user->personid);
                }
            }
            
            # View a single data collection
            if ($this->has_arg('id')) {
                $st = sizeof($args)+1;
                $where .= ' AND dc.datacollectionid=:'.$st;
                $where3 .= ' AND r.robotactionid=:'.($st+1);
                $where2 .= ' AND es.energyscanid=:'.($st+2);
                $where4 .= ' AND xrf.xfefluorescencespectrumid=:'.($st+3);
                for ($i = 0; $i < 4; $i++) array_push($args, $this->arg('id'));
            }
            
            # Search terms
            if ($this->has_arg('s')) {
                $s = str_replace('_', '$_', $this->arg('s'));

                $st = sizeof($args) + 1;
                $where .= " AND (lower(dc.filetemplate) LIKE lower(CONCAT(CONCAT('%',:$st),'%')) ESCAPE '$' OR lower(dc.imagedirectory) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) ESCAPE '$' OR lower(smp.name) LIKE lower(CONCAT(CONCAT('%', :".($st+2)."), '%')) ESCAPE '$')";
                $where2 .= " AND (lower(es.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+3)."), '%')) ESCAPE '$' OR lower(es.element) LIKE lower(CONCAT(CONCAT('%',:".($st+4)."), '%')) ESCAPE '$' OR lower(smp.name) LIKE lower(CONCAT(CONCAT('%',:".($st+5)."), '%')) ESCAPE '$')";
                $where3 .= ' AND r.robotactionid < 0';
                $where4 .= " AND (lower(xrf.filename) LIKE lower(CONCAT(CONCAT('%',:".($st+6)."), '%')) ESCAPE '$' OR lower(smp.name) LIKE lower(CONCAT(CONCAT('%',:".($st+7)."), '%')) ESCAPE '$')";
                
                for ($i = 0; $i < 8; $i++) array_push($args, $s);
            }
            

            # Data collection group
            if ($this->has_arg('dcg')) {
                $count_field = 'dc.datacollectionid';
                $fields = "count(distinct dca.datacollectionfileattachmentid) as dcac, count(distinct dcc.datacollectioncommentid) as dccc, 1 as dcc, smp.name as sample,smp.blsampleid, ses.visit_number as vn, dc.kappastart as kappa, dc.phistart as phi, dc.startimagenumber as si, dc.experimenttype as dct, dc.datacollectiongroupid as dcg, dc.runstatus, dc.beamsizeatsamplex as bsx, dc.beamsizeatsampley as bsy, dc.overlap, dc.flux, 1 as scon, 'a' as spos, 'a' as san, 'data' as type, dc.imageprefix as imp, dc.datacollectionnumber as run, dc.filetemplate, dc.datacollectionid as id, dc.numberofimages as ni, dc.imagedirectory as dir, dc.resolution, dc.exposuretime, dc.axisstart, dc.numberofimages as numimg, TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, dc.transmission, dc.axisrange, dc.wavelength, dc.comments, 1 as epk, 1 as ein, dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4, dc.starttime as sta, dc.detectordistance as det, dc.xbeam, dc.ybeam, dc.chistart, 
                    dc.voltage,
                    dc.c2aperture,
                    dc.c2lens,
                    dc.objaperture,
                    dc.magnification,
                    dc.totalexposeddose as totaldose,
                    d.detectorpixelsizehorizontal,
                    d.detectorpixelsizevertical,
                    d.detectormanufacturer,
                    d.detectormodel,
                    TIMESTAMPDIFF('MINUTE', dc.starttime, CURRENT_TIMESTAMP) as age,

                    dc.numberofpasses,
                    dc.c1aperture,
                    dc.c3aperture,
                    dc.c1lens,
                    dc.c3lens,
                    dc.detectormode,
                    dc.slitgaphorizontal,
                    dc.slitgapvertical,
                    dc.binning,
                    dc.averagetemperature,
                    dc.nominalmagnification,
                    dc.nominaldefocus,
                    dc.imagesizex,
                    dc.imagesizey,
                    dc.pixelsizeonimage,
                    dc.phaseplate,
                    ses.beamlinename as bl,
                    dc.blsubsampleid,
                    d.numberofpixelsx as detectornumberofpixelsx,
                    d.numberofpixelsy as detectornumberofpixelsy
                    ";
                $groupby = 'GROUP BY smp.name,smp.blsampleid,ses.visit_number,dc.kappastart,dc.phistart, dc.startimagenumber, dc.experimenttype, dc.datacollectiongroupid, dc.runstatus, dc.beamsizeatsamplex, dc.beamsizeatsampley, dc.overlap, dc.flux, dc.imageprefix, dc.datacollectionnumber, dc.filetemplate, dc.datacollectionid, dc.numberofimages, dc.imagedirectory, dc.resolution, dc.exposuretime, dc.axisstart, dc.numberofimages, TO_CHAR(dc.starttime, \'DD-MM-YYYY HH24:MI:SS\'), dc.transmission, dc.axisrange, dc.wavelength, dc.comments, dc.xtalsnapshotfullpath1, dc.xtalsnapshotfullpath2, dc.xtalsnapshotfullpath3, dc.xtalsnapshotfullpath4, dc.starttime, dc.detectordistance, dc.xbeam, dc.ybeam, dc.chistart';
                // $this->db->set_debug(True);

                $where .= ' AND dc.datacollectiongroupid=:'.(sizeof($args)+1);

                // will want to support these too at some point
                $where2 = ' AND es.energyscanid < 0';
                $where3 = ' AND r.robotactionid < 0';
                $where4 = ' AND xrf.xfefluorescencespectrumid < 0';

                array_push($args, $this->arg('dcg'));

            } else {
                $count_field = 'distinct dc.datacollectiongroupid';
                $fields = "count(distinct dca.datacollectionfileattachmentid) as dcac, count(distinct dcc.datacollectioncommentid) as dccc, count(distinct dc.datacollectionid) as dcc, min(smp.name) as sample, min(smp.blsampleid) as blsampleid, min(ses.visit_number) as vn, min(dc.kappastart) as kappa, min(dc.phistart) as phi, min(dc.startimagenumber) as si, min(dcg.experimenttype) as dct, dc.datacollectiongroupid as dcg, min(dc.runstatus) as runstatus, min(dc.beamsizeatsamplex) as bsx, min(dc.beamsizeatsampley) as bsy, min(dc.overlap) as overlap, max(dc.flux) as flux, 1 as scon, 'a' as spos, 'a' as san, 'data' as type, min(dc.imageprefix) as imp, min(dc.datacollectionnumber) as run, min(dc.filetemplate) as filetemplate, min(dc.datacollectionid) as id, min(dc.numberofimages) as ni, min(dc.imagedirectory) as dir, min(dc.resolution) as resolution, min(dc.exposuretime) as exposuretime, min(dc.axisstart) as axisstart, min(dc.numberofimages) as numimg, TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as st, min(dc.transmission) as transmission, min(dc.axisrange) as axisrange, min(dc.wavelength) as wavelength, min(dc.comments) as comments, 1 as epk, 1 as ein, min(dc.xtalsnapshotfullpath1) as x1, min(dc.xtalsnapshotfullpath2) as x2, min(dc.xtalsnapshotfullpath3) as x3, min(dc.xtalsnapshotfullpath4) as x4, min(dc.starttime) as sta, min(dc.detectordistance) as det, min(dc.xbeam) as xbeam, min(dc.ybeam) as ybeam, min(dc.chistart) as chistart,
                    max(dc.voltage) as voltage,
                    max(dc.c2aperture) as c2aperture,
                    max(dc.c2lens) as c2lens,
                    max(dc.objaperture) as objaperture,
                    max(dc.magnification) as magnification,
                    sum(dc.totalabsorbeddose) as totaldose,
                    max(d.detectormanufacturer) as detectormanufacturer,
                    max(d.detectormodel) as detectormodel,
                    max(d.detectorpixelsizehorizontal) as detectorpixelsizehorizontal,
                    max(d.detectorpixelsizevertical) as detectorpixelsizevertical,
                    max(TIMESTAMPDIFF('MINUTE', dc.starttime, CURRENT_TIMESTAMP)) as age,
                    max(dc.numberofpasses) as numberofpasses,
                    max(dc.c1aperture) as c1aperture,
                    max(dc.c3aperture) as c3aperture,
                    max(dc.c1lens) as c1lens,
                    max(dc.c3lens) as c3lens,
                    max(dc.detectormode) as detectormode,
                    max(dc.slitgaphorizontal) as slitgaphorizontal,
                    max(dc.slitgapvertical) as slitgapvertical,
                    max(dc.binning) as binning,
                    max(dc.averagetemperature) as averagetemperature,
                    max(dc.nominalmagnification) as nominalmagnification,
                    max(dc.nominaldefocus) as nominaldefocus,
                    max(dc.imagesizex) as imagesizex,
                    max(dc.imagesizey) as imagesizey,
                    max(dc.pixelsizeonimage) as pixelsizeonimage,
                    max(dc.phaseplate) as phaseplate,
                    max(ses.beamlinename) as bl,
                    max(dc.blsubsampleid) as blsubsampleid,
                    max(d.numberofpixelsx) as detectornumberofpixelsx,
                    max(d.numberofpixelsy) as detectornumberofpixelsy";
                $groupby = "GROUP BY dc.datacollectiongroupid";
            }


            $tot = $this->db->pq("SELECT sum(tot) as t FROM (SELECT count($count_field) as tot FROM datacollection dc
                INNER JOIN blsession ses ON ses.sessionid = dc.sessionid
                LEFT OUTER JOIN blsample smp ON dc.blsampleid = smp.blsampleid
                $extj[0]
                WHERE $sess[0] $where
                
                UNION SELECT count(es.energyscanid) as tot FROM energyscan es
                INNER JOIN blsession ses ON ses.sessionid = es.sessionid
                LEFT OUTER  JOIN blsample smp ON es.blsampleid = smp.blsampleid
                $extj[1]
                WHERE $sess[1] $where2
                                
                UNION SELECT count(xrf.xfefluorescencespectrumid) as tot from xfefluorescencespectrum xrf
                INNER JOIN blsession ses ON ses.sessionid = xrf.sessionid
                LEFT OUTER  JOIN blsample smp ON xrf.blsampleid = smp.blsampleid
                $extj[3]
                WHERE $sess[3] $where4
                                
                UNION SELECT count(r.robotactionid) as tot FROM robotaction r
                INNER JOIN blsession ses ON ses.sessionid = r.blsessionid
                LEFT OUTER  JOIN blsample smp ON r.blsampleid = smp.blsampleid
                $extj[2]
                WHERE $sess[2]  $where3) inq", $args);
            $tot = $tot[0]['T'];
            
            $this->profile('after page count');
            
            $pgs = intval($tot/$pp);
            if ($tot % $pp != 0) $pgs++;

            $st = sizeof($args) + 1;
            array_push($args, $start);
            array_push($args, $end);


            $q = "SELECT $extcg $fields FROM datacollection dc
             INNER JOIN blsession ses ON ses.sessionid = dc.sessionid
             INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
             LEFT OUTER JOIN blsample smp ON dc.blsampleid = smp.blsampleid
             LEFT OUTER JOIN datacollectioncomment dcc ON dc.datacollectionid = dcc.datacollectionid
             LEFT OUTER JOIN datacollectionfileattachment dca ON dc.datacollectionid = dca.datacollectionid
             LEFT OUTER JOIN detector d ON d.detectorid = dc.detectorid

             $extj[0]
             WHERE $sess[0] $where
             $groupby
                   
             UNION
             SELECT $extc 1 as dcac, 1 as dccc, 1 as dcc, smp.name as sample,smp.blsampleid, ses.visit_number as vn, 1,1,1,'A',1,'A',es.beamsizehorizontal,es.beamsizevertical,1, 1, 1 as scon, 'A' as spos, 'A' as sn, 'edge' as type, es.jpegchoochfilefullpath, 1, es.scanfilefullpath, es.energyscanid, 1, es.element, es.peakfprime, es.exposuretime, es.axisposition, es.peakfdoubleprime, TO_CHAR(es.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, es.transmissionfactor, es.inflectionfprime, es.inflectionfdoubleprime, es.comments, es.peakenergy, es.inflectionenergy, 'A', 'A', 'A', 'A', es.starttime as sta, 1, 1, 1, 0, 
                1, 1, 1, 1, 1, 1, 1, 1, '', '', TIMESTAMPDIFF('MINUTE', es.starttime, CURRENT_TIMESTAMP) as age,
                0, 0, 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ses.beamlinename as bl, es.blsubsampleid, '', ''
            FROM energyscan es
            INNER JOIN blsession ses ON ses.sessionid = es.sessionid
            LEFT OUTER JOIN blsample smp ON es.blsampleid = smp.blsampleid
            $extj[1]
            WHERE $sess[1] $where2
                   
            UNION
            SELECT $extc 1 as dcac, 1 as dccc, 1 as dcc, smp.name as sample,smp.blsampleid, ses.visit_number as vn, 1,1,1,'A',1,'A',xrf.beamsizehorizontal,xrf.beamsizevertical,1, 1, 1, 'A', 'A', 'mca' as type, 'A', 1, 'A', xrf.xfefluorescencespectrumid, 1, xrf.filename, 1, xrf.exposuretime, xrf.axisposition, 1, TO_CHAR(xrf.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, xrf.beamtransmission, 1, xrf.energy, xrf.comments, 1, 1, 'A', 'A', 'A', 'A', xrf.starttime as sta, 1, 1, 1, 0,
                1, 1, 1, 1, 1, 1, 1, 1, '', '', TIMESTAMPDIFF('MINUTE', xrf.starttime, CURRENT_TIMESTAMP) as age,
                0, 0, 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ses.beamlinename as bl, xrf.blsubsampleid, '', ''
            FROM xfefluorescencespectrum xrf
            INNER JOIN blsession ses ON ses.sessionid = xrf.sessionid
            LEFT OUTER  JOIN blsample smp ON xrf.blsampleid = smp.blsampleid     
            $extj[3]
            WHERE $sess[3] $where4
                   
            UNION
            SELECT $extc 1 as dcac, 1 as dccc, 1 as dcc, smp.name as sample,smp.blsampleid, ses.visit_number as vn, 1,1,1,'A',1,'A',ROUND(TIMESTAMPDIFF('SECOND', CAST(r.starttimestamp AS DATE), CAST(r.endtimestamp AS DATE)), 1),1,1, 1, 1, r.status, r.message, 'load' as type, r.actiontype, 1, smp.code, r.robotactionid, 1,  r.samplebarcode, r.containerlocation, r.dewarlocation, 1, 1, TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24:MI:SS') as st, 1, 1, 1, 'A', 1, 1, r.xtalsnapshotbefore, r.xtalsnapshotafter, 'A', 'A', r.starttimestamp as sta, 1, 1, 1, 0,
                1, 1, 1, 1, 1, 1, 1, 1, '', '', TIMESTAMPDIFF('MINUTE', r.starttimestamp, CURRENT_TIMESTAMP) as age,
                0, 0, 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ses.beamlinename as bl, 1 as blsubsampleid, '', ''
            FROM robotaction r
            INNER JOIN blsession ses ON ses.sessionid = r.blsessionid
            LEFT OUTER  JOIN blsample smp ON r.blsampleid = smp.blsampleid
            $extj[2]
            WHERE $sess[2] $where3
                 
                   
            ORDER BY sta DESC";
            
            $dcs = $this->db->paginate($q, $args);
            $this->profile('main query');            
            
            foreach ($dcs as $i => &$dc) {
                $dc['SN'] = 0;
                $dc['DI'] = 0;
                
                #if ($this->has_arg('sid') || $this->has_arg('pjid')) $dc['VIS'] = $this->arg('prop').'-'.$dc['VN'];
                if ($this->has_arg('sid')) $dc['VIS'] = $this->arg('prop').'-'.$dc['VN'];
                
                foreach (array('X1', 'X2', 'X3', 'X4') as $x) {
                    $dc[$x] = file_exists($dc[$x]) ? 1 : 0;
                }

                
                // Data collections
                if ($dc['TYPE'] == 'data') {
                    $nf = array(1 => array('AXISSTART'), 2 => array('RESOLUTION', 'TRANSMISSION', 'AXISRANGE'), 3 => array('EXPOSURETIME'), 4 => array('WAVELENGTH'));

                    $dc['DIRFULL'] = $dc['DIR'];
                    $dc['DIR'] = preg_replace('/.*\/'.$this->arg('prop').'-'.$dc['VN'].'\//', '', $dc['DIR']);
                    
                    $dc['BSX'] = round($dc['BSX']*1000);
                    $dc['BSY'] = round($dc['BSY']*1000);
                    
                    if (!$dc['DCT']) {
                        if ($dc['AXISRANGE'] == 0) $dc['DCT'] = 'Still Image';
                        if ($dc['AXISRANGE'] == 0 && $dc['NI'] > 1) $dc['DCT'] = 'Grid Scan';
                        if ($dc['OVERLAP'] != 0) $dc['DCT'] = 'Screening';
                        if ($dc['AXISRANGE'] > 0 && $dc['OVERLAP'] == 0) $dc['DCT'] = 'Data Collection';
                    }

                    if ($dc['DCT'] == 'Mesh') $dc['DCT'] = 'Grid Scan';
                    if ($dc['DCT'] == 'OSC') $dc['DCT'] = 'Data Collection';
                    

                    if ($dc['AXISRANGE'] == 0 && $dc['NI'] > 1) $dc['TYPE'] = 'grid';
                    //$this->profile('dc');
                    
                // Edge Scans
                } else if ($dc['TYPE'] == 'edge') {
                    $dc['EPK'] = floatVal($dc['EPK']);
                    $dc['EIN'] = floatVal($dc['EIN']);
                    
                    # Transmission factor rather than transmission :(
                    $dc['TRANSMISSION'] *= 100;
                    
                    $dc['FILETEMPLATE'] = preg_replace('/.*\/'.$this->arg('prop').'-'.$dc['VN'].'\//', '', $dc['FILETEMPLATE']);
                    
                    $nf = array(2 => array('EXPOSURETIME'), 2 => array('AXISSTART', 'RESOLUTION', 'TRANSMISSION'));
                    $this->profile('edge');  
                
                // MCA Scans
                } else if ($dc['TYPE'] == 'mca') {
                    $nf = array(2 => array('EXPOSURETIME', 'WAVELENGTH', 'TRANSMISSION'));
                    $dc['DIRFULL'] = $dc['DIR'];
                    $dc['DIR'] = preg_replace('/.*\/\d\d\d\d\/\w\w\d+-\d+\//', '', $dc['DIR']);
                    
                // Robot loads
                } else if ($dc['TYPE'] == 'load') {
                    $nf = array();
                    if ($dc['IMP'] == 'ANNEAL' || $dc['IMP'] == 'WASH') $dc['TYPE'] = 'action';
                }
                
                
                //$dc['AP'] = array(0,0,0,0,0,0,0,0);
                
                foreach ($nf as $nff => $cols) {
                    foreach ($cols as $c) {
                        $dc[$c] = number_format($dc[$c], $nff);
                    }
                }
            
            }

            
            $this->profile('processing');
            if ($single) $this->_output($dcs[0]);
            else $this->_output(array($pgs, $dcs));
        }
        
        # ------------------------------------------------------------------------
        # Check whether diffraction and snapshot images exist
        function _chk_image() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $where = array();
            $ids = array();
            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    foreach ($this->arg('ids') as $i) {
                        array_push($ids,$i);
                        array_push($where,'dc.datacollectionid=:'.sizeof($ids));
                    }
                }
            }
            $where = '('.implode(' OR ', $where).')';
            
            if (!sizeof($ids)) {
                $this->_output(array());
                return;
            }
            
            $dct = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, dc.datacollectionid as id, dc.startimagenumber, dc.filetemplate, dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4,dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, s.visit_number FROM datacollection dc INNER JOIN blsession s ON s.sessionid=dc.sessionid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $ids);
            
            $this->db->close();
            $this->profile('dc query');
            
            $dcs = array();
            foreach ($dct as $d) $dcs[$d['ID']] = $d;
            
            $out = array();
            
            foreach ($dcs as $dc) {
                $debug = array();

                $sn = 0;
                $images = array();
                foreach (array('X1', 'X2', 'X3', 'X4') as $j => $im) {
                    array_push($images, file_exists($dc[$im]) ? 1 : 0);
                    if ($im == 'X1') {
                        $thumb = str_replace('.png', 't.png', $dc[$im]);
                        if ($this->staff && $this->has_arg('debug')) $debug['snapshot_thumb'] = array('file' => $thumb, 'exists' => file_exists($thumb) ? 1 : 0);
                        if (file_exists($thumb)) $sn = 1;
                    }
                    unset($dc[$im]);
                }

                $dc['DIR'] = $this->ads($dc['DIR']);
                $dc['X'] = $images;
                
                $di = str_replace($dc['VIS'], $dc['VIS'].'/jpegs', $dc['DIR']).str_replace(pathinfo($dc['FILETEMPLATE'], PATHINFO_EXTENSION), 'jpeg',preg_replace('/#+/', sprintf('%0'.substr_count($dc['FILETEMPLATE'], '#').'d', $dc['STARTIMAGENUMBER']),$dc['FILETEMPLATE']));
                
                $this->profile('diffraction image');
                $die = 0;
                if (file_exists($di)) $die = 1;
                if ($this->staff && $this->has_arg('debug')) $debug['diffraction_thumb'] = array('file' => $di, 'exists' => file_exists($di) ? 1 : 0);
            
                array_push($out, array($dc['ID'], array($die,$images,$sn,$debug)));
            }
            $this->_output($out);
        }
        
        
        # ------------------------------------------------------------------------
        # Autoprocessing Status
        function _ap_status() {
            session_write_close();
            
            $where = array();
            
            #$this->db->set_debug(True);
            #$this->db->set_stats(True);
            #$this->profile = True;
            
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $ids = array();
            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    foreach ($this->arg('ids') as $i) {
                        array_push($ids,$i);
                        array_push($where,'dc.datacollectionid=:'.sizeof($ids));
                    }
                }

            }
                   
            if (!sizeof($ids)) {
                $this->_output(array());
                return;
            }
                                
            $where = '('.implode(' OR ', $where).')';
            
            if ($this->has_arg('visit')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($ids)+1);
                array_push($ids, $this->arg('visit'));
            } else {
                $where .= " AND s.proposalid = :".(sizeof($ids)+1);
                array_push($ids, $this->proposalid);
            }

            $this->profile('start');
            
            $aps1 = array(
                    "Mosflm" => array('simple_strategy/', 'strategy_native.log', 'Phi start'),
                    "EDNA" => array('edna/', 'summary.html', 'Selected spacegroup'),
                    "Xia2/strat" => array('xia2strategy/', 'xia2.strategy.txt', 'Status: error', 'Start / end / width'),
            );
            $aps2 = array(
                    "Fast DP" => array('fast_dp/', 'fast_dp.log', 'I/sigma'),
                    
                    "Xia2/3d" => array('xia2/3d-run/', 'xia2.txt' , 'I/sigma'),
                    "Xia2/3dii" => array('xia2/3dii-run/', 'xia2.txt' , 'I/sigma'),
                    "DIALS" => array('xia2/dials-run/', 'xia2.txt' , 'I/sigma'),
                    
                    "MultiXia2/XDS" => array('multi-xia2/3dii/', 'xia2.txt' , 'I/sigma'),
                    "MultiXia2/DIALS" => array('multi-xia2/dials/', 'xia2.txt' , 'I/sigma'),
                    
                    "autoPROC" => array('autoPROC/ap-run/', 'autoPROC.log', 'Normal termination'),
                    
                    "Fast EP" => array('fast_ep/', 'fast_ep.log', 'Best hand:'),
                    "Dimple" => array('fast_dp/dimple/', 'refmac5_restr.log', 'DPI'),
                    "MrBUMP" => array('auto_mrbump/', 'MRBUMP.log', 'Looks like MrBUMP succeeded'),
                    "Big EP/XDS" => array('big_ep/', '/xia2/3dii-run/big_ep*.log', 'Results for'),
                    "Big EP/DIALS" => array('big_ep/', '/xia2/dials-run/big_ep_*.log', 'Results for', 'Residues'),
            );
            
            $out = array();
            
            # DC Details
            $dct = $this->db->pq("SELECT dc.overlap, dc.blsampleid, dc.datacollectionid as id, dc.startimagenumber, dc.filetemplate, dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, s.visit_number, xrc.status as xrcstatus
                FROM datacollection dc 
                LEFT OUTER JOIN gridinfo gr ON gr.datacollectiongroupid = dc.datacollectiongroupid
                LEFT OUTER JOIN xraycentringresult xrc ON xrc.gridinfoid = gr.gridinfoid
                INNER JOIN blsession s ON s.sessionid=dc.sessionid 
                INNER JOIN proposal p ON p.proposalid=s.proposalid
                WHERE $where", $ids);
            
            $dcs = array();
            foreach ($dct as $d) $dcs[$d['ID']] = $d;
            
            foreach ($dcs as $dc) {
                $dc['VIS'] = $this->arg('prop').'-'.$dc['VISIT_NUMBER'];
                $dc['DIR'] = $this->ads($dc['DIR']);

                $this->profile('filestart');
                if ($dc['OVERLAP'] == 0) {
                    $aps = $aps2;
                } else {
                    $aps = $aps1;
                }
                $apr = array();
                foreach ($aps as $name => $ap) {
                    # 0: didnt run, 1: running, 2: success, 3: failed
                    $val = 0;

                    foreach (array('/processed', '/tmp') as $loc) {
                        $root = preg_replace('/'.$dc['VIS'].'/', $dc['VIS'].$loc, $dc['DIR'], 1).$dc['IMP'].'_'.$dc['RUN'].'_'.'/';
                        if (file_exists($root.$ap[0])) {
                            $val = 1;
                            $logs = glob($root.$ap[0].'*'.$ap[1]);
                             
                            if (sizeof($logs)) $log = $logs[0];
                            else $log = '';
                            if (is_readable($log) && filesize($log) > 0) {
                                $val = 3;
                                exec('grep -q "'.$ap[2].'" '.$log, $out,$ret);
                                if ($ret == 0) $val = 2;
                                if (sizeof($ap) > 3) {
                                    $val = 1;
                                    exec('grep -q -i "'.$ap[3].'" '.$log, $out,$ret);
                                    if ($ret == 0) {
                                        $val = 2;
                                    } else {
                                        exec('grep -q "'.$ap[2].'" '.$log, $out,$ret);
                                        if ($ret == 0) $val = 3;
                                    }
                                }
                            }
                            break;
                        } //else $val = 3;
                    }
                    
                    $apr[$name] = $val;
                    
                }

                $apr['XrayCentring'] = $dc['XRCSTATUS'] === null ? 0 
                    : ($dc['XRCSTATUS'] === 'pending' ? 1 
                        : ($dc['XRCSTATUS'] === 'success' ? 2 : 3));
            
                $this->profile('fileend');
                
                array_push($out, array($dc['ID'], $apr));
            }
        
            $this->profile('end');
            $this->_output($out);
        }


        # ------------------------------------------------------------------------
        # AutoProcProgram Messages
        function _ap_message_status() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            $where = 'WHERE p.proposalid=:1';
            $args = array($this->proposalid);

            $wids = array();
            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    foreach ($this->arg('ids') as $i) {
                        array_push($wids,'dc.datacollectionid=:'.(sizeof($args)+1));
                        array_push($args,$i);
                    }
                }
            }

            if (!sizeof($wids)) {
                $this->_output(array());
                return;
            }
                                
            $where .= ' AND ('.implode(' OR ', $wids).')';

            $rows = $this->db->pq("SELECT app.autoprocprogramid, dc.datacollectionid as id, SUM(IF(appm.severity = 'ERROR', 1, 0)) as errors, SUM(IF(appm.severity = 'WARNING', 1, 0)) as warnings, SUM(IF(appm.severity = 'INFO', 1, 0)) as infos
                FROM autoprocprogrammessage appm
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                INNER JOIN datacollection dc ON (dc.datacollectionid = api.datacollectionid OR app.datacollectionid = dc.datacollectionid)
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                $where
                GROUP BY dc.datacollectionid", $args);

            $this->_output($rows);
        }
        

        function _ap_message() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('id') && !$this->has_arg('AUTOPROCPROGRAMMESSAGEID')) $this->_error('No datacollection or message specified');

            $where = 'WHERE p.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('AUTOPROCPROGRAMMESSAGEID')) {
                $where .= ' AND appm.autoprocprogrammessageid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMMESSAGEID'));
            }

            if ($this->has_arg('id')) {
                $where .= ' AND dc.datacollectionid=:2';
                array_push($args, $this->arg('id'));
            }

            $rows = $this->db->pq("SELECT app.processingprograms, appm.autoprocprogrammessageid, appm.recordtimestamp, appm.severity, appm.message, appm.description, api.autoprocintegrationid
                FROM autoprocprogrammessage appm
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = appm.autoprocprogramid
                LEFT OUTER JOIN autoprocintegration api ON api.autoprocprogramid = app.autoprocprogramid
                INNER JOIN datacollection dc ON (dc.datacollectionid = api.datacollectionid OR app.datacollectionid = dc.datacollectionid)
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                $where", $args);

            if ($this->has_arg('AUTOPROCPROGRAMMESSAGEID')) {
                if (sizeof($rows)) {
                    $this->_output($rows[0]);
                } else $this->_error('No such auto processing message');
            } else $this->_output($rows);
        }
        
        
        # ------------------------------------------------------------------------
        # Edge Scan Data
        function _edge($id) {
            session_write_close();
            
            $info = $this->db->pq('SELECT jpegchoochfilefullpath as pth FROM energyscan WHERE energyscanid=:1', array($id));
            if (sizeof($info) == 0) {
                $this->_error('No data for that collection id');
                return;
            }
            
            $this->db->close();
            
            $ch = str_replace('.png', '', $info[0]['PTH']);
            
            $data = array(array(), array(), array());
            if (file_exists($ch)) {
                $dat = explode("\n",file_get_contents($ch));
                
                foreach ($dat as $i => $d) {
                    if ($d) {
                        list($x, $y) = explode(' ', $d);
                        array_push($data[0], array(floatval($x), intval($y)));
                    }
                }
                
                $dat = explode("\n",file_get_contents($ch.'.efs'));
                foreach ($dat as $i => $d) {
                    if ($d) {
                        list($x, $y, $y2) = preg_split('/\s+/', trim($d));
                        array_push($data[1], array(floatval($x), intval($y)));
                        array_push($data[2], array(floatval($x), intval($y2)));
                    }
                }
            }
            
            $this->_output($data);
        }
        
        
        # ------------------------------------------------------------------------
        # MCA Scan Data
        function _mca($id) {
            session_write_close();
            
            $info = $this->db->pq('SELECT filename as dir,energy,scanfilefullpath as dat 
                FROM xfefluorescencespectrum 
                WHERE xfefluorescencespectrumid=:1', array($id));
            if (sizeof($info) == 0) {
                $this->_error('No data for that spectrum id');
                return;
            }
            
            $info = $info[0];
            $this->db->close();
            
            $data = array(array(),array());
            if (file_exists($info['DAT'])) {
                $dat = explode("\n",file_get_contents($info['DAT']));

                foreach ($dat as $i => $d) {
                    if ($i >2 && $d) {
                        list($e, $v) = preg_split('/\s+/', trim($d));
                        if ($i % 2 == 1) {
                            if (floatval($e) <= $info['ENERGY']) {
                                if (floatval($e) > ($info['ENERGY'] - 1100)) array_push($data[1], array(floatval($e), floatval($v)));
                                else array_push($data[0], array(floatval($e), floatval($v)));
                            }
                        }
                    }
                }
                
            }
            
            
            # pymca
            $results = str_replace('.mca', '.results.dat', preg_replace('/(data\/\d\d\d\d\/\w\w\d+-\d+)/', '\1/processed/pymca', $info['DIR']));
            
            $el_to_en = json_decode(file_get_contents('tables/energies.json'), true);
            $elements = array();
            $el_no_match = array();
            $max_counts = 0;
            
            if (file_exists($results)) {
                $dat = explode("\n",file_get_contents($results));
                foreach ($dat as $i => $d) {
                    if ($i < 5) {
                        $l = explode(' ', $d);
                        if ($i == 0) $max_counts = floatval($l[1]);
                        if (array_key_exists($l[0], $el_to_en)) {
                            $els = $el_to_en[$l[0]];
                            if (($els[sizeof($els)-1]*1000) < ($info['ENERGY'] - 1000))
                                $elements[$l[0]] = array(array_map('floatval', $els), floatval($l[1]), floatval($l[2]));
                        } else array_push($el_no_match, $l[0]);
                    }
                }
            }
            array_push($data, $elements);
            array_push($data, $el_no_match);
            array_push($data, $max_counts);
            
            $max = 0;
            foreach ($data[0] as $d) {
                if ($d[1] > $max) $max = $d[1];
            }
            
            array_push($data, $max);
            
            $this->_output($data);
        }
        
        
        # ------------------------------------------------------------------------        
        # Strategies for a data collection
        function _dc_strategies($id) {
            global $strat_align;

            $rows = $this->db->pq("SELECT s.programversion, st.rankingresolution as rankres, ssw.wedgenumber, sssw.subwedgenumber, ssw.chi, ssw.kappa, ssw.phi, dc.datacollectionid as dcid, s.comments, dc.transmission as dctrn, dc.wavelength as lam, dc.imagedirectory imd, dc.imageprefix as imp, dc.comments as dcc, dc.blsampleid as sid, sl.spacegroup as sg, sl.unitcell_a as a, sl.unitcell_b as b, sl.unitcell_c as c, sl.unitcell_alpha as al, sl.unitcell_beta as be, sl.unitcell_gamma as ga, CONCAT(CONCAT(s.shortcomments, ' Wedge'), IFNULL(ssw.wedgenumber, '')) as com, sssw.axisstart as st, sssw.exposuretime as time, sssw.transmission as tran, sssw.oscillationrange as oscran, sssw.resolution as res, sssw.numberofimages as nimg, det.numberofpixelsx, det.detectorpixelsizehorizontal
                FROM screeningstrategy st 
                INNER JOIN screeningoutput so on st.screeningoutputid = so.screeningoutputid 
                INNER JOIN screening s on so.screeningid = s.screeningid 
                INNER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid 
                LEFT JOIN screeningstrategysubwedge sssw ON sssw.screeningstrategywedgeid = ssw.screeningstrategywedgeid 
                LEFT JOIN screeningoutputlattice sl ON sl.screeningoutputid = st.screeningoutputid 
                INNER JOIN datacollection dc on s.datacollectionid = dc.datacollectionid
                LEFT OUTER JOIN detector det ON dc.detectorid = det.detectorid
                WHERE s.datacollectionid = :1 
                ORDER BY s.shortcomments, ssw.wedgenumber", array($id));
        

            $output = array();
            foreach ($rows as $r) {
                if (!array_key_exists($r['PROGRAMVERSION'], $output)) $output[$r['PROGRAMVERSION']] = array('CELL' => array(), 'STRATS' => array());
            }

            $nf = array('A', 'B', 'C', 'AL', 'BE', 'GA');
            foreach ($rows as &$r) {
                $is_align = false;
                foreach ($strat_align as $sa) {
                    if (!$is_align) $is_align = strpos($r['PROGRAMVERSION'], $sa) !== false;
                }

                if ($is_align) {
                    array_push($output[$r['PROGRAMVERSION']]['STRATS'], $r);
                } else {
                
                    $t = $r['PROGRAMVERSION'];
                    
                    foreach ($r as $k => &$v) {
                        if (in_array($k, $nf)) {
                            $v = number_format(floatval($v), 2);
                            $output[$t]['CELL'][$k] = $v;
                            unset($r[$k]);
                        }

                        if ($k == 'TRAN') $v = number_format($v, 1);
                        if ($k == 'TIME') $v = number_format($v, 3);
                        if ($k == 'OSCRAN') $v = number_format($v, 2);
                        if ($k == 'RES') $v = number_format($v, 2);
                        if ($k == 'RANKRES') $v = number_format($v, 2);
                    }
                    
                    $output[$t]['CELL']['SG'] = $r['SG'];
                    unset($r['SG']);
                    
                    $r['COM'] = str_replace('EDNA', '', $r['COM']);
                    $r['COM'] = str_replace('Mosflm ', '', $r['COM']);
                    
                    $r['VPATH'] = join('/', array_slice(explode('/', $r['IMD']),0,6));
                    list(,,$r['BL']) = explode('/', $r['IMD']);

                    # we dont actually use this in the display view maybe Deprecate?
                    # detector diameter in mm
                    if ($r['DETECTORPIXELSIZEHORIZONTAL'] && $r['NUMBEROFPIXELSX']) {
                        $diam = $r['DETECTORPIXELSIZEHORIZONTAL']*$r['NUMBEROFPIXELSX']*1000;
                    } else {
                        // drop back to pilatus 6m diameter
                        $diam = 415;
                    }

                    $r['DIST'] = $this->_r_to_dist($diam, $r['LAM'], $r['RES']);
                    $r['ATRAN'] = round($r['TRAN']/100.0*$r['DCTRN'],1);
                    list($r['NTRAN'], $r['NEXP']) = $this->_norm_et($r['ATRAN'], $r['TIME']);
                    $r['AP'] = $this->_get_ap($r['DCC']);
                    
                    array_push($output[$t]['STRATS'], $r);
                }
            }
                
            $this->_output(array(sizeof($rows), $output));
        }
        
        # ------------------------------------------------------------------------        
        # Normalise transmission fo 25hz data collection
        function _norm_et($t, $e) {
            if ($t < 100 && $e > 0.04) {
                $f = $e / 0.04;
                $maxe = 0.04;
                $maxt = ($e / 0.04) * $t;
                
                if ($maxt > 100) {
                    $maxe *= $maxt/100;
                    $maxt = 100;
                }
                return array(number_format($maxt,1), number_format($maxe,3));
            } else {
                return array($t, $e);
            }
        
        }
        
        # ------------------------------------------------------------------------        
        # Convert resolution to detector distance
        function _r_to_dist($diam, $lambda, $r) {
            if ($r == 0) return 0;

            $b=$lambda/(2*$r);
            $d=2*asin($b);
            $f=2*tan($d);
            
            return number_format($diam/$f, 2);
        }
        
        # ------------------------------------------------------------------------        
        # Work out which aperture is selected
        function _get_ap($com) {
            $aps = array('Aperture: Large'=>'LARGE_APERTURE',
                         'Aperture: Medium'=>'MEDIUM_APERTURE',
                         'Aperture: Small'=>'SMALL_APERTURE',
                         'Aperture: 10'=>'In_10',
                         'Aperture: 20'=>'In_20',
                         'Aperture: 30'=>'In_30',
                         'Aperture: 50'=>'In_50',
                         'Aperture: 70'=>'In_70');
            
            $app = '';
            foreach ($aps as $k => $v) {
                if (strpos($com, $k) !== False) $app = $v;
            }
            
            return $app;
        }
        
        
        # ------------------------------------------------------------------------
        # Auto processing for a data collection
        function _dc_auto_processing($id) {
            $rows = $this->db->pq('SELECT apss.cchalf, apss.ccanomalous, apss.anomalous, dc.xbeam, dc.ybeam, api.refinedxbeam, api.refinedybeam, app.autoprocprogramid,app.processingprograms as type, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.scalingstatisticstype as shell, apss.rmeasalliplusiminus as rmeas, apss.rmerge, apss.completeness, apss.anomalouscompleteness as anomcompleteness, apss.anomalousmultiplicity as anommultiplicity, apss.multiplicity, apss.meanioversigi as isigi, ap.spacegroup as sg, ap.refinedcell_a as cell_a, ap.refinedcell_b as cell_b, ap.refinedcell_c as cell_c, ap.refinedcell_alpha as cell_al, ap.refinedcell_beta as cell_be, ap.refinedcell_gamma as cell_ga, 
                    (SELECT COUNT(api1.autoprocintegrationid) FROM autoprocintegration api1 WHERE api1.autoprocprogramid =  app.autoprocprogramid) as nswps, app.processingstatus, app.processingmessage
                FROM autoprocintegration api 
                LEFT OUTER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                LEFT OUTER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                LEFT OUTER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN datacollection dc ON api.datacollectionid = dc.datacollectionid
                WHERE api.datacollectionid = :1 AND app.processingstatus IS NOT NULL
                ORDER BY apss.scalingstatisticstype DESC', array($id));
            

            $msg_tmp = $this->db->pq("SELECT api.autoprocprogramid, appm.recordtimestamp, appm.severity, appm.message, appm.description
                FROM autoprocprogrammessage appm
                INNER JOIN autoprocintegration api ON api.autoprocprogramid = appm.autoprocprogramid
                WHERE api.datacollectionid=:1", array($id));

            $messages = array();
            foreach ($msg_tmp as $m) {
                if (!array_key_exists($m['AUTOPROCPROGRAMID'], $messages)) $messages[$m['AUTOPROCPROGRAMID']] = array();
                array_push($messages[$m['AUTOPROCPROGRAMID']], $m);
            }

            $dts = array('cell_a', 'cell_b', 'cell_c', 'cell_al', 'cell_be', 'cell_ga');
            $dts2 = array('rlow', 'rhigh');
            
            $output = array();
            foreach ($rows as &$r) {
                if (!array_key_exists($r['AUTOPROCPROGRAMID'], $output)) $output[$r['AUTOPROCPROGRAMID']] = array('BEAM' => array(), 'SHELLS' => array(), 'CELL' => array());
                
                if ($r['PROCESSINGSTATUS'] == '1') {
                    $shell = array();
                    foreach ($r as $k => &$v) {
                        if ($k == 'TYPE') {
                            if ($r['NSWPS'] > 1) {
                                $v = $r['NSWPS'].'xMulti'.$v;
                            }
                        }

                        if ($k == 'ISIGI') $v = number_format($v, 1);
                        if ($k == 'RMERGE') $v = number_format($v, 3);
                        if ($k == 'RMEAS') $v = number_format($v, 3);
                        if ($k == 'COMPLETENESS') $v = number_format($v, 1);
                        if ($k == 'MULTIPLICITY') $v = number_format($v, 1);
                        if ($k == 'ANOMCOMPLETENESS') $v = number_format($v, 1);
                        if ($k == 'ANOMMULTIPLICITY') $v = number_format($v, 1);
                        if ($k == 'CCHALF') $v = number_format($v, 1);
                        if ($k == 'CCANOMALOUS') $v = number_format($v, 1);

                        $beam = array('XBEAM', 'YBEAM', 'REFINEDXBEAM', 'REFINEDYBEAM');
                        if (in_array($k, $beam)) $v = number_format($v, 2);
                        
                        if ($k == 'AUTOPROCPROGRAMID' || $k == 'SHELL') {
                            continue;
                            
                        } else if ($k == 'SG') {
                            $output[$r['AUTOPROCPROGRAMID']]['SG'] = $v;
                        
                        } else if (in_array(strtolower($k), $dts2)) {
                            $shell[$k] = number_format($v, 2);
                        
                        } else if (in_array(strtolower($k), $dts)) {
                            $v = number_format($v, 2);
                            $output[$r['AUTOPROCPROGRAMID']]['CELL'][$k] = $v;
                            
                        } else if (in_array($k, $beam)) {
                            $output[$r['AUTOPROCPROGRAMID']]['BEAM'][$k] = $v;

                        } else {
                            $shell[$k] = $v;
                        }
                    }
                    $output[$r['AUTOPROCPROGRAMID']]['SHELLS'][$r['SHELL']] = $shell;
                }

                $output[$r['AUTOPROCPROGRAMID']]['TYPE'] = $r['TYPE'];
                $output[$r['AUTOPROCPROGRAMID']]['AID'] = $r['AUTOPROCPROGRAMID'];
                $output[$r['AUTOPROCPROGRAMID']]['PROCESSINGSTATUS'] = $r['PROCESSINGSTATUS'];
                $output[$r['AUTOPROCPROGRAMID']]['PROCESSINGMESSAGE'] = $r['PROCESSINGMESSAGE'];
                $output[$r['AUTOPROCPROGRAMID']]['MESSAGES'] = array_key_exists($r['AUTOPROCPROGRAMID'], $messages) ? $messages[$r['AUTOPROCPROGRAMID']] : array();
            }
                  
            #$this->_output($rows);
            $this->_output(array(sizeof($output), $output));
        }
        
        
        # ------------------------------------------------------------------------
        # Results from downstream processing
        function _dc_downstream($id) {
            $ap = array('Fast EP' => array('fast_ep', array('sad.mtz', 'sad_fa.pdb')),
                        'MrBUMP' => array('auto_mrbump', array('PostMRRefine.pdb', 'PostMRRefine.mtz')),
                        'Dimple' => array('fast_dp', array('dimple/final.pdb', 'dimple/final.mtz')),
                        'Big EP' => array('shelxc', array('', ''))
                        );
            
            list($info) = $this->db->pq("SELECT dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis
             FROM datacollection dc
             INNER JOIN blsession s ON s.sessionid=dc.sessionid 
             INNER JOIN proposal p ON (p.proposalid = s.proposalid) 
             WHERE dc.datacollectionid=:1", array($id));
            
            $this->db->close();
            $info['DIR'] = $this->ads($info['DIR']);
            $data = array();
            
            foreach($ap as $n => $p) {
                $dat = array();
                
                #$root = str_replace($info['VIS'], $info['VIS'] . '/processed', $info['DIR']).$info['IMP'].'_'.$info['RUN'].'_'.'/'.$p[0].'/';
                $root = preg_replace('/'.$info['VIS'].'/', $info['VIS'].'/processed', $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_'.'/'.$p[0].'/';
                
                $file = $root . $p[1][0];
                if (file_exists($file)) {
                    $dat['TYPE'] = $n;
                    
                    # Fast EP
                    if ($n == 'Fast EP') {
                        # parse pdb file
                        
                        $ats = array();
                        $p1 = array();
                        $p2 = array();
                        
                        $pdb = file_get_contents($root . $p[1][1]);
                        foreach (explode("\n", $pdb) as $l) {
                            if (strpos($l,'HETATM') !== False) {
                                $parts = preg_split('/\s+/', $l);
                                array_push($ats, array($parts[1], $parts[5], $parts[6], $parts[7], $parts[8]));
                            }
                            
                        }
                        
                        $dat['ATOMS'] = array_slice($ats, 0, 5);
                        
                        if (file_exists($root.'/sad.lst')) {
                            $lst = file_get_contents($root.'/sad.lst');
                            $graph_vals = 0;
                            $gvals = array();
                            foreach (explode("\n", $lst) as $l) {
                                if (strpos($l, 'Estimated mean FOM and mapCC as a function of resolution') !== False) {
                                    $graph_vals = 1;
                                }
                                
                                if ($graph_vals && $graph_vals < 5) {
                                    array_push($gvals, $l);
                                    $graph_vals++;
                                }
                                
                                if (preg_match('/ Estimated mean FOM = (\d+.\d+)\s+Pseudo-free CC = (\d+.\d+)/', $l, $mat)) {
                                    $dat['FOM'] = floatval($mat[1]);
                                    $dat['CC'] = floatval($mat[2]);
                                }
                            }
                            
                            
                            if (sizeof($gvals) > 0) {
                                $x = array_map('floatval', array_slice(explode(' - ', $gvals[1]), 1));
                                $y = array_map('floatval', array_slice(preg_split('/\s+/', $gvals[2]), 2));
                                $y2 = array_map('floatval', array_slice(preg_split('/\s+/', $gvals[3]), 2));

                                foreach ($x as $i => $v) {
                                    array_push($p1, array(1.0/pow($v, 2), $y[$i]));
                                    array_push($p2, array(1.0/pow($v, 2), $y2[$i]));
                                }
                            }
                            
                        }
                        $dat['PLOTS']['FOM'] = $p1;
                        $dat['PLOTS']['CC'] = $p2;
                        array_push($data, $dat);
                        
                    # Dimple
                    } else if ($n == 'Dimple') {
                        //$pth = glob($root.'/EDApplication_*.log');
                        $lfs = glob($root . '/dimple/*refmac5_restr.log');
                        
                        if (sizeof($lfs)) $lf = $lfs[0];
                        else $lf = '';
                        
                        //if (sizeof($pth) > 0) {
                        if (file_exists($lf)) {
                            list($plts, $stats) = $this->_parse_ccp4_log(file_get_contents($lf));
                            
                            $peaks = glob($root . '/dimple/*find-blobs.log');
                            $pklist = array();
                            if (sizeof($peaks)) {
                                $pk = $peaks[0];
                                if (file_exists($pk)) {
                                    $pks = explode("\n", file_get_contents($pk));
                                    foreach ($pks as $p) {
                                        if (strpos($p, '#') === 0) {
                                            array_push($pklist, array(floatval(substr($p, 40,7)), floatval(substr($p, 48,7)), floatval(substr($p, 56,7)), floatval(substr($p, 29,5))));
                                        }
                                    }
                                }
                                
                            }
                            
                            if (sizeof($stats) > 0) array_unshift($stats[0], 'Parameter');
                            $dat['STATS'] = $stats;
                            $dat['PLOTS'] = $plts;
                            $dat['PKLIST'] = $pklist;
                            
                            $blobs = glob($root .'/dimple/blob*v*.png');
                            $dat['BLOBS'] = sizeof($blobs)/3;
                            
                            if (sizeof($stats)) array_push($data, $dat);
                        }


                    # MrBUMP
                    } else if ($n == 'MrBUMP') {
                        $lf = $root.'/MRBUMP.log';
                        if (file_exists($lf)) {
                            list($plots, $stats) = $this->_parse_ccp4_log(file_get_contents($lf));
                            $dat['PLOTS'] = $plots;
                            $dat['STATS'] = $stats;
                        }

                        array_push($data, $dat);

                    # BigEP
                    } else if ($n == 'Big EP') {
                        $this->_bigep_downstream($root, $data, $info);
                    }
                   
                }
                
            }
            
            $this->_output($data);
        }


        function _bigep_downstream($root, &$data, $info) {
            $sg_patterns = array('XDS' => 'xia2/3dii-run*',
                                 'DIALS' => 'xia2/dials-run*');
            
            foreach ($sg_patterns as $name => $sgpt) {
                $proc_paths = glob($root.$sgpt);
                if (sizeof($proc_paths)) {
                    foreach ($proc_paths as $i => $pth) {
                        
                        $dat = array('TYPE' => 'Big EP/'.$name.":".$i);
                        
                        # Read SHELXC logs
                        $graph_patterns = array('CHISQ' => array('Chi-sq', 2),
                                                'ISIGI' => array('<I/sig>', 2),
                                                'DSIG' => array('<d"/sig>', 2),
                                                'CC12' => array('CC(1/2)', 2),
                                                'RESO' => array('Resl.', 3));
                        $shx_logs = glob($pth.'/*_shelxc.log');
                        if (sizeof($shx_logs)) {
                            $shx_log = $shx_logs[0];
                            if (file_exists($shx_log)) {
                                $lst = explode("\n", file_get_contents($shx_log));
                                $graphs = array();
                                foreach ($lst as $l) {
                                    foreach ($graph_patterns as $k => $gr) {
                                        if (strpos($l, $gr[0]) == 1) {
                                            $graphs[$k] = array_map('floatval', array_slice(preg_split('/\s+/', $l), $gr[1]));
                                        }
                                    }
                                }
                            }
                            if ($graphs) {
                                $dat['SHELXC']['PLOTS'][$name] = array();
                            } else {
                                continue;
                            }
                            foreach (array_keys($graph_patterns) as $k) {
                                if ($k != 'RESO' and array_key_exists($k, $graphs)) {
                                    $dat['SHELXC']['PLOTS'][$name][$k] = array();
                                }
                            }
                            if (array_key_exists('RESO', $graphs)) {
                                foreach ($graphs['RESO'] as $i => $r) {
                                    foreach (array_keys($dat['SHELXC']['PLOTS'][$name]) as $k) {
                                        if (array_key_exists($i, $graphs[$k])) {
                                            array_push($dat['SHELXC']['PLOTS'][$name][$k], array(1.0/pow($r, 2), $graphs[$k][$i]));
                                        }
                                    }
                                }
                            }
                        }
                        # Read model building results
                        $bigep_patterns = array (
                                'AUTOSHARP' => '/big_ep*/*/autoSHARP/',
                                'AUTOBUILD' => '/big_ep*/*/AutoSol/',
                                'CRANK2' => '/big_ep*/*/crank2/' 
                        );
                        preg_match('/\/xia2\/(3dii|dials)\-run\w*/', $pth, $sgmatch);
                        $dtpt = 'big_ep/*'.$sgmatch[0];
                        foreach ( array ('/processed',
                                        '/tmp') as $loc ) {
                            $settings_root = preg_replace ( '/' . $info ['VIS'] . '/', $info ['VIS'] . $loc, $info ['DIR'], 1 ) . $info ['IMP'] . '_' . $info ['RUN'] . '_' . '/' . $dtpt;
                            $bigep_settings_glob = glob($settings_root.'/big_ep*/*/big_ep_settings.json');
                            if (sizeof($bigep_settings_glob)) {
                                preg_match('/\/big_ep\/(?P<tag>\w+)\/xia2\/(3dii|dials)\-run\w*/', $bigep_settings_glob[0], $tagmatch);
                                $dat['TAG'] = $tagmatch['tag'];
                                $bigep_settings_json = $bigep_settings_glob[0];
                                $json_str = file_get_contents($bigep_settings_json);
                                $dat['SETTINGS'][$name] = json_decode($json_str, true);
                                break;
                            }
                        }
                        foreach ( $bigep_patterns as $ppl => $pplpt ) {
                            foreach ( array ('/processed', '/tmp' ) as $loc ) {
                                $bigep_root = preg_replace ( '/' . $info ['VIS'] . '/', $info ['VIS'] . $loc, $info ['DIR'], 1 ) . $info ['IMP'] . '_' . $info ['RUN'] . '_' . '/' . $dtpt . $pplpt;
                                $bigep_mdl_glob = glob($bigep_root.'big_ep_model_ispyb.json');
                                if (sizeof($bigep_mdl_glob)) {
                                    $bigep_mdl_json = $bigep_mdl_glob[0];
                                    $json_str = file_get_contents($bigep_mdl_json);
                                    $json_data = json_decode($json_str, true);
                                    foreach ( array('RESID' => array('total', 0),
                                                    'FRAGM' => array('fragments', 0),
                                                   'MAXLEN' => array('max', 0),
                                                    'MAPCC' => array('mapcc', 2),
                                                 'MAPRESOL' => array('mapcc_dmin', 2)) as $k => $v) {
                                        if (array_key_exists($v[0], $json_data)) {
                                            $dat['PROC'][$name][$ppl][$k] = number_format($json_data[$v[0]], $v[1]);
                                        } else {
                                            $dat['PROC'][$name][$ppl][$k] = null;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        
                        if (array_key_exists('PROC',$dat) && array_intersect(array_keys($dat['PROC']), array_keys($sg_patterns))) {
                            array_push( $data, $dat );
                        }
                    }
                }
            }
        }


        function _parse_ccp4_log($log) {
            $refmac = 0;
            $stats = array();
            $plot = 0;
            $plots = array();
            //print $log;
            foreach (explode("\n", $log) as $l) {
                if ($plot == 1) {
                    $plot++;
                    continue;
                }
                
                if (strpos(trim($l), '$TEXT:Result: $$ Final results $$') !== False) {
                    $refmac = 1;
                    $stats = array();
                    continue;
                }
                if (strpos(trim($l), '$$') !== False) $refmac = 0;
                
                if ($refmac) {
                    array_push($stats, preg_split('/\s\s+/', trim($l)));
                }
                
                if (preg_match('/Ncyc\s+Rfact\s+Rfree/', trim($l))) {
                    $plot = 1;
                    $plots = array();
                    continue;
                }
                
                if (strpos(trim($l), '$$') !== False) $plot = 0;
                    
                if ($plot) {
                    array_push($plots, preg_split('/\s+/', trim($l)));
                }
            }

            $plts = array('RVC'=>array(), 'FVC'=>array(), 'RVR'=>array());
            foreach ($plots as $p) {
                $p = array_map('floatval', $p);
                array_push($plts['RVC'], array($p[0], $p[1]));
                array_push($plts['FVC'], array($p[0], $p[2]));
            }

            return array($plts, $stats);
        }
        
        
        # ------------------------------------------------------------------------
        # Image quality indicators from distl
        function _image_qi($id) {
            session_write_close();
            $iqs = array(array(), array(), array(), array(), array());

            #$this->db->set_debug(True);

            $where = $id;
            $args = array();
            /*
            $dcg = $this->db->pq("SELECT datacollectiongroupid as dcg FROM datacollection WHERE datacollectionid=:1", array($id));
            if (!sizeof($dcg)) $this->error('No such data collection');

            $dcids = $this->db->pq("SELECT datacollectionid as id FROM datacollection WHERE datacollectiongroupid=:1", array($dcg[0]['DCG']));

            $where = array();
            $args = array();
            foreach ($dcids as $i => $id) {
                //array_push($where, ':'.($i+1));
                array_push($where, $id['ID']);
                //array_push($args, $id['ID']);
            }
            $where = implode($where, ', ');
            */

            /*$tot = $this->db->pq("SELECT count(im.imagenumber) as tot 
                FROM image im 
                INNER JOIN imagequalityindicators imq ON imq.imageid = im.imageid AND (im.datacollectionid IN ($where))
                ORDER BY imagenumber", $args);

            $int = intval($tot[0]['TOT'] / 250);
            array_push($args, $int);*/

            #im.datacollectionid=:1 
            $imqs = $this->db->pq("SELECT imq.imagenumber as nim, imq.method2res as res, imq.spottotal as s, imq.totalintegratedsignal, imq.goodbraggcandidates as b, imq.dozor_score as d
                FROM imagequalityindicators imq 
            	WHERE imq.datacollectionid IN ($where)
                ORDER BY imq.imagenumber", $args);

            foreach ($imqs as $imq) {
                array_push($iqs[0], array(intval($imq['NIM']), intval($imq['S'])));
                array_push($iqs[1], array(intval($imq['NIM']), intval($imq['B'])));
                array_push($iqs[2], array(intval($imq['NIM']), floatval($imq['RES'])));
                array_push($iqs[3], array(intval($imq['NIM']), floatval($imq['TOTALINTEGRATEDSIGNAL'])));
                array_push($iqs[4], array(intval($imq['NIM']), floatval($imq['D'])));
            }

            $this->_output($iqs);
        }

        # ------------------------------------------------------------------------
        # Grid Scan Info
        function _grid_info() {
            $info = $this->db->pq("SELECT dc.datacollectiongroupid, dc.datacollectionid, dc.axisstart, p.posx as x, p.posy as y, p.posz as z, g.dx_mm, g.dy_mm, g.steps_x, g.steps_y, g.pixelspermicronx, g.pixelspermicrony, g.snapshot_offsetxpixel, g.snapshot_offsetypixel, g.orientation, g.snaked
                FROM gridinfo g
                INNER JOIN datacollection dc ON dc.datacollectiongroupid = g.datacollectiongroupid
                LEFT OUTER JOIN position p ON dc.positionid = p.positionid
                WHERE dc.datacollectionid = :1 ", array($this->arg('id')));

            if (!sizeof($info)) $this->_output(array());
            else {
                foreach ($info[0] as $k => &$v) {
                    if ($k == 'ORIENTATION') continue;
                    $v = floatval($v);
                }    
                $this->_output($info[0]);
            }
        }


        function _grid_map() {
            if (!$this->has_arg('id')) $this->_error('No datacollection id specified');

            $map = $this->db->pq("SELECT positionx, positiony, imagenumber, outputfileid
                FROM gridimagemap
                WHERE datacollectionid=:1", array($this->arg('id')));

            $this->_output($map);
        }


        # XRC
        function _grid_xrc() {
            $info = $this->db->pq("SELECT dc.datacollectiongroupid, dc.datacollectionid, xrc.method, xrc.x, xrc.y
                FROM gridinfo g
                INNER JOIN datacollection dc ON dc.datacollectiongroupid = g.datacollectiongroupid
                INNER JOIN xraycentringresult xrc ON xrc.gridinfoid = g.gridinfoid
                WHERE dc.datacollectionid = :1 ", array($this->arg('id')));

            if (!sizeof($info)) $this->_output(array());
            else {
                foreach ($info[0] as $k => &$v) {
                    if ($k == 'METHOD') continue;
                    $v = floatval($v);
                }    
                $this->_output($info[0]);
            }
        }

        # ------------------------------------------------------------------------
        # Fluorescence Map Info
        function _fluo_map() {
            $info = $this->db->pq("SELECT xfm.imagenumber, xfm.counts, xfroi.element, xfroi.r, xfroi.g, xfroi.b
                FROM xrffluorescencemapping xfm
                INNER JOIN xrffluorescencemappingroi xfroi
                WHERE xfm.datacollectionid=:1", array($this->arg('id')));

            $this->_output($info);
        }

        
        # ------------------------------------------------------------------------
        # Update comment for a data collection
        function _set_comment() {
            if (!$this->has_arg('t')) $this->_error('No data type specified');
            if (!$this->arg('id')) $this->_error('No data collection id specified');
            
            $types = array('data' => array('datacollection', 'datacollectionid'),
                           'edge' => array('energyscan', 'energyscanid'),
                           'mca' => array('xfefluorescencespectrum', 'xfefluorescencespectrumid'),
                           );

            $types['grid'] = $types['data'];
            
            if (!array_key_exists($this->arg('t'), $types)) $this->_error('No such data type');
            $t = $types[$this->arg('t')];
            
            $com = $this->db->pq('SELECT comments from '.$t[0].' WHERE '.$t[1].'=:1', array($this->arg('id')));
            
            if (!sizeof($com)) $this->_error('No such data collection');
            
            foreach (array('COMMENTS') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE $t[0] set $f=:1 where $t[1]=:2", array($this->arg($f), $this->arg('id')));
                }
            }
        }
        
        
        # Plot R_d for fast_dp
        function _rd($aid, $id) {
            $info = $this->db->pq("SELECT appa.filename,appa.filepath,appa.filetype 
                FROM autoprocintegration api 
                INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                WHERE api.datacollectionid = :1 AND api.autoprocprogramid=:2 AND appa.filetype LIKE 'Log'", array($id, $aid));
            
            if (!sizeof($info)) $this->_error('The specified auto processing doesnt exist');
            else $info = $info[0];
            $this->db->close();
            
            $file = $info['FILEPATH'].'/xdsstat.log';

            $rows = array();
            if (file_exists($file)) {
                $log = file_get_contents($file);
                
                $start = 0;
                foreach (explode("\n", $log) as $l) {
                    if (strpos(trim($l), 'Framediff #refs R_d n-notfriedel Rd-notfriedel n-friedel Rd-friedel dummy $$') !== False) {
                        $start = 1;
                    }
                    
                    if ($start) $start++;
                    
                    if (strpos(trim($l), '$$') !== False && $start > 4) {
                        $start = 0;
                    }
                    
                    if ($start > 3) {
                        $start++;
                        if (trim($l)) {
                            $f = preg_split('/\s+/', trim($l));
                            array_push($rows, array(intval($f[0]), floatval($f[2])));
                        }
                    }
                    
                }
            }
            
            $this->_output($rows);
            
        }
        
        
        
        function _get_symmetry() {
            if (!($this->has_arg('a') && $this->has_arg('b') && $this->has_arg('c') && $this->has_arg('al') && $this->has_arg('be') && $this->has_arg('ga') && $this->has_arg('sg'))) $this->_error('Missing parameters');
            
            exec('./scripts/symtry.sh '.$this->arg('a').' '.$this->arg('b').' '.$this->arg('c').' '.$this->arg('al').' '.$this->arg('be').' '.$this->arg('ga').' '.$this->arg('sg'), $ret);
            
            $matrices = array();
            foreach ($ret as $l) {
                $parts = array_map('floatval', explode(' ', $l));
                array_push($matrices, array(array_slice($parts, 0, 4),
                                            array_slice($parts, 4, 4),
                                            array_slice($parts, 8, 4))
                           );
            }
            
            $this->_output($matrices);
        }




        function _get_comments() {
            $where = '1=1';
            $args = array();
            // $this->db->set_debug(True);

            if ($this->has_arg('dcid')) {
                $where .= ' AND dcc.datacollectioncommentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('dcid'));
            }

            if ($this->has_arg('id')) {
                $where .= ' AND dc.datacollectionid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('id'));
            }

            $tot = $this->db->pq("SELECT count(dcc.datacollectioncommentid) as tot
                FROM datacollectioncomment dcc
                INNER JOIN datacollection dc ON dc.datacollectionid = dcc.datacollectionid
                WHERE $where", $args);

            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            array_push($args, $start);
            array_push($args, $end);


            $comments = $this->db->paginate("SELECT dcc.datacollectioncommentid, dcc.datacollectionid, dcc.personid, dcc.comments, TO_CHAR(dcc.createtime, 'DD-MM-YYYY HH24:MI:SS') as createtime, TO_CHAR(dcc.modtime, 'DD-MM-YYYY HH24:MI:SS') as modtime, p.givenname, p.familyname
                    FROM datacollectioncomment dcc
                    INNER JOIN datacollection dc ON dc.datacollectionid = dcc.datacollectionid
                    INNER JOIN person p ON p.personid = dcc.personid
                    WHERE $where
                    ORDER BY dcc.createtime ASC", $args);


            if ($this->has_arg('dcid')) {
                if (sizeof($comments)) $this->_output($comments[0]);
                else $this->_error('No such comment');
            } else $this->_output(array('total' => $tot, 'data' => $comments));
        }


        function _add_comment() {
            if (!$this->has_arg('DATACOLLECTIONID')) $this->_error('No datacollection specified');
            if (!$this->has_arg('PERSONID')) $this->_error('No person specified');
            if (!$this->has_arg('COMMENTS')) $this->_error('No comment specified');

            $this->db->pq("INSERT INTO datacollectioncomment (datacollectioncommentid, datacollectionid, personid, comments, createtime) 
                VALUES (s_datacollectioncomment.nextval, :1, :2, :3, CURRENT_TIMESTAMP) RETURNING datacollectioncommentid INTO :id", 
                array($this->arg('DATACOLLECTIONID'), $this->arg('PERSONID'), $this->arg('COMMENTS')));

            $this->_output(array('DATACOLLECTIONCOMMENTID' => $this->db->id(), 
                'GIVENNAME' => $this->user->givenname, 
                'FAMILYNAME' => $this->user->familyname,
                'CREATETIME' => date('d-m-Y H:i:s')
            ));
        }




        # ------------------------------------------------------------------------
        # Dat Plot
        function _plot() {
            session_write_close();
            if (!$this->has_arg('id')) {
                $this->_error('No data collection id specified');
                return;
            }
            
            $info = $this->db->pq('SELECT ses.visit_number, dc.datfullpath, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir FROM datacollection dc INNER JOIN blsession ses ON dc.sessionid = ses.sessionid WHERE datacollectionid=:1', array($this->arg('id')));
            if (sizeof($info) == 0) {
                $this->_error('No data for that collection id');
                return;
            } else $info = $info[0];
            
            $info['VISIT'] = $this->arg('prop') .'-'.$info['VISIT_NUMBER'];
            
            $pth = $info['DATFULLPATH'] ? $info['DATFULLPATH'] : str_replace($info['VISIT'], $info['VISIT'].'/.ispyb', $this->ads($info['DIR']).$info['IMP'].'/'.$info['SCAN'].'.dat');
            
            $data = array();
            if (file_exists($pth) && is_readable(($pth))) {
                $dat = explode("\n",file_get_contents($pth));

                foreach ($dat as $i => $d) {
                    if ($d) {
                        list($x, $y) = preg_split('/\s+/', trim($d));
                        array_push($data, array(floatval($x), floatval($y)));
                    }
                }
            }
            
            $this->_output(array($data));
        }

    }

?>
