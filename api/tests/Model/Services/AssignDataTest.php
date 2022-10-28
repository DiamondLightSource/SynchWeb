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

    public function testGetContainer(): void
    {
        $this->assignData->getContainer('testVisitId', 'testContainerId', 'testLocation');
        $this->assertEquals("SELECT d.dewarid,bl.beamlinename,c.containerid,c.code FROM Container c INNER JOIN Dewar d ON d.dewarid = c.dewarid INNER JOIN Shipping s ON s.shippingid = d.shippingid INNER JOIN BLSession bl ON bl.proposalid = s.proposalid INNER JOIN Proposal p ON s.proposalid = p.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), bl.visit_number) LIKE 'testVisitId' AND c.containerid='testContainerId'", $this->db->getLastQuery());
    }

    public function testAddContainer(): void
    {
        $container = array('CONTAINERID' => 'testContainerId', 'BEAMLINENAME' => 'testBeamLineName', 'DEWARID' => 'testDewarId', 'CODE' => 'testCode');
        $this->assignData->assignContainer($container, "testLocation");
        $this->assertEquals("UPDATE Dewar SET dewarstatus='processing' WHERE dewarid='testDewarId'", $this->db->getLastQuery());
    }
}