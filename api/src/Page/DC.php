<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\TemplateParser;

class DC extends Page
{
        

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
                              'PROCESSINGJOBID' => '\d+',

                              'debug' => '\d',

                              );
        

        public static $dispatch = array(array('(/sing:le)(/:id)', 'get', '_data_collections', array('le' => '\w+', 'id' => '\d+')),
                              array('/chi', 'post', '_chk_image'),
                              array('/imq/:id', 'get', '_image_qi'),
                              array('/grid/:id', 'get', '_grid_info'),
                              array('/grid/xrc/:id', 'get', '_grid_xrc'),
                              array('/grid/map', 'get', '_grid_map'),
                              array('/ed/:id', 'get', '_edge', array('id' => '\d+'), 'edge'),
                              array('/mca/:id', 'get', '_mca', array('id' => '\d+'), 'mca'),
                              array('/strat/:id', 'get', '_dc_strategies'),
                              array('/rd/aid/:aid/:id', 'get', '_rd'),
                              array('/single/t/:t/:id', 'patch', '_set_comment'),
                              array('/sym', 'get', '_get_symmetry'),
                              array('/xfm(/:id)', 'get', '_fluo_map'),

                              array('/comments(/:dcid)', 'get', '_get_comments'),
                              array('/comments', 'post', '_add_comment'),

                              array('/dat/:id', 'get', '_plot'),
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
                        LEFT OUTER JOIN processingjob pj ON dc.datacollectionid = pj.datacollectionid
                        LEFT OUTER JOIN autoprocprogram app ON (app.autoprocprogramid = api.autoprocprogramid OR dc.datacollectionid = pj.datacollectionid)
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
                
                $sess = array('dcg.sessionid=:1', 'es.sessionid=:2', 'r.blsessionid=:3', 'xrf.sessionid=:4');
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

            # Processing job
            } else if ($this->has_arg('PROCESSINGJOBID')) {
                $info = $this->db->pq('SELECT processingjobid 
                    FROM processingjob pj
                    INNER JOIN datacollection dc ON pj.datacollectionid = dc.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                    WHERE pj.processingjobid=:1 AND s.proposalid=:2', array($this->arg('PROCESSINGJOBID'), $this->proposalid));

                $where2 .= ' AND es.energyscanid < 0';
                $where3 .= ' AND r.robotactionid < 0';
                $where4 .= ' AND xrf.xfefluorescencespectrumid < 0';

                for ($i = 0; $i < 4; $i++) {
                    $sess[$i] = 'ses.proposalid=:'.($i+1);
                    array_push($args, $this->proposalid);
                }

                $where .= ' AND pjis.processingjobid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('PROCESSINGJOBID'));
                $extj[0] .= ' LEFT OUTER JOIN processingjobimagesweep pjis ON pjis.datacollectionid=dc.datacollectionid';

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
            if ($this->has_arg('dcg') || $this->has_arg('PROCESSINGJOBID')) {
                $count_field = 'dc.datacollectionid';
                $fields = "count(distinct dca.datacollectionfileattachmentid) as dcac,
                    count(distinct dcc.datacollectioncommentid) as dccc,
                    1 as dcc,
                    smp.name as sample,
                    smp.blsampleid,
                    ses.visit_number as vn,
                    dc.kappastart as kappa,
                    dc.phistart as phi,
                    dc.startimagenumber as si,
                    dcg.experimenttype as dct,
                    dc.datacollectiongroupid as dcg,
                    dc.runstatus,
                    dc.beamsizeatsamplex as bsx,
                    dc.beamsizeatsampley as bsy,
                    dc.overlap,
                    dc.flux,
                    1 as scon,
                    'a' as spos,
                    'a' as san,
                    'data' as type,
                    dc.imageprefix as imp,
                    dc.datacollectionnumber as run,
                    dc.filetemplate,
                    dc.datacollectionid as id,
                    dc.numberofimages as ni,
                    dc.imagedirectory as dir,
                    dc.resolution,
                    dc.exposuretime,
                    dc.axisstart,
                    dc.numberofimages as numimg,
                    TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st,
                    dc.transmission,
                    dc.axisrange,
                    dc.wavelength,
                    dc.comments,
                    1 as epk,
                    1 as ein,
                    dc.xtalsnapshotfullpath1 as x1,
                    dc.xtalsnapshotfullpath2 as x2,
                    dc.xtalsnapshotfullpath3 as x3,
                    dc.xtalsnapshotfullpath4 as x4,
                    dc.starttime as sta,
                    dc.detectordistance as det,
                    dc.xbeam,
                    dc.ybeam,
                    dc.chistart,
                    dc.omegastart,
                    dcg.scanparameters as scanparams,
                    dc.voltage,
                    dc.c2aperture,
                    dc.c2lens,
                    dc.objaperture,
                    dc.magnification,
                    dc.totalexposeddose as totaldose,
                    CAST(dc.totalabsorbeddose AS DECIMAL(5, 2)) as totalabsdose,
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
                    d.numberofpixelsy as detectornumberofpixelsy,
                    ses.archived,
                    IFNULL(dc.rotationaxis, 'Omega') as rotationaxis,
                    dc.detector2theta";
                $groupby = 'GROUP BY smp.name,
                    smp.blsampleid,
                    ses.visit_number,
                    dc.kappastart,
                    dc.phistart,
                    dc.startimagenumber,
                    dc.experimenttype,
                    dc.datacollectiongroupid,
                    dc.runstatus,
                    dc.beamsizeatsamplex,
                    dc.beamsizeatsampley,
                    dc.overlap,
                    dc.flux,
                    dc.imageprefix,
                    dc.datacollectionnumber,
                    dc.filetemplate,
                    dc.datacollectionid,
                    dc.numberofimages,
                    dc.imagedirectory,
                    dc.resolution,
                    dc.exposuretime,
                    dc.axisstart,
                    dc.numberofimages,
                    TO_CHAR(dc.starttime, \'DD-MM-YYYY HH24:MI:SS\'),
                    dc.transmission,
                    dc.axisrange,
                    dc.wavelength,
                    dc.comments,
                    dc.xtalsnapshotfullpath1,
                    dc.xtalsnapshotfullpath2,
                    dc.xtalsnapshotfullpath3,
                    dc.xtalsnapshotfullpath4,
                    dc.starttime,
                    dc.detectordistance,
                    dc.xbeam,
                    dc.ybeam,
                    dc.chistart
                ';
                // $this->db->set_debug(True);

                // will want to support these too at some point
                $where2 = ' AND es.energyscanid < 0';
                $where3 = ' AND r.robotactionid < 0';
                $where4 = ' AND xrf.xfefluorescencespectrumid < 0';

                if ($this->has_arg('dcg')) {
                    $where .= ' AND dc.datacollectiongroupid=:'.(sizeof($args)+1);
                    array_push($args, $this->arg('dcg'));
                }

            } else {
                $count_field = 'distinct dc.datacollectiongroupid';
                $fields = "count(distinct dca.datacollectionfileattachmentid) as dcac,
                    count(distinct dcc.datacollectioncommentid) as dccc,
                    count(distinct dc.datacollectionid) as dcc,
                    min(smp.name) as sample,
                    min(smp.blsampleid) as blsampleid,
                    min(ses.visit_number) as vn,
                    min(dc.kappastart) as kappa,
                    min(dc.phistart) as phi,
                    min(dc.startimagenumber) as si,
                    min(dcg.experimenttype) as dct,
                    dc.datacollectiongroupid as dcg,
                    min(dc.runstatus) as runstatus,
                    min(dc.beamsizeatsamplex) as bsx,
                    min(dc.beamsizeatsampley) as bsy,
                    min(dc.overlap) as overlap,
                    max(dc.flux) as flux,
                    1 as scon,
                    'a' as spos,
                    'a' as san,
                    'data' as type,
                    min(dc.imageprefix) as imp,
                    min(dc.datacollectionnumber) as run,
                    min(dc.filetemplate) as filetemplate,
                    min(dc.datacollectionid) as id,
                    min(dc.numberofimages) as ni,
                    min(dc.imagedirectory) as dir,
                    min(dc.resolution) as resolution,
                    min(dc.exposuretime) as exposuretime,
                    min(dc.axisstart) as axisstart,
                    min(dc.numberofimages) as numimg,
                    TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as st,
                    min(dc.transmission) as transmission,
                    min(dc.axisrange) as axisrange,
                    min(dc.wavelength) as wavelength,
                    min(dc.comments) as comments,
                    1 as epk,
                    1 as ein,
                    min(dc.xtalsnapshotfullpath1) as x1,
                    min(dc.xtalsnapshotfullpath2) as x2,
                    min(dc.xtalsnapshotfullpath3) as x3,
                    min(dc.xtalsnapshotfullpath4) as x4,
                    max(dc.starttime) as sta,
                    min(dc.detectordistance) as det,
                    min(dc.xbeam) as xbeam,
                    min(dc.ybeam) as ybeam,
                    min(dc.chistart) as chistart,
                    min(dc.omegastart) as omegastart,
                    dcg.scanparameters as scanparams,
                    max(dc.voltage) as voltage,
                    max(dc.c2aperture) as c2aperture,
                    max(dc.c2lens) as c2lens,
                    max(dc.objaperture) as objaperture,
                    max(dc.magnification) as magnification,
                    sum(dc.totalabsorbeddose) as totaldose,
                    CAST(dc.totalabsorbeddose AS DECIMAL(5, 2)) as totalabsdose,
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
                    max(d.numberofpixelsy) as detectornumberofpixelsy,
                    max(ses.archived) as archived,
                    IFNULL(max(dc.rotationaxis), 'Omega') as rotationaxis,
                    dc.detector2theta";
                $groupby = "GROUP BY dc.datacollectiongroupid";
            }


            $tot = $this->db->pq("SELECT sum(tot) as t FROM (SELECT count($count_field) as tot FROM datacollection dc
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
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


            $q = "SELECT $extcg $fields 
                FROM datacollection dc
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                LEFT OUTER JOIN blsample smp ON dc.blsampleid = smp.blsampleid
                LEFT OUTER JOIN datacollectioncomment dcc ON dc.datacollectionid = dcc.datacollectionid
                LEFT OUTER JOIN datacollectionfileattachment dca ON dc.datacollectionid = dca.datacollectionid
                LEFT OUTER JOIN detector d ON d.detectorid = dc.detectorid

                $extj[0]
                WHERE $sess[0] $where
                $groupby
                      
                UNION
                SELECT
                    $extc
                    1 as dcac,
                    1 as dccc,
                    1 as dcc,
                    smp.name as sample,
                    smp.blsampleid,
                    ses.visit_number as vn,
                    1,
                    1,
                    1,
                    'A',
                    1,
                    'A',
                    es.beamsizehorizontal,
                    es.beamsizevertical,
                    1,
                    1,
                    1 as scon,
                    'A' as spos,
                    'A' as sn,
                    'edge' as type,
                    es.jpegchoochfilefullpath,
                    1,
                    es.scanfilefullpath,
                    es.energyscanid,
                    1,
                    es.element,
                    es.peakfprime,
                    es.exposuretime,
                    es.axisposition,
                    es.peakfdoubleprime,
                    es.starttime as st,
                    es.transmissionfactor,
                    es.inflectionfprime,
                    es.inflectionfdoubleprime,
                    es.comments,
                    es.peakenergy,
                    es.inflectionenergy,
                    'A',
                    'A',
                    'A',
                    'A',
                    es.starttime as sta,
                    1,
                    1,
                    1,
                    0,
                    0,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    '',
                    '',
                    TIMESTAMPDIFF(MINUTE, es.starttime, CURRENT_TIMESTAMP) as age,
                    0,
                    0,
                    0,
                    0,
                    0,
                    '',
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    ses.beamlinename as bl,
                    es.blsubsampleid,
                    '',
                    '',
                    ses.archived,
                    '',
                    ''
                FROM energyscan es
                INNER JOIN blsession ses ON ses.sessionid = es.sessionid
                LEFT OUTER JOIN blsample smp ON es.blsampleid = smp.blsampleid
                $extj[1]
                WHERE $sess[1] $where2
                   
            UNION
            SELECT
                $extc
                1 as dcac,
                1 as dccc,
                1 as dcc,
                smp.name as sample,
                smp.blsampleid,
                ses.visit_number as vn,
                1,
                1,
                1,
                'A',
                1,
                'A',
                xrf.beamsizehorizontal,
                xrf.beamsizevertical,
                1,
                1,
                1,
                'A',
                'A',
                'mca' as type,
                'A',
                1,
                'A',
                xrf.xfefluorescencespectrumid,
                1,
                xrf.filename,
                1,
                xrf.exposuretime,
                xrf.axisposition,
                1,
                TO_CHAR(xrf.starttime, 'DD-MM-YYYY HH24:MI:SS') as st,
                xrf.beamtransmission,
                1,
                xrf.energy,
                xrf.comments,
                1,
                1,
                'A',
                'A',
                'A',
                'A',
                xrf.starttime as sta,
                1,
                1,
                1,
                0,
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                '',
                '',
                TIMESTAMPDIFF('MINUTE', xrf.starttime, CURRENT_TIMESTAMP) as age,
                0,
                0,
                0,
                0,
                0,
                '',
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                ses.beamlinename as bl,
                xrf.blsubsampleid,
                '',
                '',
                ses.archived,
                '',
                ''
            FROM xfefluorescencespectrum xrf
            INNER JOIN blsession ses ON ses.sessionid = xrf.sessionid
            LEFT OUTER  JOIN blsample smp ON xrf.blsampleid = smp.blsampleid     
            $extj[3]
            WHERE $sess[3] $where4
                   
            UNION
            SELECT
                $extc
                1 as dcac,
                1 as dccc,
                1 as dcc,
                smp.name as sample,
                smp.blsampleid,
                ses.visit_number as vn,
                1,
                1,
                1,
                'A',
                1,
                'A',
                ROUND(TIMESTAMPDIFF('SECOND', CAST(r.starttimestamp AS DATE), CAST(r.endtimestamp AS DATE)), 1),
                1,
                1,
                1,
                1,
                r.status,
                r.message,
                'load' as type,
                r.actiontype,
                1,
                smp.code,
                r.robotactionid,
                1,
                r.samplebarcode,
                r.containerlocation,
                r.dewarlocation,
                1,
                1,
                TO_CHAR(r.starttimestamp, 'DD-MM-YYYY HH24:MI:SS') as st,
                1,
                1,
                1,
                'A',
                1,
                1,
                r.xtalsnapshotbefore,
                r.xtalsnapshotafter,
                'A',
                'A',
                r.starttimestamp as sta,
                1,
                1,
                1,
                0,
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                '',
                '',
                TIMESTAMPDIFF('MINUTE', r.starttimestamp, CURRENT_TIMESTAMP) as age,
                0,
                0,
                0,
                0,
                0,
                '',
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                ses.beamlinename as bl,
                1 as blsubsampleid,
                '',
                '',
                ses.archived,
                '',
                ''
            FROM robotaction r
            INNER JOIN blsession ses ON ses.sessionid = r.blsessionid
            LEFT OUTER  JOIN blsample smp ON r.blsampleid = smp.blsampleid
            $extj[2]
            WHERE $sess[2] $where3
                 
                   
            ORDER BY sta DESC, id DESC";
            
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
                    $nf = array(1 => array('AXISSTART'), 2 => array('RESOLUTION', 'TRANSMISSION', 'AXISRANGE'), 4 => array('WAVELENGTH', 'EXPOSURETIME'));

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

                    if ($dc['DCT'] != 'Serial Fixed' &&
                        $dc['DCT'] != 'Serial Jet' &&
                        $dc['AXISRANGE'] == 0 &&
                        $dc['NI'] > 1
                    ) {
                        $dc['TYPE'] = 'grid';
                    }
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
            global $jpeg_thumb_location;
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
            
            $dct = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, dc.datacollectionid as id, dc.startimagenumber, dc.filetemplate, dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4,dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, s.visit_number 
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $ids);
            
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
                        $ext = pathinfo($dc[$im], PATHINFO_EXTENSION);
                        $thumb = str_replace('.'.$ext, 't.'.$ext, $dc[$im]);
                        if ($this->staff && $this->has_arg('debug')) $debug['snapshot_thumb'] = array('file' => $thumb, 'exists' => file_exists($thumb) ? 1 : 0);
                        if (file_exists($thumb)) $sn = 1;
                    }
                    unset($dc[$im]);
                }

                $dc['DIR'] = $this->ads($dc['DIR']);
                $dc['X'] = $images;
                
                $tmp = new TemplateParser($this->db);
                $di = $tmp->interpolate($jpeg_thumb_location, array('DCID' => $dc['ID']));
                
                $this->profile('diffraction image');
                $die = 0;
                if (file_exists($di)) $die = 1;
                if ($this->staff && $this->has_arg('debug')) $debug['diffraction_thumb'] = array('file' => $di, 'exists' => file_exists($di) ? 1 : 0);
            
                array_push($out, array($dc['ID'], array($die,$images,$sn,$debug)));
            }
            $this->_output($out);
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

            $rows = $this->db->pq("SELECT s.programversion, st.rankingresolution as rankres, ssw.wedgenumber, sssw.subwedgenumber, ssw.chi, ssw.kappa, ssw.phi, dc.datacollectionid as dcid, s.comments, dc.transmission as dctrn, dc.wavelength as lam, dc.imagedirectory imd, dc.imageprefix as imp, dc.comments as dcc, dc.blsampleid as sid, sl.spacegroup as sg, sl.unitcell_a as a, sl.unitcell_b as b, sl.unitcell_c as c, sl.unitcell_alpha as al, sl.unitcell_beta as be, sl.unitcell_gamma as ga, CONCAT(CONCAT(IF(sssw.comments, sssw.comments, IF(ssw.comments, ssw.comments, s.shortcomments)), ' Wedge'), IFNULL(ssw.wedgenumber, '')) as com, sssw.axisstart as st, sssw.exposuretime as time, sssw.transmission as tran, sssw.oscillationrange as oscran, sssw.resolution as res, sssw.numberofimages as nimg, det.numberofpixelsx, det.detectorpixelsizehorizontal, sssw.rotationaxis
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
            $result = 0;
            try {
                $b=$lambda/(2*$r);
                $d=2*asin($b);
                $f=2*tan($d);
                $result = number_format($diam/$f, 2);
            } catch (\Exception $e) {
                error_log('Error converting resolution to distance, lambda=' . $lambda . ' r=' . $r . ' Exception: ' . $e->getMessage());
            }
            return $result;
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
                array_push($iqs[0], array(intval($imq['NIM']), $this->_null_or($imq['S'], 'int')));
                array_push($iqs[1], array(intval($imq['NIM']), $this->_null_or($imq['B'], 'int')));
                array_push($iqs[2], array(intval($imq['NIM']), $this->_null_or($imq['RES'], 'float')));
                array_push($iqs[3], array(intval($imq['NIM']), $this->_null_or($imq['TOTALINTEGRATEDSIGNAL'], 'float')));
                array_push($iqs[4], array(intval($imq['NIM']), $this->_null_or($imq['D'], 'float')));
            }

            $this->_output($iqs);
        }

        function _null_or($field, $conversion) {
            $val = $field;
            if ($conversion == 'float') $val = floatval($field);
            if ($conversion == 'int') $val = intval($field);

            return $field == null ? $field : $val;
        }

        # ------------------------------------------------------------------------
        # Grid Scan Info
        function _grid_info() {
            $info = $this->db->pq("SELECT dc.datacollectiongroupid, dc.datacollectionid, dc.axisstart, p.posx as x, p.posy as y, p.posz as z, g.dx_mm, g.dy_mm, g.steps_x, g.steps_y, g.pixelspermicronx, g.pixelspermicrony, g.snapshot_offsetxpixel, g.snapshot_offsetypixel, g.orientation, g.snaked
                FROM gridinfo g
                INNER JOIN datacollection dc on (dc.datacollectionid = g.datacollectionid) or (dc.datacollectiongroupid = g.datacollectiongroupid)
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
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'ses.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('id')) {
                $where .= ' AND g.datacollectionid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('id'));
            }

            if ($this->has_arg('sid')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));
            }

            $maps = $this->db->pq("SELECT xfm.xrffluorescencemappingid, IF(xfroi.scalar IS NOT NULL, xfroi.scalar, CONCAT(xfroi.element, '-', xfroi.edge)) as title, xfm.data, xfm.opacity, xfm.min, xfm.max, xfroi.element, xfroi.scalar, xfroi.edge, xfroi.startenergy, xfroi.endenergy, dc.blsubsampleid, dc.blsampleid, dc.datacollectionid, g.steps_x, g.steps_y, g.snaked, g.orientation
                FROM xrffluorescencemapping xfm
                INNER JOIN gridinfo g ON g.gridinfoid = xfm.gridinfoid
                INNER JOIN datacollection dc ON dc.datacollectionid = g.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON ses.sessionid = dcg.sessionid
                INNER JOIN xrffluorescencemappingroi xfroi ON xfm.xrffluorescencemappingroiid = xfroi.xrffluorescencemappingroiid
                LEFT OUTER JOIN blsample s ON dc.blsampleid = s.blsampleid

                WHERE $where", $args);

            foreach ($maps as &$m) {
                $m["DATA"] = json_decode(gzdecode($m["DATA"]));
            }

            $this->_output($maps);
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
            
            $info = $this->db->pq('SELECT ses.visit_number, dc.datfullpath, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir 
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession ses ON dcg.sessionid = ses.sessionid 
                WHERE datacollectionid=:1', array($this->arg('id')));
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
