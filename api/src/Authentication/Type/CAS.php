<?php

namespace SynchWeb\Authentication\Type;

use phpCAS;
use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

class CAS extends AuthenticationParent implements AuthenticationInterface
{
    function check()
    {
        global $cas_url, $cas_sso, $cacert;

        if (!$cas_sso) return false;

        phpCAS::client(CAS_VERSION_2_0, $cas_url, 443, '/cas');
        phpCAS::setCasServerCACert($cacert);

        try {
            // CAS will try and redirect us
            $check = phpCAS::checkAuthentication();

            // phpCAS will now lumber us with a session, which we dont want
            $params = session_get_cookie_params();
            setcookie(session_name(), '', 0, $params['path'], $params['domain'], $params['secure'], isset($params['httponly']));
            session_unset();
            session_destroy();

            if ($check) return phpCAS::getUser();

            // Dont crash the app
        } catch (\Exception $e) {

        }
    }

    function authenticate($login, $password)
    {
        global $cas_url, $cacert;

        $fields = array(
            'username' => $login,
            'password' => $password,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $cas_url . '/cas/v1/tickets');
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $this->tgt = null;
        foreach (explode("\n", $this->response) as $line) {
            if (preg_match('/^Location: .*\/(TGT.*)$/', $line, $mat)) {
                $this->tgt = rtrim($mat[1]);//str_replace('?bypassSPNEGO=true', '', $mat[1]);
            }
        }

        // CAS returns 201 = Created
        return $code == 201;
    }

    function service($service)
    {
        global $cas_url, $cacert;

        $fields = array(
            'service' => $service,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $cas_url . '/cas/v1/tickets/' . $this->tgt);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return rtrim($resp);
    }

    function validate($service, $ticket)
    {
        global $cas_url, $cacert;

        $fields = array(
            'service' => $service,
            'ticket' => $ticket,
            'format' => 'JSON',
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $cas_url . '/cas/v1/serviceValidate');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return rtrim($resp);
    }
}

