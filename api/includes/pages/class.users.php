<?php

class Users extends Page {
    

    public static $arg_list = array('gid' => '\d+',
                                    'pid' => '\d+',
                                    'pjid' => '\d+',
                                    'peid' => '\d+',
                                    'uid' => '\d+',
                                    'sid' => '\d+',
                                    'visit' => '\w+\d+-\d+',
                                    'location' => '(\w|-|\/)+',
                                    'all' => '\d',
                                    'login' => '\d',

                                    'NAME' => '\w+',

                                    'TYPE' => '\w+',
                                    'DESCRIPTION' => '(\w|\s)+',


                                    'PERSONID' => '\d+',
                                    'FAMILYNAME' => '([\w-])+',
                                    'GIVENNAME' => '([\w-])+',
                                    'PHONENUMBER' => '.*',
                                    'EMAILADDRESS' => '.*',
                                    'LABNAME' => '([\w\s-])+',
                                    'ADDRESS' => '([\w\s-\n])+',
                              );
        

    public static $dispatch = array(array('(/:PERSONID)', 'get', '_get_users'),
                                    array('/:PERSONID', 'patch', '_update_user'),

                                    array('/current', 'get', '_get_current_user'),

                                    array('/login', 'get', '_login'),
                                    array('/log(/)', 'post', '_log_action'),
                                    array('/time', 'get', '_get_time'),

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


    # ------------------------------------------------------------------------
    # Helpers for backbone application
    function _get_current_user() {
            $this->_output(array('personid' => $this->user->personid, 'user' => $this->user->login, 'givenname' => $this->user->givenname,
                'permissions' => $this->user->perms, 
                'is_staff' => $this->staff, 
                'visits' => $this->visits, 
                'ty' => $this->ptype->ty));
    }

    function _login() {
    }
    
    function _log_action() {
        if (!$this->has_arg('location')) $this->_error('No location specified');
        $this->log_action(1, $this->arg('location'));
        print $this->arg('location');
    }


    # ------------------------------------------------------------------------
    # Get current time
    function _get_time() {
        $d = new DateTime("now");
        $this->_output(array('TIME' => $d->format('D M d Y H:i:s (\G\M\TO)')));
    }



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
        // $this->user->can('manage_groups');

        $args = array();
        $where = 'p.login IS NOT NULL';
        $join = '';
        $extc = '';
        $group = '';

        if ($this->has_arg('all')) {
            $where = '1=1';
        }

        if ($this->has_arg('pid')) {
            $where .= ' AND (prhp.proposalid=:'.(sizeof($args)+1).' OR lc.proposalid=:'.(sizeof($args)+2).' OR p.personid=:'.(sizeof($args)+3).')';
            array_push($args, $this->proposalid);
            array_push($args, $this->proposalid);
            array_push($args, $this->user->personid);
        }

        if ($this->has_arg('PERSONID')) {
            $where = '1=1';

            $where .= ' AND p.personid=:'.(sizeof($args)+1);
            array_push($args, $this->arg('PERSONID'));

            $where .= ' AND (prhp.proposalid=:'.(sizeof($args)+1).' OR lc.proposalid=:'.(sizeof($args)+2).' OR p.personid=:'.(sizeof($args)+3).')';
            array_push($args, $this->proposalid);
            array_push($args, $this->proposalid);
            array_push($args, $this->user->personid);
        }

        if (!$this->staff && !$this->has_arg('visit') && !$this->has_arg('pid')) {
            $where .= ' AND (prhp.proposalid=:'.(sizeof($args)+1).' OR lc.proposalid=:'.(sizeof($args)+2).')';
            array_push($args, $this->proposalid);
            array_push($args, $this->proposalid);
        }

        if ($this->has_arg('gid')) {
            $join = 'INNER JOIN usergroup_has_person uhp ON uhp.personid = p.personid';
            $where .= ' AND uhp.usergroupid=:'.(sizeof($args)+1);
            array_push($args, $this->arg('gid'));
        }

        if ($this->has_arg('login')) {
            $where .= ' AND p.login IS NOT NULL';
        }

        if ($this->has_arg('s')) {
            $st = sizeof($args) + 1;
            $where .= " AND (lower(p.familyname) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(p.givenname) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."),'%')) OR lower(p.login) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."),'%')))";
            for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
        }

        if ($this->has_arg('sid')) {
            $join = 'INNER JOIN blsession_has_person shp ON shp.personid = p.personid';
            $where .= ' AND shp.sessionid=:'+(sizeof($args)+1);
            array_push($args, $this->arg('sid'));
        }

        if ($this->has_arg('visit')) {
            $extc = "count(ses.sessionid) as visits, TO_CHAR(max(ses.startdate), 'DD-MM-YYYY') as last, shp.remote,";
            $join = 'INNER JOIN session_has_person shp ON shp.personid = p.personid
                     INNER JOIN blsession s ON shp.sessionid = s.sessionid
                     INNER JOIN proposal pr ON pr.proposalid = s.proposalid

                     LEFT OUTER JOIN session_has_person shp2 ON p.personid = shp2.personid
                     LEFT OUTER JOIN blsession ses ON ses.sessionid = shp2.sessionid AND ses.startdate < s.startdate';
            $where .= " AND shp.remote IS NOT NULL AND CONCAT(CONCAT(CONCAT(pr.proposalcode,pr.proposalnumber), '-'), s.visit_number) LIKE :".(sizeof($args)+1);
            $group = 'GROUP BY p.personid, p.givenname, p.familyname, p.login';
            array_push($args, $this->arg('visit'));
        }

        if ($this->has_arg('pjid')) {
            $join = ' INNER JOIN project_has_person php ON p.personid = php.personid';
            $where .= ' AND php.projectid=:'.(sizeof($args)+1);
            $extc = "CONCAT(CONCAT(p.personid, '-'), php.projectid) as ppid,";
            array_push($args, $this->arg('pjid'));
        }


        $tot = $this->db->pq("SELECT count(distinct p.personid) as tot
            FROM person p
            LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
            LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
            $join
            WHERE $where", $args);
        $tot = intval($tot[0]['TOT']);
        
        
        $start = 0;
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $end = $pp;
        
        if ($this->has_arg('page')) {
            $pg = $this->arg('page') - 1;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
        }
        
        $st = sizeof($args)+1;
        array_push($args, $start);
        array_push($args, $end);
        

        $order = 'p.familyname,p.givenname';
        if ($this->has_arg('sort_by')) {
            $cols = array('LOGIN' => 'p.login', 'GIVENNAME' => 'p.givenname', 'FAMILYNAME' => 'p.familyname');
            $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
            if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
        }
        
        $rows = $this->db->paginate("SELECT $extc p.personid, p.givenname, p.familyname, CONCAT(CONCAT(p.givenname, ' '), p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address
                               FROM person p
                               LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
                               LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
                               LEFT OUTER JOIN laboratory l ON l.laboratoryid = p.laboratoryid
                               $join
                               WHERE $where
                               $group
                               ORDER BY $order", $args);

        foreach ($rows as &$r) {
            if ($r['PERSONID'] == $this->user->personid) $r['FULLNAME'] .= ' [You]';
        }

        if ($this->has_arg('PERSONID')) {
            if (sizeof($rows)) $this->_output($rows[0]);
            else $this->_error('No such user');

        } else $this->_output(array('total' => $tot,
                             'data' => $rows,
                            ));   

    }



    function _update_user() {
        if (!$this->has_arg('PERSONID')) $this->_error('No person specified');

        // $this->db->set_debug(True);
        $person = $this->db->pq("SELECT p.personid, p.laboratoryid
            FROM person p
            LEFT OUTER JOIN proposalhasperson php ON php.personid = p.personid
            LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
            WHERE (p.personid=:1 OR php.proposalid=:2 OR lc.proposalid=:3) AND p.personid=:4", array($this->user->personid, $this->proposalid, $this->proposalid, $this->arg('PERSONID')));

        if (!sizeof($person)) $this->_error('No such person');
        $person = $person[0];

        # Update person
        $pfields = array('FAMILYNAME', 'GIVENNAME', 'PHONENUMBER', 'EMAILADDRESS');
        foreach ($pfields as $i => $f) {
            if ($this->has_arg($f)) {
                $this->db->pq('UPDATE person SET '.$f.'=:1 WHERE personid=:2', array($this->arg($f), $person['PERSONID']));
                $this->_output(array($f => $this->arg($f)));
            }
        }

        # Update laboratory
        $lfields = array('LABNAME', 'ADDRESS');
        foreach ($lfields as $i => $f) {
            if ($this->has_arg($f)) {
                $c = $f == 'LABNAME' ? 'NAME' : $f;

                if (!$person['LABORATORYID']) {
                    $this->db->pq("INSERT INTO laboratory ($c) VALUES (:1)", array($this->arg($f)));
                    $person['LABORATORYID'] = $this->db->id();
                    $this->db->pq("UPDATE person SET laboratoryid=:1 WHERE personid=:2", array($person['LABORATORYID'], $this->arg('PERSONID')));

                } else $this->db->pq('UPDATE laboratory SET '.$c.'=:1 WHERE laboratoryid=:2', array($this->arg($f), $person['LABORATORYID']));
                $this->_output(array($f => $this->arg($f)));
            }
        }
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
            $where .= " AND (lower(p.type) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')))";
            array_push($args, $this->arg('s'));
        }

        $tot = $this->db->pq("SELECT count(p.permissionid) as tot
            FROM permission p
            $join
            WHERE 1=1 $where", $args);
        $tot = intval($tot[0]['TOT']);
        
        
        $start = 0;
        $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $end = $pp;
        
        if ($this->has_arg('page')) {
            $pg = $this->arg('page') - 1;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
        }
        
        $st = sizeof($args)+1;
        array_push($args, $start);
        array_push($args, $end);
        
        
        $rows = $this->db->paginate("SELECT p.permissionid, p.type, p.description
                               FROM permission p
                               $join
                               WHERE 1=1 $where
                               ORDER BY p.type", $args);


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
