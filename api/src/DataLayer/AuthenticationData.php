<?php declare(strict_types=1);

namespace SynchWeb\DataLayer;

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
}