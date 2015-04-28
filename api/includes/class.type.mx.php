<?php
    
class MX extends ProposalType {
    
    // Pages that this proposal type provides
    var $pages = array(
        'image',
        'download',
        'pdf',
        'robot',
        'dc',
        'mc',
        'assign',
        'status',
        'cell',
        'shipment',
        'sample',
        'contact',
        'projects',      
        'stats',
        //'tracking',
    );
    
    var $default = 'proposal';
    var $dir = '';
    
    var $visit_table = 'datacollection';
    var $session_column = 'sessionid';
    
    
    // Authentication method for this type of proposal
    function auth($require_staff, $parent) {
        $groups = $this->user ? explode(' ', exec('groups ' . $this->user)) : array();
        $this->staff = false;
        $this->staff = in_array('mx_staff', $groups) ? True : False;
        if (!$this->staff && in_array('dls_dasc', $groups)) $this->staff = True;
        
        // Staff only pages
        if ($require_staff) {
            $auth = $this->staff;
            
        // Beamline Sample Registration
        } else if ($this->blsr() && !$this->user) {
            $auth = false;

            if ($this->has_arg('visit')) {
                $blsr_visits = array();
                foreach ($parent->blsr_visits() as $v) array_push($blsr_visits, $v['VISIT']);
                
                if (in_array($this->arg('visit'), $blsr_visits)) $auth = True;
                
            } else {
                $auth = true;
            }
            
        // Normal validation
        } else {
            $auth = False;
            
            // Registered visit or staff
            if ($this->staff) {
                $auth = True;
                
                if ($this->has_arg('prop')) {
                    $prop = $this->db->pq('SELECT p.proposalid FROM proposal p WHERE p.proposalcode || p.proposalnumber LIKE :1', array($this->arg('prop')));
                    
                    if (sizeof($prop)) $this->proposalid = $prop[0]['PROPOSALID'];
                }
                
            // Normal users
            } else {
                $rows = $this->db->pq("SELECT lower(i.visit_id) as vis from investigation@DICAT_RO i inner join investigationuser@DICAT_RO iu on i.id = iu.investigation_id inner join user_@DICAT_RO u on u.id = iu.user_id where u.name=:1", array($this->user));
                
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
                        
                        $vis = $this->db->pq('SELECT p.proposalid, p.proposalcode || p.proposalnumber || \'-\' || s.visit_number as vis FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN '.$table.' dc ON s.sessionid = dc.sessionid WHERE dc.'.$col.' = :1', array($this->arg('id')));

                        if (sizeof($vis)) $this->proposalid = $vis[0]['PROPOSALID'];
                        $vis = sizeof($vis) ? $vis[0]['VIS'] : '';
                        
                        
                    } else if ($this->has_arg('visit')) {
                        $vis = $this->arg('visit');
                        
                        $visp = $this->db->pq("SELECT p.proposalid FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode || p.proposalnumber || '-' || s.visit_number LIKE :1", array($this->arg('visit')));
                        
                        if (sizeof($visp)) $this->proposalid = $visp[0]['PROPOSALID'];
                        
                    // Check user is in this proposal
                    } else if ($this->has_arg('prop')) {
                        $viss = $this->db->pq('SELECT p.proposalid, p.proposalcode || p.proposalnumber || \'-\' || s.visit_number as vis FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE p.proposalcode || p.proposalnumber LIKE :1', array($this->arg('prop')));
                        
                        $vis = array();
                        foreach ($viss as $v) array_push($vis, $v['VIS']);
                        $this->proposalid = $viss[0]['PROPOSALID'];
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
            $this->msg('Access Denied', 'You dont have access to that page');
        }
        
        return $auth;
    }

    
    # Work out what beamline from its ip
    function ip2bl() {
        global $ip2bl;
        $parts = explode('.', $_SERVER['REMOTE_ADDR']);
        
        if (array_key_exists($parts[2], $ip2bl)) {
            return $ip2bl[$parts[2]];
        }
    }
    
    # Beamline Sample Registration Machine
    function blsr() {
        global $blsr;
        
        return in_array($_SERVER['REMOTE_ADDR'], $blsr);
    }
    
}

?>