<?php

namespace SynchWeb\Authentication;

class AuthenticationTypeFactory {

    // Array of authentication types and corresponding authentication class names.
    // Value is class name in SynchWeb\Authentication\Type namespace.
    // Key is lower case representation of class name.
    private $authentication_types = array(
        'cas' => 'CAS',
        'dummy' => 'Dummy',
        'ldap' => 'LDAP',
        'simple' => 'Simple',
        'oidc' => 'OIDC'
    );

    // Return instance of authentication class corresponding to $authentication_type.
    // The value passed by the calling method derives from $authentication_type, a global variable specified in config.php.
    public function create($authentication_type)
    {
        if (!$authentication_type)
        {
            error_log("Authentication method not specified in config.php.");

            $authentication_type = 'cas';
        }

        // Determine fully-qualified class name of authentication class corresponding to $authentication_type.
        $full_class_name = null;

        if (key_exists(strtolower($authentication_type), $this->authentication_types))
        {
            $full_class_name = 'SynchWeb\\Authentication\\Type\\' . $this->authentication_types[$authentication_type];
        }
        else
        {
            throw new \Exception("Authentication method '$authentication_type' not configured.");
        }

        // Return instance of authentication class.
        if (class_exists($full_class_name))
        {
            return new $full_class_name();
        }
        else
        {
            throw new \Exception("Authentication class '$full_class_name' does not exist.");
        }

        throw new \Exception('Authentication not possible due to a configuration error.');
    }
}