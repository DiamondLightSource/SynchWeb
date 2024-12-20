<?php

declare(strict_types=1);

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


    function getUsers($getCount, $isStaffMember, $stringMatch, $page, $sortBy = null, $pid=null,  $proposalid = null, $personId = null, $isManager = false, $currentUserId = null, $gid = null, $pjid = null, $visitName = null, $perPage = 15, $isAscending = true, $isAll = false, $onlyLogins = false)
    {
        $args = array();

        // set up start and end
        $start = 0;
        $pp = $perPage;
        $end = $pp;

        if ($page)
        {
            $pg = $page - 1;
            $start = $pg * $pp;
            $end = $pg * $pp + $pp;
        }

        // Set initial where clause restrict it to just users within logins unless it is for a all or a person id and only logins not set 
        if (!$onlyLogins and ($personId || $isAll))
            $where = '1=1';
        else
            $where = 'p.login IS NOT NULL';

        if ($personId == "" && $stringMatch == "" && $gid == "" && $visitName == "" && $pjid == "")
        {
            //secured by making sure the user has access to proposalid
            return $this->getUsersForProposal($where, $getCount, $page, $sortBy, $proposalid, $currentUserId, $perPage, $isAscending, $start, $end);
        }

        $join = '';
        $extc = '';
        $group = 'GROUP BY p.personid';

        // This blocks means that non-staff can only see users on their proposal, except when they looking at a visit 
        //  (i.e. the proposal that was checking is added to the where clause)
        if ((($personId && !$isManager) // if you're not a manager: you're looking for a person
            || (!$isStaffMember && !$visitName)) // if you are not a staff member and not looking at a specific visit
            || $pid) // if you are looking for user based on a proposal, but this 
        {
            $where .= ' AND (prhp.proposalid=:' . (sizeof($args) + 1) . ' OR lc.proposalid=:' . (sizeof($args) + 2) . ' OR p.personid=:' . (sizeof($args) + 3) . ')';
            array_push($args, $proposalid, $proposalid, $personId);
            $join .= 'LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
                      LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid ';
        }

        if ($personId)
        {
            $where .= ' AND p.personid=:' . (sizeof($args) + 1);
            array_push($args, $personId);
        }

        if ($stringMatch)
        {
            $st = sizeof($args) + 1;
            $where .= " AND (p.familyname LIKE CONCAT('%',:" . $st . ",'%') OR p.givenname LIKE CONCAT('%',:" . ($st + 1) . ",'%') OR p.login LIKE CONCAT('%',:" . ($st + 2) . ",'%'))";
            for ($i = 0; $i < 3; $i++)
            {
                array_push($args, $stringMatch);
            }
        }

        if ($gid)
        {
            $join .= 'INNER JOIN usergroup_has_person uhp ON uhp.personid = p.personid';
            $where .= ' AND uhp.usergroupid=:' . (sizeof($args) + 1);
            array_push($args, $gid);
        }
        else if ($visitName)
        {
            $ses = $this->db->pq("SELECT sessionid FROM blsession s INNER JOIN proposal pr ON pr.proposalid = s.proposalid
                                  WHERE CONCAT(pr.proposalcode, pr.proposalnumber, '-', s.visit_number) LIKE :1",
                                  array($visitName)
                                );
            $sessionid = sizeof($ses) ? $ses[0]['SESSIONID'] : 0;
            $extc = "count(ses.sessionid) as visits, TO_CHAR(max(ses.startdate), 'DD-MM-YYYY') as last, shp.remote, shp.role,";
            $join .= 'INNER JOIN session_has_person shp ON shp.personid = p.personid
                     INNER JOIN blsession s ON shp.sessionid = s.sessionid
                     LEFT OUTER JOIN session_has_person shp2 ON p.personid = shp2.personid
                     LEFT OUTER JOIN blsession ses ON ses.sessionid = shp2.sessionid AND ses.startdate < s.startdate';
            $where .= " AND shp.remote IS NOT NULL AND s.sessionid = :" . (sizeof($args) + 1);
            $group = 'GROUP BY p.personid, p.givenname, p.familyname, p.login';
            array_push($args, $sessionid);
        }
        else if ($pjid)
        {
            $join .= 'INNER JOIN project_has_person php ON p.personid = php.personid';
            $where .= ' AND php.projectid=:' . (sizeof($args) + 1);
            $extc = "CONCAT(p.personid, '-', php.projectid) as ppid,";
            array_push($args, $pjid);
        }

        if ($getCount)
        {
            $tot = $this->db->pq("SELECT count(distinct p.personid) as tot
                FROM person p
                $join
                WHERE $where", $args);

            return sizeof($tot) ? intval($tot[0]['TOT']) : 0;
        }

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

        $rows = $this->db->paginate("SELECT $extc p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country
                               FROM person p
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

    function getUsersForProposal($where, $getCount, $page, $sortBy, $proposalid, $currentUserId, $perPage, $isAscending, $start, $end)
    {
        $args = array();

        $where1 = $where . ' AND prhp.proposalid=:1';
        $where2 = $where . ' AND (lc.proposalid=:2 OR p.personid=:3)';

        array_push($args, $proposalid);
        array_push($args, $proposalid);
        array_push($args, $currentUserId);

        if ($getCount)
        {
            $tot = $this->db->pq("select count(personId) as tot FROM
                (SELECT p.personid
                FROM person p
                LEFT OUTER JOIN proposalhasperson prhp ON prhp.personid = p.personid
                WHERE $where1
                UNION
                SELECT p.personid
                FROM person p
                LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
                WHERE $where2)
                AS PERSONS", $args);

            return sizeof($tot) ? intval($tot[0]['TOT']) : 0;
        }

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

        $extc = "p.personid, p.givenname, p.familyname, CONCAT(p.givenname, ' ', p.familyname) as fullname, p.login, p.emailaddress, p.phonenumber, l.name as labname, l.address, l.city, l.postcode, l.country";
        $rows = $this->db->paginate("(SELECT $extc
                               FROM person p
                               LEFT OUTER JOIN ProposalHasPerson prhp ON prhp.personid = p.personid
                               LEFT OUTER JOIN laboratory l ON l.laboratoryid = p.laboratoryid
                               WHERE $where1
                               GROUP BY p.personid
                               ORDER BY $order)
                               UNION
                               (SELECT $extc
                               FROM person p
                               LEFT OUTER JOIN labcontact lc ON lc.personid = p.personid
                               LEFT OUTER JOIN Laboratory l ON l.laboratoryid = p.laboratoryid
                               WHERE $where2
                               GROUP BY p.personid
                               ORDER BY $order)", $args);

        return $rows;
    }

    function checkLogin($loginId)
    {
        return $this->db->pq("SELECT login FROM person WHERE login=:1", array($loginId));
    }


    function addUser($loginId, $givenName, $familyName, $emailAddress = null)
    {
        $this->db->pq(
            "INSERT INTO person (login, givenname, familyname, emailaddress) VALUES (:1, :2, :3, :4)",
            array($loginId, $givenName, $familyName, $emailAddress)
        );
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
        $db_values_to_use = (new DatabaseQueryBuilder($this->db))
            ->patch("name", $labName)
            ->patch("address", $labAddress)
            ->patch("city", $city)
            ->patch("postcode", $postcode)
            ->patch("country", $country);

        if ($laboratoryId)
        {
            $db_values_to_use
                ->whereIdEquals("laboratoryid", $laboratoryId)
                ->update("laboratory");
        }
        else
        {
            # TODO: the logic here appears dubious - may result in duplicate entries for labs, rather than reusing these?  Perhaps this is ok, though...
            $laboratoryId = $db_values_to_use->insert("laboratory");

            $db_values_to_use = (new DatabaseQueryBuilder($this->db))
                ->patch("laboratoryid", $laboratoryId)
                ->whereIdEquals("personid", $personId)
                ->update("person");
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
