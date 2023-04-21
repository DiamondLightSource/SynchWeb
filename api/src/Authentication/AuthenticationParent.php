<?php

namespace SynchWeb\Authentication;

class AuthenticationParent
{

}

interface AuthenticationInterface
{
    public function authenticate($login, $password);

    public function check();
}