<?php
    
    class Page {
        var $require_staff = False;
        var $staff = False;
        var $visits = array();
        var $debug = False;
        var $explain = False;
        var $stats = False;
        var $profile = False;
        var $profiles = array();
        var $base;
    
        public static $dispatch = array();
        public static $arg_list = array();

        private $generic_args = array('page' => '\d+',
                                      'per_page' => '\d+',
                                      'sort_by' => '\w+',
                                      'order' => 'desc|asc',
                                      'ty' => '\w+',
                                      's' => '[\w\s-]+',
                                      'prop' => '\w+\d+',
                                      );

        
        var $sessionid;
        var $proposalid;
        
        function _base() {
            $rc = new ReflectionClass(get_class($this));
            return dirname($rc->getFileName()).'/'.basename($rc->getFileName(), '.php');
        }

        
        function __construct($app, $db, $user) {
            $this->_arg_list = array();
            $this->_dispatch = array();
            $class = $this;
            while ($class) {
                $this->_arg_list = array_merge($class::$arg_list, $this->_arg_list);
                $this->_dispatch = array_merge($class::$dispatch, $this->_dispatch);
                $class = get_parent_class($class);
            }

            $this->app = $app;
            
            $this->last_profile = microtime(True);
            $this->db = $db;
            $this->db->set_debug($this->debug);
            $this->db->set_explain($this->explain);
            $this->db->set_stats($this->stats);

            $this->_setup_routes();

            $this->user = $user;
        }
    

        function _get_type() {
            global $prop_types, $bl_types;
            $this->ty = 'gen';

            if ($this->user) {
                $ty = 'gen';
                if ($this->has_arg('prop')) {
                    if (preg_match('/([A-z]+)\d+/', $this->arg('prop'), $m)) {
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

                $this->ty = $ty;
            }
        }



        function auth($require_staff) {
            if ($require_staff) {
                $auth = $this->staff;
                
            // Beamline Sample Registration
            } else if ($this->blsr() && !$this->user->login) {
                $auth = false;

                if ($this->has_arg('visit')) {
                    $blsr_visits = array();
                    foreach ($this->blsr_visits() as $v) array_push($blsr_visits, $v['VISIT']);
                    
                    if (in_array($this->arg('visit'), $blsr_visits)) $auth = True;
                    
                } else {
                    $auth = true;
                }

            // Barcode Scanners
            } else if ($this->bcr() && !$this->user->login) {
                $auth = true;
                
            // Normal validation
            } else {
                $auth = False;
                
                // Registered visit or staff
                if ($this->staff) {
                    $auth = True;
                    
                    if ($this->has_arg('prop')) {
                        $prop = $this->db->pq('SELECT p.proposalid FROM proposal p WHERE CONCAT(p.proposalcode, p.proposalnumber) LIKE :1', array($this->arg('prop')));
                        
                        if (sizeof($prop)) $this->proposalid = $prop[0]['PROPOSALID'];
                    }
                    
                // Normal users
                } else {
                    $rows = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis
                        FROM proposal p
                        INNER JOIN blsession s ON p.proposalid = s.proposalid
                        INNER JOIN session_has_person shp ON shp.sessionid = s.sessionid
                        WHERE shp.personid=:1", array($this->user->personid));

                    foreach ($rows as $row) {
                        array_push($this->visits, strtolower($row['VIS']));
                    }
                    
                    /*$ids = $this->db->pq("SELECT s.sessionid FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE p.proposalcode || p.proposalnumber || '-' || s.visit_number in ('".implode("','", $this->visits)."')");
                    
                    $this->sessionids = array();
                    foreach ($ids as $id) {
                        array_push($this->sessionids, $id['SESSIONID']);
                    }*/
                    #print_r($this->sessionids);
                                         
                    if ($this->has_arg('id') || $this->has_arg('visit') || $this->has_arg('prop')) {
                        
                        // Check user is in this visit
                        if ($this->has_arg('id')) {
                            $types = array('data' => array('datacollection', 'datacollectionid'),
                                           'edge' => array('energyscan', 'energyscanid'),
                                           'mca' => array('xfefluorescencespectrum', 'xfefluorescencespectrumid'),
                                           );
                            
                            $table = 'datacollection';
                            $col = 'datacollectionid';
                            if ($this->has_arg('t')) {
                                if (array_key_exists($this->arg('t'), $types)) {
                                    $table = $types[$this->arg('t')][0];
                                    $col = $types[$this->arg('t')][1];
                                }
                            }
                            
                            $vis = $this->db->pq("SELECT p.proposalid, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN $table dc ON s.sessionid = dc.sessionid WHERE dc.$col = :1", array($this->arg('id')));

                            if (sizeof($vis)) $this->proposalid = $vis[0]['PROPOSALID'];
                            $vis = sizeof($vis) ? $vis[0]['VIS'] : '';
                            
                            
                        } else if ($this->has_arg('visit')) {
                            $vis = $this->arg('visit');
                            
                            $visp = $this->db->pq("SELECT p.proposalid FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
                            
                            if (sizeof($visp)) $this->proposalid = $visp[0]['PROPOSALID'];
                            
                        // Check user is in this proposal
                        } else if ($this->has_arg('prop')) {
                            $viss = $this->db->pq("SELECT p.proposalid, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE CONCAT(p.proposalcode, p.proposalnumber) LIKE :1", array($this->arg('prop')));
                            
                            $vis = array();
                            foreach ($viss as $v) array_push($vis, $v['VIS']);
                            if (sizeof($viss)) $this->proposalid = $viss[0]['PROPOSALID'];
                        }
                        
                        if ($this->has_arg('id') || $this->has_arg('visit')) {
                            if (in_array($vis, $this->visits)) $auth = True;
                        } else {
                            if (sizeof(array_intersect($vis, $this->visits))) $auth = True;
                        }
                        
                    // No id or visit, anyone ok to view
                    } else {
                        $auth = True;
                    }
                }
            }

            
            // End execution, show not authed page template
            if (!$auth) {
                $this->_error('Access Denied', 'You dont have access to that page');
            }
            
            return $auth;
        }

        
        function _setup_routes() {
            foreach ($this->_dispatch as $args) {
                if (sizeof($args) > 4) $this->app->{$args[1]}($args[0], array(&$this, 'execute'), array(&$this, $args[2]))->conditions($args[3])->name($args[4]);
                if (sizeof($args) > 3) $this->app->{$args[1]}($args[0], array(&$this, 'execute'), array(&$this, $args[2]))->conditions($args[3]);
                else $this->app->{$args[1]}($args[0], array(&$this, 'execute'), array(&$this, $args[2]))->conditions($this->_arg_list);
            }
        }
        
        function execute($route) {
            $this->_parse_args();
            $this->_get_type();
            $this->staff = $this->user->has($this->ty.'_admin');

            if (in_array($route->getName(), array('edge', 'mca'))) {
                $this->args['t'] = $route->getName();
            }

            /*$extra = $route->getParams();
            foreach (array('id', 'visit', 't') as $i => $k) {
                if (array_key_exists($k, $extra)) $this->args[$k] = $extra[$k];
            }*/

            $extra = array();
            foreach ($route->getParams() as $k => $v) {
                if ($v) $extra[$k] = $v;
            }
            $this->args = array_merge($this->args, $extra);

            $ret = $this->auth($this->require_staff, $this);

            return $ret;
        }
        

        # ------------------------------------------------------------------------
        # Log Action
        function log_action($act=1,$com='') {
            if (get_class($this) == 'Image') return;
            if (get_class($this) == 'Download') return;
            
            $action = $act ? 'LOGON' : 'LOGOFF';
            
            if ($this->user) {
                $com = 'ISPyB2: '.($com ? $com : $_SERVER['REQUEST_URI']);
                $chk = $this->db->pq("SELECT comments FROM adminactivity WHERE username LIKE :1", array($this->user->login));
                
                if (sizeof($chk)) {
                    $this->db->pq("UPDATE adminactivity SET action=:1, comments=:2, datetime=SYSDATE WHERE username=:3", array($action, $com, $this->user->login));
                    
                    
                } else {
                    $this->db->pq("INSERT INTO adminactivity (adminactivityid, username, action, comments, datetime) VALUES (s_adminactivity.nextval, :1, :2, :3, SYSDATE)", array($this->user->login, $action, $com));
                }
                
            }
            
            return true;
        }


        # ------------------------------------------------------------------------
        # Output JSON encoded data
        function _output($data) {
            if (!$this->debug && !$this->db->debug) $this->app->contentType('application/json');
            if ($this->profile) $data['profile'] = $this->pro();
            $this->app->response()->body(json_encode($data));
            //print json_encode($data);
            if ($this->explain) print "\n".$this->db->plan;
            if ($this->db->stats) print "\n".$this->db->stat;

        }
        
        # Error messages as json object, should probably return a different
        # http code as well
        function _error($msg, $code=400) {
            //header('HTTP/1.1 400 Bad Request');
            //header('Content-type:application/json');
            //print 

            $this->app->halt($code, json_encode(array('status' => $code, 'message' => $msg)));
            //exit();
        }
        
        
        
        # ------------------------------------------------------------------------
        # Convert input arg url to key / value pairs once checked against templates
        //function _parse_args($args) {
        function _parse_args() {
            require_once('lib/HTMLPurifier/HTMLPurifier.auto.php');
            $config = HTMLPurifier_Config::createDefault();
            $purifier = new HTMLPurifier($config);
            
            $bbreq = (array)json_decode($this->app->request()->getBody());
            $request = array_merge($_REQUEST, $bbreq);
            $this->request = $request;

            $parsed = array();
            
            // Array of arguments
            if (sizeof($request) && !$this->is_assoc($request)) {
                $pa = array();
                foreach ($request as $r) {
                    $par = array();
                    foreach (array_merge($this->generic_args, $this->_arg_list) as $k => $v) {
                        if (array_key_exists($k, $r)) {

                            if (is_array($r->$k)) {
                                $tmp = array();
                                foreach ($r->$k as $val) {
                                    if (preg_match('/^'.$v.'$/m', $val)) {
                                        array_push($tmp, $v == '.*' ? $purifier->purify($val) : $val);
                                    }
                                }
                                $par[$k] = $tmp;
                                
                            } else {
                                if (preg_match('/^'.$v.'$/m', $r->$k)) {
                                    $par[$k] = $v == '.*' ? $purifier->purify($r->$k) : $r->$k;
                                    if ($k == 'prop') $parsed[$k] = $par[$k];
                                }
                            }
                        }
                    }
                    array_push($pa, $par);
                }
                
                $parsed['collection'] = $pa;
                

            } else {
                foreach (array_merge($this->generic_args, $this->_arg_list) as $k => $v) {
                    if (!array_key_exists($k, $parsed)) {
                        if (array_key_exists($k, $request)) {
                            
                            if (is_array($request[$k])) {
                                $tmp = array();
                                foreach ($request[$k] as $val) {
                                    if (preg_match('/^'.$v.'$/m', $val)) {
                                        array_push($tmp, $v == '.*' ? $purifier->purify($val) : $val);
                                    }
                                }
                                $parsed[$k] = $tmp;
                                
                            } else {
                                if (preg_match('/^'.$v.'$/m', $request[$k])) {
                                    $parsed[$k] = $v == '.*' ? $purifier->purify($request[$k]) : $request[$k];
                                
                                }
                            }
                        }
                    }
                }
            }

            # Retrieve cookie args
            // if ($this->user) {
            //     if (array_key_exists('ispyb_prop_'.$this->user->login, $_COOKIE) && !array_key_exists('prop', $parsed)) $parsed['prop'] = $_COOKIE['ispyb_prop_'.$this->user->login];
            // }
            
            $this->args = $parsed;
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

        function def_arg($key, $val) {
            return $this->has_arg($key) ? $this->arg($key) : $val;
        }
        
        # ------------------------------------------------------------------------
        # Misc Helpers
        
        # Pretty-ish printer
        function p($array) {
            if ($this->debug) {
                print '<h1 class="debug">Debug</h1><pre>';
                print_r($array);
                print '</pre>';
            }
        }
        
        # Unix time to javascript timestamp
        function jst($str, $plus=True) {
            return strtotime($str.' GMT')*1000;# + ($plus ? (3600*1000) : 0);
        }
        
        
        # Get a PV
        function pv($pvs, $full=false, $string=false) {
            global $bl_pv_prog, $bl_pv_env;
            putenv($bl_pv_env);
            exec($bl_pv_prog . ($string ? ' -S' : '') .' ' . implode(' ', $pvs) . ' 2>/dev/null', $ret);
            $output = array();
            foreach ($ret as $i => $v) {
                $lis = preg_split('/\s+/', $v);
                $output[$lis[0]] = sizeof($lis) > 1 ? ($full ? array_slice($lis,1) : $lis[1]) : '';
            }
            
            return $output;
        }
        
        
        # Check for trailing slash on path
        function ads($var) {
            if (!(substr($var, -1, 1) == '/')) $var .= '/';
            return $var;
        }
        
        
        function dirs($root) {
            $d = array();
            
            if (file_exists($root)) {
                foreach (scandir($root) as $f) {
                    if ($f === '.' or $f === '..') continue;
                    if (is_dir($root.'/'.$f)) array_push($d,$f);
                }
            }
            
            return $d;
        }

        
        # ------------------------------------------------------------------------
        # Page profiling, call with a message to log the time taken between calls
        function profile($msg) {
            if ($this->profile)
                array_push($this->profiles, $msg.': '.(microtime(True) - $this->last_profile));
            $this->last_profile = microtime(True);
        }
        
        function pro() {
            return $this->profiles;
        }
        
        
        # ------------------------------------------------------------------------
        # Beamline sample registration: Get Beamline from IP
        function ip2bl() {
            global $ip2bl;
            $parts = explode('.', $_SERVER['REMOTE_ADDR']);
            
            if (array_key_exists($parts[2], $ip2bl)) {
                return $ip2bl[$parts[2]];
            }
        }
        
        
        # Return visit list for blsr;
        function blsr_visits() {
            $b = $this->ip2bl();
            
            if (!$b) return array();
            
            $visits = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE TIMESTAMPDIFF('DAY', s.startdate, CURRENT_TIMESTAMP) < 1 AND TIMESTAMPDIFF('DAY', CURRENT_TIMESTAMP, s.enddate) < 2 AND s.beamlinename LIKE :1 ORDER BY s.startdate", array($b));
                
            //if (!sizeof($visits)) {
            $v = $this->db->paginate("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en,s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode LIKE 'cm' AND s.beamlinename LIKE :1 AND s.enddate <= CURRENT_TIMESTAMP ORDER BY s.startdate DESC", array($b,0,1));
            $visits = array_merge($visits, $v);
            //}
            
            return $visits;
        }
        
        # Beamline Sample Registration Machine
        function blsr() {
            global $blsr;
            
            return in_array($_SERVER['REMOTE_ADDR'], $blsr);
        }
        
        # Barcode Scanner Machines
        function bcr() {
            global $bcr;
            return in_array($_SERVER['REMOTE_ADDR'], $bcr);
        }
        
        
        # ------------------------------------------------------------------------
        # LDAP: Return a name for a fedid
        function _get_name($fedid) {
            $src = $this->_ldap_search('cn='.$fedid);
            return array_key_exists($fedid, $src) ? $src[$fedid] : $fedid;
        }
        
        function _get_email($fedid) {
            $src = $this->_ldap_search('cn='.$fedid, True);
            return array_key_exists($fedid, $src) ? $src[$fedid] : $fedid;
        }

        function _get_email_fn($name) {
            $parts = explode(' ', $name);
            if (sizeof($parts) == 2) {
                $fn = $parts[0];
                $ln = $parts[1];
            } else if (sizeof($parts) == 3) {
                $fn = $parts[1];
                $ln = $parts[2];
            } else return;

            $src = $this->_ldap_search("(&(sn=$ln)(givenname=$fn))", true);

            $ret = array();
            foreach ($src as $fedid => $email) {
                array_push($ret, $email);
            }

            if (sizeof($ret)) return $ret[0];
        }
              

        # Run an ldap search
        function _ldap_search($search,$email=False) {
            global $ldap_server, $ldap_search;

            $ret = array();
            $ds=ldap_connect($ldap_server);
            if ($ds) {
                $r=ldap_bind($ds);
                $sr=ldap_search($ds, $ldap_search, $search);
                $info = ldap_get_entries($ds, $sr);

                for ($i=0; $i<$info["count"]; $i++) {
                    if ($email) {
                        $ret[$info[$i]['cn'][0]] = array_key_exists('mail', $info[$i]) ? $info[$i]['mail'][0] : '';
                    } else $ret[$info[$i]['cn'][0]] = $info[$i]['givenname'][0].' '.$info[$i]['sn'][0];
                }
                
                ldap_close($ds);                                  
            }
            return $ret;
        }
        
        
        // Deprecated - now set in javascript
        # ------------------------------------------------------------------------
        # Set cookie for current proposal
        function cookie($val) {
            if ($this->user) {
                setcookie('ispyb_prop_'.$this->user, $val, time()+31536000, '/');
            }
        }
     
        
        # ------------------------------------------------------------------------
        # Talk to channel archiver to get a pv
        function _get_archive($pv, $s, $e, $n=100) {
            require_once('lib/xmlrpc/xmlrpc.inc');
            require_once('lib/xmlrpc/xmlrpcs.inc');
            require_once('lib/xmlrpc/xmlrpc_wrappers.inc');
            
            $m = new xmlrpcmsg('archiver.values', array(
                                                        new xmlrpcval(1000, 'int'),
                                                        new xmlrpcval(array(new xmlrpcval($pv,'string')), 'array'),
                                                        new xmlrpcval($s,'int'),
                                                        new xmlrpcval(0,'int'),
                                                        new xmlrpcval($e,'int'),
                                                        new xmlrpcval(0,'int'),
                                                        new xmlrpcval($n,'int'),
                                                        new xmlrpcval(0,'int'),
                                                        ));
            $c = new xmlrpc_client("/archive/cgi/ArchiveDataServer.cgi", "archiver.pri.diamond.ac.uk", 80);
            
            $r = $c->send($m);
            $val = $r->value();
            
            if ($val) {
                $str = $val->arrayMem(0);
                $vals = $str->structMem('values');
                
                $ret = array();
                for ($i = 0; $i < $vals->arraySize(); $i++) {
                    $vs = $vals->arrayMem($i);
                    $v = $vs->structMem('value')->arrayMem(0)->scalarVal();
                    $t = $vs->structMem('secs')->scalarVal()-3600;
                    
                    $inputTZ = new DateTimeZone('Europe/London');
                    $transitions = $inputTZ->getTransitions($t, $t);
                    if ($transitions[0]['isdst']) $t += 3600;
                    
                    array_push($ret, array($t,$v));
                }
                
                return $ret;
            }
        }



        function is_assoc(array $array) {
            $keys = array_keys($array);
            return array_keys($keys) !== $keys;
        }



        # ------------------------------------------------------------------------
        # Make a cURL request
        function _curl($options) {
            $ch = curl_init();

            $headers = getallheaders();
            if (array_key_exists('Authorization', $headers) && array_key_exists('jwt', $options)) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: '.$headers['Authorization']));
            }

            $data = '';
            if ($options['data']) {
                $data = '?'.http_build_query($options['data']);
            }

            curl_setopt($ch, CURLOPT_URL, $options['url'].$data);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
            curl_setopt($ch, CURLOPT_HEADER, 0);
            $content = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return array('code' => $code, 'content' => $content);
        }

    }


?>
