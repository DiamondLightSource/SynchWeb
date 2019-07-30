<?php

namespace SynchWeb\Authentication\Type;

use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

class Dummy extends AuthenticationParent implements AuthenticationInterface
{
    function check()
    {
        return false;
    }

    function authenticate($login, $password)
    {
        return true;
    }
}
