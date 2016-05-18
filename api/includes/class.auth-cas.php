<?php

require_once('config.php');

class CASAuthentication extends AuthenticationBase implements Authentication {

    function authenticate($login, $password) {
        global $cas_url;

        $fields = array(
            'username' => $login,
            'password' => $password,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $cas_url.'/cas/v1/tickets');
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // CAS returns 201 = Created
        return $code == 201;
    }

}
