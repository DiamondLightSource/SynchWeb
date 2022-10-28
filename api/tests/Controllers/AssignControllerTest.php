<?php declare(strict_types=1);

namespace SynchWeb\Controllers;

use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Controllers\AssignController;
use SynchWeb\Model\Services\AssignData;
use SynchWeb\Model\User;
use SynchWeb\Database\Type\MySQL;
use SynchWeb\Controllers\AppStub;

require_once __DIR__ . '/Utils/Functions.php';

final class AssignControllerTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $serviceStub;
    private $slimStub;
    private $dataLayerStub;
    private $dbStub;
    private $user;
    private $assignController;

    protected function setUp(): void
    {
        Output::reset();
        $this->slimStub = Mockery::mock('Slim\Slim');
        $this->dataLayerStub = $this->getMockBuilder(AssignData::class)
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
        $this->assignController = Mockery::mock('SynchWeb\Controllers\AssignController')->makePartial();
        $this->assignController->shouldReceive('_setup_routes')->times(1)->andReturn(Mockery::self());;
        $this->assignController->__construct($this->slimStub, $this->dbStub, $this->user, $this->dataLayerStub);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        Output::reset();
    }

    function setUpCommonResponse($responseTimes = 1): \Slim\Http\Response
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times($responseTimes)->andReturn($response);
        $this->slimStub->shouldReceive('contentType')->times($responseTimes);
        return $response;
    }

    public function testAssignContainerReturnsZeroWhenNoContainerFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['cid'] = 4;
        $this->assignController->args['pos'] = 5;
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainer')->with(3, 4, 5)->willReturn(array());


        $this->assignController->assignContainer();
        $this->assertEquals(0, $response->getBody());
    }
    public function testAssignContainerReturnsOneWhenNoContainerFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['cid'] = 4;
        $this->assignController->args['pos'] = 5;
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainer')->with(3, 4, 5)->willReturn(array(1,2,3));


        $this->assignController->assignContainer();
        $this->assertEquals(1, $response->getBody());
    }
}