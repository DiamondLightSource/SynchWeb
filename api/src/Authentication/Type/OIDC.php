<?php

namespace SynchWeb\Authentication\Type;

use SynchWeb\Authentication\AuthenticationInterface;
use SynchWeb\Authentication\AuthenticationParent;
use SynchWeb\Utils;

class OIDC extends AuthenticationParent implements AuthenticationInterface
{
    //** Cache for providerConfig */
    private $providerConfigCache = null;

    private function getProviderConfig() {
        global $sso_url, $oidc_client_id, $oidc_client_secret;
        if (is_null($this->providerConfigCache)) {            

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $sso_url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $response = curl_exec($ch);
            curl_close($ch);
            $newProviderConfig = json_decode($response);

            if(!$newProviderConfig
                || !isset($newProviderConfig->userinfo_endpoint)
                || !isset($newProviderConfig->authorization_endpoint) 
                || !isset($newProviderConfig->token_endpoint)) {
                error_log("OIDC Authentication provider replied with invalid JSON body");
                return null;
            }
            $newProviderConfig->b64ClientCreds = base64_encode(
                $oidc_client_id . ":" . $oidc_client_secret
            );

            $this->providerConfigCache = $newProviderConfig;
        }
        return $this->providerConfigCache;
    }

    private function getUser($token)
    {        
        global $sso_user_key;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->getProviderConfig()->userinfo_endpoint);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $response_json = json_decode($response, true);
        if (!$response_json || !isset($response_json[$sso_user_key])) {
            return false;
        }

        return $response_json[$sso_user_key];
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

        return ( $this->getProviderConfig()->authorization_endpoint . 
            '?response_type=code&client_id=' . $oidc_client_id . 
            '&redirect_uri=' . urlencode($redirect_url) .
            '&scope=openid'
        );
    }

    function authenticateByCode($code) 
    {   
        global $cacert, $oidc_client_secret, $oidc_client_id, $cookie_key;

        $redirect_url = Utils::filterParamFromUrl($_SERVER["HTTP_REFERER"], "code");
        $redirect_url = Utils::filterParamFromUrl($redirect_url, "iss");
        $redirect_url = Utils::filterParamFromUrl($redirect_url, "session_state");

        $ch = curl_init();
        curl_setopt_array ( $ch, array (
            CURLOPT_URL => $this->getProviderConfig()->token_endpoint,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_HEADER => 0,
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => array (
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirect_url
            ),
            CURLOPT_HTTPHEADER => array('Authorization: Basic ' . $this->getProviderConfig()->b64ClientCreds)
        ) );
        $response = curl_exec($ch);
        curl_close($ch);
   
        $response_json = json_decode($response);
        if (!$response_json || !isset($response_json->access_token)) {
            error_log("Invalid authentication attempt, provider returned invalid response");
            return false;
        }        
        
        $token = $response_json->access_token;
        
        if(!$token) {
            error_log("Invalid authentication attempt, provider returned no access token");
            return false;
        }

        $cookieOpts = array (
            'expires' => time() + $response_json->expires_in,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        );

        setcookie($cookie_key, $token, $cookieOpts);
        return $this->getUser($token);
    }

    function logout()
    {
        return $this->getProviderConfig()->end_session_endpoint;
    }
}
