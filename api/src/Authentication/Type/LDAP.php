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
        global $ldap_server_type;
	global $ldap_search;
	global $active_directory_domain;

	if (!$ldap_server_type) {
		$ldap_search_type = "openldap";
	}

        $conn = ldap_connect($ldap_server);

        if ($conn) {
            // Tested against LDAP version 3 (could add support for older versions here)
            ldap_set_option($conn, LDAP_OPT_PROTOCOL_VERSION, 3);

	    try {
		    if ($ldap_server_type == "activedirectory") {
			    if (!$active_directory_domain) {
				error_log("'active_directory_domain' parameter is not defined.");
				error_log("\t This is required when LDAP server type is 'activedirectory'");
				return false;
			    }
			$ldap_user = $active_directory_domain . "\\" . $login;
		} else {
			// testing with openldap indicates this call needs to use a correct
			// DN syntax: "uid=<login>,ou=people,dc=example,dc=com"
			$ldap_user = $login . "," . $ldap_search;
		}
                return ldap_bind($conn, $ldap_user, $password);

                // Couldn't bind
	    } catch (\Exception $e) {
		    error_log("SynchWeb - LDAP Auth FAILURE for user $login");
		    error_log("\t" . $e->getMessage());
		    error_log("\tldap_error: " . ldap_error($conn) . "  (Err Code: " . ldap_errno($conn) . ")");
		    return false;
            }
        }
    }
}
