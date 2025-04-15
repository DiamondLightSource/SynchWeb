<?php declare(strict_types=1);

namespace SynchWeb;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class UtilsTest extends TestCase {
    public function testMd5CreationFailsWithInvalidArgValue(): void {
        $this->expectException(InvalidArgumentException::class);

        Utils::generateRandomMd5(-10);
    }

    public function testMd5CreationSucceedsWithValidArgValue(): void {

        $md5Hash = Utils::generateRandomMd5(5);

        $this->assertNotEmpty($md5Hash );
        $this->assertIsString($md5Hash );
        $this->assertLessThanOrEqual(32, strlen($md5Hash));
    }


    public function testMd5CreationSucceedsWithEmptyArgValue(): void {

        $md5Hash = Utils::generateRandomMd5();

        $this->assertNotEmpty($md5Hash );
        $this->assertIsString($md5Hash );
        $this->assertLessThanOrEqual(32, strlen($md5Hash));
    }


}

