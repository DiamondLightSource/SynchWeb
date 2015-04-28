<?php

class GEN extends ProposalType {
    
    // Pages that this proposal type provides
    var $pages = array(
                   'image',
                   'dc',
                   );
    
    var $default = 'proposal';
    
    // base directory for all files
    var $dir = 'gen';
    
    // table and column to add data collection count to visit page
    var $visit_table = 'datacollection';
    var $session_column = 'datacollectionid';
    
    
    // Authentication method for this type of proposal
    function auth($require_staff, $parent) {
        $groups = $this->user ? explode(' ', exec('groups ' . $this->user)) : array();
        $this->staff = in_array('mx_staff', $groups) ? True : False;
        if (!$this->staff && in_array('dls_dasc', $groups)) $this->staff = True;
        if (!$this->staff && in_array('b21_staff', $groups)) $this->staff = True;
        if (!$this->staff && in_array('i11_staff', $groups)) $this->staff = True;
        
        // Staff only pages
        if ($require_staff) {
            $auth = $this->staff;
            
        
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
                
                if ($this->has_arg('id') || $this->has_arg('visit') || $this->has_arg('prop')) {
                    
                    // Check user is in this visit
                    if ($this->has_arg('id')) {
                        $vis = $this->db->pq('SELECT p.proposalcode || p.proposalnumber || \'-\' || s.visit_number as vis FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN datacollection dc ON s.sessionid = dc.sessionid WHERE dc.datacollectionid = :1', array($this->arg('id')));
                        
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
    
}

?>
