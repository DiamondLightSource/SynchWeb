<?php

require_once('config.php');

class LDAPAuthentication extends AuthenticationBase implements Authentication {

    function authenticate($login, $password) {
        global $ldap_server;

        $conn = ldap_connect($ldap_server);

        if ($conn) {
            try {
                return ldap_bind($conn, $login, $password);

            // Coulnt bind
            } catch (Exeption $e) {
                return false
            }
        }
    }

}
