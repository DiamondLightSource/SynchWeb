<?php declare(strict_types=1);

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Database;
use Mockery;

final class DatabaseTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    public function testCanBeInstantiated(): void
    {
        // fwrite(STDERR, print_r("Quick debugging can be done in the tests using this to generate output", TRUE));
        $this->assertInstanceOf(
            Database::class,
            new Database()
        );
    }

    public function testGetThrowsExceptionDueToInvalidConnectionDetails(): void
    {
        global $isb, $dbtype, $app;
        $dbtype = "MySql";
        $isb  = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');

        $this->expectException(\mysqli_sql_exception::class);
        Database::get();
    }

    public function testErrorIsLoggedForUnrecognisedDatabaseType(): void
    {
        global $dbtype;
        $dbtype = "obscure-db";

        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database type '$dbtype' not configured.");

        Database::get();
    }

    public function testErrorIsLoggedForDatabaseTypeClassThatDoesNotExist(): void
    {
        global $dbtype;
        $dbtype = "obscure-db2";
        Database::$database_types[$dbtype] = $dbtype;

        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database class 'SynchWeb\Database\Type\obscure-db2' does not exist.");

        Database::get();
    }

    /**
    * @runInSeparateProcess // Needed to allow db mocking
    * @preserveGlobalState disabled
    */
    public function testErrorIsLoggedForUnspecifiedDbType(): void
    {
        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database type variable, dbtype, is not specified in config.php - defaulting to MySql.");

        global $dbtype, $isb;
        $dbtype = "";
        $isb  = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');

        Mockery::mock('overload:SynchWeb\Database\Type\MySQL');

        Database::get();
    }

    /**
    * @runInSeparateProcess // Needed to allow db mocking
    * @preserveGlobalState disabled
    */
    public function testMySQLObjectCreatedWithExpectedParameters(): void
    {
        global $isb, $dbtype, $app;
        $dbtype = "MySql";
        $isb  = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');
        $app = null;

        $dblMock = Mockery::mock('overload:SynchWeb\Database\Type\MySQL');
        $dblMock->shouldReceive('__construct')
            ->once()
            ->with($app, $isb['user'], $isb['pass'], $isb['db'], $isb['port']);

        Database::get();
    }
}
