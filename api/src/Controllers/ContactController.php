<?php

namespace SynchWeb\Controllers;

use Slim\Slim;

use SynchWeb\Page;
use SynchWeb\Model\Services\ContactData;
use SynchWeb\Model\Services\UserData;

class ContactController extends Page
{
    private $contactData;
    private $userData;

    public static $arg_list = array(
        'CARDNAME' => '([\w\s\-])+',
        'FAMILYNAME' => '([\w\-])+',
        'GIVENNAME' => '([\w\-])+',
        'PHONENUMBER' => '.*',
        'EMAILADDRESS' => '.*',
        'LABNAME' => '([\w\s\-])+',
        'ADDRESS' => '([\w\s\-\n,])+',
        'COUNTRY' => '([\w\s\-,\(\)\'])+',
        'CITY' => '([\w\s\-])+',
        'POSTCODE' => '([\w\s\-])+',
        'DEFAULTCOURRIERCOMPANY' => '([\w\s\-])+',
        'COURIERACCOUNT' => '([\w\-])+',
        'BILLINGREFERENCE' => '([\w\s\-])+',
        'DEWARAVGTRANSPORTVALUE' => '\d+',
        'DEWARAVGCUSTOMSVALUE' => '\d+',
        'PERSONID' => '\d+',
        'cid' => '\d+',
    );

    public static $dispatch = array(
        array('(/:cid)', 'get', 'getContacts'),
        array('', 'post', 'addLabContact'),
        array('/:cid', 'patch', '_update_contact'),
    );


    function __construct(Slim $app, $db, $user, ContactData $contactData, UserData $userData)
    {
        // Call parent constructor to register our routes
        parent::__construct($app, $db, $user);
        $this->app = $app;
        $this->contactData = $contactData;
        $this->userData = $userData;
    }

    # ------------------------------------------------------------------------
    # Get List of Lab Contacts
    function getContacts()
    {
        $rows = $this->contactData->getLabContacts($this->proposalid, $this->def_arg('cid', null), $this->def_arg('page', 0), $this->def_arg('per_page', 15));

        if ($this->has_arg('cid'))
        {
            if (sizeof($rows))
                $this->_output($rows[0]);
            else
                $this->_error('No such contact');
        }
        else
        {
            $tot = $this->contactData->getLabContactsCount($this->proposalid);
            $this->_output(
                array(
                    'total' => $tot,
                    'data' => $rows,
                )
            );
        }
    }


    function updateLabContact()
    {
        if (!$this->has_arg('cid'))
            $this->_error('No contact specified');

        // TODO: Note, the old query didn't include the join on proposal - and this leads to the inclusion of a small number (7) of contacts who have a proposal id of '0' being
        // excluded - I don't think this is important, but may be worth checking
        $cont = $this->contactData->getLabContacts($this->proposalid, $this->arg('cid'));

        if (!sizeof($cont))
            $this->_error('The specified contact does not exist');
        else
            $cont = $cont[0];

        $this->contactData->updateLabContact($cont, $this->def_arg('CARDNAME', null), $this->def_arg('DEFAULTCOURRIERCOMPANY', null),
            $this->def_arg('COURIERACCOUNT', null), $this->def_arg('BILLINGREFERENCE', null), $this->def_arg('DEWARAVGTRANSPORTVALUE', 0), $this->def_arg('DEWARAVGCUSTOMSVALUE', 0));

        // $this->_output(array($f => $this->arg($f)));

        // reuse the update person/lab from UserController...

        // # Update person
        // $pfields = array('FAMILYNAME', 'GIVENNAME', 'PHONENUMBER', 'EMAILADDRESS');
        // foreach ($pfields as $i => $f)
        // {
        //     if ($this->has_arg($f))
        //     {
        //         $this->db->pq('UPDATE person SET ' . $f . '=:1 WHERE personid=:2', array($this->arg($f), $cont['PERSONID']));
        //         $this->_output(array($f => $this->arg($f)));
        //     }
        // }


        // # Update laboratory
        // $lfields = array('LABNAME', 'ADDRESS', 'CITY', 'COUNTRY', 'POSTCODE');
        // foreach ($lfields as $i => $f)
        // {
        //     if ($this->has_arg($f))
        //     {
        //         $c = $f == 'LABNAME' ? 'NAME' : $f;
        //         $this->db->pq('UPDATE laboratory SET ' . $c . '=:1 WHERE laboratoryid=:2', array($this->arg($f), $cont['LABORATORYID']));
        //         $this->_output(array($f => $this->arg($f)));
        //     }
        // }
    }

    function addLabContact()
    {
        $valid = True;
        foreach (array('CARDNAME', 'FAMILYNAME', 'GIVENNAME', 'LABNAME', 'ADDRESS', 'CITY', 'COUNTRY', 'POSTCODE') as $k)
        {
            if (!$this->has_arg($k))
                $valid = False;
        }

        if (!$valid)
            $this->_error('Missing Fields');


        $laboratoryId = $this->userData->addLaboratory($this->arg('LABNAME'), $this->arg('ADDRESS'), $this->arg('CITY'), $this->arg('POSTCODE'), $this->arg('COUNTRY'));
        $personId = $this->contactData->addPerson($this->arg('GIVENNAME'), $this->arg('FAMILYNAME'), $this->argOrEmptyString('EMAILADDRESS'), $this->argOrEmptyString('PHONENUMBER'), $laboratoryId);
        $labContactId = $this->contactData->addLabContact($this->arg('CARDNAME'), $this->argOrEmptyString('DEFAULTCOURRIERCOMPANY'), $this->argOrEmptyString('COURIERACCOUNT'),
            $this->argOrEmptyString('BILLINGREFERENCE'), $this->def_arg('DEWARAVGCUSTOMSVALUE', 0), $this->def_arg('DEWARAVGTRANSPORTVALUE', 0), $this->proposalid, $personId);

        $this->_output(array('LABCONTACTID' => $labContactId));
    }
}