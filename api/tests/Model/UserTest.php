<?php declare(strict_types=1);

namespace SynchWeb\Model;

use PHPUnit\Framework\TestCase;
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

    public function testUserHasExceptectedPermissions(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertTrue($user->hasPermissions($perm1));
        $this->assertTrue($user->hasPermissions($perm2));
    }

    public function testUserDoesNotHaveUnexceptectedPermissions(): void
    {
        $perm1 = "read";
        $perm2 = "write";

        $user = new User("blah", 231312, "frod", "blegs", array($perm1, $perm2), array(), array());

        $this->assertFalse($user->hasPermissions("cigar"));
        $this->assertFalse($user->hasPermissions(null));
        $this->assertFalse($user->hasPermissions(array()));
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