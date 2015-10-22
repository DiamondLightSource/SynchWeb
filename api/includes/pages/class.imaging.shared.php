<?php

	class ImagingShared {
	
		function __construct($db) {
			if (!$db) {
				include_once('class.db.php');
				include_once('config.php');
				$db = new Oracle($isb['user'], $isb['pass'], $isb['db']);
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
				if (in_array($f, array('BLTIMESTAMP', 'SCHEDULEDTIMESTAMP'))) {
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
        		ORDER BY bltimestamp, offset_hours", array($args['CONTAINERID']));

        	if (!$insps[0]['BLTIMESTAMP']) $this->error('No inspections completed yet for that container');

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

	}

?>