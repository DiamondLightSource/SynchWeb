<?php declare(strict_types=1);

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page;
use Slim\Slim;
use SynchWeb\Database\Type\MySQL;

final class PageTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    public function testMissingArgThrowsException(): void
    {
        $slimStub = $this->getMockBuilder(Slim::class)
                        ->disableOriginalConstructor()
                        ->disableOriginalClone()
                        ->disableArgumentCloning()
                        ->disallowMockingUnknownTypes()
                        ->getMock();
        $dbStub = $this->getMockBuilder(MySQL::class)
                        ->disableOriginalConstructor()
                        ->disableOriginalClone()
                        ->disableArgumentCloning()
                        ->disallowMockingUnknownTypes()
                        ->getMock();


        $this->expectException(\Exception::class);
        $page = new Page($slimStub, $dbStub, null);
        $page->args = array();
        
        $page->arg('invald_key');
    }
}
