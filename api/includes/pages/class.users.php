<?php

class Users extends Page {
    

    public static $arg_list = array('gid' => '\d+',
                                    'pid' => '\d+',
                                    'peid' => '\d+',
                                    'uid' => '\d+',
                                    'sid' => '\d+',
                                    'visit' => '\w+\d+-\d+',

                                    'NAME' => '\w+',

                                    'TYPE' => '\w+',
                                    'DESCRIPTION' => '(\w|\s)+',
                              );
        

    public static $dispatch = array(array('(/:gid)', 'get', '_get_users'),

                                    array('/groups(/:gid)', 'get', '_get_groups'),
                                    array('/groups', 'post', '_add_group'),
                                    array('/groups/:gid', 'put', '_update_group'),

                                    array('/groups/:gid/permission/:pid', 'post', '_add_group_permission'),
                                    array('/groups/:gid/permission/:pid', 'delete', '_remove_group_permission'),

                                    array('/groups/:gid/users/:peid', 'post', '_add_group_user'),
                                    array('/groups/:gid/users/:peid', 'delete', '_remove_group_user'),

                                    array('/permissions(/:pid)(/group/:gid)', 'get', '_get_permissions'),
                                    array('/permissions', 'post', '_add_permission'),
                                    array('/permissions/:pid', 'put', '_update_permission'),
                              );


    function _get_groups() {
        $this->user->can('manage_groups');

        $where = '';
        $args = array();

        if ($this->has_arg('gid')) {
            $where = 'WHERE g.usergroupid=:1';
            array_push($args, $this->arg('gid'));
        }

        $groups = $this->db->pq("SELECT g.usergroupid, g.name, count(uhp.personid) as users 
            FROM usergroup g 
            LEFT OUTER JOIN usergroup_has_person uhp ON uhp.usergroupid = g.usergroupid
            $where
            GROUP BY g.usergroupid, g.name
            ORDER BY g.name", $args);
        if ($this->has_arg('gid')) {
            if (sizeof($groups)) $this->_output($groups[0]);
            else $this->_error('No such group');
        } else $this->_output($groups);
    }


    function _add_group() {
        $this->user->can('manage_groups');

        if (!$this->has_arg('NAME')) $this->_error('No group name');
            
        $this->db->pq('INSERT INTO usergroup (usergroupid,name) VALUES (s_usergroup.nextval,:1) RETURNING usergroupid INTO :id',array($this->arg('NAME')));
        $this->_output(array('USERGROUPID' => $this->db->id()));
    }


    function _update_group() {
        $this->user->can('manage_groups');
        $group = $this->db->pq("SELECT usergroupid FROM usergroup WHERE usergroupid = :1", array($this->arg('gid')));
            
        if (!sizeof($group)) $this->_error('No such group');
        $this->db->pq('UPDATE usergroup SET name=:1 WHERE usergroupid=:2', array($this->arg('NAME'), $this->arg('gid')));
        $this->_output(array('NAME' => $this->arg('NAME')));
    }




    function _add_group_permission() {
        $this->user->can('manage_groups');

        $group = $this->db->pq("SELECT usergroupid FROM usergroup WHERE usergroupid=:1", array($this->arg('gid')));
        if (!sizeof($group)) $this->_error('No such group');
        $perm = $this->db->pq("SELECT permissionid FROM permission WHERE permissionid=:1", array($this->arg('pid')));
        if (!sizeof($perm)) $this->_error('No such permission');

        $chk = $this->db->pq("SELECT usergroupid FROM usergroup_has_permission WHERE usergroupid=:1 and permissionid=:2", array($this->arg('gid'), $this->arg('pid')));
        if (sizeof($chk)) $this->_error('That group already has the supplied permission');

        $this->db->pq("INSERT INTO usergroup_has_permission (usergroupid, permissionid) VALUES (:1,:2)", array($this->arg('gid'), $this->arg('pid')));
        $this->_output(array('USERGROUPID' => $this->arg('gid'), 'PERMISSIONID' => $this->arg('pid')));
    }


    function _remove_group_permission() {
        $this->user->can('manage_groups');

        $chk = $this->db->pq("SELECT usergroupid FROM usergroup_has_permission WHERE usergroupid=:1 and permissionid=:2", array($this->arg('gid'), $this->arg('pid')));
        if (!sizeof($chk)) $this->_error('That group does not have the supplied permission');

        $this->db->pq("DELETE FROM usergroup_has_permission WHERE usergroupid=:1 and permissionid=:2", array($this->arg('gid'), $this->arg('pid')));
        $this->_output(1);
    }



    function _get_users() {
        $this->user->can('manage_groups');

        $args = array();
        $where = '';
        $join = '';

        if ($this->has_arg('gid')) {
            $join = 'INNER JOIN usergroup_has_person uhp ON uhp.personid = p.personid';
            $where = 'AND uhp.usergroupid=:'.(sizeof($args)+1);
            array_push($args, $this->arg('gid'));
        }

        if ($this->has_arg('s')) {
            $st = sizeof($args) + 1;
            $where .= " AND (lower(p.familyname) LIKE lower('%'||:".$st."||'%') OR lower(p.givenname) LIKE lower('%'||:".($st+1)."||'%') OR lower(p.login) LIKE lower('%'||:".($st+2)."||'%'))";
            for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
        }

        if ($this->has_arg('sid')) {
            $join = 'INNER JOIN blsession_has_person shp ON shp.personid = p.personid';
            $where = 'AND shp.sessionid=:'+(sizeof($args)+1);
            array_push($args, $this->arg('sid'));
        }

        if ($this->has_arg('visit')) {
            $join = 'INNER JOIN session_has_person shp ON shp.personid = p.personid
                     INNER JOIN blsession s ON shp.sessionid = s.sessionid
                     INNER JOIN proposal pr ON pr.proposalid = s.proposalid';
            $where = "AND pr.proposalcode||pr.proposalnumber||'-'||s.visit_number LIKE :".(sizeof($args)+1);
            array_push($args, $this->arg('visit'));
        }        


        $tot = $this->db->pq("SELECT count(p.personid) as tot
            FROM person p
            $join
            WHERE 1=1 $where", $args);
        $tot = intval($tot[0]['TOT']);
        
        
        $start = 0;
        $end = 10;
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        
        if ($this->has_arg('page')) {
            $pg = $this->arg('page') - 1;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
        }
        
        $st = sizeof($args)+1;
        array_push($args, $start);
        array_push($args, $end);
        

        $order = 'p.familyname';
        if ($this->has_arg('sort_by')) {
            $cols = array('LOGIN' => 'p.login', 'GIVENNAME' => 'p.givenname', 'FAMILYNAME' => 'p.familyname');
            $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
            if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
        }
        
        $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                               SELECT p.personid, p.givenname, p.familyname, p.givenname || ' ' || p.familyname as fullname, p.login
                               FROM person p
                               $join
                               WHERE 1=1 $where
                               ORDER BY $order
                               ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);

        $this->_output(array('total' => $tot,
                             'data' => $rows,
                            ));   

    }



    function _add_group_user() {
        $this->user->can('manage_groups');

        $user = $this->db->pq("SELECT personid FROM person WHERE personid=:1", array($this->arg('peid')));
        if (!sizeof($user)) $this->_error('No such user');
        $group = $this->db->pq("SELECT usergroupid FROM usergroup WHERE usergroupid=:1", array($this->arg('gid')));
        if (!sizeof($group)) $this->_error('No such group');

        $chk = $this->db->pq("SELECT personid FROM usergroup_has_person WHERE usergroupid=:1 and personid=:2", array($this->arg('gid'), $this->arg('peid')));
        if (sizeof($chk)) $this->_error('That group already contains the supplied person');

        $this->db->pq("INSERT INTO usergroup_has_person (usergroupid, personid) VALUES (:1,:2)", array($this->arg('gid'), $this->arg('peid')));
        $this->_output(array('USERGROUPID' => $this->arg('gid'), 'PERSONID' => $this->arg('peid')));
    }


    function _remove_group_user() {
        $this->user->can('manage_groups');

        $chk = $this->db->pq("SELECT usergroupid FROM usergroup_has_person WHERE usergroupid=:1 and personid=:2", array($this->arg('gid'), $this->arg('peid')));
        if (!sizeof($chk)) $this->_error('That group does not have the supplied permission');

        $this->db->pq("DELETE FROM usergroup_has_person WHERE usergroupid=:1 and personid=:2", array($this->arg('gid'), $this->arg('peid')));
        $this->_output(1);
    }





    function _get_permissions() {
        $this->user->can('manage_perms');

        $args = array();
        $where = '';
        $join = '';

        if ($this->has_arg('gid')) {
            $join = 'INNER JOIN usergroup_has_permission uhp ON uhp.permissionid = p.permissionid';
            $where = 'AND uhp.usergroupid=:'.(sizeof($args)+1);;
            array_push($args, $this->arg('gid'));
        }

        if ($this->has_arg('pid')) {
            $where = 'AND p.permissionid=:'.(sizeof($args)+1);
            array_push($args, $this->arg('pid'));
        }

        if ($this->has_arg('s')) {
            $st = sizeof($args) + 1;
            $where .= " AND (lower(p.type) LIKE lower('%'||:".$st."||'%'))";
            array_push($args, $this->arg('s'));
        }

        $tot = $this->db->pq("SELECT count(p.permissionid) as tot
            FROM permission p
            $join
            WHERE 1=1 $where", $args);
        $tot = intval($tot[0]['TOT']);
        
        
        $start = 0;
        $end = 10;
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        
        if ($this->has_arg('page')) {
            $pg = $this->arg('page') - 1;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
        }
        
        $st = sizeof($args)+1;
        array_push($args, $start);
        array_push($args, $end);
        
        
        $rows = $this->db->pq("SELECT outer.* FROM (SELECT ROWNUM rn, inner.* FROM (
                               SELECT p.permissionid, p.type, p.description
                               FROM permission p
                               $join
                               WHERE 1=1 $where
                               ORDER BY p.type
                               ) inner) outer WHERE outer.rn > :$st AND outer.rn <= :".($st+1), $args);


        if ($this->has_arg('pid')) {
            if (sizeof($rows)) $this->_output($rows[0]);
            else $this->_error('No such permission');
        } else $this->_output(array('total' => $tot,
                                    'data' => $rows,
                                   ));   
    }


    function _add_permission() {
        $this->user->can('manage_perms');

        if (!$this->has_arg('TYPE')) $this->_error('No permission type');
        $desc = $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : '';
            
        $this->db->pq('INSERT INTO permission (permissionid,type,description) VALUES (s_permission.nextval,:1,:2) RETURNING permissionid INTO :id',array($this->arg('TYPE'), $desc));
        $this->_output(array('PERMISSIONID' => $this->db->id()));
    }


    function _update_permission() {
        $this->user->can('manage_perms');

        $perm = $this->db->pq("SELECT permissionid FROM permission WHERE permissionid = :1", array($this->arg('pid')));
        if (!sizeof($perm)) $this->_error('No such permission');
        
        $desc = $this->has_arg('DESCRIPTION') ? $this->arg('DESCRIPTION') : '';
        $this->db->pq('UPDATE permission SET type=:1, description=:2 WHERE permissionid=:3', array($this->arg('TYPE'), $desc, $this->arg('pid')));

        $this->_output(array('TYPE' => $this->arg('TYPE'), $desc));
    }


}
