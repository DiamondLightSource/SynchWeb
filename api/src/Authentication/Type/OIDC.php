<?php

namespace SynchWeb\Authentication\Type;

use phpCAS;
use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;
use SynchWeb\Utils;

class OIDC extends AuthenticationParent implements AuthenticationInterface
{
    private $providerConfig = array();

    function __construct() {
        global $sso_url, $oidc_client_id, $oidc_client_secret;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $sso_url . '/.well-known/openid-configuration');
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);
        curl_close($ch);

        $newProviderConfig = json_decode($response);
        $newProviderConfig->b64ClientCreds = base64_encode(
            $oidc_client_id . ":" . $oidc_client_secret
        );

        if($newProviderConfig == null) {
            error_log("OIDC Authentication provider replied with invalid JSON body");
            return;
        }

        $this->providerConfig = $newProviderConfig;
    }

    private function getUser($token)
    {
        global $cacert;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->providerConfig->userinfo_endpoint);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $fedid = json_decode($response)->id;

        return $fedid;
    }

    function authenticate($login, $password) 
    {
        return false;
    }

    function check()
    {
        global $cookie_key;

        if (array_key_exists($cookie_key, $_COOKIE)) {
            return($this->getUser($_COOKIE[$cookie_key]));
        }

        return false;
    }

    function authorise() 
    {
        global $oidc_client_id;
        $redirect_url = Utils::filterParamFromUrl($_SERVER["HTTP_REFERER"], "code");

        return ( $this->providerConfig->authorization_endpoint . 
            '?response_type=code&client_id=' . $oidc_client_id . 
            '&redirect_uri=' . $redirect_url
        );
    }

    function authenticateByCode($code) 
    {   
        global $cacert, $oidc_client_secret, $oidc_client_id, $cookie_key;

        $redirect_url = Utils::filterParamFromUrl($_SERVER["HTTP_REFERER"], "code");
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->providerConfig->token_endpoint . 
            '?grant_type=authorization_code&redirect_uri=' . 
            $redirect_url . 
            "&code=" . $code
        );
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Basic ' . $this->providerConfig->b64ClientCreds));
        $response = curl_exec($ch);
        curl_close($ch);

        $token = json_decode($response)->access_token;

        if(!$token) {
            error_log("Invalid authentication attempt, provider returned no access token");
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
        return $this->getUser($token);
    }
}

