<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

require_once(__DIR__ . '/Utils.php');

class ContactData
{
    private $db;

    function __construct($db)
    {
        $this->db = $db;
    }

    private function prepareStatement($proposalId, $labContactId, &$args)
    {
        array_push($args, $proposalId);
        $where = 'WHERE c.proposalid = :1';

        if ($labContactId)
        {
            array_push($args, $labContactId);
            $where .= ' AND c.labcontactid=:' . (sizeof($args));
        }
        return $where;
    }

    function getLabContactsCount($proposalId)
    {
        $args = array();
        $where = $this->prepareStatement($proposalId, null, $args);

        $tot = $this->db->pq("SELECT count(c.labcontactid) as tot FROM labcontact c  $where", $args);
        return sizeof($tot) ? intval($tot[0]['TOT']) : 0;
    }

    function getLabContacts($proposalId, $labContactId, $page = 0, $perPage = 15)
    {
        $args = array();
        $where = $this->prepareStatement($proposalId, $labContactId, $args);

        setupPagingParameters($args, $perPage, $page);

        return $this->db->paginate("SELECT c.labcontactid, c.cardname, pe.givenname, pe.familyname, pe.phonenumber, pe.personid,
                                    l.name as labname, l.address, l.city, l.country, l.laboratoryid,
                                    c.courieraccount, c.billingreference, c.defaultcourriercompany, c.dewaravgcustomsvalue, c.dewaravgtransportvalue, 
                                    pe.emailaddress, l.postcode, l.country
                                 FROM labcontact c 
                                 INNER JOIN person pe ON c.personid = pe.personid 
                                 INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid 
                                 INNER JOIN proposal p ON p.proposalid = c.proposalid 
                                 $where ORDER BY c.labcontactid DESC", $args);
    }


    function updateLabContact($labContact, $cardName, $defaultCourierCompany, $courierAccount, $billingReference, $dewarTransportVal, $dewarCustomsVal)
    {
        $cardName = $cardName ? $cardName : $labContact['CARDNAME'];
        $defaultCourierCompany = $defaultCourierCompany ? $defaultCourierCompany : $labContact['DEFAULTCOURRIERCOMPANY'];
        $courierAccount = $courierAccount ? $courierAccount : $labContact['COURIERACCOUNT'];
        $billingReference = $billingReference ? $billingReference : $labContact['BILLINGREFERENCE'];
        $dewarTransportVal = $dewarTransportVal ? $dewarTransportVal : $labContact['DEWARAVGTRANSPORTVALUE'];
        $dewarCustomsVal = $dewarCustomsVal ? $dewarCustomsVal : $labContact['DEWARAVGCUSTOMSVALUE'];
        $this->db->pq('UPDATE labcontact 
            SET DEFAULTCOURRIERCOMPANY=:1, COURIERACCOUNT=:2, BILLINGREFERENCE=:3, DEWARAVGTRANSPORTVALUE=:4, DEWARAVGCUSTOMSVALUE=:5, CARDNAME=:6
            WHERE labcontactid=:7',
            array($defaultCourierCompany, $courierAccount, $billingReference, $dewarTransportVal, $dewarCustomsVal, $cardName, $labContact['LABCONTACTID']));
    }

    function addPerson($givenName, $familyName, $email, $phone, $laboratoryId)
    {
        $this->db->pq("INSERT INTO person (givenname, familyname, emailaddress, phonenumber, laboratoryid) 
                VALUES (:1, :2, :3, :4, :5) RETURNING personid INTO :id",
            array($givenName, $familyName, $email, $phone, $laboratoryId));
        return $this->db->id();
    }

    function addLabContact($cardName, $courierCompany, $courierAccount, $billingRef, $dewarCustomsVal, $dewarTransportVal, $proposalId, $personId)
    {
        $this->db->pq("INSERT INTO labcontact 
            (cardname, defaultcourriercompany, courieraccount, billingreference, dewaravgcustomsvalue, dewaravgtransportvalue, proposalid, personid)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8)",
            array($cardName, $courierCompany, $courierAccount, $billingRef, $dewarCustomsVal, $dewarTransportVal, $proposalId, $personId));
        return $this->db->id();
    }
}