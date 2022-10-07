<?php declare(strict_types=1);

namespace SynchWeb\Authentication;

use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Authentication\AuthenticationService;
use SynchWeb\DataLayer\AuthenticationData;
use SynchWeb\Authentication\Output;

require_once __DIR__ . '/Utils/Functions.php';

class AppStub
{
    public function conditions()
    {
    }
}

final class AuthenticationServiceTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $serviceStub;
    private $slimStub;
    private $dataLayerStub;

    protected function setUp(): void
    {
        Output::reset();
        $this->slimStub = Mockery::mock('Slim\Slim');
        $this->slimStub->shouldReceive('post')->times(1)->andReturn(new AppStub());
        $this->slimStub->shouldReceive('get')->times(3);
        $this->dataLayerStub = $this->getMockBuilder(AuthenticationData::class)
            ->disableOriginalConstructor()
            ->disableOriginalClone()
            ->disableArgumentCloning()
            ->disallowMockingUnknownTypes()
            ->getMock();
    }


    protected function tearDown(): void
    {
        Mockery::close();
        Output::reset();
    }

    public function testConstructorSetsUpExpectedRoutes(): void
    {
        new AuthenticationService($this->slimStub, $this->dataLayerStub);
    }

    public function testGetUserInitiallyReturnsNull(): void
    {
        $authService = new AuthenticationService($this->slimStub, $this->dataLayerStub);
        $this->assertNull($authService->getUser());
    }

    private function setupMockRequest(): \Slim\Http\Request
    {
        $environment = \Slim\Environment::mock([
            'REQUEST_METHOD' => 'GET',
            'REQUEST_URI' => '/echo',
            'QUERY_STRING' => 'foo=bar']
        );
        return new \Slim\Http\Request($environment);
    }
    public function testCheckResultsInitiallyFails(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);
        $authService = new AuthenticationService($this->slimStub, $this->dataLayerStub, false); // a bit of a hack - if the service uses exit() it is untestable as this will end the process prematurely
        $authService->check();

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 400', Output::$headers);
    }

    public function testValidateAuthenticationInitiallyFails(): void
    {
        $request = $this->setupMockRequest();
        $this->slimStub->shouldReceive('request')->times(2)->andReturn($request);
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);

        $authService = new AuthenticationService($this->slimStub, $this->dataLayerStub, false);
        $authService->validateAuthentication();

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 401', Output::$headers);
    }
}