<?php declare(strict_types=1);

namespace SynchWeb\Database\Type;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Database\Type\MySQL;
use SynchWeb\Utils;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class MySqlTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $connStub;
    private $stmtStub;
    private $db;

    private function stubOutMethodsToAllowCleanCompletion($bindArgs = true)
    {
        $this->connStub->expects($this->exactly(1))->method('prepare')->willReturn($this->stmtStub);
        if ($bindArgs) {
            $this->stmtStub->expects($this->exactly(1))->method('bind_param')->willReturn(true);
        }
        $this->stmtStub->expects($this->exactly(1))->method('execute')->willReturn(true);

        $log = $this->setupError("something bad happened....");
        $log->expects($this->never());
    }

    private function setupError($errorMessage)
    {
        $errorMsg = $this->getFunctionMock(__NAMESPACE__, "mysqli_error");
        $errorMsg->expects($this->any())->willReturn($errorMessage);
        Utils::$exitOnError = false;
        $log = $this->getFunctionMock('SynchWeb', "error_log");
        return $log;
    }

    protected function setUp(): void
    {
        $this->connStub = $this->getMockBuilder(mysqli::class)
            ->getMock();
        $this->db = new MySQL($this->connStub);

        $this->stmtStub = $this->getMockBuilder(\mysqli_stmt::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['bind_param', 'execute', 'get_result', 'close'])
            ->getMock();

    }

    public function testGetLastQueryReturnsCorrectlyForZeroArgs(): void
    {
        $this->assertEmpty($this->db->getLastQuery());
    }

    public function testPqFailsWithExpectedError(): void
    {
        $expectedError = "something bad happened....";
        $log = $this->setupError($expectedError);
        $log->expects($this->once())->with("Database Error: " . $expectedError);

        $this->db->pq("SELECT BLAH FROM BLAH", array());
    }

    public function testPqFailsWithExpectedErrorAtExecute(): void
    {
        $this->connStub->expects($this->exactly(1))->method('prepare')->willReturn($this->stmtStub);

        $expectedError = "something bad happened....";
        $log = $this->setupError($expectedError);
        $log->expects($this->once())->with("Database Error: " . $expectedError);

        $this->db->pq("SELECT BLAH FROM BLAH", array());
    }

    public function testPqCompletesCleanlyWithStubs(): void
    {
        $this->connStub->expects($this->exactly(1))->method('prepare')->willReturn($this->stmtStub);
        $this->stmtStub->expects($this->exactly(1))->method('execute')->willReturn(true);

        $log = $this->setupError("something bad happened....");
        $log->expects($this->never());

        $result = $this->db->pq("SELECT BLAH FROM BLAH", array());
        $this->assertEmpty($result);
    }

    public function testPqCompletesCleanlyWithStubsAndQueryArgs(): void
    {
        $this->stubOutMethodsToAllowCleanCompletion();
        $args = array('one', 'two', 'three');

        $result = $this->db->pq("SELECT BLAH FROM BLAH", $args);

        $this->assertEmpty($result);
    }

    public function testLastQueryReturnsValidStatmentIgnoringArgs(): void
    {
        $this->stubOutMethodsToAllowCleanCompletion();
        $args = array('one', 'two', 'three');
        $query = "SELECT BLAH FROM BLAH";

        $this->db->pq($query, $args);

        $this->assertEquals($query, $this->db->getLastQuery());
    }

    public function testLastQueryReturnsValidStatmentNoArgs(): void
    {
        $this->stubOutMethodsToAllowCleanCompletion(false);
        $query = "SELECT BLAH FROM BLAH";

        $this->db->pq($query, array());

        $this->assertEquals($query, $this->db->getLastQuery());
    }

    public function testLastQueryReturnsValidStatmentUsingArgs(): void
    {
        $this->stubOutMethodsToAllowCleanCompletion(false);
        $query = "SELECT BLAH FROM BLAH WHERE (p.personid=:1 OR php.proposalid=:2 OR lc.proposalid=:3)";
        $args = array('one', 'two', 'three');

        $this->db->pq($query, $args);

        $this->assertEquals("SELECT BLAH FROM BLAH WHERE (p.personid='one' OR php.proposalid='two' OR lc.proposalid='three')", $this->db->getLastQuery());
    }

    public function testIdReturnsConnInsertId(): void
    {
        $insertId = $this->getFunctionMock(__NAMESPACE__, "mysqli_insert_id");
        $insertId->expects($this->any())->willReturn(666);

        $this->assertEquals(666, $this->db->id());
    }
}