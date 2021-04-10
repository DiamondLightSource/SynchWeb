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

                              'ppl' => '\w+',
                              'aid' => '\w+',
            
                              'filetype' => '\w+',
                              'blsampleid' => '\d+',
                              'dcg' => '\d+',

                              'download' => '\d',
                              'AUTOPROCPROGRAMID' => '\d+',
                              'AUTOPROCPROGRAMATTACHMENTID' => '\d+',
                              );


        public static $dispatch = array(
                              array('/plots', 'get', '_auto_processing_plots'),
                              array('/csv/visit/:visit', 'get', '_csv_report'),
                              array('/sign', 'post', '_sign_url'),
                              array('/data/visit/:visit', 'get', '_download_visit'),
                              array('/attachments', 'get', '_get_attachments'),
                              array('/attachment/id/:id/aid/:aid', 'get', '_get_attachment'),
                              array('/dc/id/:id', 'get', '_download'),

                              array('/ap/attachments(/:AUTOPROCPROGRAMATTACHMENTID)(/dl/:download)', 'get', '_get_autoproc_attachments'),
                              array('/ap/archive/:AUTOPROCPROGRAMID', 'get', '_get_autoproc_archive'),
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
        # This method either returns a list of plots from MX auto processing tools (n_obs, n_uniq, completeness etc.)
        # Or returns a specific plot based on auto processing attachment id (aid).
        # Individual plotly format Graphs can be returned via an aid, but will not be included in the list of plots (as their format is different)
        function _auto_processing_plots() {
            global $ap_types;
            if (!$this->has_arg('id')) $this->_error('No data collection', 'No data collection id specified');

            $args = array($this->arg('id'));
            $where = '';

            // Are we asking for a specific plot attachment?
            // Example Plotly plots are not included in the general processing results plot types
            if ($this->has_arg('aid')) {
                $where .= ' AND appa.autoprocprogramattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('aid'));
            }

            $rows = $this->db->pq("SELECT appa.filename,
                appa.filepath,
                api.autoprocprogramid,
                appa.autoprocprogramattachmentid,
                app.processingcommandline as type
                FROM autoprocintegration api 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                WHERE appa.filetype='Graph' AND api.datacollectionid = :1 $where", $args);

            foreach ($rows as $k => &$r) {
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

                    $plotData = json_decode($cont);
                    $r['PLOTS'] = $plotData;

                    // We need to check if this is a plotly type (in which case this should be a request for a specific attachment)
                    // A plotly chart must define two keys 'data' and 'layout'
                    $r['PLOTLY'] = false;

                    if (array_key_exists('data', $plotData) && array_key_exists('layout', $plotData)) {
                        // This is a plotly chart
                        // If we are looking for a specific plot (by attachment id) then OK...
                        if($this->has_arg('aid')){
                            $r['PLOTLY'] = true;
                        } else {
                            // ..if not, we should remove this from the list of returned plots
                            // Autoprocessing results use the same bespoke format for charts
                            // and we don't want to include plotly in those aggregated results
                            unset($rows[$k]);
                            continue;
                        }
                    }
                }

                unset($r['FILENAME']);
                unset($r['FILEPATH']);
            }
            // Because we may have removed plotly type plots from the list, we should re-index to provide a consistent array.
            // Also ensures there will be an index at 0 for the first item.
            $results = array_values($rows);
            $this->_output($results);
        }


        # ------------------------------------------------------------------------
        # Return list of attachments for an autoproc run
        function __get_autoproc_attachments() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specific', 'No proposal specified');

            $args = array($this->proposalid);
            $where = '';

            if ($this->has_arg(('FILENAME'))) {
                $where .= " AND appa.filename  LIKE CONCAT('%',:".(sizeof($args)+1)."), '%')";
                array_push($args, $this->arg('FILENAME'));
            }

            if ($this->has_arg('FILETYPE')) {
                $where .= ' AND appa.filetype =:'.(sizeof($args)+1);
                array_push($args, $this->arg('FILETYPE'));
            }

            if ($this->has_arg('AUTOPROCPROGRAMID')) {
                $where .= ' AND app.autoprocprogramid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMID'));
            }

            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                $where .= ' AND appa.autoprocprogramattachmentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('AUTOPROCPROGRAMATTACHMENTID'));
            }

            $rows = $this->db->union(array(
                "SELECT app.autoprocprogramid, appa.filename, appa.filepath, appa.filetype, appa.autoprocprogramattachmentid, dc.datacollectionid, appa.importancerank
                FROM autoprocintegration api 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                WHERE s.proposalid=:1 $where",
                "SELECT app.autoprocprogramid, appa.filename, appa.filepath, appa.filetype, appa.autoprocprogramattachmentid, dc.datacollectionid, appa.importancerank
                FROM autoprocprogram app
                INNER JOIN processingjob pj on pj.processingjobid = app.processingjobid
                INNER JOIN autoprocprogramattachment appa ON appa.autoprocprogramid = app.autoprocprogramid 
                INNER JOIN datacollection dc ON dc.datacollectionid = pj.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                WHERE s.proposalid=:1 $where
                ORDER BY importancerank"
            ), $args);

            return $rows;
        }


        function _get_autoproc_attachments() {
            $rows = $this->__get_autoproc_attachments();
            if ($this->has_arg('AUTOPROCPROGRAMATTACHMENTID')) {
                if (!sizeof($rows)) $this->_error('No such attachment');
                else  {
                    if ($this->has_arg('download')) {
                        $this->_get_file($rows[0]['AUTOPROCPROGRAMID'], $rows[0]);
                    } else $this->_output($rows[0]);
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

                # Set mime / content type
                $this->set_mime_content($response, $file['FILENAME'], $id);

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

                $this->set_mime_content($response, $filename);
                $response->headers->set("Content-Length", filesize($filename));
                $response->send();
            } else {
                error_log("Download file " . $filename . " not found");
                $this->_error('Attachment not found on filesystem', 404);
            }
        }


        # ------------------------------------------------------------------------
        # Get an archive of an autoproc
        function _get_autoproc_archive() {
            if (!$this->has_arg('prop')) {
                $this->_error('No proposal specific', 'No proposal specified');
            }

            $aps = $this->db->union(
                array(
                    "SELECT app.autoprocprogramid, app.processingprograms, app.processingstatus
                    FROM autoprocintegration api 
                    INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                    INNER JOIN datacollection dc ON dc.datacollectionid = api.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                    WHERE s.proposalid=:1 AND app.autoprocprogramid=:2",
                    "SELECT app.autoprocprogramid, app.processingprograms, app.processingstatus
                    FROM autoprocprogram app
                    INNER JOIN processingjob pj on pj.processingjobid = app.processingjobid
                    INNER JOIN datacollection dc ON dc.datacollectionid = pj.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                    WHERE s.proposalid=:1 AND app.autoprocprogramid=:2",
                ),
                array($this->proposalid, $this->arg('AUTOPROCPROGRAMID'))
            );

            if (!sizeof($aps)) {
                return $this->_error('No such auto processing');
            }
            $ap = $aps[0];

            $files = $this->__get_autoproc_attachments();
            if (!sizeof($files)) {
                return $this->_error('No files to archive');
            }

            $clean_program = preg_replace('/[^A-Za-z0-9\-]/', '', $ap['PROCESSINGPROGRAMS']);
            $tar = '/tmp/' . $this->arg('AUTOPROCPROGRAMID') . '_' . $clean_program . '.tar';
            $gz = $tar . '.gz';

            $a = new \PharData($tar);
            foreach ($files as $file) {
                $filename = $file['FILEPATH'] . '/' . $file['FILENAME'];
                $a->addFile($filename, basename($filename));
            }
            $a->compress(\Phar::GZ);
            unlink($tar);

            $response = new BinaryFileResponse($gz);
            $response->headers->set("Content-Type", "application/octet-stream");
            $response->setContentDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                $this->arg('AUTOPROCPROGRAMID') . '_' . $clean_program . '.tar.gz'
            );
            $response->deleteFileAfterSend(true);
            $response->send();
            exit();

        }


        # ------------------------------------------------------------------------
        # Set mime and content type for a file
        /** 
         * Set mime and content type headers for the provided response.
         * Determines the mime type from the filename extension.
         * 
         * @param BinaryFileResponse $response Symfony Response Object
         * @param string $filename Filename to be downloaded (will use basename in case file path is provided)
         * @param string $prefix Add this string to the filename "prefix_filename"
         * @return void
         */
        function set_mime_content($response, $filename, $prefix=null) {
            $path_ext = pathinfo($filename, PATHINFO_EXTENSION);
            // If we are downloading the file (not inline) then set a sensible name
            $saved_filename = $prefix ? implode('_', array($prefix, basename($filename))) : basename($filename);

            if (in_array($path_ext, array('html', 'htm'))) {
                $response->headers->set("Content-Type", "text/html");
                $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
            } elseif ($path_ext == 'pdf') {
                $response->headers->set("Content-Type", "application/pdf");
                $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $saved_filename);
            } elseif ($path_ext == 'png') {
                $response->headers->set("Content-Type", "image/png");
                $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $saved_filename);
            } elseif (in_array($path_ext, array('jpg', 'jpeg'))) {
                $response->headers->set("Content-Type", "image/jpeg");
                $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $saved_filename);
            } elseif (in_array($path_ext, array('log', 'txt', 'error', 'LP', 'json'))) {
                $response->headers->set("Content-Type", "text/plain");
                $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE);
            } else {
                $response->headers->set("Content-Type", "application/octet-stream");
                $response->setContentDisposition(
                    ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                    $saved_filename
                );    
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

            $info = $this->db->pq('SELECT s.visit_number, dc.datacollectionnumber as scan, dc.imageprefix as imp, dc.imagedirectory as dir
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
