<?php

namespace SynchWeb\Authentication\Type;

use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

/**
 * Combined OIDC and CAS login to allow current api users to use the authentiate api
 *  endpoint with username and password
 */
class Combined extends AuthenticationParent implements AuthenticationInterface
{
    private $CASAuth;
    private $OIDCAuth;

    function __construct() {
        $this->CASAuth = new CAS();
        $this->OIDCAuth = new OIDC();
    }


    public function authenticate($login, $password)
    {
        return $this->CASAuth->authenticate($login, $password);
    }

    public function check() {
        return $this->OIDCAuth->check();
    }

    public function authorise() {
        return $this->OIDCAuth->authorise();
    }

    public function authenticateByCode($code){
        return $this->OIDCAuth->authenticateByCode($code);
    }
}
