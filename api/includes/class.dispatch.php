<?php

class Dispatch {

    var $pages = array(
        'proposal', 
        'fault', 
        'cal', 
        'feedback', 
        'vstat',
        'users',
        'sample',
        'shipment',
        'pdf',
        'contact',
        'download',
        'exp',

        'image',
        'download',
        'pdf',
        'robot',
        'dc',
        'mc',
        'assign',
        'status',
        'cell',
        'projects',      
        'stats',
        
        'imaging',
        'process',
    );
    

    function __construct($app, $db, $user) {
        $this->app = $app;
        $this->db = $db;
        $this->user = $user;
    }
    
    
    // Generate routes for slim
    function dispatch() {
        $app = $this->app;
        $db = $this->db;
        $u = $this->user;
        $cl = $this;
        foreach ($this->pages as $i => $p) {
            $app->group('/'.$p, function () use ($app, $db, $p, $u) {
                $class = 'includes/pages/class.'.$p.'.php';
                if (file_exists($class)) {
                    require_once($class);
                    $cn = '\\'.ucfirst($p);
                    $pg = new $cn($app, $db, $u);
                }
            });
        }

        $this->app->notFound(function() use($app) {
            $app->halt(404, json_encode(array('status' => 404, 'message' => 'not found')));
        });

        $app->run();
    }

}
    
?>
