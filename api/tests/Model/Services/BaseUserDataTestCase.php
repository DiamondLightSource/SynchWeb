<?php

declare(strict_types=1);

namespace Tests\Model\Services;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\UserData;
use SynchWeb\Database\Type\MySQL;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
class BaseUserDataTestCase extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    protected $db;
    /**
     * @var UserData
     */
    protected $userData;
    protected $insertId;
    protected $query = [];

    protected function setUpMocks($invocationNumber = 1): void
    {
        $class = $this;
        $connStub = $this->getMockBuilder(mysqli::class)
            ->onlyMethods(['prepare'])
            ->getMock();
        $this->db = new MySQL($connStub);

        $this->userData = new UserData($this->db);
        $stmtStub = $this->getMockBuilder(\mysqli_stmt::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['bind_param', 'execute', 'get_result', 'close'])
            ->getMock();

        // can only stub this out once
        if (!$this->insertId)
        {
            $this->insertId = $this->getFunctionMock('SynchWeb\Database\Type', "mysqli_insert_id");
            $this->insertId->expects($class->any())->willReturn(666);
        }

        $this->query = [];
        $stmtStub->expects($this->exactly($invocationNumber))->method('execute')
            ->willReturnCallback([$this, "recordEntry"]);
        $connStub->expects($this->exactly($invocationNumber))->method('prepare')->willReturn($stmtStub);
    }

    public function recordEntry()
    {
        array_push($this->query, $this->db->getLastQuery());
        return true;
    }
}
