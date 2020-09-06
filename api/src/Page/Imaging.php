<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\ImagingShared;

class Imaging extends Page
{


        public static $arg_list = array('cid' => '\d+',
                                        'iid' => '\d+',
                                        'imid' => '\d+',
                                        'itid' => '\d+',
                                        'igid' => '\d+',
                                        'shid' => '\d+',
                                        'shcid' => '\d+',
                                        'scid' => '\d+',
                                        'sccid' => '\d+',
                                        'scgid' => '\d+',
                                        'sid' => '\d+',
                                        'f' => '\d',
                                        'did' => '\d+',
                                        'all' => '\d',
                                        'allStates' => '\d',
                                        'delta' => '\d',

                                        'SCHEDULEID' => '\d+',
                                        'SCHEULECOMPONENTID' => '\d+',
                                        'CONTAINERID' => '\d+',
                                        'CONTAINERINSPECTIONID' => '\d+',
                                        'IMAGERID' => '\d+',
                                        'TEMPERATURE' => '\d+',
                                        'INSPECTIONTYPEID' => '\d+',
                                        'BLSAMPLEID' => '\d+',
                                        'BLSAMPLEIMAGESCOREID' => '\d+',
                                        'COMMENTS' => '.*',
                                        'NAME' => '[\w|\s|-]+',
                                        'MANUAL' => '\d',
                                        'OFFSET_HOURS' => '\d+',
                                        'BLTIMESTAMP' => '\d\d-\d\d-\d\d\d\d \d\d:\d\d',

                                        'POSITION' => '\d+',
                                        'SCREENID' => '\d+',
                                        'PROPOSALID' => '\d+',
                                        'COMPONENTID' => '\d+',
                                        'GLOBAL' => '\d',
                                        'SCREENCOMPONENTGROUPID' => '\d+',
                                        'SCREENCOMPONENTID' => '\d+',
                                        'CONCENTRATION' => '\d+(.\d+)?',
                                        'PH' => '\d+(.\d+)?',

                                        'BLSAMPLEIMAGEAUTOSCORESCHEMAID' => '\d',
                               );
        

        public static $dispatch = array(array('/inspection(/:iid)', 'get', '_get_inspections'),
                                        array('/inspection/locations/:barcode', 'get', '_get_locations'),
                                        array('/inspection', 'post', '_add_inspection'),

                                        array('/inspection/images(/:imid)(/iid/:iid)', 'get', '_get_inspection_images'),
                                        array('/inspection/images', 'post', '_add_inspection_image'),
                                        array('/inspection/images/:imid', 'patch', '_update_inspection_image'),

                                        array('/inspection/images/scores', 'get', '_get_image_scores'),
                                        array('/inspection/images/scores/auto', 'get', '_get_auto_scores'),
                                        array('/inspection/images/scores/auto/schemas', 'get', '_get_auto_score_schemas'),

                                        array('/inspection/image/:imid', 'get', '_get_image'),

                                        array('/inspection/types(/:itid)', 'get', '_get_inspection_types'),

                                        array('/inspection/adhoc', 'get', '_add_adhoc_inspection'),

                                        
                                        array('/imager(/:igid)', 'get', '_get_imagers'),


                                        array('/schedule(/:shid)', 'get', '_get_schedules'),
                                        array('/schedule/:shid', 'patch', '_update_schedule'),
                                        array('/schedule', 'post', '_add_schedule'),


                                        array('/schedule/components(/:shcid)(/shid/:shid)', 'get', '_get_schedule_components'),
                                        array('/schedule/components', 'post', '_add_schedule_component'),
                                        array('/schedule/components/:shcid', 'put', '_update_schedule_component'),



                                        array('/screen(/:scid)', 'get', '_get_screens'),
                                        array('/screen', 'post', '_add_screen'),
                                        array('/screen/:scid', 'patch', '_update_screen'),

                                        array('/screen/groups(/:scgid)', 'get', '_get_screen_componentgroups'),
                                        array('/screen/groups', 'post', '_add_screen_componentgroup'),
                                        array('/screen/groups', 'put', '_add_screen_componentgroups'),
                                        array('/screen/groups/:scgid', 'patch', '_update_screen_componentgroup'),

                                        array('/screen/components(/:sccid)', 'get', '_get_screen_components'),
                                        array('/screen/components', 'post', '_add_screen_component'),
                                        array('/screen/components', 'put', '_add_screen_components'),
                                        array('/screen/components/:sccid', 'patch', '_update_screen_component'),
                                        array('/screen/components/:sccid', 'put', '_update_screen_component_full'),
                                        array('/screen/components/:sccid', 'delete', '_delete_screen_component'),
                             );

        # Initialise shared functions
        function __construct() {
            call_user_func_array(array('parent', '__construct'), func_get_args());

            $this->shared = new ImagingShared($this->db);
        }


        # Returns a list of drop numbers for a plate identified by its unique barcode
        # For use on Formulatrix via ImagerLink
        function _get_locations(){
            $args = array();
            array_push($args, $this->arg('barcode'));
	
            $locations = $this->db->pq("SELECT location FROM BLSample s INNER JOIN Container c ON s.containerId = c.containerId WHERE barcode=:1", $args);

            if(sizeof($locations))
                $this->_output($locations);
            else
                $this->_error('Barcode not found, or no valid locations for container', 404);
        }


        function _get_imagers() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('igid')) {
                $where .= ' AND i.imagerid=:1';
                array_push($args, $this->arg('igid'));
            }

            $imagers = $this->db->pq("SELECT i.capacity, i.imagerid, i.name, i.temperature, i.serial, count(c.containerid) as containers, ROUND(COUNT(c.containerid)/i.capacity*100,1) as pusage
              FROM imager i 
              LEFT OUTER JOIN container c ON c.imagerid = i.imagerid
              WHERE $where
              GROUP BY i.capacity, i.imagerid, i.name, i.temperature, i.serial
              ", $args);

            if ($this->has_arg('igid')) {
                if (sizeof($imagers)) $this->_output($imagers[0]);
                else $this->_error('No such imager');
            } else $this->_output($imagers);
        }




        function _get_schedules() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('shid')) {
                $where .= ' AND s.scheduleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('shid'));
            }

            $schedules = $this->db->pq("SELECT s.scheduleid, s.name, count(distinct sc.schedulecomponentid) as schedulecomponents, count(distinct c.containerid) as containers
              FROM schedule s
              LEFT OUTER JOIN schedulecomponent sc ON sc.scheduleid = s.scheduleid
              LEFT OUTER JOIN container c ON c.scheduleid = s.scheduleid
              WHERE $where
              GROUP BY s.scheduleid, s.name", $args);

            if ($this->has_arg('shid')) {
                if (sizeof($schedules)) $this->_output($schedules[0]);
                else $this->_error('No such schedule');

            } else $this->_output($schedules);
        }


        function _add_schedule() {
            $this->user->can('schedules');

            if (!$this->has_arg('NAME')) $this->_error('No name specified');

            $this->db->pq("INSERT INTO schedule (scheduleid, name) 
              VALUES (s_schedule.nextval, :1) RETURNING scheduleid INTO :id", array($this->arg('NAME')));

            $this->_output(array('SCHEDULEID' => $this->db->id()));
        }


        function _update_schedule() {
            $this->user->can('schedules');

            if (!$this->has_arg('shid')) $this->_error('No schedule specified');

            $sch = $this->db->pq("SELECT scheduleid FROM schedule WHERE scheduleid=:1", array($this->arg('shid')));
            if (!sizeof($sch)) $this->_error('No such schedule');

            foreach(array('NAME') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE schedule SET '.$f.'=:1 WHERE scheduleid=:2', array($this->arg($f), $this->arg('shid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }




        function _get_schedule_components() {
            $where = '1=1';
            $args = array();
            $join = '';


            if ($this->has_arg('shid')) {
                $where .= ' AND sc.scheduleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('shid'));
            }

            if ($this->has_arg('shcid')) {
                $where .= ' AND sc.schedulecomponentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('shcid'));
            }

            if ($this->has_arg('cid')) {
                $where .= ' AND ci.containerid=:'.(sizeof($args)+1);
                $join = 'LEFT OUTER JOIN containerinspection ci ON ci.schedulecomponentid = sc.schedulecomponentid';
                array_push($args, $this->arg('cid'));
            }


            $components = $this->db->pq("SELECT sc.schedulecomponentid, sc.inspectiontypeid, sc.scheduleid, sc.offset_hours, t.name as inspectiontype
              FROM schedulecomponent sc
              INNER JOIN inspectiontype t ON t.inspectiontypeid = sc.inspectiontypeid
              $join
              WHERE $where
              ORDER BY sc.offset_hours", $args);


            if ($this->has_arg('shcid')) {
                if (sizeof($components)) $this->_output($components[0]);
                else $this->_error('No such component');

            } else $this->_output($components);
        }


        function _add_schedule_component() {
            $this->user->can('schedule_comps');

            if (!$this->has_arg('SCHEDULEID')) $this->_error('No schedule specified');
            if (!$this->has_arg('OFFSET_HOURS')) $this->_error('No time offset specified');
            if (!$this->has_arg('INSPECTIONTYPEID')) $this->_error('No inspection type specified');

            $sch = $this->db->pq("SELECT scheduleid FROM schedule WHERE scheduleid=:1", array($this->arg('SCHEDULEID')));
            if (!sizeof($sch)) $this->_error('No such schedule');

            $this->db->pq("INSERT INTO schedulecomponent (schedulecomponentid, scheduleid, offset_hours, inspectiontypeid)
              VALUES (s_schedulecomponent.nextval, :1, :2, :3) RETURNING schedulecomponentid INTO :id", array($this->arg('SCHEDULEID'), $this->arg('OFFSET_HOURS'), $this->arg('INSPECTIONTYPEID')));

            $this->_output(array('SCHEDULECOMPONENTID' => $this->db->id()));
        }


        function _update_schedule_component() {
            $this->user->can('schedule_comps');

            if (!$this->has_arg('shcid')) $this->_error('No schedule component specified');
            if (!$this->has_arg('OFFSET_HOURS')) $this->_error('No offset specified');
            if (!$this->has_arg('INSPECTIONTYPEID')) $this->_error('No type specified');

            $sc = $this->db->pq("SELECT schedulecomponentid FROM schedulecomponent WHERE schedulecomponentid=:1", array($this->arg('shcid')));
            if (!sizeof($sc)) $this->_error('No such schedule component');

            $this->db->pq("UPDATE schedulecomponent SET offset_hours=:1, inspectiontypeid=:2 WHERE schedulecomponentid=:3", 
              array($this->arg('OFFSET_HOURS'), $this->arg('INSPECTIONTYPEID'), $this->arg('shcid')));

            $this->_output(array(
              'OFFSET_HOURS' => $this->arg('OFFSET_HOURS'),
              'INSPECTIONTYPEID' => $this->arg('INSPECTIONTYPEID'),
            ));
        }




        function _get_inspection_types() {
            $where = '1=1';
            $args = array();

            if ($this->has_arg('itid')) {
                $where .= ' AND inspectiontypeid=:1';
                array_push($args, $this->arg('itid'));
            }

            $types = $this->db->pq("SELECT inspectiontypeid, name FROM inspectiontype WHERE $where", $args);

            if ($this->has_arg('itid')) {
                if (sizeof($types)) $this->_output($types[0]);
                else $this->_error('No such inspection type');
            } else $this->_output($types);
        }



        # Get list of inspections for a container
        function _get_inspections() {
            global $img;

            $join = '';
            $extc = '';

            if (!$this->has_arg('cid') &&
              !$this->has_arg('iid') &&
             (!$this->staff || !$this->has_arg('all'))) $this->_error('No container / inspection specified');

            if (($this->has_arg('all') && $this->staff) || in_array($_SERVER["REMOTE_ADDR"], $img)) {
                $where = '1=1';
                $args = array();
            } else {
                $where = 'p.proposalid = :1';
                $args = array($this->proposalid);
            }

            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }

            if ($this->has_arg('iid')) { 
                $where .= ' AND i.containerinspectionid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('iid'));
            } else {
                if (!$this->has_arg('allStates')) $where .= " AND i.state='Completed'";
            }

            $tot = $this->db->pq("SELECT count(i.containerinspectionid) as tot FROM containerinspection i
              INNER JOIN container c ON c.containerid = i.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE $where", $args);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $start = 0;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $order = 'sc.offset_hours, i.bltimestamp';
            
            if ($this->has_arg('sort_by')) {
                $cols = array(
                  'SCHEDULEDTIMESTAMP' => 'i.scheduledtimestamp', 
                  'BLTIMESTAMP' => 'i.bltimestamp', 
                  'STATE' => 'i.state',
                  'SCHEDULECOMPONENTID' => 'i.schedulecomponentid',
                  'MANUAL' => 'i.manual',
                  'IMAGESSCORED' => 'imagesscored',
                  'CONTAINER' => 'c.code',
                );
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }

            if ($this->has_arg('s')) {
                $where .= " AND (LOWER(CONCAT(p.proposalcode, p.proposalnumber)) LIKE LOWER(CONCAT(CONCAT('%', :".(sizeof($args)+1)."), '%')) OR LOWER(c.code) LIKE LOWER(CONCAT(CONCAT('%', :".(sizeof($args)+2)."), '%')))";
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }

            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'COMPLETED') $where .= " AND i.state = 'Completed' AND i.manual=0";
                if ($this->arg('ty') == 'INCOMPLETE') $where .= " AND i.state != 'Completed'";
                if ($this->arg('ty') == 'SCHEDULED') $where .= " AND i.scheduledtimestamp IS NOT NULL AND i.state != 'Completed'";
                if ($this->arg('ty') == 'ADHOC') $where .= " AND i.schedulecomponentid IS NULL";
                if ($this->arg('ty') == 'MANUAL') $where .= " AND i.manual=1";
            }

            if ($this->has_arg('delta')) {
                $join = 'LEFT OUTER JOIN containerinspection i2 ON i.containerid = i2.containerid AND i2.schedulecomponentid IS NOT NULL';
                $extc = ", ROUND(TIMESTAMPDIFF('MINUTE', min(i2.bltimestamp), i.bltimestamp)/(60*24),1) as delta, CONCAT(CONCAT(CONCAT(CONCAT(TO_CHAR(i.bltimestamp, 'HH24:MI DD-MM-YYYY'), ' (+'), ROUND(TIMESTAMPDIFF('HOUR', case when min(i2.bltimestamp) is not null then min(i2.bltimestamp) else i.bltimestamp end, i.bltimestamp)/24,1)), 'd) '), (case when i.manual=1 then '[Manual]' else (case when i.schedulecomponentid is null then '[Adhoc]' else '' end) end)) as title";
            }

            $inspections = $this->db->paginate("SELECT ROUND(TIMESTAMPDIFF('HOUR', i.bltimestamp, CURRENT_TIMESTAMP)/24,1) as age, ROUND(TIMESTAMPDIFF('MINUTE', i.scheduledtimestamp, i.bltimestamp)/(24*60),2) as dwell, c.code as container, CONCAT(p.proposalcode, p.proposalnumber) as prop, TO_CHAR(min(im.modifiedtimestamp), 'DD-MM-YYYY HH24:MI') as imagesscoredtimestamp, case when count(im.blsampleimageid) > 0 then 1 else 0 end as imagesscored,
                TO_CHAR(i.scheduledtimestamp, 'DD-MM-YYYY HH24:MI') as scheduledtimestamp, sc.offset_hours, i.priority, i.state, i.schedulecomponentid, i.manual, img.name as imager, it.name as inspectiontype, i.containerinspectionid, i.containerid, i.inspectiontypeid, i.temperature, TO_CHAR(i.bltimestamp, 'DD-MM-YYYY HH24:MI') as bltimestamp, i.imagerid, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses.visit_number) as visit, ses.visit_number, TIMESTAMPDIFF('MINUTE', i.bltimestamp, i.completedtimestamp) as duration $extc
                FROM containerinspection i
                LEFT OUTER JOIN schedulecomponent sc ON sc.schedulecomponentid = i.schedulecomponentid
                LEFT OUTER JOIN blsampleimage im ON im.containerinspectionid = i.containerinspectionid AND im.blsampleimagescoreid IS NOT NULL
                INNER JOIN inspectiontype it ON it.inspectiontypeid = i.inspectiontypeid
                INNER JOIN container c ON c.containerid = i.containerid
                LEFT OUTER JOIN imager img ON img.imagerid = i.imagerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                LEFT OUTER JOIN blsession ses ON ses.sessionid = c.sessionid
                $join
                WHERE $where
                GROUP BY i.containerinspectionid
                ORDER BY $order", $args);


            if ($this->has_arg('iid')) {
                if (!sizeof($inspections)) $this->_error('No such inspection');
                else $this->_output($inspections[0]);

            } else $this->_output(array('total' => intval($tot[0]['TOT']), 'data' => $inspections));
        }


        function _add_inspection() {
            if (!$this->has_arg('CONTAINERID')) $this->_error('No container specified');
            if (!$this->has_arg('INSPECTIONTYPEID')) $this->_error('No inspection type specified');

            if (!$this->has_arg('IMAGERID') && !$this->has_arg('TEMPERATURE')) $this->_error('No temperature specified');

            if ($this->has_arg('IMAGERID')) {
                $imager = $this->db->pq("SELECT temperature FROM imager WHERE imagerid=:1", array($args['IMAGERID']));
                if (!sizeof($imager)) $this->error('No such imager');
                $temp = $imager[0]['TEMPERATURE'];

            } else {
                $temp = $this->arg('TEMPERATURE');
            }

            $man = $this->has_arg('MANUAL') ? 1 : 0;


            $cont = $this->db->pq("SELECT c.containerid FROM container c
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE p.proposalid = :1 AND c.containerid = :2", array($this->proposalid, $this->arg('CONTAINERID')));

            if (!sizeof($cont)) $this->error('No such container');


            $args = array('CONTAINERID' => $this->arg('CONTAINERID'),
                          'INSPECTIONTYPEID' => $this->arg('INSPECTIONTYPEID'),
                          'IMAGERID' => $this->has_arg('IMAGERID') ? $this->arg('IMAGERID') : null,
                          'TEMPERATURE' => $temp,
                          'MANUAL' => $man,
                          'STATE' => 'Completed',
                          'BLTIMESTAMP' => $this->arg('BLTIMESTAMP'),
                          );

            $id = $this->shared->_do_insert_inspection($args);
            $this->_output(array('CONTAINERINSPECTIONID' => $id));
        }



        function _add_adhoc_inspection() {
            if (!$this->has_arg('cid')) $this->_error('No container specified');
            if (!$this->has_arg('INSPECTIONTYPEID')) $this->_error('No inspection type specified');

            $cont = $this->db->pq("SELECT c.containerid FROM container c
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE p.proposalid = :1 AND c.containerid = :2", array($this->proposalid, $this->arg('cid')));

            if (!sizeof($cont)) $this->error('No such container');

            $last = $this->db->pq("SELECT i.containerid 
              FROM containerinspection i
              WHERE i.state != 'Completed' AND i.schedulecomponentid IS NULL AND i.manual!=1 AND i.containerid=:1", 
              array($this->arg('cid')));

            if (sizeof($last)) $this->_error('Container already schedule for adhoc inspection');

            $args = array('CONTAINERID' => $this->arg('cid'),
                          'INSPECTIONTYPEID' => $this->arg('INSPECTIONTYPEID'),
                          'MANUAL' => 0,
                          'PRIORITY' => 99,
                          'SCHEDULEDTIMESTAMP' => date('d-m-Y H:m')
                          );

            $id = $this->shared->_do_insert_inspection($args);
            $this->_output(1);
        }



        # Get a list of sample images avaialble for an inspection
        function _get_inspection_images() {
            $where = '';
            $args = array($this->proposalid);

            if ($this->has_arg('iid')) {
                $where .= ' AND i.containerinspectionid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('iid'));
            }

            if ($this->has_arg('imid')) {
                $where .= ' AND si.blsampleimageid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('imid'));
            }

            if ($this->has_arg('sid')) {
                $where .= ' AND si.blsampleid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));
            }


            $images = $this->db->pq("SELECT i.containerid, si.containerinspectionid, ROUND(TIMESTAMPDIFF('HOUR', min(i2.bltimestamp), i.bltimestamp)/24,1) as delta, si.blsampleimageid, si.blsampleid, si.micronsperpixelx, si.micronsperpixely, si.blsampleimagescoreid, si.comments, TO_CHAR(si.bltimestamp, 'DD-MM-YYYY HH24:MI') as bltimestamp, sc.name as scorename, sc.score, sc.colour as scorecolour
              FROM blsampleimage si
              LEFT OUTER JOIN blsampleimagescore sc ON sc.blsampleimagescoreid = si.blsampleimagescoreid
              INNER JOIN containerinspection i ON i.containerinspectionid = si.containerinspectionid
              LEFT OUTER JOIN containerinspection i2 ON i.containerid = i2.containerid

              INNER JOIN container c ON c.containerid = i.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE p.proposalid = :1 $where
              GROUP BY i.containerid, si.containerinspectionid, i.bltimestamp, si.blsampleimageid, si.blsampleid, si.micronsperpixelx, si.micronsperpixely, si.blsampleimagescoreid, si.comments, TO_CHAR(si.bltimestamp, 'DD-MM-YYYY HH24:MI'), sc.name, sc.score, sc.colour
              ORDER BY i.bltimestamp", $args);


            if ($this->has_arg('imid')) {
                if (sizeof($images)) $this->_output($images[0]);
                else $this->_error('No such image');
            } else $this->_output($images);
        }


        function _add_inspection_image() {
            global $upload_directory;
            if (!$this->has_arg('CONTAINERINSPECTIONID')) $this->_error('No inspection specified');
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');

            if (array_key_exists('IMAGE', $_FILES)) {
                if ($_FILES['IMAGE']['name']) {
                    $info = pathinfo($_FILES['IMAGE']['name']);
                    
                    if (in_array($info['extension'], array('jpg', 'png'))) {
                        $id = $this->shared->_do_insert_inspection_image(array(
                            'CONTAINERINSPECTIONID' => $this->arg('CONTAINERINSPECTIONID'),
                            'BLSAMPLEID' => $this->arg('BLSAMPLEID'),
                            'PROPOSALID' => $this->proposalid,
                        ));

                        # Follow same syntax as formulatrix images
                        $root = $upload_directory.'/imaging/'.$this->arg('CONTAINERINSPECTIONID');
                        if (!file_exists($root)) mkdir($root, 0777, true);
                        $file = $root.'/'.$id.'.'.$info['extension'];
                        move_uploaded_file($_FILES['IMAGE']['tmp_name'], $file);
                        $this->_create_thumb($file);

                        $this->db->pq("UPDATE blsampleimage SET imagefullpath=:1 WHERE blsampleimageid=:2", array($file, $id));

                        $this->_output(array('BLSAMPLEIMAGEID' => $id));
                    }
                }
            }
        }

        function _create_thumb($file) {
            $info = pathinfo($file);
            $img = imagecreatefromjpeg($file);
            $w = imagesx($img);
            $h = imagesy($img);

            $nw = 200;
            $nh = floor((200/$w)*$h);

            $new = imagecreatetruecolor($nw, $nh);
            imagecopyresized($new, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);

            $info = pathinfo($file);
            imagejpeg($new, str_replace('.'.$info['extension'], 'th.'.$info['extension'], $file));
        }



        function _update_inspection_image() {
            if (!$this->has_arg('imid')) $this->_error('No inspection image specified');

            $image = $this->db->pq("SELECT si.blsampleimageid
              FROM blsampleimage si
              INNER JOIN containerinspection i ON i.containerinspectionid = si.containerinspectionid
              INNER JOIN container c ON c.containerid = i.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE p.proposalid = :1 AND si.blsampleimageid=:2", array($this->proposalid, $this->arg('imid')));

            if (!sizeof($image)) $this->_error('No such image');

            foreach(array('COMMENTS', 'BLSAMPLEIMAGESCOREID') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE blsampleimage SET '.$f.'=:1, modifiedtimestamp=CURRENT_TIMESTAMP WHERE blsampleimageid=:2', array($this->arg($f), $this->arg('imid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

        }






        function _get_image_scores() {
            // $db = array(
            //   array(1, 'Clear', 0, '#ccccc'),
            //   array(2, 'Contaminated', 1, '#fffd96'),
            //   array(3, 'Light Precipitate', 2, '#fdfd96'),
            //   array(4, 'Phase Separation', 5, '#fdfd96'),
            //   array(5, 'Spherulites / Interesting', 6, '#ffb347'),
            //   array(6, 'Microcrystals / Sea Urchin', 6, '#ffb347'),
            //   array(7, '1D Crystals', 7, '#87ceeb'),
            //   array(8, '2D Crystals', 8, '#77dd77'),
            //   array(9, '3D Crystals', 9, '#77dd77'),
            //   array(10, 'Heavy Precipitate', 3, '#ff6961'),
            //   array(11, 'Gelatinous precipitate', 4, '')
            // );

            // foreach ($db as $b) {
            //     $this->db->pq("INSERT INTO blsampleimagescore (blsampleimagescoreid, name, score, colour) 
            //       VALUES (s_blsampleimagescore.nextval, :1, :2, :3)", array($b[1], $b[2], $b[3]));
            // }

            $scores = $this->db->pq("SELECT blsampleimagescoreid, name, score, colour, CONCAT(score, ' - ', name) as title FROM blsampleimagescore ORDER BY score");
            $this->_output($scores);
        }


        function _get_auto_score_schemas() {
            if (!$this->has_arg('CONTAINERINSPECTIONID')) $this->_error('No container inspection specified');

            $rows = $this->db->pq("SELECT  distinct sass.blsampleimageautoscoreschemaid, sass.schemaname
                FROM containerinspection ci
                INNER JOIN blsampleimage si ON si.containerinspectionid = ci.containerinspectionid
                INNER JOIN blsampleimage_has_autoscoreclass as shasc ON si.blsampleimageid = shasc.blsampleimageid
                INNER JOIN blsampleimageautoscoreclass sasc ON sasc.blsampleimageautoscoreclassid = shasc.blsampleimageautoscoreclassid
                INNER JOIN blsampleimageautoscoreschema sass ON sass.blsampleimageautoscoreschemaid = sasc.blsampleimageautoscoreschemaid
                INNER JOIN container c ON c.containerid = ci.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                WHERE ci.containerinspectionid = :1 AND s.proposalid = :2", 
                array($this->arg("CONTAINERINSPECTIONID"), $this->proposalid));

            $this->_output($rows);
        }

        function _get_auto_scores() {
            if (!$this->has_arg('CONTAINERINSPECTIONID')) $this->_error('No container inspection specified');
            if (!$this->has_arg('BLSAMPLEIMAGEAUTOSCORESCHEMAID')) $this->_error('No schema specified');

            $rows = $this->db->pq("SELECT si.blsampleimageid, sasc.blsampleimageautoscoreclassid, sasc.scoreclass, shasc.probability
                FROM containerinspection ci
                INNER JOIN blsampleimage si ON si.containerinspectionid = ci.containerinspectionid
                INNER JOIN blsampleimage_has_autoscoreclass as shasc ON si.blsampleimageid = shasc.blsampleimageid
                INNER JOIN blsampleimageautoscoreclass sasc ON sasc.blsampleimageautoscoreclassid = shasc.blsampleimageautoscoreclassid
                INNER JOIN blsampleimageautoscoreschema sass ON sass.blsampleimageautoscoreschemaid = sasc.blSampleImageAutoScoreSchemaId
                INNER JOIN container c ON c.containerid = ci.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                WHERE ci.containerinspectionid = :1 AND s.proposalid = :2 AND sass.blsampleimageautoscoreschemaid = :3", 
                array($this->arg("CONTAINERINSPECTIONID"), $this->proposalid, $this->arg('BLSAMPLEIMAGEAUTOSCORESCHEMAID')));

            $inspection = array();
            foreach ($rows as $r) {
                if (!array_key_exists($r['BLSAMPLEIMAGEID'], $inspection)) $inspection[$r['BLSAMPLEIMAGEID']] = array(
                    'BLSAMPLEIMAGEID' => $r['BLSAMPLEIMAGEID'],
                    'CLASSES' => array(),
                );

                $inspection[$r['BLSAMPLEIMAGEID']]['CLASSES'][$r['SCORECLASS']] = floatval($r['PROBABILITY']);
            }

            $this->_output(array_values($inspection));
        }



        function _get_image() {
            if (!$this->has_arg('imid')) $this->_error('No image specified');

            $im = $this->db->pq("SELECT si.imagefullpath 
              FROM blsampleimage si
              INNER JOIN containerinspection i ON i.containerinspectionid = si.containerinspectionid
              INNER JOIN container c ON c.containerid = i.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE si.blsampleimageid=:1", array($this->arg('imid')));

            if (!sizeof($im)) $this->_error('No such image');
            else {
                $file = $im[0]['IMAGEFULLPATH'];
                if (file_exists($file)) {
                    $ext = pathinfo($file, PATHINFO_EXTENSION);
                    if (in_array($ext, array('png', 'jpg', 'jpeg', 'gif'))) $head = 'image/'.$ext;

                    if (!$this->has_arg('f')) {
                        $th = str_replace('.'.$ext, 'th.'.$ext, $file);
                        if (!file_exists($th)) $this->_create_thumb($file);
                        $file = $th;
                    }

                    $expires = 60*60*24*14;
                    // $this->app->response->headers->set('Pragma', 'public');
                    $this->app->response->headers->set('Cache-Control', 'max-age='.$expires);
                    $this->app->response->headers->set('Expires', gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
                    $this->app->contentType($head);
                    $this->app->response()->header('Content-Length', filesize($file));
                    readfile($file);

                } else $this->_error('No such image');
            }
        }


        function _get_screens() {
            $where = ' (s.proposalid=:1 OR s.global = 1)';
            $args = array($this->proposalid);

            if ($this->has_arg('scid')) {
                $where .= ' AND s.screenid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('scid'));
            }

            $screens = $this->db->pq("SELECT 96 as capacity, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.global, s.name, s.screenid, s.proposalid, count(distinct sg.screencomponentgroupid) as groups, count(distinct sc.screencomponentid) as components
              FROM screen s
              LEFT OUTER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              LEFT OUTER JOIN screencomponent sc ON sc.screencomponentgroupid = sg.screencomponentgroupid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE $where
              GROUP BY CONCAT(p.proposalcode, p.proposalnumber), s.global, s.name, s.screenid, s.proposalid", $args);

            if ($this->has_arg('scid')) {
                if (sizeof($screens)) $this->_output($screens[0]);
                else $this->_error('No such screen');

            } else $this->_output($screens);
        }


        function _add_screen() {
            if (!$this->has_arg('NAME')) $this->_error('No screen name provided');

            $this->db->pq("INSERT INTO screen (screenid, name, proposalid) 
              VALUES (s_screen.nextval, :1, :2) RETURNING screenid INTO :id", array($this->arg('NAME'), $this->proposalid));

            $this->_output(array('SCREENID' => $this->db->id()));
        }


        function _update_screen() {
            if (!$this->has_arg('scid')) $this->_error('No screen specified');

            $sc = $this->db->pq("SELECT sc.screenid 
              FROM screen sc 
              WHERE sc.screenid = :1 and sc.proposalid= :2", array($this->arg('scid'), $this->proposalid));

            if (!sizeof($sc)) $this->_error('No such screen');

            foreach(array('NAME', 'GLOBAL') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE screen SET '.$f.'=:1 WHERE screenid=:2', array($this->arg($f), $this->arg('scid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }



        function _get_screen_componentgroups() {
            $where = ' (s.proposalid=:1 OR s.global = 1)';
            $args = array($this->proposalid);

            if ($this->has_arg('scgid')) {
                $where .= ' AND sg.screencomponentgroupid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('scgid'));
            }

            if ($this->has_arg('scid')) {
                $where .= ' AND sg.screenid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('scid'));
            }

            $sgs = $this->db->pq("SELECT sg.screenid, sg.screencomponentgroupid, sg.position, count(sc.screencomponentid) as components
              FROM screencomponentgroup sg
              INNER JOIN screen s ON s.screenid = sg.screenid
              LEFT OUTER JOIN screencomponent sc ON sc.screencomponentgroupid = sg.screencomponentgroupid
              WHERE $where
              GROUP BY sg.screenid, sg.screencomponentgroupid, sg.position
              ORDER BY sg.position", $args);

            if ($this->has_arg('scgid')) {
                if (sizeof($sgs)) $this->_output($sgs[0]);
                else $this->_error('No such screen component group');

            } else $this->_output($sgs);
        }

        function _add_screen_componentgroup() {
            $id = $this->_do_add_screen_componentgroup();
            $this->_output(array('SCREENCOMPONENTGROUPID' => $id));
        }

        function _add_screen_componentgroups() {
            if (!$this->has_arg('collection')) $this->_error('No groups specified');

            foreach ($this->arg('collection') as $g) {
                if (array_key_exists('SCREENID', $g)) $this->args['SCREENID'] = $g['SCREENID'];
                else unset($this->args['SCREENID']);

                if (array_key_exists('SCREENCOMPONENTGROUPID', $g)) continue;

                if (array_key_exists('POSITION', $g)) $this->args['POSITION'] = $g['POSITION'];
                else unset($this->args['POSITION']);

                $this->_do_add_screen_componentgroup();
            }

            $this->args['scid'] = $this->arg('SCREENID');
            $this->_get_screen_componentgroups();
        }

        function _do_add_screen_componentgroup() {
            if (!$this->has_arg('SCREENID')) $this->_error('No screen specified');
            if (!$this->has_arg('POSITION')) $this->_error('No position specified');

            $sc = $this->db->pq("SELECT sc.screenid 
              FROM screen sc 
              WHERE sc.screenid = :1 and sc.proposalid= :2", array($this->arg('SCREENID'), $this->proposalid));

            if (!sizeof($sc)) $this->_error('No such screen');

            $this->db->pq("INSERT INTO screencomponentgroup (screencomponentgroupid, screenid, position) 
              VALUES (s_screencomponentgroup.nextval, :1, :2) RETURNING screencomponentgroupid INTO :id", array($this->arg('SCREENID'), $this->arg('POSITION')));

            return $this->db->id();
        }



        function _update_screen_componentgroup() {
            if (!$this->has_arg('scgid')) $this->_error('No screen component group specified');

            $sc = $this->db->pq("SELECT s.screenid
              FROM screen s
              INNER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              WHERE s.proposalid = :1 and sg.screencomponentgroupid = :2", 
              array($this->proposalid, $this->arg('scgid')));

            if (!sizeof($sc)) $this->_error('No such screen component group');

            foreach(array('SCREENID', 'POSITION') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE screencomponentgroup SET '.$f.'=:1 WHERE screencomponentgroupid=:2', array($this->arg($f), $this->arg('scgid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }




        // This should probably be an addition to _get_protein in class.sample.php
        function _get_screen_components() {
            $where = ' (s.proposalid=:1 OR s.global = 1)';
            $args = array($this->proposalid);

            if ($this->has_arg('sccid')) {
                $where .= ' AND sc.screencomponentid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sccid'));
            }

            if ($this->has_arg('scgid')) {
                $where .= ' AND sc.screencomponentgroupid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('scgid'));
            }

            if ($this->has_arg('scid')) {
                $where .= ' AND sg.screenid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('scid'));
            }

            $sgs = $this->db->pq("SELECT sg.position, s.screenid, sc.screencomponentid, sc.screencomponentgroupid, sc.concentration, sc.ph, sc.componentid, p.acronym, case when p.name is not null then p.name else p.acronym end as component, ct.symbol as unit, 1 as hasph
              FROM screencomponent sc
              INNER JOIN protein p ON sc.componentid = p.proteinid
              LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = p.concentrationtypeid
              INNER JOIN screencomponentgroup sg ON sc.screencomponentgroupid = sg.screencomponentgroupid
              INNER JOIN screen s ON s.screenid = sg.screenid
              WHERE $where", $args);

            if ($this->has_arg('sccid')) {
                if (sizeof($sgs)) $this->_output($sgs[0]);
                else $this->_error('No such screen component');

            } else $this->_output($sgs);
        }


        function _add_screen_component() {
            $id = $this->_do_add_screen_component();
            $this->_output(array('SCREENCOMPONENTID' => $this->db->id()));
        }

        function _add_screen_components() {
            if (!$this->has_arg('collection')) $this->_error('No collection specified');

            foreach ($this->arg('collection') as $c) {
                if (array_key_exists('SCREENCOMPONENTID', $c)) continue;

                $this->args['SCREENCOMPONENTGROUPID'] = $c['SCREENCOMPONENTGROUPID'];
                $this->args['COMPONENTID'] = $c['COMPONENTID'];

                if (array_key_exists('CONCENTRATION', $c)) $this->args['CONCENTRATION'] = $c['CONCENTRATION'];
                else unset($this->args['CONCENTRATION']);

                if (array_key_exists('PH', $c)) $this->args['PH'] = $c['PH'];
                else unset($this->args['PH']);

                $this->_do_add_screen_component();
            }

            $scids = $this->db->pq("SELECT screenid FROM screencomponentgroup WHERE screencomponentgroupid=:1", array($c['SCREENCOMPONENTGROUPID']));

            if (sizeof($scids)) {
                $this->args['scid'] = $scids[0]['SCREENID'];
                $this->_get_screen_components();
            }
        }


        function _do_add_screen_component() {
            if (!$this->has_arg('SCREENCOMPONENTGROUPID')) $this->_error('No screen component group specified');
            if (!$this->has_arg('COMPONENTID')) $this->_error('No component specified');

            $sc = $this->db->pq("SELECT s.screenid
              FROM screen s
              INNER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              WHERE s.proposalid = :1 and sg.screencomponentgroupid = :2", 
              array($this->proposalid, $this->arg('SCREENCOMPONENTGROUPID')));

            if (!sizeof($sc)) $this->_error('No such screen component group');

            $ph = $this->has_arg('PH') ? $this->arg('PH') : null;
            $conc = $this->has_arg('CONCENTRATION') ? $this->arg('CONCENTRATION') : null;
            
            $this->db->pq("INSERT INTO screencomponent (screencomponentid, screencomponentgroupid, componentid, concentration, ph)
              VALUES (s_screencomponent.nextval, :1, :2, :3, :4) RETURNING screencomponentid INTO :id", array($this->arg('SCREENCOMPONENTGROUPID'), $this->arg('COMPONENTID'), $conc, $ph));

            return $this->db->id();
        }


        function _update_screen_component() {
            if (!$this->has_arg('sccid')) $this->_error('No screen component specified');

            $sc = $this->db->pq("SELECT s.screenid
              FROM screen s
              INNER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              INNER JOIN screencomponent sc ON sc.screencomponentgroupid = sg.screencomponentgroupid
              WHERE s.proposalid = :1 and sc.screencomponentid = :2", 
              array($this->proposalid, $this->arg('sccid')));

            if (!sizeof($sc)) $this->_error('No such screen component');

            foreach(array('SCREENCOMPONENTGROUPID', 'COMPONENTID', 'CONCENTRATION', 'PH') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE screencomponent SET '.$f.'=:1 WHERE screencomponentid=:2', array($this->arg($f), $this->arg('sccid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }

        function _update_screen_component_full() {
            if (!$this->has_arg('sccid')) $this->_error('No screen component specified');

            $sc = $this->db->pq("SELECT s.screenid
              FROM screen s
              INNER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              INNER JOIN screencomponent sc ON sc.screencomponentgroupid = sg.screencomponentgroupid
              WHERE s.proposalid = :1 and sc.screencomponentid = :2", 
              array($this->proposalid, $this->arg('sccid')));

            if (!sizeof($sc)) $this->_error('No such screen component');

            $ph = $this->has_arg('PH') ? $this->arg('PH') : null;
            $conc = $this->has_arg('CONCENTRATION') ? $this->arg('CONCENTRATION') : null;

            $this->db->pq('UPDATE screencomponent SET concentration=:1,ph=:2 WHERE screencomponentid=:3', array($conc, $ph, $this->arg('sccid')));
            
            $this->_output(array(
              'CONCENTRATION' => $conc,
              'PH' => $ph,
            ));
                
        }


        function _delete_screen_component() {
            if (!$this->has_arg('sccid')) $this->_error('No screen component specified');

            $sc = $this->db->pq("SELECT s.screenid
              FROM screen s
              INNER JOIN screencomponentgroup sg ON sg.screenid = s.screenid
              INNER JOIN screencomponent sc ON sc.screencomponentgroupid = sg.screencomponentgroupid
              WHERE s.proposalid = :1 and sc.screencomponentid = :2", 
              array($this->proposalid, $this->arg('sccid')));

            if (!sizeof($sc)) $this->_error('No such screen component');

            $this->db->pq("DELETE FROM screencomponent WHERE screencomponentid=:1", array($this->arg('sccid')));
            $this->_output(1);
        }
}
