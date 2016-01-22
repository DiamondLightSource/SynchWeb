<?php 


class User {
	

	function __construct($login, $db, $app) {
		$this->db = $db;
		$this->login = $login;
		$this->app = $app;
		$this->perms = array();
		$this->groups = array();

		$result = $this->db->pq("SELECT cache, personid, givenname, familyname FROM person p WHERE login=:1", array($login));

		if (sizeof($result)) {
			foreach(array('personid', 'givenname', 'familyname') as $f) {
				$this->$f = $result[0][strtoupper($f)];
			}

			$this->_cache = $result[0]['CACHE'] ? unserialize($result[0]['CACHE']) : array();
			$this->personid = intval($this->personid);

			$perms = $this->db->pq("SELECT p.type, g.name as usergroup 
				FROM permission p
				INNER JOIN usergroup_has_permission uhp ON uhp.permissionid = p.permissionid
				INNER JOIN usergroup g ON g.usergroupid = uhp.usergroupid
				INNER JOIN usergroup_has_person uhpe ON uhpe.usergroupid = g.usergroupid
				WHERE uhpe.personid=:1", array($this->personid));

			foreach ($perms as $p) {
				array_push($this->perms, $p['TYPE']);
				if (!in_array($p['USERGROUP'], $this->groups)) array_push($this->groups, $p['USERGROUP']);
			}
		}

	}


	// Check what user can do
	function has($permission) {
		return in_array($permission, $this->perms);
	}


	function can($permission) {
		if(in_array($permission, $this->perms)) return true;
		else $this->app->halt(403, json_encode(array('status' => 403, 'message' => 'Access Denied', 'title' => 'You do not have the permission: '.$permission)));
	}

	function has_group($group) {
		return in_array($group, $this->groups);
	}



	// User cache - for saving partially filled forms, etc
	function cache($key) {
		return array_key_exists($key, $this->_cache) ? $this->_cache[$key] : null;
	}


	function set_cache($key, $data) {
		$allowed_caches = array('shipment', 'container');

		if (in_array($key, $allowed_caches)) {
			$this->_cache[$key] = $data;
			$this->db->pq("UPDATE person SET cache=:1 WHERE personid=:2", array(serialize($this->_cache), $this->personid));

			return true;
		}

		return false;
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