<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../src/Model/Services/Utils.php');

final class UtilsTest extends TestCase
{
    public function testSetupPagingParametersWithPageReturnsCorrectValues(): void
    {
        $args = array();
        setupPagingParameters($args, 15, 3);
        $this->assertEquals(2, sizeof($args));
        $this->assertEquals(30, $args[0]);
        $this->assertEquals(45, $args[1]);
    }

    public function testSetupPagingParametersWithoutPageReturnsCorrectValues(): void
    {
        $args = array();
        setupPagingParameters($args, 15);
        $this->assertEquals(2, sizeof($args));
        $this->assertEquals(0, $args[0]);
        $this->assertEquals(15, $args[1]);
    }

    public function testSetupPagingParametersWithNegativePageReturnsCorrectValues(): void
    {
        $args = array();
        setupPagingParameters($args, 15, -3);
        $this->assertEquals(2, sizeof($args));
        $this->assertEquals(0, $args[0]);
        $this->assertEquals(15, $args[1]);
    }
}