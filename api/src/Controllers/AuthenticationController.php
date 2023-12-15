<?php

namespace SynchWeb\Controllers;

use Exception;
use JWT;
use Slim\Slim;
use SynchWeb\Model\User;

use SynchWeb\Model\Services\AuthenticationData;
use SynchWeb\Authentication\AuthenticationTypeFactory;

class AuthenticationController
{
    public const ErrorUnderTestExceptionMessage = "Exit under test";
    private $app;
    private $dataLayer;
    private $exitOnError;
    private $authenticationTypeFactory;

    private $loginId = "";

    /**
     * Constructor
     * 
     * @param app: slim application 
     * @param dataLayer: the autherntication data layer object to connect to the database
     * @param exitOnError: Should be true for application but in testing set to false 
     *          and this will throw and exception rather than exiting the thread (and the tests)
     * @param authenticationTypeFactory: Factory to create the authentication type to use in this controller
     */
    public function __construct(Slim $app, AuthenticationData $dataLayer, $exitOnError = true, $authenticationTypeFactory = null)
    {
        $this->app = $app;
        $this->dataLayer = $dataLayer;
        $this->exitOnError = $exitOnError;
        $this->authenticationTypeFactory = $authenticationTypeFactory ?: new AuthenticationTypeFactory();

        $this->setupRoutes();
    }

    private function setupRoutes()
    {
        $this->app->post('/authenticate', array(&$this, 'authenticate'))->conditions(array(
            'login' => '[A-z0-9]+',
            'password' => '.*',
        ));

        $this->app->post('/authenticate/token', array(&$this, 'authenticateByCode'))->conditions(array(
            'code' => '[A-z0-9\-]+',
        ));

        $this->app->get('/authenticate/check', array(&$this, 'check'));
        $this->app->get('/authenticate/key', array(&$this, 'returnResponseWithJwtKey'));
        $this->app->get('/authenticate/logout', array(&$this, 'logout'));
        $this->app->get('/authenticate/authorise', array(&$this, 'authorise'));
    }

    function getUser(): User
    {
        if (!$this->loginId)
        {
            $this->validateAuthentication();
        }
        if ($this->loginId)
        {
            return $this->dataLayer->getUser($this->loginId);
        }

        // This is a user who is logging in from a machine specified by remote IP
        return new User($this->loginId, 0, "Machine", "", [], []);
    }

    // For SSO check if we are already logged in elsewhere
    // - if a mechanism exists to do this
    function check()
    {
        $userId = $this->authenticateByType()->check();

        if ($userId)
        {
            if ($this->dataLayer->isUserLoggedIn($userId))
            {
                $this->returnResponse(200, $this->generateJwtToken($userId));
            }
        }
        $this->returnError(400, 'No previous session');
    }

    private function checkAuthRequiredForSpecificSituations($parts): bool
    {
        global $blsr, $bcr, $img, $auto;

        $need_auth = true;
        # Work around to allow beamline sample registration without CAS authentication
        if (sizeof($parts) >= 3)
        {
            if (
                # Calendar ICS export
            ($parts[0] == 'cal' && $parts[1] == 'ics' && $parts[2] == 'h') ||

                # Allow formulatrix machines unauthorised access to inspections, certain IPs only
            ($parts[0] == 'imaging' && $parts[1] == 'inspection' && in_array($_SERVER["REMOTE_ADDR"], $img)) ||

                # For use on the touchscreen computers in the hutch.
                # Handles api calls: /assign/visits/<vist> e.g./assign/visits/mx1234-1
            ($parts[0] == 'assign' && $parts[1] == 'visits' && in_array($_SERVER["REMOTE_ADDR"], $blsr)) ||

                # Allow barcode reader ips unauthorised access to add history
            ($parts[0] == 'shipment' && $parts[1] == 'dewars' && $parts[2] == 'history' && in_array($_SERVER["REMOTE_ADDR"], $bcr)) ||

                # Allow barcode reader ips unauthorised access to add comments
            ($parts[0] == 'shipment' && $parts[1] == 'dewars' && $parts[2] == 'comments' && in_array($_SERVER["REMOTE_ADDR"], $bcr)) ||

                # Container notification: allow beamlines running in automated mode to notify users
            ($parts[0] == 'shipment' && $parts[1] == 'containers' && $parts[2] == 'notify' && in_array($_SERVER["REMOTE_ADDR"], $auto)) ||

                # Allow barcode reader ips unauthorised access to add container history
            ($parts[0] == 'shipment' && $parts[1] == 'containers' && $parts[2] == 'history' && in_array($_SERVER["REMOTE_ADDR"], $bcr))
            )
            {
                $need_auth = false;
            }

        }
        else if (sizeof($parts) >= 2)
        {
            if (
                # For use on the touchscreen computers in the hutch
                # Handles api calls: /assign/assign, /assign/unassign, /assign/deact, /assign/visits
            (($parts[0] == 'assign') && in_array($_SERVER["REMOTE_ADDR"], $blsr)) ||
            (($parts[0] == 'shipment' && $parts[1] == 'containers') && in_array($_SERVER["REMOTE_ADDR"], $blsr)) ||

                # Allow barcode reader unauthorised access, same as above, certain IPs only
            ($parts[0] == 'shipment' && $parts[1] == 'dewars' && in_array($_SERVER["REMOTE_ADDR"], $bcr)) ||

                # Allow formulatrix machines unauthorised access to inspections, certain IPs only
            ($parts[0] == 'imaging' && $parts[1] == 'inspection' && in_array($_SERVER["REMOTE_ADDR"], $img)) ||

                # Allow EPICS machines to create and close auto collect visits, certain IPs only.
                # Permitted IPs listed in global variable $auto in config.php.
            ($parts[0] == 'proposal' && $parts[1] == 'auto' && in_array($_SERVER["REMOTE_ADDR"], $auto))
            )
            {
                $need_auth = false;
            }

        }

        if ($need_auth && sizeof($parts) > 0)
        {
            if ($parts[0] == 'authenticate' || $parts[0] == 'options')
                $need_auth = false;
        }
        return $need_auth;
    }

    private function processOneTimeUseTokens(): bool
    {
        $need_auth = true;
        $tokenId = $this->app->request()->get('token');
        if ($tokenId)
        {
            $max_token_age = -10;
            $token = $this->dataLayer->getOneTimeUseToken($tokenId);
            if (sizeof($token))
            {
                $token = $token[0];
                if ($token['AGE'] > $max_token_age)
                {
                    $err = 'Authorisation token too old. Age: '.$token['AGE'].'s. Max age: '.$max_token_age.'s.';
                    $err .= ' Please press back and then try again.';
                    $err .= ' If this problem persists, please try clearing your cookies or using a different browser.';
                    $this->returnError(400, $err, true);
                }
                $qs = $_SERVER['QUERY_STRING'] ? (preg_replace('/(&amp;)?token=\w+/', '', str_replace('&', '&amp;', $_SERVER['QUERY_STRING']))) : null;
                if ($qs)
                    $qs = '?' . $qs;

                if ($this->app->request->getResourceUri() . $qs == $token['VALIDITY'])
                {
                    $_REQUEST['prop'] = $token['PROP'];
                    $this->loginId = $token['LOGIN'];
                    $need_auth = false;
                    $this->dataLayer->deleteOneTimeUseToken($tokenId);
                }
                else
                {
                    error_log('Authorisation token not valid for this URL.');
                    error_log('Requested site: ' . $this->app->request->getResourceUri() . $qs);
                    error_log('Token valid for: ' . $token['VALIDITY']);
                    $err = 'Invalid one-time authorisation token.';
                    $this->returnError(400, $err);
                }
            }
            else
            {
                $err = 'No authorisation token found. ';
                $err .= 'If this error persists, please try clearing your cookies or using a different browser.';
                $this->returnError(400, $err);
            }
            # Remove tokens more than $max_token_age seconds old, they should have been used
            $this->dataLayer->deleteOldOneTimeUseTokens($max_token_age);
        }
        return $need_auth;
    }

    private function getUrlParameters()
    {
        $parts = explode('/', $this->app->request()->getResourceUri());
        if (sizeof($parts))
        {
            array_shift($parts); // drop the first part of the url - i.e. the domain name
        }
        return $parts;
    }

    // Check if this request needs authentication
    // We allow some pages unauthorised access based on IP, or calendar hash
    function validateAuthentication()
    {
        $need_auth = $this->processOneTimeUseTokens();
        if ($need_auth)
        {
            $parts = $this->getUrlParameters();
            $need_auth = $this->checkAuthRequiredForSpecificSituations($parts);
        }
        if ($need_auth)
        {
            $this->checkForAndValidateAuthenticationToken();
        }
    }

    function updateActivityTimestamp()
    {
        if ($this->loginId)
        {
            $this->dataLayer->updateActivityTimestamp($this->loginId);
        }
    }

    // Generate a new JWT encryption key
    function returnResponseWithJwtKey()
    {
        $this->returnResponse(200, array('key' => base64_encode(openssl_random_pseudo_bytes(64))));
    }

    // Generates a JWT token with the login embedded
    private function generateJwtToken($login)
    {
        global $jwt_key;

        $now = time();
        $data = array(
            'iat' => $now,
            'jti' => sha1($login . microtime(true)), //base64_encode(mcrypt_create_iv(32)),
            'iss' => 'http://' . $_SERVER['HTTP_HOST'],
            'nbf' => $now,
            'exp' => $now + 10 + 60 * 60 * 24,
            'data' => array(
                'login' => $login,
            )
        );

        $jwt = JWT::encode($data, $jwt_key, 'HS512');
        return array('jwt' => $jwt);
    }

    private function checkForAndValidateAuthenticationToken()
    {
        global $jwt_key;

        $headers = getallheaders();
        $auth_header = '';
        if (array_key_exists('Authorization', $headers))
        {
            $auth_header = $headers['Authorization'];
        }

        if ($auth_header)
        {
            list($jwt) = sscanf($auth_header, 'Bearer %s');

            try
            {
                $token = JWT::decode($jwt, $jwt_key, array('HS512'));
                $this->loginId = $token->data->login;
            }
            catch (\Exception $e)
            {
                $this->returnError(401, 'Invalid authorisation token');
            }

        }
        else
        {
            $this->returnError(401, 'No authorisation token provided');
        }
    }

    // Send correct for errors
    private function returnResponse($code, $message)
    {
        $this->app->response()->setStatus($code);

        // Can't call $app->halt as app not yet running, just end process
        header('X-PHP-Response-Code: ' . $code, true, $code);
        header('Content-Type: application/json');
        print json_encode($message);
        if ($this->exitOnError)
        {
            exit();
        } else {
            throw new \Exception(self::ErrorUnderTestExceptionMessage);
        }
    }

    private function returnError($code, $message, $logError = false)
    {
        if ($logError)
        {
            error_log('Authentication error: ' . $message);
            error_log('User-agent: ' . $_SERVER['HTTP_USER_AGENT']);
        }
        $this->returnResponse($code, array('error' => $message));
    }

    // Calls the relevant Authentication Mechanism
    function authenticate()
    {
        // urgh
        $login = $this->app->request->post('login');
        $password = $this->app->request->post('password');

        if (!$login)
        {
            $bbreq = (array) json_decode($this->app->request()->getBody());
            $login = $bbreq['login'];
            $password = $bbreq['password'];
        }

        if (!$login)
            $this->returnError(400, 'No login specified');
        if (!$password)
            $this->returnError(400, 'No password specified');

        if (!$this->dataLayer->isUserLoggedIn($login))
        {
            $this->returnError(400, 'Invalid Credentials');
        }

        if ($this->authenticateByType()->authenticate($login, $password))
        {
            $this->returnResponse(200, $this->generateJwtToken($login));
        }
        else
        {
            $this->returnError(400, 'Invalid Credentials');
        }
    }

    function authorise() 
    {
        global $cas_sso;

        if ($cas_sso) {
            header('Location: ' . $this->authenticateByType()->authorise());
            $this->returnResponse(302, array('status' => "Redirecting to CAS"));
        } else {
            $this->returnError(501, "SSO not configured");
        }
    }

    function authenticateByCode()
    {   
        $code = $this->app->request()->post('code');
        $fedid = $this->authenticateByType()->authenticateByCode($code);
        if ($fedid) {
            /* 
             * Since the returned username might not be in the database, given it's returned by 
             * the SSO provider and not our internal authentication logic, we need to double check
             * if it's valid
             */
            if (!$this->dataLayer->isUserLoggedIn($fedid)) {
                $this->returnError(403, 'User not recognised');
            }
            $this->returnResponse(200, $this->generateJwtToken($fedid));
        } else {
            $this->returnError(401, 'Invalid Credentials');
        }
    }

    // Logout
    function logout()
    {
        global $cookie_key;
        if (isset($_COOKIE[$cookie_key])) {
            $cookieOpts = array (
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            );

            setcookie($cookie_key, null, $cookieOpts);
        }
    }

    private function authenticateByType() {
        global $authentication_type;
        try {
            return $this->authenticationTypeFactory->create($authentication_type);
        }
        catch(\Exception $e) {
            error_log($e->getMessage());
            $this->returnError(500, 'Invalid Authentication Config');
        }
    }

}
