<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\CalendarData;
use SynchWeb\Database\Type\MySQL;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class CalendarDataTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $db;
    private $calendarData;
    private $insertId;

    protected function setUp(): void
    {
        $connStub = $this->getMockBuilder(mysqli::class)
            ->onlyMethods(['prepare'])
            ->getMock();
        $this->db = new MySQL($connStub);

        $this->calendarData = new CalendarData($this->db);
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

    public function testAddCalendarHashForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->addCalendarHash('testCkey', true);
        $this->db->lastArgs[2] = 'xxxx'; // hash generation will vary from test to test, so stub out
        $this->assertEquals("INSERT INTO CalendarHash (ckey,hash,beamline) VALUES ('testCkey', 'xxxx', 1)", $this->db->getLastQuery());
    }

    public function testAddCalendarHashNotForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->addCalendarHash('testCkey', false);
        $this->db->lastArgs[2] = 'xxxx'; // hash generation will vary from test to test, so stub out
        $this->assertEquals("INSERT INTO CalendarHash (ckey,hash,beamline) VALUES ('testCkey', 'xxxx', 0)", $this->db->getLastQuery());
    }

    public function testGetCalendarHashByKeyCreatesCorrectSql(): void
    {
        $this->calendarData->getCalendarHashByKey('testCkey');
        $this->assertEquals("SELECT hash FROM CalendarHash WHERE ckey LIKE 'testCkey'", $this->db->getLastQuery());
    }

    public function testGetCalendarHashByHashCreatesCorrectSql(): void
    {
        $this->calendarData->getCalendarHashByHash('testHash');
        $this->assertEquals("SELECT ckey,beamline FROM CalendarHash WHERE hash LIKE 'testHash'", $this->db->getLastQuery());
    }

    public function testGetCalendarVisitsDataForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->getCalendarVisitsData('testCkey', true);
        $this->assertEquals("SELECT s.beamlineoperator as lc, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename as bl, DATE_FORMAT(s.startdate, '%d-%m-%Y') as d, DATE_FORMAT(s.enddate, '%d-%m-%Y') as e, DATE_FORMAT(s.startdate, '%H:%i') as st, DATE_FORMAT(s.enddate, '%H:%i') as en, s.sessionid FROM BLSession s INNER JOIN Proposal p ON (p.proposalid = s.proposalid) WHERE s.startdate > STR_TO_DATE('2022','%Y') AND s.beamlinename LIKE 'testCkey' ORDER BY s.startdate, s.beamlinename", $this->db->getLastQuery());
    }

    public function testGetCalendarVisitsDataNotForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->getCalendarVisitsData('testCkey', false);
        $this->assertEquals("SELECT s.beamlineoperator as lc, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename as bl, DATE_FORMAT(s.startdate, '%d-%m-%Y') as d, DATE_FORMAT(s.enddate, '%d-%m-%Y') as e, DATE_FORMAT(s.startdate, '%H:%i') as st, DATE_FORMAT(s.enddate, '%H:%i') as en, s.sessionid FROM BLSession s INNER JOIN Proposal p ON (p.proposalid = s.proposalid) WHERE s.startdate > STR_TO_DATE('2022','%Y') AND CONCAT(p.proposalcode,p.proposalnumber) LIKE 'testCkey' ORDER BY s.startdate, s.beamlinename", $this->db->getLastQuery());
    }

    public function testGetUserDataForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->getUserData('testCkey', true);
        $this->assertEquals("SELECT s.sessionid, pe.login, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname, shp.role FROM Person pe INNER JOIN Session_has_Person shp ON shp.personid = pe.personid INNER JOIN BLSession s ON s.sessionid = shp.sessionid INNER JOIN Proposal p ON p.proposalid = s.proposalid WHERE s.startdate > STR_TO_DATE('2022','%Y') AND s.beamlinename LIKE 'testCkey'", $this->db->getLastQuery());
    }

    public function testGetUserDataNotForBeamlineCreatesCorrectSql(): void
    {
        $this->calendarData->getUserData('testCkey', false);
        $this->assertEquals("SELECT s.sessionid, pe.login, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname, shp.role FROM Person pe INNER JOIN Session_has_Person shp ON shp.personid = pe.personid INNER JOIN BLSession s ON s.sessionid = shp.sessionid INNER JOIN Proposal p ON p.proposalid = s.proposalid WHERE s.startdate > STR_TO_DATE('2022','%Y') AND CONCAT(p.proposalcode,p.proposalnumber) LIKE 'testCkey'", $this->db->getLastQuery());
    }
}