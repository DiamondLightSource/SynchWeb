<?php

	class ImagingShared {
	
		function __construct($db=null) {
            global $isp;
			if (!$db) {
				include_once(dirname(__FILE__).'/../class.db.php');
				$db = Database::get();
			}

			$this->db = $db;
		}

		function error($msg) {
        	die($msg);
        }



		function _do_insert_inspection($args) {
			if (!array_key_exists('IMAGERID', $args)) $args['IMAGERID'] = null;
			if (!array_key_exists('SCHEDULECOMPONENTID', $args)) $args['SCHEDULECOMPONENTID'] = null;
			if (!array_key_exists('SCHEDULEDTIMESTAMP', $args)) $args['SCHEDULEDTIMESTAMP'] = null;
			if (!array_key_exists('STATE', $args)) $args['STATE'] = 'Not completed';
			if (!array_key_exists('PRIORITY', $args)) $args['PRIORITY'] = 1;
			if (!array_key_exists('MANUAL', $args)) $args['MANUAL'] = 0;
			if (!array_key_exists('TEMPERATURE', $args)) $args['TEMPERATURE'] = null;
			if (!array_key_exists('BLTIMESTAMP', $args)) $args['BLTIMESTAMP'] = null;

            $this->db->pq("INSERT INTO containerinspection (containerinspectionid, containerid, inspectiontypeid, imagerid, temperature, manual, schedulecomponentid, scheduledtimestamp, state, priority, bltimestamp) 
            	VALUES (s_containerinspection.nextval, :1, :2, :3, :4, :5, :6, TO_DATE(:7, 'DD-MM-YYYY HH24:MI'), :8, :9, TO_DATE(:10, 'DD-MM-YYYY HH24:MI')) RETURNING containerinspectionid INTO :id", 
            	array($args['CONTAINERID'], $args['INSPECTIONTYPEID'], $args['IMAGERID'], $args['TEMPERATURE'], $args['MANUAL'], $args['SCHEDULECOMPONENTID'], $args['SCHEDULEDTIMESTAMP'], $args['STATE'], $args['PRIORITY'], $args['BLTIMESTAMP']));

            return $this->db->id();
		}

		// $args = array(
		// 	'CONTAINERINSPECTIONID' => 1,
		// 	'VALUES' => array(
		// 		'STATE' => 'Completed',
		// 		'BLTIMESTAMP' => '23-03-2015 09:45',
		// 	)
		// );
		function _do_update_inspection($args) {
			foreach ($args['VALUES'] as $f => $v) {
				$fl = ':1';
				if (in_array($f, array('BLTIMESTAMP', 'SCHEDULEDTIMESTAMP', 'COMPLETEDTIMESTAMP'))) {
					$fl = "TO_DATE(:1, 'DD-MM-YYYY HH24:MI')"; 
				}

				$this->db->pq("UPDATE containerinspection SET $f=$fl WHERE containerinspectionid=:2", array($v, $args['CONTAINERINSPECTIONID']));
			}
		}



		function _do_insert_inspection_image($args) {
            $insp = $this->db->pq("SELECT ci.containerinspectionid FROM containerinspection ci
              INNER JOIN container c ON c.containerid = ci.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE p.proposalid = :1 AND ci.containerinspectionid = :2", array($args['PROPOSALID'], $args['CONTAINERINSPECTIONID']));

            if (!sizeof($insp)) $this->error('No such inspection');

            if (!array_key_exists('MICRONSPERPIXELX', $args)) $args['MICRONSPERPIXELX'] = null;
            if (!array_key_exists('MICRONSPERPIXELY', $args)) $args['MICRONSPERPIXELY'] = null;

            if (!array_key_exists('IMAGEFULLPATH', $args)) $args['IMAGEFULLPATH'] = null;

            $this->db->pq("INSERT INTO blsampleimage (blsampleimageid, containerinspectionid, blsampleid, imagefullpath, micronsperpixelx, micronsperpixely, bltimestamp)
              VALUES (s_blsampleimage.nextval, :1, :2, :3, :4, :5, CURRENT_TIMESTAMP) RETURNING blsampleimageid INTO :id", 
              array($args['CONTAINERINSPECTIONID'], $args['BLSAMPLEID'], $args['IMAGEFULLPATH'], $args['MICRONSPERPIXELX'], $args['MICRONSPERPIXELY']));

            return $this->db->id();
        }



        function _generate_schedule($args) {
        	$comps = $this->db->pq("SELECT schedulecomponentid, inspectiontypeid FROM schedulecomponent WHERE scheduleid=:1 ORDER BY offset_hours", array($args['SCHEDULEID']));
        	foreach ($comps as $i => $c) {
        		$insp = array(
        			'CONTAINERID' => $args['CONTAINERID'],
        			'INSPECTIONTYPEID' => $c['INSPECTIONTYPEID'],
        			'SCHEDULECOMPONENTID' => $c['SCHEDULECOMPONENTID'],
        			'PRIORITY' => $i+1,
        		);

        		if ($i == 0) $insp['SCHEDULEDTIMESTAMP'] = date('d-m-Y H:m');
        		$this->_do_insert_inspection($insp);
        	}
        }



        function _schedule_from_zero($args) {
        	$insps = $this->db->pq("SELECT i.containerinspectionid, i.scheduledtimestamp, TO_CHAR(i.bltimestamp, 'DD-MM-YYYY HH24:MI') as bltimestamp, sc.offset_hours 
        		FROM containerinspection i 
        		INNER JOIN schedulecomponent sc ON sc.schedulecomponentid = i.schedulecomponentid
        		WHERE containerid=:1
        		ORDER BY bltimestamp DESC, offset_hours", array($args['CONTAINERID']));

        	if (!$insps[0]['BLTIMESTAMP']) $this->error('No inspections started yet for that container');

        	$start = strtotime($insps[0]['BLTIMESTAMP']);
        	foreach ($insps as $in) {
        		if ($in['SCHEDULEDTIMESTAMP']) continue;

        		$upd = array(
        			'CONTAINERINSPECTIONID' => $in['CONTAINERINSPECTIONID'],
        			'VALUES' => array(
        				'SCHEDULEDTIMESTAMP' => date('d-m-Y H:m', $start+($in['OFFSET_HOURS']*3600))
        			)
        		);

        		$this->_do_update_inspection($upd);
        	}
        }


        function _email_status_update($inspectionid) {
            include_once(dirname(__FILE__).'/../class.email.php');

            $imaging = $this->db->pq("SELECT s.shippingname, ci.containerinspectionid, ci.containerid, c.code, c.containertype, CONCAT(p.proposalcode, p.proposalnumber) as prop, pe.emailaddress, pe.givenname, pe.familyname, it.name as inspectiontype
                FROM containerinspection ci
                INNER JOIN inspectiontype it ON it.inspectiontypeid = ci.inspectiontypeid
                INNER JOIN container c ON c.containerid = ci.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN person pe ON pe.personid = c.ownerid
                WHERE ci.containerinspectionid=:1", array($inspectionid));

            if (!sizeof($imaging)) return;
            $imaging = $imaging[0];

            if (!$imaging['EMAILADDRESS']) return;

            $email = new Email('imaging-new', '*** New inspection for your container available ***');
            $email->data = $imaging;
            $email->send($imaging['EMAILADDRESS']);
        }



        // ------------------------------------------------------------------------------------------------------
        // Functions for formulatrix
        // Return plate info from barcode
        function _get_plate_info($args) {
            if (!array_key_exists('BARCODE', $args)) $this->error('No barcode specified');

            $cont = $this->db->pq("SELECT pe.emailaddress, pe.givenname, pe.familyname, pe.login, c.sessionid, s.shippingname as shipment, c.imagerid, i.serial, c.containertype, TO_CHAR(c.bltimestamp, 'DD-MM-YYYY HH24:MI') as bltimestamp, d.code as dewar, CONCAT(p.proposalcode, p.proposalnumber) as prop, i.temperature, c.containerid, p.externalid, p.proposalid
                FROM container c
                LEFT OUTER JOIN imager i ON i.imagerid = c.imagerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping s ON s.shippingid = d.shippingid
                INNER JOIN proposal p on p.proposalid = s.proposalid
                LEFT OUTER JOIN person pe ON pe.personid = c.ownerid
                WHERE c.code=:1", array($args['BARCODE']));
            if (!sizeof($cont)) $this->error('No such container');
            $cont = $cont[0];

            // Set the imager the first time the plate is read
            if (array_key_exists('SERIAL', $args)) {
                if ($args['SERIAL'] != $cont['SERIAL']) $this->_set_imager(array('BARCODE' => $args['BARCODE'], 'SERIAL' => $args['SERIAL']));
            }

            // No sessionid, need to create a visit using UAS REST API
            if (!$cont['SESSIONID']) {
                $samples = $this->db->pq("SELECT p.externalid 
                    FROM protein p
                    INNER JOIN crystal cr ON cr.proteinid = p.proteinid
                    INNER JOIN blsample s ON s.crystalid = cr.crystalid
                    INNER JOIN contnainer c ON c.containerid = p.containerid
                    WHERE p.externalid IS NOT NULL AND c.code=:1", array($args['BARCODE']));

                $samples = array_map(function($s) {
                    return $s['EXTERNALID'];
                }, $samples);

                $data = array(
                    'proposalId' => strtoupper($cont['EXTERNALID']),
                    'sampleIds' => $samples,
                    'startAt' => date('Y-m-d\TH:i:s.000\Z'),
                    // 'startAt': "2012-04-23T18:25:43.511Z",
                    'facility' => 'I02-2'
                );

                require_once(dirname(__FILE__).'/../class.uas.php');
                $uas = new UAS();
                $sess = $uas->create_session($data);

                if ($sess['code'] == 200) {
                    $this->db->pq("INSERT INTO blsession (proposalid, visit_number, externalid, beamlinesetupid) 
                        VALUES (:1,:2,:3,1)", 
                        array($cont['PROPOSALID'], $sess['resp']->sessionNumber, $sess['resp']->id));

                    $cont['SESSIONID'] = $this->db->id();
                    $this->db->pq("UPDATE container SET sessionid=:1 WHERE code=:2", array($cont['SESSIONID'], $args['BARCODE']));
                }
            }

            return $cont;
        }


        // Duplication from imaging, but somewhat simplified
        // Only return inspections that have been scheduled.
        function _get_plate_inspections($args) {
            if (!array_key_exists('BARCODE', $args)) $this->error('No barcode specified');

            if (!array_key_exists('ALL', $args)) $scheduled = 'AND ci.schedulecomponentid IS NOT NULL';
            else $scheduled = '';

            $inspections = $this->db->pq("SELECT ci.bltimestamp > CURRENT_TIMESTAMP as completed, TO_CHAR(ci.scheduledtimestamp, 'DD-MM-YYYY HH24:MI') as datetoimage, TO_CHAR(ci.bltimestamp, 'DD-MM-YYYY HH24:MI') as dateimaged, ci.state, ci.priority, ci.containerinspectionid, c.containerid
                FROM containerinspection ci
                INNER JOIN container c ON c.containerid = ci.containerid
                WHERE c.code = :1 AND ci.scheduledtimestamp IS NOT NULL $scheduled AND ci.manual != 1", array($args['BARCODE']));

            return $inspections;
        }


        // Updates an inspection based on barcode and scheduletimestamp, thanks formulatrix
        // DATETOIMAGE comes back as UTC, we need to get MySQL to convert to UTC too
        function _update_inspection($args) {
            // Urgh
            $inspections = $this->db->pq("SELECT ci.containerinspectionid 
                FROM containerinspection ci
                INNER JOIN container c ON c.containerid = ci.containerid
                WHERE c.code = :1 AND ci.scheduledtimestamp IS NOT NULL AND ci.manual != 1 AND CONVERT_TZ(ci.scheduledtimestamp, @@session.time_zone, :3) <= TO_DATE(:2, 'DD-MM-YYYY HH24:MI')
                ORDER BY ci.scheduledtimestamp DESC", array($args['BARCODE'], $args['DATETOIMAGE'], '+00:00'));

            

            if (!sizeof($inspections)) $this->error('No inspection found');
            $inspection = $inspections[0];

            $this->_do_update_inspection(array(
                'CONTAINERINSPECTIONID' => $inspection['CONTAINERINSPECTIONID'],
                'VALUES' => $args['VALUES']
            ));

            return $inspection['CONTAINERINSPECTIONID'];
        }


        // If theres only one task scheduled, we assume this is the first imaging on site,
        // now schedule the rest of them from this "zero" time
        function _check_schedule_from_zero($args) {
            $inspections = $this->_get_plate_inspections($args);

            // more than one, we've already scheduled them
            if (sizeof($inspections) > 1) return;
            $inspection = $inspections[0];

            // Need a bltimestamp for the first one to act as time "zero"
            if ($inspection['DATETOIMAGE']) {
                $this->_schedule_from_zero(array('CONTAINERID' => $inspection['CONTAINERID']));
            }
        }


        // Sets the imagerid for the specified container
        function _set_imager($args) {
            if (!array_key_exists('BARCODE', $args)) $this->error('No barcode specified');
            if (!array_key_exists('SERIAL', $args)) $this->error('No serial specified');

            $imager = $this->db->pq("SELECT imagerid FROM imager WHERE serial=:1", array($args['SERIAL']));
            if (!sizeof($imager)) return;
            $imager = $imager[0];

            $this->db->pq("UPDATE container SET imagerid=:1 WHERE code=:2", array($imager['IMAGERID'], $args['BARCODE']));
        }




	}

?>