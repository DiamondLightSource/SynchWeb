<?php declare(strict_types=1);

namespace SynchWeb\Controllers;

use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Controllers\UserController;
use SynchWeb\Model\Services\UserData;
use SynchWeb\Model\User;
use SynchWeb\Database\Type\MySQL;
use SynchWeb\Controllers\AppStub;

require_once __DIR__ . '/Utils/Functions.php';

final class UserControllerTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $serviceStub;
    private $slimStub;
    private $dataLayerStub;
    private $dbStub;
    private $user;
    private $userController;

    protected function setUp(): void
    {
        Output::reset();
        $this->slimStub = Mockery::mock('Slim\Slim');
        $this->dataLayerStub = $this->getMockBuilder(UserData::class)
            ->disableOriginalConstructor()
            ->disableOriginalClone()
            ->disableArgumentCloning()
            ->disallowMockingUnknownTypes()
            ->getMock();
        $this->dbStub = $this->getMockBuilder(MySQL::class)
            ->disableOriginalConstructor()
            ->disableOriginalClone()
            ->disableArgumentCloning()
            ->disallowMockingUnknownTypes()
            ->getMock();
    
        $this->user = new User("blah", 231312, "frod", "blegs", array("read", "write"), array(), array());
        $this->userController = Mockery::mock('SynchWeb\Controllers\UserController')->makePartial();
        $this->userController->shouldReceive('_setup_routes')->times(1)->andReturn(Mockery::self());;
        $this->userController->__construct($this->slimStub, $this->dbStub, $this->user, $this->dataLayerStub);
    }


    protected function tearDown(): void
    {
        Mockery::close();
        Output::reset();
    }

    function setUpCommonResponse(): \Slim\Http\Response
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);
        $this->slimStub->shouldReceive('contentType')->times(1);
        return $response;
    }

    public function testGetCurrentUserReturnsCorrectData(): void
    {
        $response = $this->setUpCommonResponse();

        $this->userController->getCurrentUser();
        $this->assertEquals('{"personid":231312,"user":"blah","givenname":"frod","permissions":["read","write"],"is_staff":false,"visits":[],"ty":null}', $response->getBody());
    }

    public function testGetTimeReturnsExpectedData(): void
    {
        $response = $this->setUpCommonResponse();

        $this->userController->getTime();
        $this->assertStringStartsWith('{"TIME":"', $response->getBody());
    }

    public function testGetGroupsFailsIfLackingPermissions(): void
    {
        $response = $this->setUpCommonResponse();
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_groups"}');

        $this->userController->_get_groups();
    }

    public function testGetGroupsCompletesIfHaveCorrectPermissions(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->slimStub->shouldReceive('halt')->times(0);

        $this->userController->_get_groups();
        $this->assertEquals('null', $response->getBody());
    }

    public function testGetGroupsWithGidSpecifiedReturnsNoData(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('contentType')->times(0);
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['gid'] = 3;
        $this->dataLayerStub->expects($this->exactly(1))->method('getGroups')->with(3)->willReturn(array());

        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No such group"}');
        $this->userController->_get_groups();
        $this->assertEmpty($response->getBody());
    }

    public function testGetGroupsWithGidSpecifiedReturnsData(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['gid'] = 3;
        $this->dataLayerStub->expects($this->exactly(1))->method('getGroups')->with(3)->willReturn(array(61,2,3));

        $this->userController->_get_groups();
        $this->assertEquals(61, $response->getBody());
    }

    public function testAddGroupFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_groups"}')->andThrow(new \Exception);

        $this->userController->_add_group();
    }

    public function testAddGroupWithNameSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['NAME'] = 'test group name';
        $this->dataLayerStub->expects($this->exactly(1))->method('addGroup')->with('test group name')->willReturn(61);

        $this->userController->_add_group();
        $this->assertEquals('{"USERGROUPID":61}', $response->getBody());
    }

    public function testAddGroupWithNoNameSpecifiedReturnsError(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('contentType')->times(0);
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['NONAME'] = 'test group';

        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No group name"}');
        $this->userController->_add_group();
        $this->assertEmpty($response->getBody());
    }

    public function testUpdateGroupFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_groups"}')->andThrow(new \Exception);

        $this->userController->_update_group();
    }

    public function testUpdateGroupWithGidAndNameSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['gid'] = 3;
        $this->userController->args['NAME'] = 'new name';
        $this->dataLayerStub->expects($this->exactly(1))->method('updateGroup')->with(3, 'new name')->willReturn(61);

        $this->userController->_update_group();
        $this->assertEquals('{"NAME":"new name"}', $response->getBody());
    }

    public function testUpdateGroupWithNoGidSpecifiedReturnsError(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Missing propery: gid');
        array_push($this->user->perms, 'manage_groups');

        $this->userController->_update_group();
    }

    public function testAddGroupPermissionFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_groups"}')->andThrow(new \Exception);

        $this->userController->_add_group_permission();
    }

    public function testAddGroupPermissionWithGidAndPidSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['gid'] = 3;
        $this->userController->args['pid'] = 6;
        $this->dataLayerStub->expects($this->exactly(1))->method('addGroupPermission')->with(3, 6)->willReturn(61);

        $this->userController->_add_group_permission();
        $this->assertEquals('{"USERGROUPID":3,"PERMISSIONID":6}', $response->getBody());
    }

    public function testAddGroupPermissionWithNoGidSpecifiedReturnsError(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Missing propery: gid');
        array_push($this->user->perms, 'manage_groups');

        $this->userController->_add_group_permission();
    }

    public function testRemoveGroupPermissionFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_groups"}')->andThrow(new \Exception);

        $this->userController->_remove_group_permission();
    }

    public function testRemoveGroupPermissionWithGidAndPidSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_groups');
        $this->userController->args['gid'] = 3;
        $this->userController->args['pid'] = 6;
        $this->dataLayerStub->expects($this->exactly(1))->method('removeGroupPermission')->with(3, 6)->willReturn(61);

        $this->userController->_remove_group_permission();
        $this->assertEquals(1, $response->getBody());
    }

    public function testRemoveGroupPermissionWithNoGidSpecifiedReturnsError(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Missing propery: gid');
        array_push($this->user->perms, 'manage_groups');

        $this->userController->_remove_group_permission();
    }

    public function testGetUsersWithInvalidPersonIdReturnsNoData(): void
    {
        $this->userController->args['PERSONID'] = 88;
        $this->dataLayerStub->expects($this->exactly(1))->method('getUsers')->with(false, false, '', '', '', '', 88, false, 231312, '', '', '', '', 15, '')->willReturn(array());
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No such user"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->userController->_get_users();
    }

    public function testGetUsersWithPersonIdReturnsNoTotalData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->userController->args['PERSONID'] = 88;
        $this->dataLayerStub->expects($this->exactly(1))->method('getUsers')->with(false, false, '', '', '', '', 88, false, 231312, '', '', '', '', 15, '')->willReturn(array(9));

        $this->userController->_get_users();
        $this->assertEquals(9, $response->getBody());
    }

    public function testGetUsersWithoutPersonIdReturnsTotalsWithResults(): void
    {
        $response = $this->setUpCommonResponse();
        $this->userController->_get_users();
        $this->assertEquals('{"total":null,"data":null}', $response->getBody());
    }

    public function testCheckLoginFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_users"}')->andThrow(new \Exception);

        $this->userController->_check_login();
    }

    public function testCheckLoginWithValidLoginSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_users');
        $this->userController->args['LOGIN'] = 'fdsfdsfsdfs';
        $this->dataLayerStub->expects($this->exactly(1))->method('checkLogin')->with('fdsfdsfsdfs')->willReturn(array(61));

        $this->userController->_check_login();
        $this->assertEquals('{}', $response->getBody());
    }

    public function testCheckLoginWithInvalidLoginSpecifiedReturnsCorrectly(): void
    {
        array_push($this->user->perms, 'manage_users');
        $this->userController->args['LOGIN'] = 'fdsfdsfsdfs';
        $this->dataLayerStub->expects($this->exactly(1))->method('checkLogin')->with('fdsfdsfsdfs')->willReturn(array());
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"Login not used"}')->andThrow(new \Exception);

        $this->userController->_check_login();
    }

    public function testUpdateGroupWithNoLoginSpecifiedReturnsError(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Missing propery: LOGIN');
        array_push($this->user->perms, 'manage_users');

        $this->userController->_check_login();
    }

    public function testAddUserFailsIfLackingPermissions(): void
    {
        // note, we artificially throw an exception here, to ensure the test finishes at the point of halt()
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(403, '{"status":403,"message":"Access Denied","title":"You do not have the permission: manage_users"}')->andThrow(new \Exception);

        $this->userController->_add_user();
    }

    public function testAddUserWithValidInputsSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_users');
        $this->userController->args['LOGIN'] = 'loginId';
        $this->userController->args['GIVENNAME'] = 'given';
        $this->userController->args['FAMILYNAME'] = 'family';
        $this->dataLayerStub->expects($this->exactly(1))->method('addUser')->with(
            $this->userController->args['LOGIN'],
            $this->userController->args['GIVENNAME'],
            $this->userController->args['FAMILYNAME'],
            null)->willReturn(array(61));

        $this->userController->_add_user();
        $this->assertEquals('{"PERSONID":[61]}', $response->getBody());
    }

    public function testAddUserWithValidInputsAndEmailSpecifiedReturnsCorrectly(): void
    {
        $response = $this->setUpCommonResponse();
        array_push($this->user->perms, 'manage_users');
        $this->userController->args['LOGIN'] = 'loginId';
        $this->userController->args['GIVENNAME'] = 'given';
        $this->userController->args['FAMILYNAME'] = 'family';
        $this->userController->args['EMAILADDRESS'] = 'email';
        $this->dataLayerStub->expects($this->exactly(1))->method('addUser')->with(
            $this->userController->args['LOGIN'],
            $this->userController->args['GIVENNAME'],
            $this->userController->args['FAMILYNAME'],
            $this->userController->args['EMAILADDRESS'])->willReturn(array(61));

        $this->userController->_add_user();
        $this->assertEquals('{"PERSONID":[61]}', $response->getBody());
    }

    public function testUpdateUserWithInvalidPersonIdReturnsNoData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->userController->args['PERSONID'] = 88;
        $this->dataLayerStub->expects($this->exactly(1))->method('getUsers')->with()->willReturn(array());
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No such person"}')->andThrow(new \Exception);

        $this->userController->_update_user();
        $this->assertEquals(9, $response->getBody());
    }

    public function testUpdateUserWithoutPersonIdReturnsTotalsWithResults(): void
    {
        $this->expectException(\Exception::class);
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No person specified"}')->andThrow(new \Exception);
        $this->userController->_update_user();
    }





}