<?php declare(strict_types=1);

namespace SynchWeb\Controllers;

use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\AssignData;
use SynchWeb\Model\User;
use SynchWeb\Database\Type\MySQL;

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
        $this->assignController->shouldReceive('_setup_routes')->times(1)->andReturn(Mockery::self());
        $this->assignController->__construct($this->slimStub, $this->dbStub, $this->user, $this->dataLayerStub);

        global $ip2bl;
        $ip2bl = array(103 => 'i03');

        global $bl_pv_map;
        $bl_pv_map = array(
            'i02' => 'BL02I',
            'i03' => 'BL03I',
        );
        global $bl_pv_env;
        $bl_pv_env = 'EPICS_CA_ADDR_LIST_TEST=666.45.678.9';
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
        $this->dataLayerStub->expects($this->never())->method('assignContainer');

        $this->assignController->assignContainer();
        $this->assertEquals(0, $response->getBody());
    }
    public function testAssignContainerReturnsOneWhenContainerFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['cid'] = 4;
        $this->assignController->args['pos'] = 5;
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainer')->with(3, 4, 5)->willReturn(array(1,2,3));
        $this->dataLayerStub->expects($this->exactly(1))->method('assignContainer')->with(1, 5);

        $this->assignController->assignContainer();
        $this->assertEquals(1, $response->getBody());
    }

    public function testUnassignContainerReturnsZeroWhenNoContainerFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['cid'] = 4;
        $this->assignController->args['pos'] = 5;
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainer')->with(3, 4, 5)->willReturn(array());
        $this->dataLayerStub->expects($this->never())->method('unassignContainer');

        $this->assignController->unassignContainer();
        $this->assertEquals(0, $response->getBody());
    }
    public function testUnassignContainerReturnsOneWhenContainerFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['cid'] = 4;
        $this->assignController->args['pos'] = 5;
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainer')->with(3, 4, 5)->willReturn(array(1,2,3));
        $this->dataLayerStub->expects($this->exactly(1))->method('unassignContainer')->with(1);

        $this->assignController->unassignContainer();
        $this->assertEquals(1, $response->getBody());
    }

    public function testDeactivateDewarReturnsZeroWhenNoDewarFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['did'] = 4;
        $this->assignController->proposalid = 66;
        $this->dataLayerStub->expects($this->exactly(1))->method('getDewar')->with(4, 66, 3)->willReturn(array());
        $this->dataLayerStub->expects($this->never())->method('deactivateDewar');

        $this->assignController->deactivateDewar();
        $this->assertEquals(0, $response->getBody());
    }

    public function testDeactivateDewarReturnsOneWhenDewarFound(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['visit'] = 3;
        $this->assignController->args['did'] = 4;
        $this->assignController->proposalid = 66;
        $this->dataLayerStub->expects($this->exactly(1))->method('getDewar')->with(4, 66, 3)->willReturn(array(1,2,3));
        $this->dataLayerStub->expects($this->exactly(1))->method('deactivateDewar')->with(4);

        $this->assignController->deactivateDewar();
        $this->assertEquals(1, $response->getBody());
    }

    public function testGetBeamlineVisitsWithInvalidNoConfigReturnsNothing(): void
    {
        $response = $this->setUpCommonResponse();
        $_SERVER['REMOTE_ADDR'] = '';

        $this->assignController->getBeamlineVisits();
        $this->assertEquals('[]', $response->getBody());
    }

    public function testGetBeamlineVisitsWithValidConfigReturnsNothing(): void
    {
        $response = $this->setUpCommonResponse();
        $_SERVER['REMOTE_ADDR'] = 'www.diamond.103.com';
        $this->dbStub->expects($this->exactly(1))->method('pq')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) < 1 AND TIMESTAMPDIFF('DAY', CURRENT_TIMESTAMP, s.enddate) < 2 AND s.beamlinename LIKE :1 ORDER BY s.startdate", array('i03'))->willReturn(array());
        $this->dbStub->expects($this->exactly(1))->method('paginate')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode LIKE 'cm' AND s.beamlinename LIKE :1 AND s.enddate <= CURRENT_TIMESTAMP ORDER BY s.startdate DESC", array('i03', 0, 1))->willReturn(array());

        $this->assignController->getBeamlineVisits();
        $this->assertEquals('[]', $response->getBody());
    }

    public function testGetBeamlineVisitsWithValidConfigAndVisitReturnsData(): void
    {
        $visitId = 123;
        $response = $this->setUpCommonResponse();
        $_SERVER['REMOTE_ADDR'] = 'www.diamond.103.com';
        $result = ['VISIT' => $visitId, 'BL' => 'test03'];
        $this->dbStub->expects($this->exactly(1))->method('pq')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) < 1 AND TIMESTAMPDIFF('DAY', CURRENT_TIMESTAMP, s.enddate) < 2 AND s.beamlinename LIKE :1 ORDER BY s.startdate", array('i03'))->willReturn(array($result));
        $this->dbStub->expects($this->exactly(1))->method('paginate')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode LIKE 'cm' AND s.beamlinename LIKE :1 AND s.enddate <= CURRENT_TIMESTAMP ORDER BY s.startdate DESC", array('i03', 0, 1))->willReturn(array());

        $this->assignController->getBeamlineVisits($visitId);
        $this->assertEquals('{"VISIT":123,"BL":"test03"}', $response->getBody());
    }

    public function testGetBeamlineVisitsWithValidConfigAndInvalidVisitReturnsError(): void
    {
        $visitId = 123;
        $_SERVER['REMOTE_ADDR'] = 'www.diamond.103.com';
        $result = ['VISIT' => 1230, 'BL' => 'test03'];
        $this->dbStub->expects($this->exactly(1))->method('pq')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) < 1 AND TIMESTAMPDIFF('DAY', CURRENT_TIMESTAMP, s.enddate) < 2 AND s.beamlinename LIKE :1 ORDER BY s.startdate", array('i03'))->willReturn(array($result));
        $this->dbStub->expects($this->exactly(1))->method('paginate')->with("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode LIKE 'cm' AND s.beamlinename LIKE :1 AND s.enddate <= CURRENT_TIMESTAMP ORDER BY s.startdate DESC", array('i03', 0, 1))->willReturn(array());

        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No such visit"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->assignController->getBeamlineVisits($visitId);
    }

    public function testGetPuckNamesWithoutPropThrowsError(): void
    {
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No proposal specified"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->assignController->getPuckNames();
    }

    public function testGetPuckNamesWithPropNoBlThrowsError(): void
    {
        $this->assignController->args['prop'] = 3;
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No beamline specified"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->assignController->getPuckNames();
    }

    public function testGetPuckNamesWithPropAndInvalidBlThrowsError(): void
    {
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'test';
    
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No such beamline"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->assignController->getPuckNames();
    }

    public function testGetPuckNamesWithPropAndValidBlReturnsNothing(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'i03';
        $this->assignController->proposalid = 3;
        $this->assignController->shouldReceive('pv')->times(1)->andReturn(array());
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainerBarcodesForProposal')->with(3)->willReturn(array(['BARCODE' => 1230, 'BL' => 'test03']));

        $this->assignController->getPuckNames();
        $this->assertEquals('[]', $response->getBody());
    }

    public function testGetPuckNamesWithPropAndValidBlSingleValReturnsData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'i03';
        $this->assignController->proposalid = 3;
        $this->assignController->shouldReceive('pv')->times(1)->andReturn(array('PUCK_1_NAME' => 'puck1', 'PUCK_12_NAME' => 'puck12'));
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainerBarcodesForProposal')->with(3)->willReturn(array(['BARCODE' => 1230, 'BL' => 'test03']));

        $this->assignController->getPuckNames();
        $this->assertEquals('[{"id":1,"name":""},{"id":12,"name":""}]', $response->getBody());
    }

    public function testGetPuckNamesWithPropAndValidBlArrayWithNoDataValReturnsObfuscatedData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'i03';
        $this->assignController->proposalid = 3;
        $this->assignController->shouldReceive('pv')->times(1)->andReturn(array('PUCK_1_NAME' => array(11), 'PUCK_12_NAME' => array(12)));
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainerBarcodesForProposal')->with(3)->willReturn(array(['BARCODE' => 1230, 'BL' => 'test03']));

        $this->assignController->getPuckNames();
        $this->assertEquals('[{"id":1,"name":"[Loaded]"},{"id":12,"name":"[Loaded]"}]', $response->getBody());
    }

    public function testGetPuckNamesWithPropAndValidBlArrayWithMatchingDataValReturnsRealData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'i03';
        $this->assignController->proposalid = 3;
        $this->assignController->shouldReceive('pv')->times(1)->andReturn(array('PUCK_1_NAME' => array(11), 'PUCK_12_NAME' => array(1230)));
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainerBarcodesForProposal')->with(3)->willReturn(array(['BARCODE' => 1230, 'BL' => 'test03']));

        $this->assignController->getPuckNames();
        $this->assertEquals('[{"id":1,"name":"[Loaded]"},{"id":12,"name":1230}]', $response->getBody());
    }

    public function testGetPuckNamesWithPropAndValidBlArrayForStaffMemberReturnsRealData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->assignController->args['prop'] = 3;
        $this->assignController->args['bl'] = 'i03';
        $this->assignController->proposalid = 3;
        $this->assignController->staff = true;
        $this->assignController->shouldReceive('pv')->times(1)->andReturn(array('PUCK_1_NAME' => array(11), 'PUCK_12_NAME' => array(1231)));
        $this->dataLayerStub->expects($this->exactly(1))->method('getContainerBarcodesForProposal')->with(3)->willReturn(array(['BARCODE' => 1230, 'BL' => 'test03']));

        $this->assignController->getPuckNames();
        $this->assertEquals('[{"id":1,"name":11},{"id":12,"name":1231}]', $response->getBody());
    }
}