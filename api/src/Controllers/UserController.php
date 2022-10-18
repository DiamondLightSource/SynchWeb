<?php

namespace SynchWeb\Controllers;

use Slim\Slim;

use SynchWeb\Page;
use SynchWeb\Model\Services\UserData;

class UserController extends Page
{
    private $userData;

    public static $arg_list = array('gid' => '\d+',
        'pid' => '\d+',
        'pjid' => '\d+',
        'peid' => '\d+',
        'uid' => '\d+',
        'sid' => '\d+',
        'visit' => '\w+\d+-\d+',
        'location' => '(\w|-|\/)+',
        'all' => '\d',
        'login' => '\d',

        'NAME' => '\w+',

        'TYPE' => '\w+',
        'DESCRIPTION' => '(\w|\s)+',


        'PERSONID' => '\d+',
        'FAMILYNAME' => '([\w\-])+',
        'GIVENNAME' => '([\w\-])+',
        'PHONENUMBER' => '.*',
        'EMAILADDRESS' => '.*',
        'LABNAME' => '([\w\s\-])+',
        'ADDRESS' => '([\w\s\-\n])+',
        'COUNTRY' => '([\w\s\-])+',
        'CITY' => '([\w\s\-])+',
        'POSTCODE' => '([\w\s\-])+',
        'LOGIN' => '\w+',
        'PASSWORD' => '.*',
    );

    public static $dispatch = array(array('(/:PERSONID)', 'get', '_get_users'),
            array('/:PERSONID', 'patch', '_update_user'),
            array('/', 'post', '_add_user'),

            array('/current', 'get', 'getCurrentUser'),

            array('/login', 'get', '_login'),
            array('/log(/)', 'post', '_log_action'),
            array('/time', 'get', 'getTime'),

            array('/groups(/:gid)', 'get', '_get_groups'),
            array('/groups', 'post', '_add_group'),
            array('/groups/:gid', 'put', '_update_group'),

            array('/groups/:gid/permission/:pid', 'post', '_add_group_permission'),
            array('/groups/:gid/permission/:pid', 'delete', '_remove_group_permission'),

            array('/groups/:gid/users/:peid', 'post', '_add_group_user'),
            array('/groups/:gid/users/:peid', 'delete', '_remove_group_user'),

            array('/permissions(/:pid)(/group/:gid)', 'get', '_get_permissions'),
            array('/permissions', 'post', '_add_permission'),
            array('/permissions/:pid', 'put', '_update_permission'),
    );

    function __construct(Slim $app, $db, $user, UserData $userData)
    {
        // Call parent constructor to register our routes
        parent::__construct($app, $db, $user);
        $this->app = $app;
        $this->userData = $userData;
    }

    # ------------------------------------------------------------------------
    # Helpers for backbone application
    function getCurrentUser()
    {
        $this->_output(array('personid' => $this->user->personId, 'user' => $this->user->loginId, 'givenname' => $this->user->givenName,
            'permissions' => $this->user->perms,
            'is_staff' => $this->staff,
            'visits' => $this->visits,
            'ty' => $this->ty));
    }

    function _login()
    {
    }

    function _log_action()
    {
        if (!$this->has_arg('location'))
            $this->_error('No location specified');
        $this->log_action(1, $this->arg('location'));
        print $this->arg('location');
    }

    # ------------------------------------------------------------------------
    # Get current time
    function getTime()
    {
        $d = new \DateTime("now");
        $this->_output(array('TIME' => $d->format('D M d Y H:i:s (\G\M\TO)')));
    }

    function _get_groups()
    {
        $this->haltIfLackingPermission('manage_groups');

        $gid = $this->def_arg('gid', null);
        $groups = $this->userData->getGroups($gid);

        if ($gid)
        {
            if (sizeof($groups))
                $this->_output($groups[0]);
            else
                $this->_error('No such group');
        }
        else
        {
            $this->_output($groups);
        }
    }

    function _add_group()
    {
        $this->haltIfLackingPermission('manage_groups');

        if (!$this->has_arg('NAME'))
            $this->_error('No group name');

        $this->_output(array('USERGROUPID' => $this->userData->addGroup($this->arg('NAME'))));
    }

    function _update_group()
    {
        $this->haltIfLackingPermission('manage_groups');
        $this->userData->updateGroup($this->arg('gid'), $this->arg('NAME'));
        $this->_output(array('NAME' => $this->arg('NAME')));
    }

    function _add_group_permission()
    {
        $this->haltIfLackingPermission('manage_groups');
        $this->userData->addGroupPermission($this->arg('gid'), $this->arg('pid'));
        $this->_output(array('USERGROUPID' => $this->arg('gid'), 'PERMISSIONID' => $this->arg('pid')));
    }

    function _remove_group_permission()
    {
        $this->haltIfLackingPermission('manage_groups');
        $this->userData->removeGroupPermission($this->arg('gid'), $this->arg('pid'));
        $this->_output(1);
    }

    function _get_users()
    {
        $rows = $this->userData->getUsers(
            $this->argOrEmptyString('all'),
            $this->argOrEmptyString('pid'),
            $this->argOrEmptyString('gid'),
            $this->argOrEmptyString('login'),
            $this->user->personId,
            $this->staff,
            $this->argOrEmptyString('s'),
            $this->argOrEmptyString('si'),
            $this->argOrEmptyString('visit'),
            $this->argOrEmptyString('page'),
            $this->argOrEmptyString('sort_by'),
            false,
            $this->argOrEmptyString('pjid'),
            $this->argOrEmptyString('per_page'),
            $this->argOrEmptyString('order')
        );

        if ($this->user->personId)
        {
            if (sizeof($rows))
                $this->_output($rows[0]);
            else
                $this->_error('No such user');
        }
        else
            $tot = $this->userData->getUsers(
                $this->argOrEmptyString('all'),
                $this->argOrEmptyString('pid'),
                $this->argOrEmptyString('gid'),
                $this->argOrEmptyString('login'),
                $this->user->personId,
                $this->staff,
                $this->argOrEmptyString('s'),
                $this->argOrEmptyString('si'),
                $this->argOrEmptyString('visit'),
                $this->argOrEmptyString('page'),
                $this->argOrEmptyString('sort_by'),
                true,
                $this->argOrEmptyString('pjid'),
                $this->argOrEmptyString('per_page'),
                $this->argOrEmptyString('order')
            );
        $this->_output(array('total' => $tot,
            'data' => $rows,
        ));
    }

    function _check_login()
    {
        $this->haltIfLackingPermission('manage_users');
        $person = $this->userData->checkLogin($this->arg('LOGIN'));

        if (!sizeof($person))
            $this->_error('Login not used');
        else
            $this->_output(new \stdClass);
    }

    function _add_user()
    {
        $this->haltIfLackingPermission('manage_users');

        $email = $this->def_arg('EMAILADDRESS', null);
        $this->_output(array('PERSONID' => $this->userData->addUser($this->arg('LOGIN'), $this->has_arg('GIVENNAME'), $this->has_arg('FAMILYNAME'), $email)));
    }

    function _update_user()
    {
        if (!$this->has_arg('PERSONID'))
            $this->_error('No person specified');

        $person = $this->userData->getUser($this->user->personid, $this->proposalid, $this->arg('PERSONID'));

        if (!sizeof($person))
            $this->_error('No such person');

        $person = $person[0];

        $this->userData->updateUser(
            $person,
            $this->argOrEmptyString('PERSONID'),
            $this->argOrEmptyString('FAMILYNAME'),
            $this->argOrEmptyString('GIVENNAME'),
            $this->argOrEmptyString('PHONENUMBER'),
            $this->argOrEmptyString('EMAILADDRESS')
        );

        $person = $this->userData->getUser($this->user->personid, $this->proposalid, $this->arg('PERSONID'));
        $this->_output((array)$person[0]);

        $this->userData->updateLaboratory(
            $person,
            $this->argOrEmptyString('PERSONID'),
            $this->argOrEmptyString('LABNAME'),
            $this->argOrEmptyString('ADDRESS'),
            $this->argOrEmptyString('CITY'),
            $this->argOrEmptyString('POSTCODE'),
            $this->argOrEmptyString('COUNTRY')
        );
        $laboratory = $this->userData->getLaboratory($person['LABORATORYID']);
        $this->_output((array)$laboratory[0]);
    }

    function _add_group_user()
    {
        $this->haltIfLackingPermission('manage_groups');
        $this->userData->addGroupUser($this->arg('peid'), $this->arg('gid'));
        $this->_output(array('USERGROUPID' => $this->arg('gid'), 'PERSONID' => $this->arg('peid')));
    }

    function _remove_group_user()
    {
        $this->haltIfLackingPermission('manage_groups');
        $this->userData->removeGroupUser($this->arg('peid'), $this->arg('gid'));
        $this->_output(1);
    }

    function _get_permissions()
    {
        $this->haltIfLackingPermission('manage_perms');
        $rows = $this->userData->getPermissions(
            $this->argOrEmptyString('s'),
            $this->argOrEmptyString('gid'),
            $this->argOrEmptyString('pid'),
            $this->argOrEmptyString('per_page'),
            $this->argOrEmptyString('page'),
            false
        );

        if ($this->has_arg('pid'))
        {
            if (sizeof($rows))
                $this->_output($rows[0]);
            else
                $this->_error('No such permission');
        }
        else
        {
            $tot = $this->userData->getPermissions(
                $this->argOrEmptyString('s'),
                $this->argOrEmptyString('gid'),
                $this->argOrEmptyString('pid'),
                $this->argOrEmptyString('per_page'),
                $this->argOrEmptyString('page'),
                true
            );
            $this->_output(array('total' => $tot,
                'data' => $rows,
            ));
        }
    }


    function _add_permission()
    {
        $this->haltIfLackingPermission('manage_perms');
        $this->_output(array('PERMISSIONID' => $this->userData->addPermission($this->arg('TYPE'), $this->argOrEmptyString('DESCRIPTION'))));
    }

    function _update_permission()
    {
        $this->haltIfLackingPermission('manage_perms');
        $desc = $this->argOrEmptyString('DESCRIPTION');
        $this->userData->updatePermission(
            $this->arg('pid'),
            $this->arg('TYPE'),
            $desc
        );
        $this->_output(array('TYPE' => $this->arg('TYPE'), $desc));
    }
}