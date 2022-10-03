<?php declare(strict_types=1);

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Shipment;
use Slim\Slim;
use SynchWeb\Database\Type\MySQL;
use Mockery;

final class ShipmentTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $slimStub;
    private $dbStub;
    private $dhlStub;
    private $fromNumber = "222";
    private $toNumber = "666";

    protected function setUp():void {
        $this->slimStub = $this->getMockBuilder(Slim::class)
                         ->onlyMethods(['halt'])
                         ->getMock();
        $this->slimStub->expects($this->once())
                        ->method('halt');

        $this->dbStub = $this->getMockBuilder(MySQL::class)
                        ->disableOriginalConstructor()
                        ->disableOriginalClone()
                        ->disableArgumentCloning()
                        ->disallowMockingUnknownTypes()
                        ->getMock();


        $this->dhlMock = Mockery::mock('overload:SynchWeb\Shipment\Courier\DHL')->makePartial();
    }

    public function testDewarTrackingHaltsWhenReturnedStatusIsSet(): void
    {
        $this->dhlMock->shouldReceive('get_tracking_info')->once()->andReturn((object) ["Response" => (object)["Status" => 'error'], "propertyB" => 2]);

        $page = new Shipment($this->slimStub, $this->dbStub, null);
        $dewar = array();
        $dewar['TRACKINGNUMBERFROMSYNCHROTRON'] = "222";

        $page->_dewar_tracking($dewar);
    }

    public function testDewarTrackingUsesTrackingNumberFromSynchrotronOverTrackingNumberToSynchrotron(): void
    {
        $this->dhlMock->shouldReceive('get_tracking_info')->once()->with(array('AWB' => $this->fromNumber))->andReturn((object) ["Response" => (object)["Status" => 'error'], "propertyB" => 2]);

        $page = new Shipment($this->slimStub, $this->dbStub, null);
        $dewar = array();
        $dewar['TRACKINGNUMBERFROMSYNCHROTRON'] = $this->fromNumber;
        $dewar['TRACKINGNUMBERTOSYNCHROTRON'] = $this->toNumber;

        $page->_dewar_tracking($dewar);
    }

    public function testDewarTrackingUsesTrackingToSynchrotronIfNoTrackingFromToSynchrotronAvailable(): void
    {
        $this->dhlMock->shouldReceive('get_tracking_info')->once()->with(array('AWB' => $this->toNumber))->andReturn((object) ["Response" => (object)["Status" => 'error'], "propertyB" => 2]);

        $page = new Shipment($this->slimStub, $this->dbStub, null);
        $dewar = array();
        $dewar['TRACKINGNUMBERFROMSYNCHROTRON'] = "";
        $dewar['TRACKINGNUMBERTOSYNCHROTRON'] = $this->toNumber;

        $page->_dewar_tracking($dewar);
    }

    public function tearDown():void {
        Mockery::close();
    }
}
