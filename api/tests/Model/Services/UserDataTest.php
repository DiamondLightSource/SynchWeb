<?php

declare(strict_types=1);

namespace Tests\Model\Services;


use Tests\Model\Services\BaseUserDataTestCase;

/**
 * @runTestsInSeparateProcesses // Needed to allow db mocking
 * @preserveGlobalState disabled
 */
final class UserDataTest extends BaseUserDataTestCase
{
    use \phpmock\phpunit\PHPMock;


    public function testGivenUpdateLaboratoryNoLabAllFieldsSpecifiedThenInsertIncludesAllFields(): void
    {
        $this->setUpMocks(2);

        $this->userData->updateLaboratory(123, 'lab name', 'lab address', 'city', 'postcode', 'country');

        $this->assertEquals("INSERT INTO Laboratory ( name, address, city, postcode, country ) VALUES ( 'lab name', 'lab address', 'city', 'postcode', 'country' )", $this->query[0]);
        $this->assertEquals("UPDATE Person SET laboratoryid=666 WHERE personid=123", $this->db->getLastQuery());
    }

    public function testUpdateLaboratoryNoLabSpecifiedOnlyOneFieldSpecifiedThenJustThatFieldInInsert(): void
    {
        $this->setUpMocks(2);

        $this->userData->updateLaboratory(123, 'lab name', null, null, null, null);

        $this->assertEquals("INSERT INTO Laboratory ( name ) VALUES ( 'lab name' )", $this->query[0]);
        $this->assertEquals("UPDATE Person SET laboratoryid=666 WHERE personid=123", $this->query[1]);
    }
}
