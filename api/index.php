<?php
    

    require 'lib/Slim/Slim.php';
    \Slim\Slim::registerAutoloader();

    $app = new \Slim\Slim(array(
        //'mode' => 'production'
        'mode' => 'development'
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

    //if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) ob_start("ob_gzhandler");
    //else ob_start();

    require_once('OracleSession.php');
    $handler = new OracleSessionHandler();
    session_set_save_handler(
                             array($handler, '_open'),
                             array($handler, '_close'),
                             array($handler, '_read'),
                             array($handler, '_write'),
                             array($handler, '_destroy'),
                             array($handler, '_gc')
                             );
    
    // the following prevents unexpected effects when using objects as save handlers
    register_shutdown_function('session_write_close');
    
    require_once('config.php');


    $parts = explode('/', $app->request->getResourceUri()); 
    if (sizeof($parts)) array_shift($parts);
      
    $need_auth = true;
    # Work around to allow beamline sample registration without CAS authentication
    if (sizeof($parts) >= 2) {
        if (
            # For use on the touchscreen computers in the hutch
            (($parts[0] == 'assign') && in_array($_SERVER["REMOTE_ADDR"], $blsr)) ||
            (($parts[0] == 'shipment' && $parts[1] == 'containers') && in_array($_SERVER["REMOTE_ADDR"], $blsr)) ||
            ($parts[0] == 'cal' && $parts[1] == 'ics' && $parts[2] == 'h') || 

            # Allow barcode reader unauthorised access, same as above, certain IPs only
            ($parts[0] == 'shipment' && $parts[1] == 'dewars' && in_array($_SERVER["REMOTE_ADDR"], $bcr))
            ) {
            $need_auth = false;
        }
    }
    
    
    if ($need_auth) {
        require_once 'lib/CAS/CAS.php';
        phpCAS::client(CAS_VERSION_2_0, 'liveauth.diamond.ac.uk', 443, '/cas');
        //phpCAS::setCasServerCACert($cacert);
        phpCAS::setNoCasServerValidation();
        phpCAS::forceAuthentication();
    }

    date_default_timezone_set('Europe/London');
    
    include_once('includes/class.page.php');
    include_once('includes/class.db.php');
    
    $db = new Oracle($isb['user'], $isb['pass'], $isb['db'], $app);
    register_shutdown_function(array(&$db, '__destruct'));
    

    require_once('includes/class.user.php');
    $login = class_exists('phpCAS') ? phpCAS::getUser() : null;
    $user = new User($login, $db);


    if ($parts[0] == 'logout') {
        $db->pq("INSERT INTO log4stat (id,priority,log4jtimestamp,msg,detail) 
            VALUES (s_log4stat.nextval, 'ISPYB2_STAT', SYSDATE, 'LOGOFF', :1)", 
            array($login));
        phpCAS::logout();
    }
    
    include_once('includes/class.type.php');
    $type = new ProposalType($app, $db, $user);
    $type->get_type();
    
?>