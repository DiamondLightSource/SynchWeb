<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use MYSQLi;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\ContactData;
use SynchWeb\Database\Type\MySQL;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class ContactDataTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $db;
    private $contactData;
    private $insertId;

    protected function setUp(): void
    {
        $connStub = $this->getMockBuilder(mysqli::class)
            ->onlyMethods(['prepare'])
            ->getMock();
        $this->db = new MySQL($connStub);

        $this->contactData = new ContactData($this->db);
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

    public function testGetLabContactsCountCreatesCorrectSql(): void
    {
        $this->contactData->getLabContactsCount('testProposalId');
        $this->assertEquals("SELECT count(c.labcontactid) as tot FROM LabContact c WHERE c.proposalid = 'testProposalId'", $this->db->getLastQuery());
    }

    public function testGetLabContactsCreatesCorrectSql(): void
    {
        $this->contactData->getLabContacts('testProposalId', 'testLabContactId', 1, 50);
        $this->assertEquals("SELECT c.labcontactid, c.cardname, pe.givenname, pe.familyname, pe.phonenumber, l.name as labname, l.address, l.city, l.country, c.courieraccount, c.billingreference, c.defaultcourriercompany, c.dewaravgcustomsvalue, c.dewaravgtransportvalue, pe.emailaddress, l.postcode, l.country FROM LabContact c INNER JOIN Person pe ON c.personid = pe.personid INNER JOIN Laboratory l ON l.laboratoryid = pe.laboratoryid INNER JOIN Proposal p ON p.proposalid = c.proposalid WHERE c.proposalid = 'testProposalId' AND c.labcontactid='testLabContactId' ORDER BY c.labcontactid DESC LIMIT 0,50", $this->db->getLastQuery());
    }

    public function testGetLabContactsWithoutLabContactCreatesCorrectSql(): void
    {
        $this->contactData->getLabContacts('testProposalId', null, 1, 50);
        $this->assertEquals("SELECT c.labcontactid, c.cardname, pe.givenname, pe.familyname, pe.phonenumber, l.name as labname, l.address, l.city, l.country, c.courieraccount, c.billingreference, c.defaultcourriercompany, c.dewaravgcustomsvalue, c.dewaravgtransportvalue, pe.emailaddress, l.postcode, l.country FROM LabContact c INNER JOIN Person pe ON c.personid = pe.personid INNER JOIN Laboratory l ON l.laboratoryid = pe.laboratoryid INNER JOIN Proposal p ON p.proposalid = c.proposalid WHERE c.proposalid = 'testProposalId' ORDER BY c.labcontactid DESC LIMIT 0,50", $this->db->getLastQuery());
    }

}