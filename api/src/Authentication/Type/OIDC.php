<?php

namespace SynchWeb\Authentication\Type;

use phpCAS;
use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;

class OIDC extends AuthenticationParent implements AuthenticationInterface
{
    private $providerConfig = array();

    function __construct() {
        global $cas_url;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $cas_url . '/.well-known/openid-configuration');
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        curl_close($ch);

        $this->providerConfig = json_decode($this->response);
    }

    private function getUser($token)
    {
        global $cas_url, $cacert;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->providerConfig->userinfo_endpoint);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
        curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        curl_close($ch);
        
        $fedid = json_decode($this->response)->id;

        return $fedid;
    }

    function check()
    {
        global $cookie_key;
        return($this->getUser($_COOKIE[$cookie_key]));
    }

    function authenticate($code, $_) 
    {   
        global $cas_url, $cacert, $oidc_client_secret, $oidc_client_id, $cookie_key;

        $redirect_url = preg_replace('/(&|\?)'.preg_quote("code").'=[^&]*$/', '', $_SERVER["HTTP_REFERER"]);
        $redirect_url = urlencode(preg_replace('/(&|\?)'.preg_quote("code").'=[^&]*&/', '$1', $redirect_url));

        if (is_null($code)) {
            return ( $this->providerConfig->authorization_endpoint . 
                        '?response_type=code&client_id=' . $oidc_client_id . 
                        '&redirect_uri=' . $redirect_url
            );
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->providerConfig->token_endpoint . 
            '?grant_type=authorization_code&redirect_uri=' . 
            $redirect_url . 
            "&code=" . $code . 
            '&client_secret=' . $oidc_client_secret . 
            '&client_id=' . $oidc_client_id
        );
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        curl_close($ch);

        $token = json_decode($this->response)->access_token;

        if(!$token) {
            return false;
        }

        $cookieOpts = array (
            'expires' => time() + 60*60*24,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        );

        setcookie($cookie_key, $token, $cookieOpts);

        $fedid = $this->getUser($token);

        return $fedid;
    }
}

