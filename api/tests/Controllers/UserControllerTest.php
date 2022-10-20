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
        $this->slimStub->shouldReceive('contentType')->times(1);
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

    public function testGetCurrentUserReturnsCorrectData(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);

        $this->userController->getCurrentUser();
        $this->assertEquals('{"personid":231312,"user":"blah","givenname":"frod","permissions":["read","write"],"is_staff":false,"visits":[],"ty":null}', $response->getBody());
    }

    public function testGetTimeReturnsExpectedData(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);

        $this->userController->getTime();
        $this->assertStringStartsWith('{"TIME":"', $response->getBody());
    }
}