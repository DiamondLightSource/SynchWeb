<?php declare(strict_types=1);

namespace SynchWeb\Model;

use PHPUnit\Framework\TestCase;
use Slim\Slim;
use SynchWeb\Model\User;

final class UserTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

    private $statsStub;

    protected function setUp(): void
    {
    }

    public function testUserConstructorSetsPrimitivesCorrectly(): void
    {
        $userId = "blah";
        $personId = 34213;
        $givenName = "fred";
        $familyName = "blooogs";

        $user = new User($userId, $personId, $givenName, $familyName, array(), array(), array());

        $this->assertEquals($userId, $user->loginId);
        $this->assertEquals($personId, $user->personId);
        $this->assertEquals($givenName, $user->givenName);
        $this->assertEquals($familyName, $user->familyName);
    }

    public function testUserHasNoAdminTypeWhenNotSet(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertEmpty($user->getAdminType());
    }

    public function testUserHasCorrectAdminTypeWhenNotSet(): void
    {
        $perm1 = "read_admin";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertEquals("read", ($user->getAdminType()));
    }

    public function testUserHasExpectedPermissions(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertTrue($user->hasPermission($perm1));
        $this->assertTrue($user->hasPermission($perm2));
    }

    public function testUserDoesNotHaveUnexpectedPermissions(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertFalse($user->hasPermission("cigar"));
        $this->assertFalse($user->hasPermission(null));
        $this->assertFalse($user->hasPermission(array()));
    }

    public function testUserCanWithoutExpectedPermissionsHaltsRequest(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());
        $appStub = $this->getMockBuilder(Slim::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['halt'])
            ->getMock();
        $appStub->expects($this->once())
            ->method('halt')
            ->with(403, $this->anything());

        $user->can("bogus", $appStub);
    }

    public function testUserIsInExceptectedGroups(): void
    {
        $group1 = "abba";
        $group2 = "foals";

        $user = new User("blah", 231312, "frod", "blegs", array(), array($group1, $group2), array());

        $this->assertTrue($user->isInGroup($group1));
        $this->assertTrue($user->isInGroup($group2));
    }

    public function testUserIsNotInUnexceptectedGroups(): void
    {
        $group1 = "abba";
        $group2 = "foals";

        $user = new User("blah", 231312, "frod", "blegs", array(), array($group1, $group2), array());

        $this->assertFalse($user->isInGroup("the buggles"));
        $this->assertFalse($user->isInGroup(null));
        $this->assertFalse($user->isInGroup(array()));
    }

    public function testCacheRejectsUnexpectedKeys(): void
    {
        $key1 = "sdf";
        $val1 = "found me";
        $user = new User("blah", 231312, "frod", "blegs", array(), array(), array());
        $this->assertNull($user->getFromCache($key1));
        $user->setInCache($key1, $val1);
        $this->assertNull($user->getFromCache($key1));
    }

    public function testCacheWorksAsExpected(): void
    {
        $key1 = "shipment";
        $val1 = "found me";
        $val2 = "and again";
        $user = new User("blah", 231312, "frod", "blegs", array(), array(), array());
        $this->assertNull($user->getFromCache($key1));
        $user->setInCache($key1, $val1);
        $this->assertEquals($val1, $user->getFromCache($key1));
    }

    public function testCacheAllowsValuesToBeUpdated(): void
    {
        $key1 = "shipment";
        $val1 = "found me";
        $val2 = "and again";
        $user = new User("blah", 231312, "frod", "blegs", array(), array(), array());
        $this->assertNull($user->getFromCache($key1));
        $user->setInCache($key1, $val1);
        $this->assertEquals($val1, $user->getFromCache($key1));
        $user->setInCache($key1, $val2);
        $this->assertEquals($val2, $user->getFromCache($key1));
    }

    public function testCacheAllowsMultipeValues(): void
    {
        $key1 = "shipment";
        $val1 = "found me";
        $key2 = "container";
        $val2 = "and again";
        $user = new User("blah", 231312, "frod", "blegs", array(), array(), array());
        $this->assertNull($user->getFromCache($key1));
        $user->setInCache($key1, $val1);
        $this->assertEquals($val1, $user->getFromCache($key1));
        $user->setInCache($key2, $val2);
        $this->assertEquals($val2, $user->getFromCache($key2));
        $this->assertEquals($val1, $user->getFromCache($key1));
    }
}