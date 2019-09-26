<?php
    class ShippingShared
    {
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

        // Copy from class.shipment.php (only edit is the end output swapping commented output to return)
        // Necessary for now because SynchWeb isn't designed to allow microservices to call each other e.g. sample call shipment :(
        function _get_default_dewar($proposal, $visit) {
            if($visit == null or $visit == '') $this->error('No visit specified');
            if($proposal == null or $proposal == '') $this->error('No visit specified');
            
            $sids = $this->db->pq("SELECT s.sessionid FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1 AND p.proposalid=:2", array($visit, $proposal));
            
            if (!sizeof($sids)) $this->error('No such visit'.$visit);
            else $sid = $sids[0]['SESSIONID'];
            
            
            $shids = $this->db->pq("SELECT shippingid FROM shipping WHERE proposalid LIKE :1 AND shippingname LIKE :2", array($proposal, $visit.'_Shipment1'));
            
            if (sizeof($shids) > 0) {
                $shid = $shids[0]['SHIPPINGID'];
            } else {
                $this->db->pq("INSERT INTO shipping (shippingid,proposalid,shippingname,bltimestamp,creationdate,shippingstatus) VALUES (s_shipping.nextval,:1,:2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'processing') RETURNING shippingid INTO :id", array($proposal, $visit.'_Shipment1'));
                
                $shid = $this->db->id();
                
                $vals = $this->db->pq("INSERT INTO shippinghassession (shippingid,sessionid) VALUES (:1,:2)", array($shid, $sid));
                
            }
            
            $did = -1;
            if ($sid) {
                $dids = $this->db->pq("SELECT dewarid from dewar WHERE shippingid LIKE :1 AND code LIKE :2", array($shid, $visit.'_Dewar1'));
                
                if (sizeof($dids) > 0) {
                    $did = $dids[0]['DEWARID'];
                    
                } else {
                    $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus,firstexperimentid) VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'processing',:3) RETURNING dewarid INTO :id", array($visit.'_Dewar1', $shid, $sid));
                    
                    $did = $this->db->id();

                    # Need to generate barcode
                    $bl = $this->db->pq("SELECT s.beamlinename as bl FROM blsession s WHERE s.sessionid=:1", array($sid));
                    $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($visit.'-'.$bl[0]['BL'].'-'.str_pad($did,7,'0',STR_PAD_LEFT), $did));
                }
            }
            
            if ($did == -1) $this->error('Couldnt create default dewar');
            //$this->_output($did);
            return array('DEWARID' => $did, 'SHIPPINGID' => $sid);
        }
    }
?>