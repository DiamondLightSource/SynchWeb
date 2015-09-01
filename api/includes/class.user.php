<?php 


class User {
	

	function __construct($login, $db) {
		$this->db = $db;
		$this->login = $login;

		$result = $this->db->pq("SELECT personid, givenname, familyname FROM person p WHERE login=:1", array($login));

		if (sizeof($result)) {
			foreach(array('personid', 'givenname', 'familyname') as $f) {
				$this->$f = $result[0][strtoupper($f)];
			}

			$perms = $this->db->pq("SELECT p.type, g.name as usergroup 
				FROM permission p
				INNER JOIN usergroup_has_permission uhp ON uhp.permissionid = p.permissionid
				INNER JOIN usergroup g ON g.usergroupid = uhp.usergroupid
				INNER JOIN usergroup_has_person uhpe ON uhpe.usergroupid = g.usergroupid
				WHERE uhpe.personid=:1", array($this->personid));

			$this->perms = array();
			$this->groups = array();
			foreach ($perms as $p) {
				array_push($this->perms, $p['TYPE']);
				if (!in_array($p['USERGROUP'], $this->groups)) array_push($this->groups, $p['USERGROUP']);
			}
		}

	}


	function can($permission) {
		return in_array($permission, $this->perms);
	}

	function has_group($group) {
		return in_array($group, $this->groups);
	}


	# TODO
	# Should replace $this->user with $this->user->login
	function __toString() {
		return $this->login;
	}

	# For JSONing a user
	function __toArray() {
		return array('login' => $this->login, 'personid' => $this->personid, 'permissions' => $this->perms);
	}


}