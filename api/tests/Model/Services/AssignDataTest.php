<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\AssignData;
use SynchWeb\Database\Type\MySQL;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class AssignDataTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $db;
    private $assignData;
    private $insertId;

    protected function setUp(): void
    {
        $connStub = $this->getMockBuilder(mysqli::class)
            ->onlyMethods(['prepare'])
            ->getMock();
        $this->db = new MySQL($connStub);

        $this->assignData = new AssignData($this->db);
        $stmtStub = $this->getMockBuilder(\mysqli_stmt::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['bind_param', 'execute', 'get_result', 'close'])
            ->getMock();

        // can only stub this out once
        if (!$this->insertId)
        {
            $this->insertId = $this->getFunctionMock('SynchWeb\Database\Type', "mysqli_insert_id");
            $this->insertId->expects($this->any())->willReturn(666);
        }

        $stmtStub->method('execute')->willReturn(true);
        $connStub->method('prepare')->willReturn($stmtStub);
    }

    public function testGetContainerCreatesCorrectSql(): void
    {
        $this->assignData->getContainer('testVisitId', 'testContainerId', 'testLocation');
        $this->assertEquals("SELECT d.dewarid,bl.beamlinename,c.containerid,c.code FROM Container c INNER JOIN Dewar d ON d.dewarid = c.dewarid INNER JOIN Shipping s ON s.shippingid = d.shippingid INNER JOIN BLSession bl ON bl.proposalid = s.proposalid INNER JOIN Proposal p ON s.proposalid = p.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE 'testVisitId' AND c.containerid='testContainerId'", $this->db->getLastQuery());
    }

    public function testAssignContainerCreatesCorrectSql(): void
    {
        $container = array('CONTAINERID' => 'testContainerId', 'BEAMLINENAME' => 'testBeamLineName', 'DEWARID' => 'testDewarId', 'CODE' => 'testCode');
        $this->assignData->assignContainer($container, "testLocation");
        $this->assertEquals("UPDATE Dewar SET dewarstatus='processing' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUnassignContainerCreatesCorrectSql(): void
    {
        $container = array('CONTAINERID' => 'testContainerId', 'BEAMLINENAME' => 'testBeamLineName', 'DEWARID' => 'testDewarId', 'CODE' => 'testCode');
        $this->assignData->unassignContainer($container);
        $this->assertEquals("INSERT INTO ContainerHistory (containerid, status, location, beamlinename) VALUES ('testContainerId','at facility','','testBeamLineName')", $this->db->getLastQuery());
    }

    public function testUpdateContainerAndHistoryCreatesCorrectSql(): void
    {
        $this->assignData->updateContainerAndHistory('testContainerId', 'testStatus', 'testBeamlineName', 'testLocation');
        $this->assertEquals("INSERT INTO ContainerHistory (containerid, status, location, beamlinename) VALUES ('testContainerId','testStatus','testLocation','testBeamlineName')", $this->db->getLastQuery());
    }

    public function testUpdateContainerCreatesCorrectSql(): void
    {
        $this->assignData->updateContainer('testContainerId', 'testStatus', 'testBeamlineName', 'testLocation');
        $this->assertEquals("UPDATE Container SET beamlinelocation='testBeamlineName', samplechangerlocation='testLocation', containerstatus='testStatus' WHERE containerid='testContainerId'", $this->db->getLastQuery());
    }

    public function testUpdateContainerHistoryCreatesCorrectSql(): void
    {
        $this->assignData->updateContainerHistory('testContainerId', 'testStatus', 'testBeamlineName', 'testLocation');
        $this->assertEquals("INSERT INTO ContainerHistory (containerid, status, location, beamlinename) VALUES ('testContainerId','testStatus','testLocation','testBeamlineName')", $this->db->getLastQuery());
    }

    public function testGetDewarWithVisitDataCreatesCorrectSql(): void
    {
        $this->assignData->getDewar('testDewarId', 'testProposalId', 'testVisitId');
        $this->assertEquals("SELECT d.dewarid FROM Dewar d INNER JOIN Shipping s ON s.shippingid = d.shippingid INNER JOIN BLSession bl ON bl.proposalid = s.proposalid INNER JOIN Proposal p ON s.proposalid = p.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE 'testVisitId' AND d.dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testGetDewarWithNoVisitDataCreatesCorrectSql(): void
    {
        $this->assignData->getDewar('testDewarId', 'testProposalId', null);
        $this->assertEquals("SELECT d.dewarid FROM Dewar d INNER JOIN Shipping s ON s.shippingid = d.shippingid INNER JOIN BLSession bl ON bl.proposalid = s.proposalid INNER JOIN Proposal p ON s.proposalid = p.proposalid WHERE p.proposalid='testProposalId' AND d.dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUpdateDewarCreatesCorrectSql(): void
    {
        $this->assignData->updateDewar('testDewarId', 'testStatus');
        $this->assertEquals("UPDATE Dewar SET dewarstatus='testStatus' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUpdateDewarWithUnprocessingStatusCreatesCorrectSql(): void
    {
        $this->assignData->updateDewar('testDewarId', 'unprocessing');
        $this->assertEquals("UPDATE Dewar SET dewarstatus='at facility' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testDeactivateDewarCreatesCorrectSql(): void
    {
        $this->assignData->deactivateDewar('testDewarId');
        $this->assertEquals("SELECT containerid as id FROM Container WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUpdateDewarHistoryCreatesCorrectSql(): void
    {
        $this->assignData->updateDewarHistory('testDewarId', 'testStatus');
        $this->assertEquals("UPDATE Dewar SET dewarstatus='testStatus' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUpdateDewarHistoryWithBeamlineDataCreatesCorrectSql(): void
    {
        $this->assignData->updateDewarHistory('testDewarId', 'testStatus', 'testBeamline');
        $this->assertEquals("UPDATE Dewar SET dewarstatus='testStatus' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testUpdateDewarHistoryWithBeamlineDataAndStatusCreatesCorrectSql(): void
    {
        $this->assignData->updateDewarHistory('testDewarId', 'testStatus', 'testBeamline', 'testStatus');
        $this->assertEquals("UPDATE Dewar SET dewarstatus='testStatus' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }

    public function testGetContainerBarcodesForProposalCreatesCorrectSql(): void
    {
        $this->assignData->getContainerBarcodesForProposal('testProposalId');
        $this->assertEquals("SELECT cr.barcode FROM ContainerRegistry cr INNER JOIN ContainerRegistry_has_Proposal crhp ON crhp.containerregistryid = cr.containerregistryid WHERE crhp.proposalid = 'testProposalId'", $this->db->getLastQuery());
    }
}