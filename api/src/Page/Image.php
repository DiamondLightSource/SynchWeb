<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\TemplateParser;

class Image extends Page
{
        
        public static $arg_list = array(
            'crid' => '\d+', 
            'drid' => '\d+', 
            'id' => '\d+', 
            'n' => '\d+', 
            'f' => '\d', 
            'bl' => '[\w\-]+', 
            'w' => '\d+', 
            'fid' => '\d+', 
            'aid' => '\d+', 
            'visit' => '\w+\d+-\d+',
            'thresh' => '\d',
            'res' => '\d',
            'ice' => '\d',
        );

        public static $dispatch = array(array('/id/:id(/n/:n)', 'get', '_xtal_image'),
                              array('/diff/id/:id(/f/:f)(/n/:n)', 'get', '_diffraction_image'),
                              array('/di/id/:id(/thresh/:thresh)(/res/:res)(/ice/:ice)(/n/:n)', 'get', '_diffraction_viewer'),
                              array('/cam/bl/:bl(/n/:n)', 'get', '_forward_webcam'),
                              array('/oav/bl/:bl(/n/:n)', 'get', '_forward_oav'),
                              array('/fa/fid/:id', 'get', '_fault_attachment'),
                              array('/ai/visit/:visit/aid/:aid(/n/:n)', 'get', '_action_image'),
                              array('/dr/:drid', 'get', '_dewar_report_image'),
                              array('/cr/:crid', 'get', '_container_report_image'),
                            );

        # Dewar reports
        function _dewar_report_image() {
            $attachment = $this->db->pq("SELECT attachment 
                FROM dewarreport 
                WHERE dewarreportid = :1", array($this->arg('drid')));
            
            if (!sizeof($attachment)) $this->_error('No such dewar report');
            else $att = $attachment[0]['ATTACHMENT'];
            $this->db->close();

            if (file_exists($att)) {
                $ext = pathinfo($att, PATHINFO_EXTENSION);
                if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) $head = 'image/'.$ext;

                $this->_browser_cache();
                $this->app->contentType($head);
                readfile($att);

            } else $this->_error('No such attachment');
        }


        # Container reports
        function _container_report_image() {
            $attachment = $this->db->pq("SELECT attachmentfilepath
                FROM containerreport 
                WHERE containerreportid = :1", array($this->arg('crid')));
            
            if (!sizeof($attachment)) $this->_error('No such container report');
            else $att = $attachment[0]['ATTACHMENTFILEPATH'];
            $this->db->close();

            if (file_exists($att)) {
                $ext = pathinfo($att, PATHINFO_EXTENSION);
                if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) $head = 'image/'.$ext;

                $this->_browser_cache();
                $this->app->contentType($head);
                readfile($att);

            } else $this->_error('No such attachment');
        }


        # Fault DB Attachments
        function _fault_attachment() {
            $attachments = $this->db->pq("SELECT TO_CHAR(starttime,'YYYY') as year,attachment 
                FROM bf_fault 
                WHERE faultid = :1", array($this->arg('id')));
            
            $this->db->close();
            
            if (sizeof($attachments)) {
                $attachment = $attachments[0]['ATTACHMENT'];
                $year = $attachments[0]['YEAR'];
                $ext = pathinfo($attachment, PATHINFO_EXTENSION);
                
                if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) $head = 'image/'.$ext;
                else $head = 'application/octet-stream';
                
                $this->_browser_cache();
                $this->app->contentType($head);

                $ch = curl_init(); 
                curl_setopt($ch, CURLOPT_URL, 'http://rdb.pri.diamond.ac.uk/php/elog/files/'.$year.'/'.$attachment); 
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0); 
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
                curl_setopt($ch, CURLOPT_BINARYTRANSFER, 1); 
                $file = curl_exec($ch); 
                curl_close($ch);

                echo $file;
            }
            else return;
        
            
        }
        
        
        # ------------------------------------------------------------------------
        # Return images for crystal wash / anneal
        function _action_image() {
            $image = $this->db->pq("SELECT r.xtalsnapshotbefore,r.xtalsnapshotafter 
                FROM robotaction r 
                INNER JOIN blsession s ON r.blsessionid = s.sessionid 
                INNER JOIN proposal p ON s.proposalid = p.proposalid 
                WHERE r.robotactionid=:1 AND CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :2", array($this->arg('aid'), $this->arg('visit')));
            
            if (!sizeof($image)) return;
            else $image = $image[0];
            
            $this->db->close();
            
            $images = array($image['XTALSNAPSHOTAFTER'],$image['XTALSNAPSHOTBEFORE']);
            $n = $this->has_arg('n') ? $this->arg('n') - 1 : 0;
            if ($n < sizeof($images)) {
                $this->_browser_cache();
                $ext = pathinfo($images[$n], PATHINFO_EXTENSION);
                if (file_exists($images[$n])) {
                    $this->app->contentType('image/'.$ext);
                    readfile($images[$n]);
                } else {
                    $this->_error('Not found', 'That image is no longer available');
                }
                
            }
            
        }
        
        
        # Forward xtal images from visit directory to browser
        function _xtal_image() {
            $rows = $this->db->pq('SELECT dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4 
                FROM datacollection dc 
                WHERE dc.datacollectionid=:1', array($this->arg('id')));
            if (!sizeof($rows)) return;
            else $row = $rows[0];

            $this->db->close();
            
            $images = array($row['X1'], $row['X2'], $row['X3'], $row['X4']);
            $n = $this->has_arg('n') ? ($this->arg('n')-1) : 0;
            if ($n < sizeof($images)) {
                $ext = pathinfo($images[$n], PATHINFO_EXTENSION);

                if (file_exists($images[$n])) {
                    $this->_browser_cache();
                    $this->app->contentType('image/'.$ext);
                    readfile($images[$n]);
                } else if (file_exists($images[$n].'.gz')) {
                    $this->_browser_cache();
                    $this->app->contentType('image/'.$ext);
                    readgzfile($images[$n].'.gz');
                } else {
                    $this->_error('Not found', 'That image is no longer available');
                }
                
            } else {
                $this->_browser_cache();
                $this->app->contentType('image/png');
                readfile('assets/images/no_image.png');
            }
        }
        
        # Full size diffraction image viewer
        function _diffraction_viewer() {
            $n = $this->has_arg('n') ? $this->arg('n') : 1;
            
            list($info) = $this->db->pq('SELECT imagedirectory as loc, filetemplate as ft, numberofimages as num, imagesuffix as type 
                FROM datacollection 
                WHERE datacollectionid=:1', array($this->arg('id')));
            
            $this->db->close();
            
            if ($n > $info['NUM']) {
                $this->_error('Not found', 'That image does not exist');
            }

            $im = $info['LOC'] . '/' . $info['FT'];
            $out = '/tmp/' . $this->arg('id') . '_' . $n . ($this->has_arg('thresh') ? '_th' : '') . ($this->has_arg('res') ? '_res' : '') . ($this->has_arg('ice') ? '_ice' : '') . '.jpg';
            global $dials_rest_url, $dials_rest_jwt;
            if (!file_exists($out)) {                
                if (!empty($dials_rest_url) && !empty($dials_rest_jwt)) {
                    $resp = $this->_curl(array(
                        'url' => $dials_rest_url.'/export_bitmap/',
                        'HEADERS' => array(
                            'Content-Type: application/json',
                            'accept: application/json',
                            'Authorization: Bearer ' . $dials_rest_jwt,
                        ),
                        'POST' => 1,
                        'FIELDS' => array(
                            'filename' => $im,
                            'image_index' => $n,
                            'binning' => 4,
                            'display' => $this->has_arg('thresh') ? "threshold" : "image",
                            'colour_scheme' => 'greyscale',
                            'brightness' => $this->has_arg('thresh') ? 1000 : 10,
                            'format' => 'png',
                            'resolution_rings' => array('show' => $this->has_arg('res')),
                            'ice_rings' => array('show' => $this->has_arg('ice')),
                        )
                    ));
                } else {
                    $resp = $this->_curl(array(
                        'url' => 'http://localhost:5000/dc/image',
                        'jwt' => true,
                        'data' => array(
                            'dcid' => $this->arg('id'),
                            'image' => $n,
                            'binning' => 4,
                            'threshold' => $this->has_arg('thresh') ? 1 : 0,
                        )
                    ));
                }

                if ($resp['code'] == 200) {
                    file_put_contents($out, $resp['content']);
                } else if ($resp['code'] == 403) {
                    error_log("Not authorised when asking for grid scan image. Has the JWT token expired?". PHP_EOL);
                    $this->_error('Unauthroised in image service', 'Image server has had an error.');
                } else {
                    error_log("Gridscan failed to contact external service. " . $resp['code'] .  " - " . $resp['content'] . PHP_EOL);
                    $this->_error('Not found', 'Image not provided by image service.');
                }
            }
            
            if (file_exists($out)) {
                $this->_browser_cache();
                $this->app->contentType('image/jpeg');
                $size = filesize($out);
                $this->app->response->headers->set("Content-length", $size);
                readfile($out);
            } else {
                error_log("Grid scan image file no longer exists and should do.");
                $this->_error('Not found', 'That image is no longer available');
            }
        }
        
        
        # Small diffraction image viewer
        function _diffraction_image() {
            global $jpeg_location, $jpeg_thumb_location;

            $args = array('DCID' => $this->arg('id'));
            if ($this->has_arg('n')) $args['IMAGENUMBER'] = $this->arg('n');

            $tmp = new TemplateParser($this->db);
            $jpeg = $tmp->interpolate($this->has_arg('f') ? $jpeg_location : $jpeg_thumb_location, $args);

            if (file_exists($jpeg)) {
                $this->_browser_cache();
                $size = filesize($jpeg);
                $this->app->response->headers->set("Content-length", $size);
                $this->app->contentType('image/'.pathinfo($jpeg, PATHINFO_EXTENSION));
                readfile($jpeg);

            } else {
                $this->_error('Not found', 'That image is not available');
            }
            
        }
        
        
        # ------------------------------------------------------------------------
        # Forward OAV to browser
        function _forward_oav() {
            global $oavs;
            
            if (!array_key_exists($this->arg('bl'), $oavs)) return;
            
            set_time_limit(0);
            #for ($i = 0; $i < ob_get_level(); $i++)
            #    ob_end_flush();
            ob_implicit_flush(1);
            
            while (@ob_end_clean());
            header('content-type: multipart/x-mixed-replace; boundary=--BOUNDARY');
        
            session_write_close();
            $this->db->close();
        
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $oavs[$this->arg('bl')]);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            $im = curl_exec($ch);
            curl_close($ch);
            echo $im;
        }
        
        
        # ------------------------------------------------------------------------
        # Forward beamline webcams
        function _forward_webcam() {
            global $webcams;
            
            if (!array_key_exists($this->arg('bl'), $webcams)) return;
            
            $n = $this->has_arg('n') ? $this->arg('n') : 0;
            if ($n >= sizeof($webcams[$this->arg('bl')])) return;

            $img = $webcams[$this->arg('bl')][$n];

            session_write_close();
            $this->db->close();
            

            set_time_limit(0);
            ob_implicit_flush(1);
            
            while (@ob_end_clean());
            header('content-type: multipart/x-mixed-replace; boundary=myboundary');
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://'.$img.'/axis-cgi/mjpg/video.cgi?fps=5&resolution=CIF&resolution=480x270');
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
            $im = curl_exec($ch);
            curl_close($ch);
        }
        
        
        # ------------------------------------------------------------------------
        # Enable browser cache for static images
        function _browser_cache() {
            $expires = 60*60*24*14;
            $this->app->response->headers->set('Pragma', 'public');
            $this->app->response->headers->set('Cache-Control', 'maxage='.$expires);
            $this->app->response->headers->set('Expires', gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
        }
}
