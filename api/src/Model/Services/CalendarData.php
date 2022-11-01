<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

class CalendarData
{
    private $db;

    function __construct($db)
    {
        $this->db = $db;
    }

    // if calendar entry refers to a proposal, $forBeamline should be set to 'false'
    function addCalendarHash($ckey, $forBeamline)
    {
        $h = md5(uniqid());
        $this->db->pq("INSERT INTO calendarhash (ckey,hash,beamline) 
                VALUES (:1, :2, :3)", array($ckey, $h, $forBeamline ? 1 : 0));
        return $h;
    }

    function getCalendarHashByKey($ckey)
    {
        return $this->db->pq("SELECT hash FROM calendarhash WHERE ckey LIKE :1", array($ckey));
    }

    function getCalendarHashByHash($hash)
    {
        return $this->db->pq("SELECT ckey,beamline FROM calendarhash WHERE hash LIKE :1", array($hash));
    }

    private function prepareStatement($ckey, $forBeamline, &$args)
    {
        $where = '';
        array_push($args, date('Y'));
        array_push($args, $ckey);
        if ($forBeamline)
        {
            $where .= ' AND s.beamlinename LIKE :' . (sizeof($args));
        }
        else
        {
            $where = ' AND CONCAT(p.proposalcode,p.proposalnumber) LIKE :' . (sizeof($args));
        }
        return $where;
    }

    function getCalendarVisitsData($ckey, $forBeamline)
    {
        $args = array();
        $where = $this->prepareStatement($ckey, $forBeamline, $args);

        return $this->db->pq("SELECT 
            s.beamlineoperator as lc, 
            CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, 
            CONCAT(p.proposalcode, p.proposalnumber) as prop, 
            s.beamlinename as bl, 
            TO_CHAR(s.startdate, 'DD-MM-YYYY') as d, 
            TO_CHAR(s.enddate, 'DD-MM-YYYY') as e, 
            TO_CHAR(s.startdate, 'HH24:MI') as st, 
            TO_CHAR(s.enddate, 'HH24:MI') as en, 
            s.sessionid 
            FROM blsession s 
            INNER JOIN proposal p ON (p.proposalid = s.proposalid) 
            WHERE s.startdate > TO_DATE(:1,'YYYY') $where ORDER BY s.startdate, s.beamlinename", $args);
    }

    function getUserData($ckey, $forBeamline)
    {
        $args = array();
        $where = $this->prepareStatement($ckey, $forBeamline, $args);
        $users = $this->db->pq("SELECT s.sessionid, pe.login, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname, shp.role
            FROM person pe
            INNER JOIN session_has_person shp ON shp.personid = pe.personid
            INNER JOIN blsession s ON s.sessionid = shp.sessionid
            INNER JOIN proposal p ON p.proposalid = s.proposalid
            WHERE s.startdate > TO_DATE(:1,'YYYY') $where", $args);

        return $this->groupUsersBySession($users);
    }

    private function groupUsersBySession($users)
    {
        $usersBySession = array();
        foreach ($users as $u)
        {
            if (!array_key_exists($u['SESSIONID'], $usersBySession))
            {
                $usersBySession[$u['SESSIONID']] = array();
            }
            array_push($usersBySession[$u['SESSIONID']], $u);
        }
        return $usersBySession;
    }
}