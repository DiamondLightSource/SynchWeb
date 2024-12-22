<?php

declare(strict_types=1);

namespace Tests\Model\Services;

use Tests\Model\Services\BaseUserDataTestCase;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class UserDataSingleInvocationTest extends BaseUserDataTestCase
{
    use \phpmock\phpunit\PHPMock;

    protected function setUp(): void
    {
        $this->setUpMocks(1);
    }

    public function testAddGroup(): void
    {
        $id = $this->userData->addGroup("testGroup");
        $this->assertEquals("INSERT INTO UserGroup (name) VALUES ('testGroup')", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testUpdateGroup(): void
    {
        $this->userData->updateGroup(1, "testGroup");
        $this->assertEquals("UPDATE UserGroup SET name='testGroup' WHERE usergroupid=1", $this->db->getLastQuery());
    }

    public function testGetGroupsWithGidSpecified(): void
    {
        $this->userData->getGroups(1);
        $this->assertEquals("SELECT g.usergroupid, g.name, count(uhp.personid) as users FROM UserGroup g LEFT OUTER JOIN UserGroup_has_Person uhp ON uhp.usergroupid = g.usergroupid WHERE g.usergroupid=1 GROUP BY g.usergroupid, g.name ORDER BY g.name", $this->db->getLastQuery());
    }

    public function testGetGroupsWithGidUnspecified(): void
    {
        $this->userData->getGroups();
        $this->assertEquals("SELECT g.usergroupid, g.name, count(uhp.personid) as users FROM UserGroup g LEFT OUTER JOIN UserGroup_has_Person uhp ON uhp.usergroupid = g.usergroupid GROUP BY g.usergroupid, g.name ORDER BY g.name", $this->db->getLastQuery());
    }

    public function testGetPermissionsWithDefaults(): void
    {
        $this->userData->getPermissions();
        $this->assertEquals("SELECT p.permissionid, p.type, p.description FROM Permission p WHERE 1=1 ORDER BY p.type LIMIT 0,15", $this->db->getLastQuery());
    }

    public function testGetPermissionsCountWithDefaults(): void
    {
        $this->userData->getPermissions(true);
        $this->assertEquals("SELECT count(p.permissionid) as tot FROM Permission p WHERE 1=1 ", $this->db->getLastQuery());
    }

    public function testGetPermissionsCountWithVals(): void
    {
        $this->userData->getPermissions(true, 'ss', 11, 22, 10, 2);
        $this->assertEquals("SELECT count(p.permissionid) as tot FROM Permission p INNER JOIN UserGroup_has_Permission uhp ON uhp.permissionid = p.permissionid WHERE 1=1 AND uhp.usergroupid=11 AND p.permissionid=22 AND (lower(p.type) LIKE lower(CONCAT(CONCAT('%','ss'),'%')))", $this->db->getLastQuery());
    }

    public function testGetPermissionsWithVals(): void
    {
        $this->userData->getPermissions(false, 'ss', 11, 22, 10, 20);
        $this->assertEquals("SELECT p.permissionid, p.type, p.description FROM Permission p INNER JOIN UserGroup_has_Permission uhp ON uhp.permissionid = p.permissionid WHERE 1=1 AND uhp.usergroupid=11 AND p.permissionid=22 AND (lower(p.type) LIKE lower(CONCAT(CONCAT('%','ss'),'%'))) ORDER BY p.type LIMIT 190,10", $this->db->getLastQuery());
    }

    public function testAddGroupPermission(): void
    {
        $id = $this->userData->addGroupPermission(11, 22);
        $this->assertEquals("INSERT INTO UserGroup_has_Permission (usergroupid, permissionid) VALUES (11,22)", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testAddGroupUser(): void
    {
        $id = $this->userData->addGroupUser(11, 22);
        $this->assertEquals("INSERT INTO UserGroup_has_Person (usergroupid, personid) VALUES (22,11)", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testAddPermission(): void
    {
        $id = $this->userData->addPermission('a test type', 'a new test permission');
        $this->assertEquals("INSERT INTO Permission (type,description) VALUES ('a test type','a new test permission')", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testAddUserWithEmail(): void
    {
        $id = $this->userData->addUser('testLoginId', 'Bob', 'Tester', 'test@tester.com');
        $this->assertEquals("INSERT INTO Person (login, givenname, familyname, emailaddress) VALUES ('testLoginId', 'Bob', 'Tester', 'test@tester.com')", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testAddUserWithoutEmail(): void
    {
        $id = $this->userData->addUser('testLoginId', 'Bob', 'Tester');
        $this->assertEquals("INSERT INTO Person (login, givenname, familyname, emailaddress) VALUES ('testLoginId', 'Bob', 'Tester', null)", $this->db->getLastQuery());
        $this->assertEquals(666, $id);
    }

    public function testCheckLogin(): void
    {
        $res = $this->userData->checkLogin('testLoginId');
        $this->assertEquals("SELECT login FROM Person WHERE login='testLoginId'", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetLaboratory(): void
    {
        $res = $this->userData->getLaboratory(1);
        $this->assertEquals("SELECT l.name, l.address, l.city, l.postcode, l.country FROM Laboratory l WHERE l.laboratoryid=1", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUser(): void
    {
        $res = $this->userData->getUser(123, 1, 2);
        $this->assertEquals("SELECT p.personid, p.laboratoryid FROM Person p LEFT OUTER JOIN ProposalHasPerson php ON php.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE (p.personid=123 OR php.proposalid=1 OR lc.proposalid=1) AND p.personid=2", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithDefaults(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithDefaults(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.familyname,p.givenname LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithInvalidSortBy(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'blah');
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBy(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN');
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithInvalidSortBy(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'blah');
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.familyname,p.givenname LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortBy(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN');
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p WHERE p.login IS NOT NULL AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypID(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE p.login IS NOT NULL AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPid(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE p.login IS NOT NULL AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonId(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonId(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManager(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6, true);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManager(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6, true);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=null) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserId(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserId(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserIdGid(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7, 8);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid INNER JOIN UserGroup_has_Person uhp ON uhp.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) AND uhp.usergroupid=8 GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserIdGid(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6, true, 8);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=8) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserIdPjid(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7, null, 10);
        $this->assertEquals("SELECT CONCAT(p.personid, '-', php.projectid) as ppid, p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid INNER JOIN Project_has_Person php ON p.personid = php.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) AND php.projectid=10 GROUP BY p.personid ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserIdPjId(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7, null, 10);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid INNER JOIN Project_has_Person php ON p.personid = php.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) AND php.projectid=10", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserIdVisitname(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7, null, null, 'mx12345-1');
        $this->assertEquals("SELECT count(ses.sessionid) as visits, DATE_FORMAT(max(ses.startdate), '%d-%m-%Y') as last, shp.remote, shp.role, p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid INNER JOIN Session_has_Person shp ON shp.personid = p.personid INNER JOIN BLSession s ON shp.sessionid = s.sessionid INNER JOIN Proposal pr ON pr.proposalid = s.proposalid LEFT OUTER JOIN Session_has_Person shp2 ON p.personid = shp2.personid LEFT OUTER JOIN BLSession ses ON ses.sessionid = shp2.sessionid AND ses.startdate < s.startdate WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) AND shp.remote IS NOT NULL AND pr.proposalcode = 'mx' AND pr.proposalnumber = '12345' AND s.visit_number = '1' GROUP BY p.personid, p.givenname, p.familyname, p.login ORDER BY p.login ASC LIMIT 30,15", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserIdVisitname(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 3, 'LOGIN', 5, 5, 6, true, 7, null, null, 'mx12345-1');
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p INNER JOIN Session_has_Person shp ON shp.personid = p.personid INNER JOIN BLSession s ON shp.sessionid = s.sessionid INNER JOIN Proposal pr ON pr.proposalid = s.proposalid LEFT OUTER JOIN Session_has_Person shp2 ON p.personid = shp2.personid LEFT OUTER JOIN BLSession ses ON ses.sessionid = shp2.sessionid AND ses.startdate < s.startdate WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) AND shp.remote IS NOT NULL AND pr.proposalcode = 'mx' AND pr.proposalnumber = '12345' AND s.visit_number = '1'", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserIdPerPage(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 1, 'LOGIN', 5, 5, 6, true, 7, null, null, null, 3);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login ASC LIMIT 0,3", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserIdPerPage(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 1, 'LOGIN', 5, 5, 6, true, 7, null, null, null, 3);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersCountWithValidSortByPidPersonIdIsManagerCurrentUserIdPerPageDir(): void
    {
        $res = $this->userData->getUsers(true, true, 's', 1, 'LOGIN', 5, 5, 6, true, 7, null, null, null, 3, false);
        $this->assertEquals("SELECT count(distinct p.personid) as tot FROM Person p LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE 1=1 AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%'))", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testGetUsersWithValidSortBypIDPersonIdIsManagerCurrentUserIdPerPageDirAndIsOnlyLogin(): void
    {
        $res = $this->userData->getUsers(false, true, 's', 1, 'LOGIN', 5, 5, 6, true, 7, null, null, null, 3, false, false, true);
        $this->assertEquals("SELECT p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country FROM Person p LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid LEFT OUTER JOIN LabContact lc ON lc.personid = p.personid WHERE p.login IS NOT NULL AND (prhp.proposalid=5 OR lc.proposalid=5 OR p.personid=7) AND p.personid=6 AND (p.familyname LIKE CONCAT('%','s','%') OR p.givenname LIKE CONCAT('%','s','%') OR p.login LIKE CONCAT('%','s','%')) GROUP BY p.personid ORDER BY p.login DESC LIMIT 0,3", $this->db->getLastQuery());
        $this->assertEmpty($res);
    }

    public function testRemoveGroupPermission(): void
    {
        $this->userData->removeGroupPermission(1, 2);
        $this->assertEquals("DELETE FROM UserGroup_has_Permission WHERE usergroupid=1 and permissionid=2", $this->db->getLastQuery());
    }

    public function testUpdateUserAllFields(): void
    {
        $this->userData->updateUser(123, 'Bob', 'Tester', '641 5231', 'test@tester.com');
        $this->assertEquals("UPDATE Person SET FAMILYNAME='Bob', GIVENNAME='Tester', PHONENUMBER='641 5231', EMAILADDRESS='test@tester.com' WHERE personid=123", $this->db->getLastQuery());
    }

    public function testUpdateUserNumberField(): void
    {
        $this->userData->updateUser(123, Null, Null, '641 5231', Null);
        $this->assertEquals("UPDATE Person SET PHONENUMBER='641 5231' WHERE personid=123", $this->db->getLastQuery());
    }

    public function testUpdateLaboratoryLabSpecified(): void
    {
        $this->userData->updateLaboratory(123, 'lab name', 'lab address', 'city', 'postcode', 'country', 321);
        $this->assertEquals("UPDATE Laboratory SET name='lab name', address='lab address', city='city', postcode='postcode', country='country' WHERE laboratoryid=321", $this->db->getLastQuery());
    }

    public function testRemoveGropuUser(): void
    {
        $this->userData->removeGroupUser(1, 2);
        $this->assertEquals("DELETE FROM UserGroup_has_Person WHERE usergroupid=2 and personid=1", $this->db->getLastQuery());
    }

    public function testUpdatePermission(): void
    {
        $this->userData->updatePermission(1, 'mx', 'perm description');
    }
}
