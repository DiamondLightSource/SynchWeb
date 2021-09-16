<?php

namespace SynchWeb\Authentication\Type;

use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

class LDAP extends AuthenticationParent implements AuthenticationInterface
{
    function check()
    {
        return false;
    }

    function authenticate($login, $password)
    {
        global $ldap_server;
        global $ldap_search;

        $conn = ldap_connect($ldap_server);

        if ($conn) {
            // Tested against LDAP version 3 (could add support for older versions here)
            ldap_set_option($conn, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_start_tls($conn);

            try {
                // testing with openldap indicates this call needs to use a correct
                // DN syntax: "uid=<login>,ou=people,dc=example,dc=com"
                return ldap_bind($conn, "uid=" . $login . "," . $ldap_search, $password);

                // Couldn't bind
            } catch (\Exception $e) {
                return false;
            }
        }
    }
}
