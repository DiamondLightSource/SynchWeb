<?php declare(strict_types=1);

namespace SynchWeb\Database;

use PHPUnit\Framework\TestCase;
use SynchWeb\Database\DatabaseConnectionFactory;
use SynchWeb\Utils;

final class DatabaseConnectionFactoryTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    /**
     * @runInSeparateProcess // Needed to allow error_log mocking
     * @preserveGlobalState disabled
     */
    public function testErrorIsLoggedForInvalidDbType(): void
    {
        $log = $this->getFunctionMock('SynchWeb', "error_log");
        $log->expects($this->once())->with("Database Error: Database connection for type 'invalid' does not exist.");
        Utils::$exitOnError = false;

        $connFactory = new DatabaseConnectionFactory();
        $connFactory->get('invalid');
    }

    /**
     * @runInSeparateProcess // Needed to allow db mocking
     * @preserveGlobalState disabled
     */
    public function testErrorIsLoggedForUnspecifiedDbType(): void
    {
        global $isb;
        $isb = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb', 'port' => '80');
        $log = $this->getFunctionMock(__NAMESPACE__, "error_log");
        $log->expects($this->once())->with("Database type variable, dbtype, is not specified in config.php - defaulting to MySql.");
        Utils::$exitOnError = false;

        $this->expectWarning(\mysqli_sql_exception::class);

        $connFactory = new DatabaseConnectionFactory();
        $connFactory->get('');
    }
}