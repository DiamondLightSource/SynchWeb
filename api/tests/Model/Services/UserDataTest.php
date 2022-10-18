<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\UserData;
use SynchWeb\Database\Type\MySQL;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class UserDataTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $db;
    private $userData;
    private $stmtStub;

    protected function setUp(): void
    {
        $connStub = $this->getMockBuilder(mysqli::class)
            ->onlyMethods(['prepare'])
            ->getMock();
        $this->db = new MySQL($connStub);

        $this->userData = new UserData($this->db);

        $this->stmtStub = $this->getMockBuilder(\mysqli_stmt::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['bind_param', 'execute', 'get_result', 'close'])
            ->getMock();

        $connStub->expects($this->exactly(1))->method('prepare')->willReturn($this->stmtStub);
        $this->stmtStub->expects($this->exactly(1))->method('bind_param')->willReturn(true);
        $this->stmtStub->expects($this->exactly(1))->method('execute')->willReturn(true);
        $insertId = $this->getFunctionMock('SynchWeb\Database\Type', "mysqli_insert_id");
        $insertId->expects($this->any())->willReturn(666);
    }

    public function testAddGroup(): void
    {
        $id = $this->userData->addGroup("testGroup");
        $this->assertEquals("INSERT INTO UserGroup (name) VALUES ('testGroup')", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }
}