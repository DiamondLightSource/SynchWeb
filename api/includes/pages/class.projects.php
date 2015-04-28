<?php

    class Projects extends Page {
        

        var $arg_list = array('pid' => '\d+',
                              'ty' => '\w+',
                              'iid' => '\d+',
                              'rem' => '\d',
                              
                              'TITLE' => '.*',
                              'ACRONYM' => '([\w-])+',

                              'PROJECTID' => '\d+',
                              'USERNAME' => '\w+\d+',
                              'PUID' => '\d+',
                              );


        var $dispatch = array(array('(/:pid)', 'get', '_projects'),
                              array('', 'post', '_add_project'),
                              array('/:pid', 'patch', '_update_project'),

                              array('/users/pid/:pid', 'get', '_project_users'),
                              array('/users', 'post', '_add_user'),
                              array('/users/:PUID', 'delete', '_del_user'),

                              array('/check/ty/:ty/pid/:pid/iid/:iid', 'get', '_check_project'),
                              array('/addto/pid/:pid/ty/:ty/iid/:iid(/rem/:rem)', 'get', '_add_to_project'),
        );
    

        var $types = array('protein' => array('project_has_protein', 'proteinid'),
                           'sample' => array('project_has_blsample', 'blsampleid'),
                           'edge' => array('project_has_energyscan', 'energyscanid'),
                           'mca' => array('project_has_xfefspectrum', 'xfefluorescencespectrumid'),
                           'dc' => array('project_has_dcgroup', 'datacollectiongroupid'),
                           );
        
        
        # List of projects
        function _projects() {
            $args = array($this->user, $this->user);
            $where = "WHERE (p.owner LIKE :1 OR pu.username LIKE :2)";
            
            $tot = $this->db->pq("SELECT count(distinct p.projectid) as tot FROM project p LEFT OUTER JOIN project_has_user pu ON pu.projectid = p.projectid $where", $args);
            $tot = intval($tot[0]['TOT']);
            
            if ($this->has_arg('pid')) {
                $where .= ' AND p.projectid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
            }
            
            $start = 0;
            $end = 10;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (SELECT p.title, p.projectid, p.acronym, p.owner FROM project p LEFT OUTER JOIN project_has_user pu ON pu.projectid = p.projectid $where ORDER BY p.projectid) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);
            
            foreach ($rows as &$ro) {
                $ro['OWNER_NAME'] = $this->_get_name($ro['OWNER']);
                $ro['IS_OWNER'] = $ro['OWNER'] == $this->user;
            }
            
            if ($this->has_arg('pid')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such project');
                
            } else {
                $this->_output(array('total' => $tot,
                                 'data' => $rows,
                ));
            }
        }
        
        
        function _add_project() {
            if (!$this->has_arg('TITLE')) $this->_error('No title specified');
            if (!$this->has_arg('ACRONYM')) $this->_error('No acronym specified');
            
            $this->db->pq("INSERT INTO project (projectid,title,acronym,owner) 
                VALUES (s_project.nextval, :1, :2, :3) RETURNING projectid INTO :id", 
                array($this->arg('TITLE'), $this->arg('ACRONYM'), $this->user));
            
            $this->_output(array('PROJECTID' => $this->db->id(), 
                'IS_OWNER' => True, 
                'OWNER_NAME' => $this->_get_name($this->user), 
                'OWNER' => $this->user));
        }
        
        
        # Add to / remove from project
        function _add_to_project() {
            if (!$this->has_arg('pid')) $this->_error('No project id specified');
            if (!$this->has_arg('ty')) $this->_error('No item type specified');
            if (!$this->has_arg('iid')) $this->_error('No item id specified');
            
            
            if (array_key_exists($this->arg('ty'), $this->types)) {
                $t = $this->types[$this->arg('ty')];
                
                $chk = $this->db->pq("SELECT projectid FROM $t[0] WHERE projectid=:1 AND $t[1]=:2", array($this->arg('pid'), $this->arg('iid')));
                
                if ($this->has_arg('rem') && sizeof($chk)) {
                    $this->db->pq("DELETE FROM $t[0] WHERE projectid=:1 AND $t[1]=:2", array($this->arg('pid'), $this->arg('iid')));
                }
                
                if (!sizeof($chk)) {
                    $this->db->pq("INSERT INTO $t[0] (projectid,$t[1]) VALUES (:1, :2)", array($this->arg('pid'), $this->arg('iid')));
                }
                
                $this->_output(1);
            }
        }
        
        
        # Check if item already exists
        function _check_project() {
            if (!$this->has_arg('pid')) $this->_error('No project id specified');
            if (!$this->has_arg('ty')) $this->_error('No item type specified');
            if (!$this->has_arg('iid')) $this->_error('No item id specified');


            $ret = 0;
            
            if (array_key_exists($this->arg('ty'), $this->types)) {
                $t = $this->types[$this->arg('ty')];
                
                $rows = $this->db->pq("SELECT projectid FROM $t[0] WHERE projectid=:1 AND $t[1]=:2", array($this->arg('pid'), $this->arg('iid')));
                
                if (sizeof($rows)) $ret = 1;
            }
            
            $this->_output($ret);
        }
        
        
        # Update project
        function _update_project() {
            if (!$this->has_arg('pid')) $this->_error('No project id specified');
            
            $proj = $this->db->pq("SELECT p.projectid FROM project p WHERE p.owner LIKE :1 AND p.projectid=:2", array($this->user,$this->arg('pid')));
            if (!sizeof($proj)) $this->_error('No such project');
            
            $fields = array('ACRONYM', 'TITLE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE project SET $f=:1 WHERE projectid=:2", array($this->arg($f), $this->arg('pid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }
        
        
        # Users on project
        function _project_users() {
            if (!$this->has_arg('pid')) $this->_error('No project id specified');
            
            $pu = $this->db->pq("SELECT projectid,username,projecthasuserid as puid FROM project_has_user WHERE projectid=:1", array($this->arg('pid')));
            
            foreach ($pu as &$p) {
                $p['NAME'] = $this->_get_name($p['USERNAME']);
            }
            
            $this->_output($pu);
        }
        
    
        # Add a user to a project
        function _add_user() {
            if (!$this->has_arg('PROJECTID')) $this->_error('No project id specified');
            if (!$this->has_arg('USERNAME')) $this->_error('No user specified');
            
            $proj = $this->db->pq("SELECT p.projectid FROM project p WHERE p.owner LIKE :1 AND p.projectid=:2", array($this->user,$this->arg('PROJECTID')));
            
            if (!sizeof($proj)) $this->_error('No such project');
            $proj = $proj[0];
            
            $this->db->pq("INSERT INTO project_has_user (projecthasuserid, projectid, username) VALUES (s_project_has_user.nextval, :1, :2) RETURNING projecthasuserid INTO :id", array($this->arg('PROJECTID'), $this->arg('USERNAME')));
            
            $this->_output(array('PUID' => $this->db->id(), 'NAME' => $this->_get_name($this->arg('USERNAME'))));
        }
        
        
        # Remove a user
        function _del_user() {
            if (!$this->has_arg('PUID')) $this->_error('No user specified');
            
            $proj = $this->db->pq("SELECT p.projectid 
                FROM project p 
                INNER JOIN project_has_user pu ON pu.projectid = p.projectid
                WHERE p.owner LIKE :1 AND pu.projecthasuserid=:2", array($this->user,$this->arg('PUID')));
            if (!sizeof($proj)) $this->_error('No such project');
            $proj = $proj[0];
            
            $this->db->pq("DELETE FROM project_has_user WHERE projecthasuserid=:1", array($this->arg('PUID')));
            
            $this->_output(1);
        }

    
    }

?>