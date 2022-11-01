<?php declare(strict_types=1);

namespace SynchWeb\Controllers;

use Slim\Slim;
use Mockery;
use PHPUnit\Framework\TestCase;
use SynchWeb\Model\Services\CalendarData;
use SynchWeb\Model\User;
use SynchWeb\Database\Type\MySQL;

require_once __DIR__ . '/Utils/Functions.php';

final class CalendarControllerTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $serviceStub;
    private $slimStub;
    private $dataLayerStub;
    private $dbStub;
    private $user;
    private $calendarController;

    protected function setUp(): void
    {
        Output::reset();
        $this->slimStub = Mockery::mock('Slim\Slim');
        $this->dataLayerStub = $this->getMockBuilder(CalendarData::class)
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
        $this->calendarController = Mockery::mock('SynchWeb\Controllers\CalendarController')->makePartial();
        $this->calendarController->shouldReceive('_setup_routes')->times(1)->andReturn(Mockery::self());
        $this->calendarController->__construct($this->slimStub, $this->dbStub, $this->user, $this->dataLayerStub);
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

    public function testGenerateExternalLinkReturnsNothingIfNeitherPropOrBlSpecified(): void
    {
        $this->dataLayerStub->expects($this->never())->method('getCalendarHashByKey');
        $this->dataLayerStub->expects($this->never())->method('addCalendarHash');

        $this->calendarController->generateExternalLink();
    }

    public function testGenerateExternalLinkWithPropReturnsFoundHash(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['prop'] = 'testProp';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByKey')->with($this->calendarController->args['prop'])->willReturn(array(['HASH' => 'testHash']));
        $this->dataLayerStub->expects($this->never())->method('addCalendarHash');

        $this->calendarController->generateExternalLink();
        $this->assertEquals('"\/cal\/ics\/h\/testHash\/calendar.ics"', $response->getBody());
    }

    public function testGenerateExternalLinkWithNewPropReturnsCreatedHash(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['prop'] = 'testProp';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByKey')->with($this->calendarController->args['prop'])->willReturn(array());
        $this->dataLayerStub->expects($this->exactly(1))->method('addCalendarHash')->with($this->calendarController->args['prop'], false)->willReturn('newHash');

        $this->calendarController->generateExternalLink();
        $this->assertEquals('"\/cal\/ics\/h\/newHash\/calendar.ics"', $response->getBody());
    }

    public function testGenerateExternalLinkWithBlReturnsFoundHash(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['bl'] = 'testBl';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByKey')->with($this->calendarController->args['bl'])->willReturn(array(['HASH' => 'testHash']));
        $this->dataLayerStub->expects($this->never())->method('addCalendarHash');

        $this->calendarController->generateExternalLink();
        $this->assertEquals('"\/cal\/ics\/h\/testHash\/calendar.ics"', $response->getBody());
    }

    public function testGenerateExternalLinkWithNewBlReturnsCreatedHash(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['bl'] = 'testBl';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByKey')->with($this->calendarController->args['bl'])->willReturn(array());
        $this->dataLayerStub->expects($this->exactly(1))->method('addCalendarHash')->with($this->calendarController->args['bl'], true)->willReturn('newHash');

        $this->calendarController->generateExternalLink();
        $this->assertEquals('"\/cal\/ics\/h\/newHash\/calendar.ics"', $response->getBody());
    }

    public function testExportCalendarWithoutHThrowsError(): void
    {
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"No proposal specified: You must specify a proposal to view a calendar"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->calendarController->exportCalendar();
    }

    public function testExportCalendarWithInvalidHThrowsError(): void
    {
        $this->calendarController->args['h'] = 'testHash';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByHash')->with($this->calendarController->args['h'])->willReturn(array());
        $this->slimStub->shouldReceive('halt')->times(1)->with(400, '{"status":400,"message":"Invalid proposal specified: The specified proposal does not appear to exist"}')->andThrow(new \Exception);
        $this->expectException(\Exception::class);

        $this->calendarController->exportCalendar();
    }

    public function testExportCalendarWithValidHReturnsEmptyData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['h'] = 'testHash';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByHash')->with($this->calendarController->args['h'])->willReturn(array(['CKEY' => 'ckey1', 'BEAMLINE' => 1]));

        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarVisitsData')->with('ckey1', 1)->willReturn(array());
        $this->dataLayerStub->expects($this->exactly(1))->method('getUserData')->with('ckey1', 1)->willReturn(array());

        $this->calendarController->exportCalendar();
        $this->assertEquals('BEGIN:VCALENDARVERSION:2.0END:VCALENDAR', preg_replace("/\r|\n/", "", $response->getBody()));
    }

    public function testExportCalendarWithValidHReturnsActualData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['h'] = 'testHash';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByHash')->with($this->calendarController->args['h'])->willReturn(array(['CKEY' => 'ckey1', 'BEAMLINE' => 1]));
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarVisitsData')->with('ckey1', 1)->willReturn(array(['LC' => 'Mr X', 'VIS' => 'mx28866-3', 'PROP' => 'mx28866', 'BL' => 'b21', 'D' => '15-04-2022', 'E' => '15-04-2022', 'ST' => '09:00', 'EN' => '17:00', 'SESSIONID' => 123]));
        $this->dataLayerStub->expects($this->exactly(1))->method('getUserData')->with('ckey1', 1)->willReturn(array(123 => array(['SESSIONID' => 123, 'FULLNAME' => 'Mr E', 'ROLE' => 'spy'])));

        $this->calendarController->exportCalendar();
        $this->assertEquals('BEGIN:VCALENDARVERSION:2.0BEGIN:VEVENTDTSTAMP:20220415T090000ZDTSTART:20220415T090000ZDTEND:20220415T170000ZSUMMARY:mx28866-3 LC: Mr XATTENDEE;CN="Mr E":MAILTO:spyEND:VEVENTEND:VCALENDAR', preg_replace("/\r|\n/", "", $response->getBody()));
    }

    public function testExportCalendarWithValidHButNoUserDataReturnsActualData(): void
    {
        $response = $this->setUpCommonResponse();
        $this->calendarController->args['h'] = 'testHash';
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarHashByHash')->with($this->calendarController->args['h'])->willReturn(array(['CKEY' => 'ckey1', 'BEAMLINE' => 1]));
        $this->dataLayerStub->expects($this->exactly(1))->method('getCalendarVisitsData')->with('ckey1', 1)->willReturn(array(['LC' => 'Mr X', 'VIS' => 'mx28866-3', 'PROP' => 'mx28866', 'BL' => 'b21', 'D' => '15-04-2022', 'E' => '15-04-2022', 'ST' => '09:00', 'EN' => '17:00', 'SESSIONID' => 123]));
        $this->dataLayerStub->expects($this->exactly(1))->method('getUserData')->with('ckey1', 1)->willReturn(array());

        $this->calendarController->exportCalendar();
        $this->assertEquals('BEGIN:VCALENDARVERSION:2.0BEGIN:VEVENTDTSTAMP:20220415T090000ZDTSTART:20220415T090000ZDTEND:20220415T170000ZSUMMARY:mx28866-3 LC: Mr XEND:VEVENTEND:VCALENDAR', preg_replace("/\r|\n/", "", $response->getBody()));
    }
}