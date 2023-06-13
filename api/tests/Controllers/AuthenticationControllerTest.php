<?php declare(strict_types=1);

namespace SynchWeb\Controllers;

use Exception;
use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Controllers\AuthenticationController;
use SynchWeb\Model\Services\AuthenticationData;
use SynchWeb\Authentication\AuthenticationTypeFactory;
use SynchWeb\Controllers\Output;
use SynchWeb\Controllers\AppStub;

require_once __DIR__ . '/Utils/Functions.php';

final class AuthenticationControllerTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $serviceStub;
    private $slimStub;
    private $dataLayerStub;

    /**
     * Expect the function to return an exception and then carry on
     */
    public function expectExceptionOn($function_throwing_exception, $errorMessage = AuthenticationController::ErrorUnderTestExceptionMessage) {
        try {
            $function_throwing_exception();
            $this->fail("Exception not thrown");
        }
        catch (\Exception $e) {
            if ($e->getMessage() !== $errorMessage) {
                throw $e;
            }            
        }
    }

    /**
     * We expect slim to recieve method calls about request made and responses to those requests
     */
    private function setupSlimStubsRequestAndResponse($expectedRequestCalls, $expectedReponseCalls)
    {
        $environment = \Slim\Environment::mock([
            'REQUEST_METHOD' => 'GET',
            'REQUEST_URI' => '/echo',
            'QUERY_STRING' => 'foo=bar'
        ]);
        $request = new \Slim\Http\Request($environment);
        $this->slimStub->shouldReceive('request')->times($expectedRequestCalls)->andReturn($request);
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times($expectedReponseCalls)->andReturn($response);
    }

    /**
     * Set up auth controller with mocked authentication type in
     */
    private function setUpAuthControllerWithMockedAuthType($authTypeMethod, $authTypeReturnValue) {
        global $authentication_type;
        $authentication_type="test";
        $authTypeMock = Mockery::mock('AuthenticationType');
        $authTypeMock->shouldReceive($authTypeMethod)->andReturn($authTypeReturnValue);
        $mockAuthFactory = Mockery::mock('AuthenticationTypeFactory');
        $mockAuthFactory->shouldReceive('create')->with($authentication_type)->andReturn($authTypeMock);
        return new AuthenticationController($this->slimStub, $this->dataLayerStub, false, $mockAuthFactory);
    }

    protected function setUp(): void
    {
        global $authentication_type;
        $authentication_type = "cas";
        Output::reset();
        $this->slimStub = Mockery::mock('Slim\Slim');
        $this->slimStub->shouldReceive('post')->times(2)->andReturn(new AppStub());
        $this->slimStub->shouldReceive('get')->times(4);
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
        new AuthenticationController($this->slimStub, $this->dataLayerStub, false);
    }

    public function testGivenUnknownAuthTypeWhenCheckThenInternalServerError(): void
    {
        global $authentication_type;
        $authentication_type = "unknown";
        $this->setupSlimStubsRequestAndResponse(0,1);
        
        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false);

        $this->expectExceptionOn( function () use ($authService){
            $authService->check();
        });
        
        $this->assertContains('X-PHP-Response-Code: 500', Output::$headers);
    }

    public function testCheckResultsInitiallyFails(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);
        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false);
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->check();
        });
        
        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 400', Output::$headers);
    }

    public function testGetUserWithNoTokenInitiallyReturnsUnauthorised(): void
    {
        $this->setupSlimStubsRequestAndResponse(2, 1);
        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false);
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->getUser();
        });

        $this->assertContains('X-PHP-Response-Code: 401', Output::$headers);
    }

    public function testValidateAuthenticationInitiallyFails(): void
    {
        $this->setupSlimStubsRequestAndResponse(2,1);
        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false);
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->validateAuthentication();
        });

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 401', Output::$headers);
    }

    public function testCodeAuthenticationInitiallyFailsWhenAuthenticationTypeReturnsFalse(): void
    {
        $request = $this->setupSlimStubsRequestAndResponse(1, 1);
        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false); //Use default CAS auth to return type
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->authenticateByCode();
        });

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 401', Output::$headers);
    }

    public function testCodeAuthenticationWhenGetValidFedIdReturnsSuccess(): void
    {
        global $jwt_key;
        $jwt_key = "test_key";
        
        $expectedFedID = "FedId012";
        $_SERVER['HTTP_HOST'] = "host";

        $this->setupSlimStubsRequestAndResponse(1, 1);
        $authService = $this->setUpAuthControllerWithMockedAuthType("authenticateByCode", $expectedFedID);
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->authenticateByCode();
        });

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 200', Output::$headers);
    }


    public function testNoSSOAuthorisationRedirect(): void
    {
        $response = new \Slim\Http\Response();
        $this->slimStub->shouldReceive('response')->times(1)->andReturn($response);

        $authService = new AuthenticationController($this->slimStub, $this->dataLayerStub, false);
        
        $this->expectExceptionOn( function () use ($authService){
            $authService->authorise();
        });

        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 501', Output::$headers);
    }

    public function testValidateAuthorisationRedirect(): void
    {
        global $cas_sso;
        $cas_sso = true;

        $_SERVER['HTTP_REFERER'] = "localhost/test";
        $expectedURL = "expectedRedirectURL";

        $this->setupSlimStubsRequestAndResponse(0, 1);
        $authService = $this->setUpAuthControllerWithMockedAuthType("authorise", $expectedURL);

        $this->expectExceptionOn( function () use ($authService){
            $authService->authorise();  // once a function calls an exception the stack finishes to add finally to run final tests.
        });
        $this->assertContains('Content-Type: application/json', Output::$headers);
        $this->assertContains('X-PHP-Response-Code: 302', Output::$headers);
    }
}