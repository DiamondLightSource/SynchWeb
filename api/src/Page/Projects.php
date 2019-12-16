<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Projects extends Page
{
        

        public static $arg_list = array('pid' => '\d+',
                              'ty' => '\w+',
                              'iid' => '\d+',
                              'rem' => '\d',
                              
                              'TITLE' => '.*',
                              'ACRONYM' => '([\w-])+',

                              'PROJECTID' => '\d+',
                              'USERNAME' => '\w+\d+',
                              'PERSONID' => '\d+',
                              'PPID' => '\d+-\d+',
                              );


        public static $dispatch = array(array('(/:pid)', 'get', '_projects'),
                              array('', 'post', '_add_project'),
                              array('/:pid', 'patch', '_update_project'),

                              array('/users', 'post', '_add_user'),
                              array('/users/:PPID', 'delete', '_del_user'),

                              array('/check/ty/:ty/pid/:pid/iid/:iid', 'get', '_check_project'),
                              array('/addto/pid/:pid/ty/:ty/iid/:iid(/rem/:rem)', 'get', '_add_to_project'),

                              #array('/migrate', 'get', '_migrate'),
        );
    

        var $types = array('protein' => array('project_has_protein', 'proteinid'),
                           'sample' => array('project_has_blsample', 'blsampleid'),
                           'edge' => array('project_has_energyscan', 'energyscanid'),
                           'mca' => array('project_has_xfefspectrum', 'xfefluorescencespectrumid'),
                           'dc' => array('project_has_dcgroup', 'datacollectiongroupid'),
                           );
        
        
        # List of projects
        function _projects() {
            $args = array($this->user->personid, $this->user->personid);
            $where = "WHERE (p.personid LIKE :1 OR php.personid LIKE :2)";
            
            $tot = $this->db->pq("SELECT count(distinct p.projectid) as tot 
                FROM project p 
                LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid $where", $args);
            $tot = intval($tot[0]['TOT']);
            
            if ($this->has_arg('pid')) {
                $where .= ' AND p.projectid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
            }
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $rows = $this->db->paginate("SELECT p.title, p.projectid, p.acronym, p.personid, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as person 
                FROM project p 
                INNER JOIN person pe ON p.personid = pe.personid
                LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid $where 
                ORDER BY p.projectid", $args);
            
            foreach ($rows as &$ro) {
                $ro['IS_OWNER'] = $ro['PERSONID'] == $this->user->personid;
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
            
            $this->db->pq("INSERT INTO project (projectid,title,acronym,personid) 
                VALUES (s_project.nextval, :1, :2, :3) RETURNING projectid INTO :id", 
                array($this->arg('TITLE'), $this->arg('ACRONYM'), $this->user->personid));

            $this->_output(array('PROJECTID' => $this->db->id(), 
                'IS_OWNER' => True, 
                'PERSON' => $this->user->givenname.' '.$this->user->familyname
            ));
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
            
            $proj = $this->db->pq("SELECT p.projectid FROM project p WHERE p.personid LIKE :1 AND p.projectid=:2", array($this->user->personid,$this->arg('pid')));
            if (!sizeof($proj)) $this->_error('No such project');
            
            $fields = array('ACRONYM', 'TITLE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE project SET $f=:1 WHERE projectid=:2", array($this->arg($f), $this->arg('pid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }


        # Add a user to a project
        function _add_user() {
            if (!$this->has_arg('PROJECTID')) $this->_error('No project id specified');
            if (!$this->has_arg('PERSONID')) $this->_error('No user specified');
            
            $proj = $this->db->pq("SELECT p.projectid FROM project p WHERE p.personid LIKE :1 AND p.projectid=:2", array($this->user->personid,$this->arg('PROJECTID')));
            
            if (!sizeof($proj)) $this->_error('No such project');
            $proj = $proj[0];
            
            $person = $this->db->pq("SELECT CONCAT(CONCAT(givenname, ' '), familyname) as fullname FROM person WHERE personid=:1", array($this->arg('PERSONID')));
            if (!sizeof($person)) $this->_error('No such person');
            $person = $person[0];

            $this->db->pq("INSERT INTO project_has_person (projectid, personid) VALUES (:1, :2)", array($this->arg('PROJECTID'), $this->arg('PERSONID')));            

            $this->_output(array('FULLNAME' => $person['FULLNAME']));
        }
        
        
        # Remove a user
        function _del_user() {
            if (!$this->has_arg('PPID')) $this->_error('No project id specified');
            list($pid, $pjid) = explode('-', $this->arg('PPID'));
            
            $proj = $this->db->pq("SELECT p.projectid 
                FROM project p 
                INNER JOIN project_has_person php ON php.projectid = p.projectid
                WHERE p.personid LIKE :1 AND php.personid=:2 AND p.projectid=:3", array($this->user->personid, $pid, $pjid));
            if (!sizeof($proj)) $this->_error('No such project');
            $proj = $proj[0];
            
            $this->db->pq("DELETE FROM project_has_person WHERE personid=:1 AND projectid=:2", array($pid, $pjid));
            
            $this->_output(1);
        }



        function _migrate() {
            $projects = $this->db->pq("SELECT owner,projectid FROM project");
            foreach($projects as $p) {
                $person = $this->db->pq("SELECT personid FROM person WHERE login=:1", array($p['OWNER']));
                if (sizeof($person)) {
                    $person = $person[0];
                    $this->db->pq("UPDATE project SET personid=:1 WHERE projectid=:2", array($person['PERSONID'], $p['PROJECTID']));
                    print_r(array('Migrated Project', $p['PROJECTID'], 'owner', $p['OWNER'], 'to person', $person['PERSONID']));
                }
            }

            $pu = $this->db->pq("SELECT projectid, username FROM project_has_user");
            foreach ($pu as $u) {
                $person = $this->db->pq("SELECT personid FROM person WHERE login=:1", array($u['USERNAME']));
                if (sizeof($person)) {
                    $person = $person[0];
                    $this->db->pq('INSERT INTO project_has_person (projectid, personid) VALUES (:1, :2)', array($u['PROJECTID'], $person['PERSONID']));
                    print_r(array('Migrated Project_has_user', $u['PROJECTID'], 'username', $u['USERNAME'], 'to person', $person['PERSONID']));
                }
            }
        }
}
