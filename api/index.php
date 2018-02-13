<?php
    /*
        Copyright 2015 Diamond Light Source <stuart.fisher@diamond.ac.uk>
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */

    include_once('includes/class.autoloader.php');
    $loader = new Psr4AutoloaderClass;
    $loader->register();


    require 'lib/Slim/Slim.php';
    \Slim\Slim::registerAutoloader();

    session_cache_limiter(false);

    include_once('includes/class.db.php');
    $db = Database::get();
    register_shutdown_function(array(&$db, '__destruct'));

    // require_once('includes/class.options.php');
    // $options = new Options($db);

    require_once('config.php');

    $app = new \Slim\Slim(array(
        'mode' => $mode == 'production' ? 'production' : 'development'
    ));


    $app->configureMode('production', function () use ($app) {
        $app->config(array(
            'log.enable' => true,
            'debug' => false
        ));
    });

    $app->configureMode('development', function () use ($app) {
        $app->config(array(
            'log.enable' => false,
            'debug' => true
        ));
    });
    

    $app->get('/options', function() use ($app) {
        global $motd, $authentication_type, $cas_url, $cas_sso, $package_description, $facility_courier_countries, $facility_courier_countries_nde, $dhl_enable, $dhl_link;
        $app->contentType('application/json');
        $app->response()->body(json_encode(array('motd' => $motd, 'authentication_type' => $authentication_type, 'cas_url' => $cas_url, 'cas_sso' => $cas_sso, 'package_description' => $package_description, 'facility_courier_countries' => $facility_courier_countries, 'facility_courier_countries_nde' => $facility_courier_countries_nde, 'dhl_enable' => $dhl_enable, 'dhl_link' => $dhl_link)));
        // $app->response()->body(json_encode($options->ui()));
    });

    //if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) ob_start("ob_gzhandler");
    //else ob_start();

    
    // the following prevents unexpected effects when using objects as save handlers
    register_shutdown_function('session_write_close');

    require_once('includes/class.auth.php');
    $auth = new Authenticate($app, $db);
    $auth->check_auth_required();


    date_default_timezone_set('Europe/London');
    
    include_once('includes/class.page.php');


    require_once('includes/class.user.php');
    $login = $auth->get_user();
    $user = new User($login, $db, $app);


    if ($user->login) {
        $chk = $db->pq("SELECT TIMESTAMPDIFF('SECOND', datetime, CURRENT_TIMESTAMP) as lastupdate, comments FROM adminactivity WHERE username LIKE :1", array($user->login));
        if (sizeof($chk)) {
            if ($chk[0]['LASTUPDATE'] > 20) $db->pq("UPDATE adminactivity SET datetime=CURRENT_TIMESTAMP WHERE username=:1", array($user->login));
        }
    }
    
    include_once('includes/class.dispatch.php');
    $type = new Dispatch($app, $db, $user);
    $type->dispatch();
    
?>
