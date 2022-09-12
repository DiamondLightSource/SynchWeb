<?php declare(strict_types=1);
use PHPUnit\Framework\TestCase;
use SynchWeb\Database;

final class DatabaseTest extends TestCase
{
    public function testCanBeInstantiated(): void
    {
        $this->assertInstanceOf(
            Database::class,
            new Database()
        );
    }

    public function testGetThrowsExceptionDueToInvalidConnectionDetails(): void
    {
        $this->expectException(mysqli_sql_exception::class);
        Database::get();
    }
}
