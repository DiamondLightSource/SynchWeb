<?php

class ProposalType {
    
    var $table;
    var $col;
    
    var $generic_pages = array(
        'proposal', 'fault', 'cal', 'feedback', 'vstat', 'users',
        'sample', 'shipment', 'pdf', 'contact', 'download',
    );
    
    var $visit_table;
    var $session_column;
    
    var $pages = array();
    var $prop_menu = array();
    var $ext_menu =  array();
    var $ext_admin = array();
    
    var $staff = False;
    var $visits = array();
    var $sessionids = array();
    var $proposalid;
    
    var $default = '';
    var $dir = '';

    var $staff_permission = 'super_admin';
    
    function __construct($app, $db, $user) {
        $this->app = $app;
        $this->db = $db;
        $this->user = $user;

        $this->staff = $this->user->has($this->staff_permission);
    }
    
    
    // Work out what type of proposal we are in
    function get_type() {
        global $prop_types, $bl_types, $blsr, $bcr;
        
        
        // default to use (none)
        $ty = 'gen';
        
        $bbreq = (array)json_decode($this->app->request()->getBody());
        $request = array_merge($_REQUEST, $bbreq);

        $vis = array_key_exists('visit', $request) ? $request['visit'] : null;
        $prop = array_key_exists('prop', $request) ? $request['prop'] : null;

        if (sizeof($request) && !$this->is_assoc($request)) {
            $first = $request[0];
            if (property_exists($first, 'prop')) $prop = $first->prop;
        }

        $path = $this->app->request->getResourceUri();
        if (preg_match('/\/prop\/(\w+)/', $path, $m)) $prop = $m[1];
        if (preg_match('/\/visit\/([\w-]+)/', $path, $m)) $vis = $m[1];

        if (preg_match('/\/id\/(\d+)/', $path, $m)) {
            $id = $m[1];
            $t = null;
            if (preg_match('/\/t\/(\w)+/', $path, $m)) $t = $m[1];
            
            $types = array('data' => array('datacollection', 'datacollectionid'),
                                           'edge' => array('energyscan', 'energyscanid'),
                                           'mca' => array('xfefluorescencespectrum', 'xfefluorescencespectrumid'),
                                           );
                        
            $table = 'datacollection';
            $col = 'datacollectionid';
            if ($t) {
                if (array_key_exists($t, $types)) {
                    $table = $types[$t][0];
                    $col = $types[$t][1];
                }
            }
            
            $props = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN $table dc ON s.sessionid = dc.sessionid WHERE dc.$col = :1", array($id));
            if (sizeof($props)) $prop = $props[0]['PROP'];
        }


        // check if there is a visit in the address args
        if (preg_match('/([A-z]+)\d+-\d+/', $vis, $m)) {
            $bl = $this->db->pq("SELECT s.beamlinename 
                FROM blsession s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($m[0]));
            
            if (sizeof($bl)) {
                $bl = $bl[0]['BEAMLINENAME'];
                foreach ($bl_types as $tty => $bls) {
                    if (in_array($bl, $bls)) {
                        $ty = $tty;
                        break;
                    }
                }
            }
            
        // check if its blsr or bcr machine for mx
        } else if (in_array($_SERVER['REMOTE_ADDR'], $blsr) || in_array($_SERVER['REMOTE_ADDR'], $bcr)) {
            $ty = 'mx';
            
            
        // check if we have a proposal
        } else {
            if ($this->user) {
                if (preg_match('/([A-z]+)\d+/', $prop, $m)) {
                    $prop_code = $m[1];
                    
                    // See if proposal code matches list in config
                    $found = False;
                    foreach ($prop_types as $pty) {
                        if ($prop_code == $pty) {
                            $ty = $pty;
                            $found = True;
                        }
                    }
                    
                    // Proposal code didnt match, work out what beamline the visits are on
                    if (!$found) {
                        $bls = $this->db->pq("SELECT s.beamlinename FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(p.proposalcode,p.proposalnumber) LIKE :1", array($m[0]));
                        
                        if (sizeof($bls)) {
                            foreach ($bls as $bl) {
                                $b = $bl['BEAMLINENAME'];
                                foreach ($bl_types as $tty => $bls) {
                                    if (in_array($b, $bls)) {
                                        $ty = $tty;
                                        break 2;
                                    }
                                }
                            }
                        }
                    }

                // get default type from type of admin
                }
                else {
                    foreach ($this->user->perms as $p) {
                        if (strpos($p, '_admin')) {
                            $parts = explode('_', $p);
                            $ty = $parts[0];
                            break;
                        }
                    }
                }
            }
        }
        
        $this->ty = $ty;
        
        // Load specific proposal type
        if ($ty && file_exists('includes/class.type.'.$ty.'.php')) {
            include_once('includes/class.type.'.$ty.'.php');
            $type_class = strtoupper($ty);
            //$tyc = new $type_class($this->db, $this->parts);
            $tyc = new $type_class($this->app, $this->db, $this->user);
            $tyc->ty = $ty;
            $tyc->dispatch();
            
        } else $this->dispatch();
    }
    
    
    
    // Generate routes for slim
    function dispatch() {
        $app = $this->app;
        $db = $this->db;
        $cl = $this;
        foreach (array_merge($this->pages, $this->generic_pages) as $i => $p) {
            $app->group('/'.$p, function () use ($app, $db, $p, $cl) {
                $class = in_array($p, $cl->generic_pages) ? 'includes/pages/class.'.$p.'.php' 
                                                          : 'includes/pages/'.$cl->dir.'/class.'.$p.'.php';
                if (file_exists($class)) {
                    require_once($class);
                    // $ns = $cl->ty == 'mx' || $cl->ty == 'sm' || in_array($p, $cl->generic_pages) ? '\\' : '\\'.$cl->dir.'\\';
                    $ns = $cl->dir && !in_array($p, $cl->generic_pages) ? '\\'.$cl->dir.'\\' : '\\';
                    $cn = $ns.ucfirst($p);
                    $pg = new $cn($app, $db, $cl);
                }
            });
        }

        $this->app->notFound(function() use($app) {
            $app->halt(404, json_encode(array('status' => 404, 'message' => 'not found')));
        });

        $app->run();
    }
    
    
    function auth($require_staff, $parent) {
        // $this->staff = $this->user->can('super_admin');
        // $groups = $this->user ? explode(' ', exec('groups ' . $this->user)) : array();
        // $this->staff = in_array('mx_staff', $groups) ? True : False;
        // if (!$this->staff && in_array('dls_dasc', $groups)) $this->staff = True;
        //if (!$this->staff && in_array('b21_staff', $groups)) $this->staff = True;
        //if (!$this->staff && in_array('i11_staff', $groups)) $this->staff = True;
        
        return True;
    }
    
    
    function msg($title, $msg) {
        $this->app->halt(403, json_encode(array('status' => 403, 'message' => $msg, 'title' => $title)));
    }
    
    
    # ------------------------------------------------------------------------
    # Nice interface to args
    function has_arg($key) {
        return array_key_exists($key, $this->args);
    }
    
    function arg($key) {
        if (!$this->has_arg($key)) new Exception();
        return $this->args[$key];
    }
    
    function set_args($args) {
        $this->args = $args;
    }
    
    function is_staff() {
        return $this->staff;
    }
    
    function pid() {
        return $this->proposalid;
    }

    function is_assoc(array $array) {
            $keys = array_keys($array);
            return array_keys($keys) !== $keys;
        }
}
    
?>
