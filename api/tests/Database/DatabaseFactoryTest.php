<?php declare(strict_types=1);

namespace SynchWeb\Database;

use PHPUnit\Framework\TestCase;
use SynchWeb\Database\DatabaseFactory;
use SynchWeb\Database\DatabaseConnectionFactory;
use Mockery;

final class DatabaseFactoryTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;
    use \Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration; // needed for tests with only Mockery assertions

    private $dbFactory;

    protected function setUp(): void
    {
        $mockConnection = $this->createStub(DatabaseConnectionFactory::class);
        $this->dbFactory = new DatabaseFactory($mockConnection);
    }

    public function testCanBeInstantiated(): void
    {
        // fwrite(STDERR, print_r("Quick debugging can be done in the tests using this to generate output", TRUE));
        $this->assertInstanceOf(
            DatabaseFactory::class ,
            new DatabaseFactory(new DatabaseConnectionFactory())
        );
    }

    public function testGetThrowsExceptionDueToInvalidConnectionDetails(): void
    {
        global $isb, $dbtype, $app;
        $dbtype = "MySQL";
        $isb = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');

        $this->expectWarning(\mysqli_sql_exception::class);

        $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
        $dbFactory->get();
    }

    /**
     * @runInSeparateProcess // Needed to allow db mocking
     * @preserveGlobalState disabled
     */
    public function testErrorIsLoggedForUnrecognisedDatabaseType(): void
    {
        global $dbtype;
        $dbtype = "obscure-db";

        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database type '$dbtype' not configured.");

        $this->dbFactory->get();
    }

    /**
     * @runInSeparateProcess // Needed to allow db mocking
     * @preserveGlobalState disabled
     */
    public function testErrorIsLoggedForDatabaseTypeClassThatDoesNotExist(): void
    {
        global $dbtype;
        $dbtype = "obscure-db2";
        $this->dbFactory->database_types[$dbtype] = $dbtype;

        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database class 'SynchWeb\Database\Type\obscure-db2' does not exist.");

        $this->dbFactory->get();
    }

    /**
     * @runInSeparateProcess // Needed to allow db mocking
     * @preserveGlobalState disabled
     */
    public function testMySQLObjectCreatedWithExpectedParameters(): void
    {
        global $isb, $dbtype;
        $dbtype = "MySQL";
        $isb = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');

        $dblMock = Mockery::mock('overload:SynchWeb\Database\Type\MySQL');
        $dblMock->shouldReceive('__construct')->once();

        $this->dbFactory->get();
    }
}