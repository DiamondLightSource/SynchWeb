<?php

namespace SynchWeb\Authentication\Type;

use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

class Simple extends AuthenticationParent implements AuthenticationInterface
{
    function check()
    {
        return false;
    }

    function authenticate($login, $password)
    {
        $person = $this->db->pq("SELECT password FROM person WHERE login=:1", array($login));
        if (!sizeof($person)) return false;

        $person = $person[0];
        return password_verify($password, $person['PASSWORD']);
    }
}
