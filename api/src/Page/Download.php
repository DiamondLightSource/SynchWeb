<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\TemplateParser;

use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class Download extends Page
{

        public static $arg_list = array('id' => '\d+',
                              'aid' => '\d+',
                              'run' => '\d+',
                              'visit' => '\w+\d+-\d+',
                              'u' => '\w+\d+',
                              's' => '\d',
                              'log' => '\d',
                              'archive' => '\d',
                              'LogFiles' => '([\w|\.])+',
                              'ty' => '\w+',
                              'pdb' => '\d',
                              'map' => '\d',
                              'validity' => '.*',

                              'dt' => '\w+',
                              'ppl' => '\w+',

                              'filetype' => '\w+',
                              'blsampleid' => '\d+',
                              'dcg' => '\d+',

                              'download' => '\d',
                              'AUTOPROCPROGRAMID' => '\d+',
                              'AUTOPROCPROGRAMATTACHMENTID' => '\d+',

                              'PHASINGPROGRAMATTACHMENTID' => '\d+',
                              );


        public static $dispatch = array(array('/map(/pdb/:pdb)(/ty/:ty)(/dt/:dt)(/ppl/:ppl)(/id/:id)(/map/:map)', 'get', '_map'),
                              array('/id/:id/aid/:aid(/log/:log)(/1)(/LogFiles/:LogFiles)(/archive/:archive)', 'get', '_auto_processing'),
                              array('/plots', 'get', '_auto_processing_plots'),
                              array('/ep/id/:id(/log/:log)', 'get', '_ep_mtz'),
                              array('/dimple/id/:id(/log/:log)', 'get', '_dimple_mtz'),
                              array('/mrbump/id/:id(/log/:log)', 'get', '_mrbump_mtz'),
                              array('/csv/visit/:visit', 'get', '_csv_report'),
                              array('/bl/visit/:visit/run/:run', 'get', '_blend_mtz'),
                              array('/sign', 'post', '_sign_url'),
                              array('/bigep/id/:id/dt/:dt/ppl/:ppl(/log/:log)', 'get', '_bigep_mtz'),
                              array('/data/visit/:visit', 'get', '_download_visit'),
                              array('/attachments', 'get', '_get_attachments'),
                              array('/attachment/id/:id/aid/:aid', 'get', '_get_attachment'),
                              array('/dc/id/:id', 'get', '_download'),

                              array('/ap/attachments(/:AUTOPROCPROGRAMATTACHMENTID)(/dl/:download)', 'get', '_get_autoproc_attachments'),
                              array('/zocalo/ap/attachments(/:AUTOPROCPROGRAMATTACHMENTID)(/dl/:download)', 'get', '_get_zocalo_autoproc_attachments'),
                              array('/ph/attachments(/:PHASINGPROGRAMATTACHMENTID)(/dl/:download)', 'get', '_get_phasing_attachments'),
            );


        # ------------------------------------------------------------------------
        # Generate a one time token for access to downloads
        function _sign_url() {
            if (!$this->has_arg('validity')) $this->_error('No validity specified');
            $token = md5(uniqid());

            $this->db->pq("INSERT INTO SW_onceToken (token, validity, proposalid, personid) VALUES (:1, :2, :3, :4)", array($token, $this->arg('validity'), $this->proposalid, $this->user->personid));
            $this->_output(array('token' => $token));
        }


        # ------------------------------------------------------------------------
        # SAXS Specific Visit Download Link
        function _download_visit() {
            $filesystem = new Filesystem();
            $tp = new TemplateParser($this->db);
            $visit = $tp->visit_dir(array('VISIT' => $this->arg('visit')));

            $data = $visit.'/.ispyb/download/download.zip';

            if ($filesystem->exists($data)) {
                $response = new BinaryFileResponse($data);
                $response->headers->set("Content-Type", "application/octet-stream");
                $response->setContentDisposition(
                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                    $this->arg('visit').'_download.zip'
                );
                $response->send();
            } else $this->_error('There doesnt seem to be a data archive available for this visit');
        }

        # ------------------------------------------------------------------------
        # Download mtz/log file for Fast DP / XIA2
        #   TODO: Delete me
        function _auto_processing_plots() {
            global $ap_types;
            if (!$this->has_arg('id')) $this->_error('No data collection', 'No data collection id specified');

            $rows = $this->db->pq("SELECT appa.filename, appa.filepath, api.autoprocprogramid, app.processingcommandline as type
                FROM autoprocintegration api 
                INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                WHERE appa.filetype='Graph' AND api.datacollectionid = :1", array($this->arg('id')));

            foreach ($rows as &$r) {
                foreach ($ap_types as $id => $name) {
                    if (strpos($r['TYPE'], $id)) {
                        $r['TYPE'] = $name;
                        break;
                    }
                }

                $json = $r['FILEPATH'].'/'.$r['FILENAME'];
                $r['PLOTS'] = array();
                if (file_exists($json)) {
                    $cont = file_get_contents($json);
                    $r['PLOTS'] = json_decode($cont);
                }

                unset($r['FILENAME']);
                unset($r['FILEPATH']);
            }

            $this->_output($rows);
        }


        # ------------------------------------------------------------------------
        # Download mtz/log file for Fast DP / XIA2
        #   TODO: Delete me
        function _auto_processing() {
            ini_set('memory_limit', '512M');
            $filesystem = new Filesystem();

            if (!$this->has_arg('id')) $this->_error('No data collection', 'No data collection id specified');
            if (!$this->has_arg('aid')) $this->_error('No auto processing id', 'No auto processing id specified');

            $rows = $this->db->pq('SELECT appa.filename,appa.filepath,appa.filetype 
                FROM autoprocintegration api 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                WHERE api.datacollectionid = :1 AND api.autoprocprogramid=:2', array($this->arg('id'), $this->arg('aid')));

            $this->db->close();

            // print_r($rows);

            if (!sizeof($rows)) $this->_error('No such auto processing');
            // else $r = $rows[0];

            foreach ($rows as $r) {
                if ($this->has_arg('log') || $this->has_arg('archive')) {
                    if ($r['FILETYPE'] == 'Log') {
                        if ($this->has_arg('LogFiles')) {
                            $f = $r['FILEPATH'].'/LogFiles/'.$this->arg('LogFiles');
                            if (pathinfo($this->arg('LogFiles'), PATHINFO_EXTENSION) == 'html') $this->app->contentType("text/html");
                            else $this->app->contentType("text/plain");

                        } else {

                            if ($this->has_arg('archive')) {
                                $tar = '/tmp/'.$this->arg('aid').'.tar';
                                $f = $tar.'.gz';

                                if (!$filesystem->exists($f)) {
                                    $a = new \PharData($tar);
                                    $a->buildFromDirectory($r['FILEPATH'], '/^((?!(HKL|cbf|dimple)).)*$/');
                                    $a->compress(\Phar::GZ);

                                    unlink($tar);
                                }

                                // Use Symfony to download
                                $response = new BinaryFileResponse($f);
                                $response->headers->set("Content-Type", "application/octet-stream");
                                $response->setContentDisposition(
                                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                                    $this->arg('aid').'.tar.gz'
                                );
                                $response->deleteFileAfterSend(true);
                                $response->send();
                                exit;

                            } else {
                                $f = $r['FILEPATH'].'/'.$r['FILENAME'];
                                if ($r['FILENAME'] == 'fast_dp.log') $this->app->contentType("text/plain");
                                if ($r['FILENAME'] == 'autoPROC.log') $this->app->contentType("text/plain");
                            }
                        }

                        if ($filesystem->exists($f)) {
                            // readfile($f);
                            $response = new BinaryFileResponse($f);
                            $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
                            $response->send();
                        } else {
                            error_log('Download requested file ' . $f . 'does not exist');
                        }
                        exit;
                    } else {
                        error_log('Download Log or archive required but filetype = ' . $r['FILETYPE']);
                    }

                } else {
                    // XIA2
                    if ($r['FILETYPE'] == 'Result') {
                        $f = $r['FILEPATH'].'/'.$r['FILENAME'];
                        if ($filesystem->exists($f)) {
                            $response = new BinaryFileResponse($f);
                            $response->headers->set("Content-Type", "application/octet-stream");
                            $response->setContentDisposition(
                                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                                $r['FILENAME']
                            );
                            $response->send();
                            exit;

                        } $this->_error('No such file', 'The specified auto processing file doesnt exist');

                    // FastDP
                    } else if ($r['FILETYPE'] == 'Log' && ($r['FILENAME'] == 'fast_dp.log' || $r['FILENAME'] == 'fast_dp-report.html')) {
                        $f = $r['FILEPATH'].'/fast_dp.mtz';
                        if ($filesystem->exists($f)) {
                            $response = new BinaryFileResponse($f);
                            $response->headers->set("Content-Type", "application/octet-stream");
                            $response->setContentDisposition(
                                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                                $this->arg('aid').'_fast_dp.mtz'
                            );
                            $response->send();
                            exit;

                        } $this->_error('No such file', 'The specified auto processing file doesnt exist');
                    }
                }
            }
        }


        # ------------------------------------------------------------------------
        # Return list of attachments for an autoproc run
        function _get_autoproc_attachments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specific', 'No proposal specified');

            $args = array($this->proposalid);
            $where = '';

            if ($this->has_arg('AUTOPROCPROGRAMID')) {
                $where .= ' AND api.autoprocprogramid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMID'));
            }

            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                $where .= ' AND appa.autoprocprogramattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMATTACHMENTID'));
            }

            $rows = $this->db->pq("SELECT app.autoprocprogramid, appa.filename, appa.filepath, appa.filetype, appa.autoprocprogramattachmentid, dc.datacollectionid
                FROM autoprocintegration api 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                WHERE s.proposalid=:1 $where", $args);

            // exit();
            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                if (!sizeof($rows)) $this->_error('No such attachment');
                else  {
                    if ($this->has_arg('download')) {
                        $this->_get_file($rows[0]['AUTOPROCPROGRAMID'], $rows[0]);
                    } else $this->_output($rows[0]);
                }
            } else $this->_output($rows);
        }


        # ------------------------------------------------------------------------
        # Return list of attachments for an autoproc run
        function _get_zocalo_autoproc_attachments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specific', 'No proposal specified');
            
            $args = array($this->proposalid);
            $where = '';

            if ($this->has_arg('AUTOPROCPROGRAMID')) {
                $where .= ' AND app.autoprocprogramid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMID'));
            }

            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                $where .= ' AND appa.autoprocprogramattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMATTACHMENTID'));
            }

            $rows = $this->db->pq("SELECT app.autoprocprogramid, appa.filename, appa.filepath, appa.filetype, appa.autoprocprogramattachmentid, dc.datacollectionid, 'zocalo' as zocalo 
                FROM processingjob pj 
                INNER JOIN autoprocprogram app ON pj.processingjobid = app.processingjobid 
                INNER JOIN autoprocprogramattachment appa ON app.autoprocprogramid = appa.autoprocprogramid 
                INNER JOIN datacollection dc ON dc.datacollectionid = pj.datacollectionid 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                WHERE s.proposalid=:1 $where", $args);

            // exit();
            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                if (!sizeof($rows)) $this->_error('No such attachment');
                else  {
                    if ($this->has_arg('download')) {
                        $this->_get_file($rows[0]['AUTOPROCPROGRAMID'], $rows[0]);
                    } else $this->_output($rows[0]);
                }
            } else $this->_output($rows);
        }


        # ------------------------------------------------------------------------
        # Return list of attachments for a phasing run
        #   TODO: duplicate of above, consolidate tables
        function _get_phasing_attachments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specific', 'No proposal specified');

            $where = '';
            $args = array($this->proposalid);

            if ($this->has_arg('id')) {
                $where .= ' AND dc.datacollectionid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('id'));
            }

            if ($this->has_arg('PHASINGPROGRAMATTACHMENTID')) {
                $where .= ' AND ppa.phasingprogramattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('PHASINGPROGRAMATTACHMENTID'));
            }

            $rows = $this->db->pq("SELECT ph.phasingprogramrunid, ppa.phasingprogramattachmentid, ppa.filepath, ppa.filename, ppa.filetype
                        FROM phasingprogramattachment ppa
                        INNER JOIN phasing ph ON ph.phasingprogramrunid = ppa.phasingprogramrunid
                        INNER JOIN phasing_has_scaling phs ON phs.phasinganalysisid = ph.phasinganalysisid
                        INNER JOIN autoprocscaling_has_int aps ON aps.autoprocscalingid = phs.autoprocscalingid
                        INNER JOIN autoprocintegration api ON api.autoprocintegrationid = aps.autoprocintegrationid
                        INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                        INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                        INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                        WHERE s.proposalid=:1 $where", $args);

            if ($this->has_arg('PHASINGPROGRAMATTACHMENTID')) {
                if (!sizeof($rows)) $this->_error('No such attachment');
                else {
                    if ($this->has_arg('download')) {
                        $this->_get_file($rows[0]['PHASINGPROGRAMRUNID'], $rows[0]);
                    } else  $this->_output($rows[0]);
                }
            } else $this->_output($rows);
        }


        /**
         * Download a file to the browser
         * This function is used to download autoproc and phasing run attachments.
         * It sets a maximum amount of memory for the download.
         * The $id is used as a prefix to the filename.
         *
         * @param integer $id One of AutoProcProgramId or PhasingProgramRunId
         * @param array $file Array that must include FILENAME (including extension) and FILEPATH
         */
        function _get_file($id, $file) {
            // We don't want to allow unlimited file sizes
            ini_set('memory_limit', '512M');
            $filesystem = new Filesystem();

            $filename = $file['FILEPATH'].'/'.$file['FILENAME'];

            // Do the check first, if no file quit early
            if ($filesystem->exists($filename)) {

                $response = new BinaryFileResponse($filename);

                $path_ext = pathinfo($file['FILENAME'], PATHINFO_EXTENSION);

                if ($path_ext == 'html') {
                    $response->headers->set("Content-Type", "text/html");
                    $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
                } elseif ($path_ext == 'pdf') {
                    $f = $file['FILENAME'];
                    $response->headers->set("Content-Type", "application/pdf");
                    $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $f);
                } elseif ($path_ext == 'png') {
                    $f = $file['FILENAME'];
                    $response->headers->set("Content-Type", "image/png");
                    $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT,$f);
                } elseif (in_array($path_ext, array('log', 'txt', 'error', 'LP', 'json'))) {
                    $response->headers->set("Content-Type", "text/plain");
                    $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
                } else {
                    $response->headers->set("Content-Type", "application/octet-stream");
                    $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT,$id.'_'.$file['FILENAME']);
                }

                // All OK - send it
                // We were getting out of memory errors - switch off output buffer to fix
                if (ob_get_level()) {
                    ob_end_clean();
                }
                // Setting content length means browser can indicate how long is left
                $response->headers->set("Content-Length", filesize($filename));

                $response->send();
                exit();
            } else {
                $this->_error("No such file, the specified file " . $filename . " doesn't exist");
            }
        }


        # ------------------------------------------------------------------------
        # Return a blended mtz file
        function _blend_mtz() {
            $filesystem = new Filesystem();

            if (!$this->has_arg('visit')) $this->_error('No visit specified', 'No visit was specified');
            if (!$this->has_arg('run')) $this->_error('No run specified', 'No blend run number was specified');

            $visit = $this->db->pq("SELECT TO_CHAR(startdate, 'YYYY') as y, s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON p.proposalid=s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));

            if (!sizeof($visit)) $this->_error('No such visit', 'The specified visit does not exist');
            else $visit = $visit[0];
            $this->db->close();

            $u = $this->has_arg('u') ? $this->arg('u') : $this->user->login;

            $root = '/dls/'.$visit['BL'].'/data/'.$visit['Y'].'/'.$this->arg('visit').'/processing/auto_mc/'.$u.'/blend/run_'.$this->arg('run');

            if (file_exists($root)) {
                $file = $this->has_arg('s') ? 'scaled_001.mtz' : 'merged_001.mtz';
                $f = $root.'/combined_files/'.$file;
                if (file_exists($f)) {
                    $response = new BinaryFileResponse($f);
                    $response->headers->set("Content-Type", "application/octet-stream");
                    $response->setContentDisposition(
                        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                        'run_'.$this->arg('run').'_'.$file
                    );
                    $response->send();
                    exit;
                }
            }
        }


        # ------------------------------------------------------------------------
        # Return pdb/mtz/log file for fast_ep and dimple
        function _use_rel_path($pat, $pth, $root_pth) {
            $regex_pat = str_replace("*", "\w+", $pat);
            $sp = preg_split('`'.$regex_pat.'`', $pth);
            $rel_path =  array_pop($sp);
            $res =  $root_pth . $rel_path;
            return $res;
        }

        function _get_downstream_dir($subdir, $root) {
            $info = $this->db->pq("SELECT dc.imageprefix as imp, dc.datacollectionnumber as run, dc.imagedirectory as dir, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis 
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON (p.proposalid = s.proposalid) 
                WHERE dc.datacollectionid=:1", array($this->arg('id')));

            if (!sizeof($info)) $this->_error('No such data collection', 'The specified data collection does not exist');
            else $info = $info[0];

            $info['DIR'] = $this->ads($info['DIR']);
            $this->db->close();

            if (is_string($subdir)) {
                return preg_replace('/'.$info['VIS'].'/', $info['VIS'].$subdir, $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_/'.$root;

            } elseif (is_array($subdir)) {
                $paths = array();
                foreach ($subdir as $sbd) {
                    if (is_string($sbd)) {
                        $pth = preg_replace('/'.$info['VIS'].'/', $info['VIS'].$sbd, $info['DIR'], 1).$info['IMP'].'_'.$info['RUN'].'_/'.$root;
                        array_push($paths, $pth);
                    } else {
                        $this->_error('Invalid parameter type in downstream directory function call', 500);
                    }
                }
                return $paths;
            } else {
                $this->_error('Invalid parameter type in downstream directory function call', 500);
            }
        }


        function _ep_mtz() {
            $this->_mtzmap('FastEP');
        }

        function _dimple_mtz() {
            $this->_mtzmap('Dimple');
        }

        function _mrbump_mtz() {
            $this->_mtzmap('MrBUMP');
        }

        function _bigep_mtz() {
            $bigep_patterns = array (
                    'AUTOSHARP' => array( 'path' => 'big_ep*/*/autoSHARP/', 'log' => 'LISTautoSHARP.html'),
                    'AUTOBUILD' => array( 'path' => 'big_ep*/*/AutoSol/', 'log' => 'phenix_autobuild.log'),
                    'CRANK2' => array( 'path' => 'big_ep*/*/crank2/', 'log' => 'crank2.log')
            );
            $dt = strtoupper($this->arg('dt'));
            $ppl = strtoupper($this->arg('ppl'));

            $t = array();
            $root_dirs = $this->_get_downstream_dir(array ('/processed', '/tmp'), 'big_ep/');
            foreach ( $root_dirs as $loc ) {
                $root_pattern = $loc . $dt . '/xia2/*/' . $bigep_patterns[$ppl]['path'];
                $bigep_mdl_glob = glob($root_pattern);
                if (sizeof($bigep_mdl_glob)) {
                    $root = $bigep_mdl_glob[0];
                    $bigep_mdl_json = $root.'big_ep_model_ispyb.json';
                    if (file_exists($bigep_mdl_json)) {
                        $json_str = file_get_contents($bigep_mdl_json);
                        $json_data = json_decode($json_str, true);
                        $mtz_pth = $this->_use_rel_path($bigep_patterns[$ppl]['path'], $json_data['mtz'], $root);
                        $pdb_pth = $this->_use_rel_path($bigep_patterns[$ppl]['path'], $json_data['pdb'], $root);
                        $t = array('files' => array($mtz_pth, $pdb_pth), 'log' => $root.$bigep_patterns[$ppl]['log']);
                        $type = 'BigEP_'.$dt.'_'.$ppl;
                        $this->_mtzmap_readfile($type, $t['files'], $t['log']);
                        return;
                    }
                }
            }
            $this->_error('Cannot find Big EP model builing results file');
        }


        function _mtzmap($type) {
            $types = array('MrBUMP' => array('root' => 'auto_mrbump/', 'files' => array('PostMRRefine.pdb', 'PostMRRefine.mtz'), 'log' => 'MRBUMP.log'),
                           'Dimple' => array('root' => 'fast_dp/dimple/', 'files' => array('final.pdb', 'final.mtz'), 'log' => 'screen.log'),
                           'FastEP' => array('root' => 'fast_ep/', 'files' => array('sad.mtz', 'sad_fa.pdb'), 'log' => 'fast_ep.log'),
            );

            if (!array_key_exists($type, $types)) $this->_error('No such downstream type');
            else $t = $types[$type];

            $root = $this->_get_downstream_dir('/processed', $t['root']);
            $this->_mtzmap_readfile($type, array($root.$t['files'][0],$root.$t['files'][1]), $root.$t['log']);
        }

        function _mtzmap_readfile($type, $files, $log_file) {
            $filesystem = new Filesystem();
            $file = $files[0];

            if ($filesystem->exists($file)) {
                if ($this->has_arg('log')) {
                    if ($filesystem->exists($log_file)) {
                        $response = new BinaryFileResponse($log_file);

                        if (pathinfo($log_file, PATHINFO_EXTENSION) == 'log') {
                            $response->headers->set("Content-Type", "text/plain");
                        }
                        // readfile($log_file);
                        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
                        $response->send();

                    } else $this->_error('Not found, that file could not be found');

                } else {
                    $filename = '/tmp/'.$this->arg('id').'_'.$type;
                    $archive_filename = $filename . '.tar.gz';

                    if (!$filesystem->exists($archive_filename)) {
                        $a = new \PharData($filename.'.tar');
                        foreach ($files as $f) {
                            $a->addFile($f, basename($f));
                        }
                        $a->addFile($log_file, basename($log_file));
                        $a->compress(\Phar::GZ);

                        unlink($filename.'.tar');
                    }
                    $response = new BinaryFileResponse($archive_filename);
                    $response->setContentDisposition(
                        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                        $this->arg('id').'_'.$type.'.tar.gz'
                    );
                    $response->deleteFileAfterSend(true);
                    $response->send();

                    exit;
                }

            } else $this->_error('File not found ' .$type.' files were not found');

        }


        # ------------------------------------------------------------------------
        # Return maps and pdbs for big_ep
        function _big_ep_map() {
            $bigep_patterns = array (
                    'AUTOSHARP' => 'big_ep*/*/autoSHARP/',
                    'AUTOBUILD' => 'big_ep*/*/AutoSol/',
                    'CRANK2' => 'big_ep*/*/crank2/'
            );
            $dt = strtoupper($this->arg('dt'));
            $ppl = strtoupper($this->arg('ppl'));

            $root_dirs = $this->_get_downstream_dir(array ('/processed', '/tmp'), 'big_ep/');
            foreach ( $root_dirs as $loc ) {
                $root_pattern = $loc . $dt . '/xia2/*/' . $bigep_patterns[$ppl];
                $bigep_mdl_glob = glob($root_pattern);
                if (sizeof($bigep_mdl_glob)) {
                    $root = $bigep_mdl_glob[0];
                    $bigep_mdl_json = $root.'big_ep_model_ispyb.json';
                    if (file_exists($bigep_mdl_json)) {
                        $json_str = file_get_contents($bigep_mdl_json);
                        $json_data = json_decode($json_str, true);

                        if ($this->has_arg('pdb') && array_key_exists('pdb', $json_data)) {
                            $out = $this->_use_rel_path($bigep_patterns[$ppl], $json_data['pdb'], $root);
                        } elseif (array_key_exists('map', $json_data)) {
                            $out = $this->_use_rel_path($bigep_patterns[$ppl], $json_data['map'], $root);
                        } else {
                            continue;
                        }
                        # Use relative path in case files were moved
                        if (file_exists($out)) {
                            break;
                        } else {
                            $pth_split = preg_split('`'.$bigep_patterns[$ppl].'`', $out);
                            if (sizeof($pth_split)) {
                                $pth_rel = array_pop($pth_split);
                                $out = $root.$pth_rel;
                                if (file_exists($out)) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (file_exists($out)) {
                if ($this->has_arg('pdb')) {
                    $this->app->response->headers->set("Content-Length", filesize($out));
                    readfile($out);
                } else {
                    $gz_map = gzencode(file_get_contents($out));
                    $this->app->response->headers->set("Content-Length", strlen($gz_map));
                    print $gz_map;
                }
            }
        }

        # ------------------------------------------------------------------------
        # Return maps and pdbs for dimple / fast ep
        function _map() {
            if (!$this->has_arg('id')) $this->_error('No id specified', 'No id was specified');
            if (!$this->has_arg('ty')) $this->_error('No type specified', 'No type was specified');

            if ($this->arg('ty') == 'ep') {
                $root = $this->_get_downstream_dir('/processed', 'fast_ep/');
                $file_name = 'sad';

            } else if ($this->arg('ty') == 'dimple') {
                $root = $this->_get_downstream_dir('/processed', 'fast_dp/dimple/');
                $file_name = 'final';

            } else if ($this->arg('ty') == 'mrbump') {
                $root = $this->_get_downstream_dir('/processed', 'auto_mrbump/');
                $file_name = 'PostMRRefine';

            } else if ($this->arg('ty') == 'bigep') {
                $this->_big_ep_map();
                return;

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

            $vis = $this->db->pq("SELECT s.sessionid,s.beamlinename,TO_CHAR(s.startdate, 'DD_MM_YYYY') as st FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));

            if (!sizeof($vis)) $this->_error('No such visit', 'The specified visit doesnt exist');
            else $vis = $vis[0];

            $rows = $this->db->pq("SELECT dc.imageprefix,s.beamlinename,dc.datacollectionnumber,TO_CHAR(dc.starttime, 'DD/MM/YYYY HH24:MI:SS'), sa.name, p.name as protein, dc.numberofimages, dc.wavelength, dc.detectordistance, dc.exposuretime, dc.axisstart, dc.axisrange, dc.xbeam, dc.ybeam, dc.resolution, dc.comments 
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                LEFT OUTER JOIN blsample sa ON dc.blsampleid = sa.blsampleid 
                LEFT OUTER JOIN crystal c ON sa.crystalid = c.crystalid 
                LEFT OUTER JOIN protein p ON c.proteinid = p.proteinid 
                WHERE dcg.sessionid=:1 ORDER BY dc.starttime", array($vis['SESSIONID']));

            $this->app->response->headers->set("Content-type", "application/vnd.ms-excel");
            $this->app->response->headers->set("Content-disposition", "attachment; filename=".$vis['ST']."_".$vis['BEAMLINENAME']."_".$this->arg('visit').".csv");
            print "Image prefix,Beamline,Run no,Start Time,Sample Name,Protein Acronym,# images, Wavelength (angstrom), Distance (mm), Exp. Time (sec), Phi start (deg), Phi range (deg), Xbeam (mm), Ybeam (mm), Detector resol. (angstrom), Comments\n";
            foreach ($rows as $r) {
                $r['COMMENTS'] = '"'.$r['COMMENTS'].'"';
                print implode(',', array_values($r))."\n";
            }
        }


        # ------------------------------------------------------------------------
        # Get dc attachmmnts
        function _get_attachments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('id') && !$this->has_arg('blsampleid') && !$this->has_arg('dcg')) $this->_error('No data collection or sample specified');

            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';

            if ($this->has_arg('id')) {
                $where .= ' AND dca.datacollectionid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('id'));
            }

            if ($this->has_arg('dcg')) {
                $where .= ' AND dc.datacollectiongroupid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('dcg'));
            }

            if ($this->has_arg('aid')) {
                $where .= ' AND dca.datacollectionfileattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('aid'));
            }

            if ($this->has_arg('filetype')) {
                $where .= ' AND dca.filetype LIKE :'.(sizeof($args)+1);
                array_push($args, $this->arg('filetype'));
            }

            if ($this->has_arg('blsampleid')) {
                $where .= ' AND dc.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('blsampleid'));
            }

            $rows = $this->db->pq("SELECT dca.filefullpath, dca.filetype, dca.datacollectionfileattachmentid, dca.datacollectionid, CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) as visit, dc.blsampleid, dc.blsubsampleid, g.dx_mm, g.dy_mm, g.steps_x, g.steps_y, g.orientation, g.snaked
                FROM datacollectionfileattachment dca
                INNER JOIN datacollection dc ON dc.datacollectionid = dca.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                LEFT OUTER JOIN gridinfo g ON g.datacollectiongroupid = dc.datacollectiongroupid
                WHERE $where", $args);

            foreach($rows as &$r) {
                $r['FILENAME'] = basename($r['FILEFULLPATH']);
                $info = pathinfo($r['FILENAME']);
                $r['NAME'] = basename($r['FILENAME'],'.'.$info['extension']);

                $r['FILEFULLPATH'] = preg_replace('/.*\/'.$r['VISIT'].'\//', '', $r['FILEFULLPATH']);

                foreach (array('DX_MM', 'DY_MM', 'STEPS_X', 'STEPS_Y') as $k) {
                    $r[$k] = floatval($r[$k]);
                }
            }


            if ($this->has_arg('aid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such attachment');

            } else $this->_output($rows);
        }


        function _get_attachment() {
            $filesystem = new Filesystem();
            $rows = $this->db->pq("SELECT filefullpath
                FROM datacollectionfileattachment
                WHERE datacollectionid=:1 AND datacollectionfileattachmentid=:2", array($this->arg('id'), $this->arg('aid')));

            if (!sizeof($rows)) $this->_error('No such attachment');

            $filename = $rows[0]['FILEFULLPATH'];

            if ($filesystem->exists($filename)) {
                $response = new BinaryFileResponse($filename);
                $response->headers->set("Content-Type", "application/octet-stream");
                $response->setContentDisposition(
                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                    basename($filename)
                );
                $response->headers->set("Content-Length", filesize($filename));
                $response->send();
            } else {
                error_log("Download file " . $filename . " not found");
                $this->_error('Attachment not found on filesystem', 404);
            }
        }



        # ------------------------------------------------------------------------
        # Download Data
        function _download() {
            $filesystem = new Filesystem();
            session_write_close();
            if (!$this->has_arg('id')) {
                $this->_error('No data collection id specified');
                return;
            }

            $info = $this->db->pq('SELECT ses.visit_number, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir 
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                WHERE dc.datacollectionid=:1', array($this->arg('id')));
            if (sizeof($info) == 0) {
                $this->_error('No data for that collection id');
                return;
            } else $info = $info[0];

            $info['VISIT'] = $this->arg('prop') .'-'.$info['VISIT_NUMBER'];

            $data = str_replace($info['VISIT'], $info['VISIT'].'/.ispyb', $this->ads($info['DIR']).$info['IMP'].'/download/download.zip');

            if ($filesystem->exists($data)) {
                $response = new BinaryFileResponse($data);
                $response->headers->set("Content-Type", "application/octet-stream");
                $response->setContentDisposition(
                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                    $this->arg('id').'_download.zip'
                );
                $response->send();
            } else {
                error_log("Download file " . $data . " not found");
                $this->_error('File not found on filesystem', 404);
            }
        }


        # ------------------------------------------------------------------------
        # Force browser to download file
        # Deprecated function now we are using symfony filesystem
        function _header($f) {
            header("Content-Type: application/octet-stream");
            header("Content-Transfer-Encoding: Binary");
            header("Content-disposition: attachment; filename=\"$f\"");
        }
}
