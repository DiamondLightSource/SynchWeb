<?php

namespace SynchWeb\Authentication;

class AuthenticationParent
{

}

interface AuthenticationInterface
{
    public function authenticate($user, $pass);

    public function check();
}