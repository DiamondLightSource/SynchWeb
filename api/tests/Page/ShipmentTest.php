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

    public function testDewarTrackingHaltsWhenReturnedStatusIsSet(): void
    {
        $slimStub = $this->getMockBuilder(Slim::class)
                         ->onlyMethods(['halt'])
                         ->getMock();
        $slimStub->expects($this->once())
                        ->method('halt');

        $dbStub = $this->getMockBuilder(MySQL::class)
                        ->disableOriginalConstructor()
                        ->disableOriginalClone()
                        ->disableArgumentCloning()
                        ->disallowMockingUnknownTypes()
                        ->getMock();

        $dhlMock = Mockery::mock('overload:SynchWeb\Shipment\Courier\DHL');
        $dhlMock->shouldReceive('get_tracking_info')->once()->andReturn((object) ["Response" => (object)["Status" => 'error'], "propertyB" => 2]);

        $page = new Shipment($slimStub, $dbStub, null);
        $dewar = array();
        $dewar['TRACKINGNUMBERFROMSYNCHROTRON'] = "222";

        $page->_dewar_tracking($dewar);
    }
}
