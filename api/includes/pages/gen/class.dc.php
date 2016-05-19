<?php

    namespace gen;
    
    class Dc extends \Page {
        

        public static $arg_list = array('id' => '\d+', 'visit' => '\w+\d+-\d+', 'page' => '\d+', 's' => '[\w\d-\/]+', 'pp' => '\d+', 'h' => '\d\d',
            'dcg' => '\d+', 
            'COMMENTS' => '.*',
            'pid' => '\d+',
            'sid' => '\d+',


            'dcid' => '\d+',
            'DATACOLLECTIONID' => '\d+',
            'PERSONID' => '\d+',
                              );


        public static $dispatch = array(array('(/sing:le)(/:id)', 'get', '_data_collections', array('le' => '\w+', 'id' => '\d+')),
                              array('/chi', 'post', '_chk_image'),
                              array('/dat/:id', 'get', '_plot'),

                              array('/single/t/:t/:id', 'patch', '_set_comment'),
                              array('/dl/id/:id', 'get', '_download'),

                              array('/comments(/:dcid)', 'get', '_get_comments'),
                              array('/comments', 'post', '_add_comment'),
                            );
        
        
        # Data Collections
        function _data_collections() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $args = array();
            $where = '';
            $extj = array('','','','');
            $extc = '';
            $sess = array();
            
            # Pagination
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('pp') ? $this->arg('pp') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            # Check that whatever we are looking for actually exists
            $info = array();
            # Visits
            if ($this->has_arg('visit')) {
                list($info,) = $this->db->pq("SELECT TO_CHAR(s.startdate, 'HH24') as sh, TO_CHAR(s.startdate, 'DDMMYYYY') as dmy, s.sessionid, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
                
                $sess = array('dc.sessionid=:1');
                array_push($args, $info['SESSIONID']);
             
            # Samples
            } else if ($this->has_arg('sid') && $this->has_arg('prop')) {
                $info = $this->db->pq("SELECT s.blsampleid FROM blsample s INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid INNER JOIN proposal p ON p.proposalid = pr.proposalid WHERE s.blsampleid=:1 AND CONCAT(p.proposalcode, p.proposalnumber) LIKE :2", array($this->arg('sid'), $this->arg('prop')));
                
                $sess[0] = $t.'.blsampleid=:'.($i+1);
                array_push($args, $this->arg('sid'));


            # Proteins
            } else if ($this->has_arg('pid')) {
                $info = $this->db->pq("SELECT proteinid FROM protein p WHERE p.proteinid=:1", array($this->arg('pid')));

                $extj[0] .= " INNER JOIN crystal cr ON cr.crystalid = smp.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid";
                $sess[0] = 'pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));

            # Proposal
            } else if ($this->has_arg('prop')) {
                $info = $this->db->pq('SELECT proposalid FROM proposal p WHERE CONCAT(p.proposalcode, p.proposalnumber) LIKE :1', array($this->arg('prop')));
                
                $sess[0] = 'ses.proposalid=:1';
                array_push($args, $this->proposalid);
            }
            
            if (!sizeof($info)) $this->_error('The specified visit, or proposal doesnt exist');
            
            # Filter by time for visits
            if (($this->has_arg('h') && ($this->has_arg('visit') || $this->has_arg('dmy')))) {
                $where .= "AND dc.starttime > TO_DATE(:".(sizeof($args)+1).", 'HH24:MI:SS DDMMYYYY') AND dc.starttime < TO_DATE(:".(sizeof($args)+2).", 'HH24:MI:SS DDMMYYYY')";
                
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
                
                array_push($args, $st.$my);
                array_push($args, $en.$my);
            }
            
            
            # If not staff check they have access to data collection
            if (!$this->has_arg('visit') && !$this->staff) {
                $extj[0] .= " INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }
            
            
            # View a single data collection
            if ($this->has_arg('id')) {
                $st = sizeof($args)+1;
                $where .= ' AND dc.datacollectionid=:'.$st;
                array_push($args, $this->arg('id'));
            }
            
            
            # Search terms
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(dc.filetemplate) LIKE lower(CONCAT(CONCAT('%',:$st),'%')) OR lower(dc.imagedirectory) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."),'%')) OR lower(dc.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."),'%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }

            # Data collection group
            if ($this->has_arg('dcg')) {
                $count_field = 'dc.datacollectionid';
                $fields = "1 as dcc,
                    smp.name as sample,
                    smp.blsampleid,
                    ses.visit_number as vn,

                    dc.datacollectionid as id,
                    dc.datacollectiongroupid as dcg,

                    dc.runstatus,
                    'data' as type,
                    TO_CHAR(dc.starttime, 'DD-MM-YYYY HH24:MI:SS') as st,
                    dc.comments,
                    dc.starttime as sta,

                    dc.numberofimages as numimg,
                    dc.imageprefix as imp,
                    dc.datacollectionnumber as run,
                    dc.filetemplate,
                    dc.imagedirectory as dir,

                    dc.resolution,
                    dc.exposuretime,
                    dc.transmission,
                    dc.wavelength,
                    dc.flux,

                    dc.beamsizeatsamplex as bsx,
                    dc.beamsizeatsampley as bsy,
                    dc.detectordistance as det,

                    dc.voltage,
                    dc.c2aperture,
                    dc.c2lens,
                    dc.objaperture,
                    dc.magnification,
                    dc.totalabsorbeddose,

                    d.detectorpixelsizehorizontal,
                    d.detectorpixelsizevertical,
                    count(dcc.datacollectioncommentid) as dccc
                    ";
                $groupby = '';

                $where .= ' AND dc.datacollectiongroupid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('dcg'));

            } else {
                $count_field = 'distinct dc.datacollectiongroupid';
                $fields = "count(dc.datacollectionid) as dcc, 
                    min(smp.name) as sample,
                    min(smp.blsampleid) as blsampleid,
                    min(ses.visit_number) as vn,

                    min(dc.datacollectionid) as id,
                    dc.datacollectiongroupid as dcg,

                    min(dc.runstatus) as runstatus,
                    'data' as type,
                    TO_CHAR(min(dc.starttime), 'DD-MM-YYYY HH24:MI:SS') as st,
                    min(dc.comments) as comments,
                    min(dc.starttime) as sta,

                    sum(dc.numberofimages) as numimg,
                    min(dc.imageprefix) as imp,
                    min(dc.datacollectionnumber) as run,
                    min(dc.filetemplate) as filetemplate,
                    min(dc.imagedirectory) as dir,

                    min(dc.resolution) as resolution,
                    min(dc.exposuretime) as exposuretime,
                    min(dc.transmission) as transmission,
                    min(dc.wavelength) as wavelength,
                    max(dc.flux) as flux,

                    min(dc.beamsizeatsamplex) as bsx,
                    min(dc.beamsizeatsampley) as bsy,
                    min(dc.detectordistance) as det,

                    max(dc.voltage) as voltage,
                    max(dc.c2aperture) as c2aperture,
                    max(dc.c2lens) as c2lens,
                    max(dc.objaperture) as objaperture,
                    max(dc.magnification) as magnification,
                    sum(dc.totalabsorbeddose) as totaldose,

                    max(d.detectorpixelsizehorizontal) as detectorpixelsizehorizontal,
                    max(d.detectorpixelsizevertical) as detectorpixelsizevertical,

                    count(dcc.datacollectioncommentid) as dccc";
                $groupby = "GROUP BY dc.datacollectiongroupid";
            }
            
            $tot = $this->db->pq("SELECT sum(tot) as t FROM (SELECT count($count_field) as tot FROM datacollection dc
                INNER JOIN blsession ses ON ses.sessionid = dc.sessionid
                LEFT OUTER JOIN blsample smp ON dc.blsampleid = smp.blsampleid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                $extj[0]
                WHERE $sess[0] $where
                
                ) inq", $args);
            
            $tot = $tot[0]['T'];
            
            $pgs = intval($tot/$pp);
            if ($tot % $pp != 0) $pgs++;

            $st = sizeof($args) + 1;
            array_push($args, $start);
            array_push($args, $end);

            $q = "SELECT $extc $fields
             FROM datacollection dc
             INNER JOIN blsession ses ON ses.sessionid = dc.sessionid
             INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
             LEFT OUTER JOIN blsample smp ON dc.blsampleid = smp.blsampleid
             LEFT OUTER JOIN detector d ON d.detectorid = dc.detectorid
             LEFT OUTER JOIN datacollectioncomment dcc ON dc.datacollectionid = dcc.datacollectionid
             $extj[0]
             WHERE $sess[0] $where 
             $groupby
                   
            ORDER BY sta DESC";
            
            $dcs = $this->db->paginate($q, $args);
            
            $nf = array(5 => array('WAVELENGTH'), 4 => array('RESOLUTION'), 3 => array('RESOLUTION'));
            foreach ($dcs as $i => &$dc) {
                $dc['DIR'] = preg_replace('/.*\/\d\d\d\d\/\w\w\d+-\d+\//', '', $dc['DIR']);
                
                $dc['BSX'] = round($dc['BSX']*1000);
                $dc['BSY'] = round($dc['BSY']*1000);
                
                foreach ($nf as $nff => $cols) {
                    foreach ($cols as $c) {
                        $dc[$c] = number_format($dc[$c], $nff, '.', '');
                    }
                }
            
            }

            $this->_output(array($pgs, $dcs));

        }
        
        
        
        # ------------------------------------------------------------------------
        # Check whether images exist
        function _chk_image() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');
            
            $where = array();
            $ids = array();
            if (array_key_exists('ids', $_POST)) {
                foreach ($_POST['ids'] as $i) {
                    if (preg_match('/^\d+$/', $i)) {
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
            
            $dct = $this->db->pq("SELECT dc.datacollectionid as id, dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4 FROM datacollection dc  WHERE $where", $ids);
                
            $this->profile('dc query');
                                   
            $dcs = array();
            foreach ($dct as $d) $dcs[$d['ID']] = $d;
            
            $out = array();
            
            foreach ($dcs as $dc) {
                $images = array();
                foreach (array('X1', 'X2', 'X3', 'X4') as $j => $im) {
                    array_push($images, file_exists($dc[$im]) ? 1 : 0);
                }
            
                array_push($out, array($dc['ID'], $images));
            }
            $this->_output($out);
        }
        
        
        # ------------------------------------------------------------------------
        # Dat Plot
        function _plot() {
            session_write_close();
            if (!$this->has_arg('id')) {
                $this->_error('No data collection id specified');
                return;
            }
            
            $info = $this->db->pq('SELECT ses.visit_number, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir FROM datacollection dc INNER JOIN blsession ses ON dc.sessionid = ses.sessionid WHERE datacollectionid=:1', array($this->arg('id')));
            if (sizeof($info) == 0) {
                $this->_error('No data for that collection id');
                return;
            } else $info = $info[0];
            
            $info['VISIT'] = $this->arg('prop') .'-'.$info['VISIT_NUMBER'];
            
            $pth = str_replace($info['VISIT'], $info['VISIT'].'/.ispyb', $this->ads($info['DIR']).$info['IMP'].'/'.$info['SCAN'].'.dat');
            
            $data = array();
            if (file_exists($pth) && is_readable(($pth))) {
                $dat = explode("\n",file_get_contents($pth));

                foreach (array_slice($dat,5) as $i => $d) {
                    if ($d) {
                        list($x, $y) = preg_split('/\s+/', trim($d));
                        array_push($data, array(floatval($x), floatval($y)));
                    }
                }
            }
            
            $this->_output(array($data));
        }

        
        # ------------------------------------------------------------------------
        # Download Data
        function _download() {
            session_write_close();
            if (!$this->has_arg('id')) {
                $this->_error('No data collection id specified');
                return;
            }
            
            $info = $this->db->pq('SELECT ses.visit_number, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir FROM datacollection dc INNER JOIN blsession ses ON dc.sessionid = ses.sessionid WHERE datacollectionid=:1', array($this->arg('id')));
            if (sizeof($info) == 0) {
                $this->_error('No data for that collection id');
                return;
            } else $info = $info[0];
            
            $info['VISIT'] = $this->arg('prop') .'-'.$info['VISIT_NUMBER'];
            
            $data = str_replace($info['VISIT'], $info['VISIT'].'/.ispyb', $this->ads($info['DIR']).$info['IMP'].'/download/download.zip');
            if (file_exists($data)) {
                $this->_header($this->arg('id').'_download.zip');
                readfile($data);
            }
        }
        
        # ------------------------------------------------------------------------
        # Force browser to download file
        function _header($f) {
            header("Content-Type: application/octet-stream");
            header("Content-Transfer-Encoding: Binary");
            header("Content-disposition: attachment; filename=\"$f\"");
        }
        
        # ------------------------------------------------------------------------
        # Update comment for a data collection
        function _set_comment() {
            if (!$this->arg('id')) $this->_error('No data collection id specified');
            if (!$this->arg('COMMENTS')) $this->_error('No comment specified');
            
            $com = $this->db->pq('SELECT comments from datacollection WHERE datacollectionid=:1', array($this->arg('id')));
            
            if (!sizeof($com)) $this->_error('No such data collection');
            
            $this->db->pq("UPDATE datacollection set comments=:1 where datacollectionid=:2", array($this->arg('COMMENTS'), $this->arg('id')));
            
            $this->_output(array('COMMENTS' => $this->arg('COMMENTS')));
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
                
    }

?>