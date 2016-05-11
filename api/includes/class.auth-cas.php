<?php

require_once('config.php');

class CASAuthentication extends AuthenticationBase implements Authentication {

    function authenticate($login, $password) {
        global $cas_url;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $cas_url.'/cas/v1/tickets');
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS,"username=$login&password=$password");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // CAS returns 201 = Created
        return $code == 201;
    }

}
