<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use SynchWeb\Model\User;

class AuthenticationData
{
    private $db;

    function __construct($db)
    {
        $this->db = $db;
    }

    function isUserLoggedIn($userId): bool
    {
        $userc = $this->db->pq("SELECT personid FROM person WHERE login=:1", array($userId));

        return sizeof($userc) > 0;
    }


    function getOneTimeUseToken($tokenId)
    {
        return $this->db->pq("SELECT o.validity, pe.personid, pe.login, CONCAT(p.proposalcode, p.proposalnumber) as prop 
		    		FROM SW_onceToken o
		    		INNER JOIN proposal p ON p.proposalid = o.proposalid
		    		INNER JOIN person pe ON pe.personid = o.personid
		    		WHERE token=:1", array($tokenId));
    }

    function deleteOneTimeUseToken($tokenId)
    {
        $this->db->pq("DELETE FROM SW_onceToken WHERE token=:1", array($tokenId));
    }

    function deleteOldOneTimeUseTokens()
    {
        # Remove tokens more than 10 seconds old, they should have been used
        $this->db->pq("DELETE FROM SW_onceToken WHERE TIMESTAMPDIFF('SECOND', recordTimeStamp, CURRENT_TIMESTAMP) > 10");
    }


    function getUser($loginId): User
    {
        $user = null;
        $result = $this->db->pq("SELECT cache, personid, givenname, familyname FROM person p WHERE login=:1", array($loginId));

        if (sizeof($result)) {
            $personId = intval($result[0]['PERSONID']);

            $perms = array();
            $groups = array();
            $permsAndGroups = $this->db->pq("SELECT p.type, g.name as usergroup 
				FROM permission p
				INNER JOIN usergroup_has_permission uhp ON uhp.permissionid = p.permissionid
				INNER JOIN usergroup g ON g.usergroupid = uhp.usergroupid
				INNER JOIN usergroup_has_person uhpe ON uhpe.usergroupid = g.usergroupid
				WHERE uhpe.personid=:1", array($personId));

            foreach ($permsAndGroups as $p) {
                array_push($perms, $p['TYPE']);
                if (!in_array($p['USERGROUP'], $groups)) {
                    array_push($groups, $p['USERGROUP']);
                }
            }

            $cache = array();
            if ($result[0]['CACHE']) {
                array_push($cache, json_decode($this->db->read($result[0]['CACHE']), True));
            }

            $user = new User($loginId, $personId, $result[0]['GIVENNAME'], $result[0]['FAMILYNAME'], $perms, $groups, $cache);
        }
        return $user;
    }

    function updateActivityTimestamp($loginId)
    {
        $chk = $this->db->pq("SELECT TIMESTAMPDIFF('SECOND', datetime, CURRENT_TIMESTAMP) AS lastupdate, comments FROM adminactivity WHERE username LIKE :1", array($loginId));
        if (sizeof($chk)) {
            if ($chk[0]['LASTUPDATE'] > 20)
                $this->db->pq("UPDATE adminactivity SET datetime=CURRENT_TIMESTAMP WHERE username=:1", array($loginId));
        }
    }
}