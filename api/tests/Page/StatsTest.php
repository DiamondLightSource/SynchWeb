<?php declare(strict_types=1);

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Stats;

final class StatsTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $statsStub;

    protected function setUp():void {
        $this->statsStub = $this->getMockBuilder(Stats::class)
                                ->disableOriginalConstructor()
                                ->onlyMethods(['_data_collections'])
                                ->getMock();
    }

    public function testBeamlineCallWithDCTypeInvokesDataCollectionCorrectly(): void
    {
        $this->statsStub->args = array('t' => 'dc');
        $this->statsStub->expects($this->once())
                        ->method('_data_collections')
                        ->with(False, True);
        $this->statsStub->_beamline();
    }

    public function testBeamlineCallForScreeningsInvokesDataCollectionCorrectly(): void
    {
        $this->statsStub->args = array('t' => 'sc');
        $this->statsStub->expects($this->once())
                        ->method('_data_collections')
                        ->with(True);
        $this->statsStub->_beamline();
    }

    public function testBeamlineCallForFCTypeInvokesDataCollectionCorrectly(): void
    {
        $this->statsStub->args = array('t' => 'fc');
        $this->statsStub->expects($this->once())
                        ->method('_data_collections')
                        ->with(False, False);
        $this->statsStub->_beamline();
    }

    public function testBeamlineCallForUnknownTypeCallsError(): void
    {
        $statsStub1 = $this->getMockBuilder(Stats::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['_error'])
            ->getMock();
        $statsStub1->args = array('t' => 'invalidtype');
        $statsStub1->expects($this->once())
                        ->method('_error')
                        ->with('No such stat type');
        $statsStub1->_beamline();
    }
}
