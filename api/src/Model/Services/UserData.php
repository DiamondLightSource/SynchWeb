<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

use SynchWeb\Database\DatabaseParent;
use SynchWeb\Database\DatabaseQueryBuilder;

class UserData
{
    /**
     * @var DatabaseParent db the database used to store and retrieve data
     */
    private $db;

    function __construct(DatabaseParent $db)
    {
        $this->db = $db;
    }

    function getGroups($gid = null)
    {
        $where = '';
        $args = array();

        if ($gid)
        {
            $where = 'WHERE g.usergroupid=:1';
            array_push($args, $gid);
        }

        return $this->db->pq("SELECT g.usergroupid, g.name, count(uhp.personid) as users 
            FROM usergroup g 
            LEFT OUTER JOIN usergroup_has_person uhp ON uhp.usergroupid = g.usergroupid
            $where
            GROUP BY g.usergroupid, g.name
            ORDER BY g.name", $args);
    }


    function addGroup($groupName)
    {
        $this->db->pq('INSERT INTO usergroup (name) VALUES (:1) RETURNING usergroupid INTO :id', array($groupName));
        return $this->db->id();
    }


    function updateGroup($gid, $groupName)
    {
        $this->db->pq('UPDATE usergroup SET name=:1 WHERE usergroupid=:2', array($groupName, $gid));
    }

    function addGroupPermission($gid, $pid)
    {
        $this->db->pq("INSERT INTO usergroup_has_permission (usergroupid, permissionid) VALUES (:1,:2)", array($gid, $pid));
        return $this->db->id();
    }


    function removeGroupPermission($userGroupId, $permisionId)
    {
        $this->db->pq("DELETE FROM usergroup_has_permission WHERE usergroupid=:1 and permissionid=:2", array($userGroupId, $permisionId));
    }

    private function addPersonOrProposalSearch($pid, $personId, &$args): string
    {
        $whereClause = ' AND (prhp.proposalid=:' . (sizeof($args) + 1) . ' OR lc.proposalid=:' . (sizeof($args) + 2) . ' OR p.personid=:' . (sizeof($args) + 3) . ')';
        array_push($args, $pid);
        array_push($args, $pid);
        array_push($args, $personId);
        return $whereClause;
    }

    function getUsers($getCount, $isStaffMember, $stringMatch, $page, $sortBy = null, $pid = null, $personId = null, $isManager = false, $currentUserId = null, $gid = null, $sid = null, $pjid = null, $visitName = null, $perPage = 15, $isAscending = true, $isAll=false, $onlyLogins=false)
    {
        $args = array();

        // Set initial where clause restrict it to just users within logins unless it is for a all or a person id and only logins not set 
        if (!$onlyLogins and ($personId || $isAll))
            $where = '1=1'; 
        else
            $where = 'p.login IS NOT NULL';
        $join = '';
        $extc = '';
        $group = 'GROUP BY p.personid';

        if (($personId && !$isManager) || $pid || (!$isStaffMember && !$visitName))
        {
            $where .= $this->addPersonOrProposalSearch($pid, $currentUserId, $args);
        }

        if ($personId)
        {            
            $where .= ' AND p.personid=:' . (sizeof($args) + 1);
            array_push($args, $personId);
        }

        if ($stringMatch)
        {
            $st = sizeof($args) + 1;
            $where .= " AND (lower(p.familyname) LIKE lower(CONCAT(CONCAT('%',:" . $st .
                "),'%')) OR lower(p.givenname) LIKE lower(CONCAT(CONCAT('%',:" .
                ($st + 1) . "),'%')) OR lower(p.login) LIKE lower(CONCAT(CONCAT('%',:" . ($st + 2) . "),'%')))";
            for ($i = 0; $i < 3; $i++)
            {
                array_push($args, $stringMatch);
            }
        }

        // TODO: the following statements were not previously coded as mutually exclusive, however logically they must be as no attempt was made to extend the JOIN statement
        // - it may be worth reviewing this, however.
        if ($gid)
        {
            $join = 'INNER JOIN usergroup_has_person uhp ON uhp.personid = p.personid';
            $where .= ' AND uhp.usergroupid=:' . (sizeof($args) + 1);
            array_push($args, $gid);
        }
        else if ($sid)
        {
            // TODO: this is an invalid DB table - does this need to be removed entirely?
            $join = 'INNER JOIN blsession_has_person shp ON shp.personid = p.personid';
            $where .= ' AND shp.sessionid=:' . (sizeof($args) + 1);
            array_push($args, $sid);
        }
        else if ($visitName)
        {
            $extc = "count(ses.sessionid) as visits, TO_CHAR(max(ses.startdate), 'DD-MM-YYYY') as last, shp.remote, shp.role,";
            $join = 'INNER JOIN session_has_person shp ON shp.personid = p.personid
                     INNER JOIN blsession s ON shp.sessionid = s.sessionid
                     INNER JOIN proposal pr ON pr.proposalid = s.proposalid
                     LEFT OUTER JOIN session_has_person shp2 ON p.personid = shp2.personid
                     LEFT OUTER JOIN blsession ses ON ses.sessionid = shp2.sessionid AND ses.startdate < s.startdate';
            $where .= " AND shp.remote IS NOT NULL AND CONCAT(CONCAT(CONCAT(pr.proposalcode,pr.proposalnumber), '-'), s.visit_number) LIKE :" . (sizeof($args) + 1);
            $group = 'GROUP BY p.personid, p.givenname, p.familyname, p.login';
            array_push($args, $visitName);
        }
        else if ($pjid)
        {
            $join = 'INNER JOIN project_has_person php ON p.personid = php.personid';
            $where .= ' AND php.projectid=:' . (sizeof($args) + 1);
            $extc = "CONCAT(CONCAT(p.personid, '-'), php.projectid) as ppid,";
            array_push($args, $pjid);
        }

        if ($getCount)
        {
            $tot = $this->db->pq("SELECT count(distinct p.personid) as tot
                FROM person p
                LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
                LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
                $join
                WHERE $where", $args);

            return sizeof($tot) ? intval($tot[0]['TOT']) : 0;
        }

        $start = 0;
        $pp = $perPage;
        $end = $pp;

        if ($page)
        {
            $pg = $page - 1;
            $start = $pg * $pp;
            $end = $pg * $pp + $pp;
        }

        $st = sizeof($args) + 1;
        array_push($args, $start);
        array_push($args, $end);

        $order = 'p.familyname,p.givenname';
        if ($sortBy)
        {
            $cols = array('LOGIN' => 'p.login', 'GIVENNAME' => 'p.givenname', 'FAMILYNAME' => 'p.familyname');
            if (array_key_exists($sortBy, $cols))
            {
                $dir = $isAscending ? 'ASC' : 'DESC';
                $order = $cols[$sortBy] . ' ' . $dir;
            }
        }

        $rows = $this->db->paginate("SELECT $extc p.personid, p.givenname, p.familyname, CONCAT(CONCAT(p.givenname, ' '), p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, '' as postcode, l.country
                               FROM person p
                               LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
                               LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
                               LEFT OUTER JOIN laboratory l ON l.laboratoryid = p.laboratoryid
                               $join
                               WHERE $where
                               $group
                               ORDER BY $order", $args);

        foreach ($rows as &$r)
        {
            if ($r['PERSONID'] == $personId)
                $r['FULLNAME'] .= ' [You]';
        }

        return $rows;
    }

    function checkLogin($loginId)
    {
        return $this->db->pq("SELECT login FROM person WHERE login=:1", array($loginId));
    }


    function addUser($loginId, $givenName, $familyName, $emailAddress = null)
    {
        $this->db->pq("INSERT INTO person (login, givenname, familyname, emailaddress) VALUES (:1, :2, :3, :4)",
                array($loginId, $givenName, $familyName, $emailAddress));
        return $this->db->id();
    }

    function getUser($userId, $proposalId, $personId)
    {
        return $this->db->pq("SELECT p.personid, p.laboratoryid
            FROM person p
            LEFT OUTER JOIN proposalhasperson php ON php.personid = p.personid
            LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
            WHERE (p.personid=:1 OR php.proposalid=:2 OR lc.proposalid=:3) AND p.personid=:4", array($userId, $proposalId, $proposalId, $personId));
    }

    function updateUser($personId, $familyName, $givenName, $phoneNumber, $email)
    {
        (new DatabaseQueryBuilder($this->db))
            ->patch("FAMILYNAME", $familyName)
            ->patch("GIVENNAME", $givenName)
            ->patch("PHONENUMBER", $phoneNumber)
            ->patch("EMAILADDRESS", $email)
            ->whereIdEquals("personid", $personId)
            ->update("person");
    }

    function getLaboratory($laboratoryId)
    {
        return $this->db->pq("SELECT l.name, l.address, l.city, l.postcode, l.country
            FROM laboratory l
            WHERE l.laboratoryid=:1", array($laboratoryId));
    }

    function updateLaboratory($personId, $labName, $labAddress, $city, $postcode, $country, $laboratoryId = null)
    {
        if ($laboratoryId)
        {
            (new DatabaseQueryBuilder($this->db))
                ->patch("name", $labName)
                ->patch("address", $labAddress)
                ->patch("city", $city)
                ->patch("postcode", $postcode)
                ->patch("country", $country)
                ->whereIdEquals("laboratoryid", $laboratoryId)
                ->update("laboratory");
        }
        else
        {
            # TODO: the logic here appears dubious - may result in duplicate entries for labs, rather than reusing these?  Perhaps this is ok, though...
            $this->db->pq("INSERT INTO laboratory ('NAME', 'ADDRESS', 'CITY', 'POSTCODE', 'COUNTRY') VALUES (:1, :2, :3, :4, :5)", array($labName, $labAddress, $city, $postcode, $country));

            $laboratoryId = $this->db->id();
            $this->db->pq("UPDATE person SET laboratoryid=:1 WHERE personid=:2", array($laboratoryId, $personId));
        }
    }

    function addGroupUser($personId, $gid)
    {
        $this->db->pq("INSERT INTO usergroup_has_person (usergroupid, personid) VALUES (:1,:2)", array($gid, $personId));
        return $this->db->id();
    }


    function removeGroupUser($personId, $gid)
    {
        $this->db->pq("DELETE FROM usergroup_has_person WHERE usergroupid=:1 and personid=:2", array($gid, $personId));
    }

    function getPermissions($getCount = false, $s = null, $gid = null, $pid = null, $perPage = 15, $startPage = 0)
    {
        $args = array();
        $where = '';
        $join = '';

        if ($gid)
        {
            $join = 'INNER JOIN usergroup_has_permission uhp ON uhp.permissionid = p.permissionid';
            $where = ' AND uhp.usergroupid=:' . (sizeof($args) + 1);
            array_push($args, $gid);
        }

        if ($pid)
        {
            $where .= ' AND p.permissionid=:' . (sizeof($args) + 1);
            array_push($args, $pid);
        }

        if ($s)
        {
            $st = sizeof($args) + 1;
            $where .= " AND (lower(p.type) LIKE lower(CONCAT(CONCAT('%',:" . $st . "),'%')))";
            array_push($args, $s);
        }

        if ($getCount)
        {
            $tot = $this->db->pq("SELECT count(p.permissionid) as tot
                FROM permission p
                $join
                WHERE 1=1 $where", $args);
            if (!sizeof($tot))
            {
                return 0;
            }
            return intval($tot[0]['TOT']);
        }

        $start = 0;
        $pp = $perPage;
        $end = $pp;

        if ($startPage)
        {
            $pg = $startPage - 1;
            $start = $pg * $pp;
            $end = $start + $pp;
        }
        array_push($args, $start);
        array_push($args, $end);

        return $this->db->paginate("SELECT p.permissionid, p.type, p.description
                                    FROM permission p
                                    $join
                                    WHERE 1=1 $where
                                    ORDER BY p.type", $args);
    }

    function addPermission($type, $description)
    {
        $this->db->pq('INSERT INTO permission (type,description) VALUES (:1,:2) RETURNING permissionid INTO :id', array($type, $description));
        return $this->db->id();
    }

    function updatePermission($pid, $type, $description = '')
    {
        $this->db->pq('UPDATE permission SET type=:1, description=:2 WHERE permissionid=:3', array($type, $description, $pid));
    }
}