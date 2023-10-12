<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use SynchWeb\Utils;

class AssignData
{
    private $db;

    function __construct($db)
    {
        $this->db = $db;
    }

    # ------------------------------------------------------------------------
    # Get a container
    # $visitId is an aggregate of the group name, proposal number and visit number - e.g. group: 'mx', proposal: 28866, visit: 4 -> $visitId = 'mx28866-4'
    function getContainer($visitId, $containerId)
    {
        return $this->db->pq("SELECT d.dewarid,bl.beamlinename,c.containerid,c.code FROM container c
                                INNER JOIN dewar d ON d.dewarid = c.dewarid
                                INNER JOIN shipping s ON s.shippingid = d.shippingid
                                INNER JOIN blsession bl ON bl.proposalid = s.proposalid
                                INNER JOIN proposal p ON s.proposalid = p.proposalid
                                WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE :1 
                                    AND c.containerid=:2", array($visitId, $containerId));
    }

    function assignContainer($container, $location)
    {
        $this->updateDewar($container['DEWARID'], 'processing');

        $this->updateContainerAndHistory($container['CONTAINERID'], 'processing', $container['BEAMLINENAME'], $location);

        $this->updateDewarHistory($container['DEWARID'], 'processing', $container['BEAMLINENAME'], $container['CODE'] . ' => ' . $location);
    }

    function unassignContainer($container)
    {
        $this->updateContainerAndHistory($container['CONTAINERID'], 'at facility', '', '');
    }

    function updateContainerAndHistory($containerId, $status, $beamlineName, $location)
    {
        $this->updateContainer($containerId, $status, $beamlineName, $location);
        $this->updateContainerHistory($containerId, $status, $beamlineName, $location);
    }

    function updateContainerHistory($containerId, $status, $beamlineName, $location)
    {
        $this->db->pq("INSERT INTO containerhistory 
                            (containerid, status, location, beamlinename) 
                            VALUES (:1,:2,:3,:4)", array($containerId, $status, $location, $beamlineName));
    }

    function updateContainer($containerId, $status, $beamlineName, $location)
    {
        $this->db->pq("UPDATE container 
                            SET beamlinelocation=:1, samplechangerlocation=:2, containerstatus=:3 
                            WHERE containerid=:4", array($beamlineName, $location, $status, $containerId));
    }

    function getDewar($dewarId, $proposalId, $visitId)
    {
        $where = "p.proposalid=:1";
        $arg = $proposalId;
        if ($visitId)
        {
            $where = "CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE :1";
            $arg = $visitId;
        }

        return $this->db->pq("SELECT d.dewarid FROM dewar d
                                INNER JOIN shipping s ON s.shippingid = d.shippingid
                                INNER JOIN blsession bl ON bl.proposalid = s.proposalid
                                INNER JOIN proposal p ON s.proposalid = p.proposalid
                                WHERE $where AND d.dewarid=:2", array($arg, $dewarId));
    }

    function updateDewar($dewarId, $status)
    {
        if ($status == 'unprocessing')
            $status = 'at facility';
        $this->db->pq("UPDATE dewar SET dewarstatus=:1 WHERE dewarid=:2", array($status, $dewarId));
    }

    function deactivateDewar($dewarId)
    {
        $location = $this->db->pq("SELECT storagelocation FROM dewar WHERE dewarid=:1", array($dewarId));
        $this->updateDewarHistory($dewarId, 'unprocessing', $location[0]['STORAGELOCATION']);

        $conts = $this->db->pq("SELECT containerid FROM container WHERE dewarid=:1", array($dewarId));
        foreach ($conts as $container)
        {
            $this->updateContainerAndHistory($container['CONTAINERID'], 'at facility', '', '');
        }
    }

    function updateDewarHistory($did, $status, $beamline = null, $additionalStatusDetail = null)
    {
        $st = $status;
        if ($additionalStatusDetail)
            $st .= ' (' . $additionalStatusDetail . ')';
        $loc = Utils::getValueOrDefault($beamline, '');
        $this->db->pq("INSERT INTO dewartransporthistory 
                        (dewarid, dewarstatus, storagelocation, arrivaldate) 
                        VALUES (:1, :2, :3, CURRENT_TIMESTAMP)", array($did, $st, $loc));

        $this->updateDewar($did, $status);
    }

    function getContainerBarcodesForProposal($proposalId)
    {
        return $this->db->pq("SELECT cr.barcode 
                FROM containerregistry cr
                INNER JOIN containerregistry_has_proposal crhp ON crhp.containerregistryid = cr.containerregistryid
                WHERE crhp.proposalid = :1", array($proposalId));
    }
}
