<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Shipment\Courier\DHL;
use SynchWeb\Email;
use SynchWeb\ImagingShared;

class Shipment extends Page
{
        

        public static $arg_list = array('did' => '\d+',
                              'cid' => '\d+',
                              'sid' => '\d+',
                              'lcid' => '\d+',
                              'pid' => '\d+',
                              'iid' => '\d+',

                              
                              'visit' => '\w+\d+-\d+',
                              'bl' => '[\w-]+',
                              'current' => '\d',
                              'all' => '\d',
                              'ty' => '\w+',
                              'imager' => '\d',
                              'imid' => '\d+',

                              'requestedimager' => '\d',
                              'firstexperimentdate' => '\d\d-\d\d-\d\d\d\d',

                              // cache name
                              'name' => '\w+',


                              // Dewar Fields
                              'CODE' => '([\w-])+',
                              'FACILITYCODE' => '^(?![\s\S])|([\w-])+',
                              'NEWFACILITYCODE' => '([\w-])+',
                              'TRACKINGNUMBERTOSYNCHROTRON' => '\w+',
                              'TRACKINGNUMBERFROMSYNCHROTRON' => '\w+',
                              'FIRSTEXPERIMENTID' => '\d+|^(?![\s\S])',
                              'SHIPPINGID' => '\d+',

                              'DEWARREGISTRYID' => '\d+',

                              'BARCODE' => '([\w-])+',
                              'LOCATION' => '[\w|\s|-]+',
                              'NEXTLOCATION' => '\w+|^(?![\s\S])',
                              'STATUS' => '[\w|\s|-]+',

                              'PURCHASEDATE' => '\d+-\d+-\d+',
                              'LABCONTACTID' => '\d+',
                              'REPORT' => '.*',

                              'ADDRESS' => '.*',
                              'DESCRIPTION' => '.*',
                              'EMAILADDRESS' => '.*',
                              'FAMILYNAME' => '.*',
                              'GIVENNAME' => '.*',
                              'LABNAME' => '.*',
                              'LOCALCONTACT' => '[\w|\s+|-]+',
                              'NEXTLOCALCONTACT' => '\w+|^(?![\s\S])',
                              'PHONENUMBER' => '.*',
                              'VISIT' => '\w+\d+-\d+',
                              'NEXTVISIT' => '\w+\d+-\d+|^(?![\s\S])',
                              'AWBNUMBER' => '\w+',
                              'WEIGHT' => '\d+',
                              
                              // Shipment fields
                              'FCODES' => '([\w-])+',
                              'SENDINGLABCONTACTID' => '\d+',
                              'RETURNLABCONTACTID' => '\d+',
                              'SHIPPINGNAME' => '([\w\s-])+',
                              'DELIVERYAGENT_SHIPPINGDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_DELIVERYDATE' => '\d+-\d+-\d+',
                              'DELIVERYAGENT_AGENTNAME' => '[\s|\w|-]+',
                              'DELIVERYAGENT_AGENTCODE' => '[\w-]+',
                              'SAFETYLEVEL' => '\w+',
                              'DEWARS' => '\d+',
                              //'FIRSTEXPERIMENTID' => '\w+\d+-\d+',
                              'COMMENTS' => '.*',
                              
                              'assigned' => '\d',
                              'bl' => '[\w-]+',
                              'unassigned' => '[\w-]+',
                              
                              // Container fields
                              'DEWARID' => '\d+',
                              'CAPACITY' => '\d+',
                              'CONTAINERTYPE' => '\w+',
                              'NAME' => '([\w-])+',
                              'SCHEDULEID' => '\d+',
                              'SCREENID' => '\d+',
                              'PERSONID' => '\d+',
                              'DISPOSE' => '\d',
                              'REQUESTEDRETURN' => '\d',
                              'REQUESTEDIMAGERID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'UNQUEUE' => '\d',
                              'EXPERIMENTTYPE' => '\w+',
                              'STORAGETEMPERATURE' => '[\w-]+',
                              'AUTOMATED' => '\d+',
                              'PUCK' => '\d',
                              'PROCESSINGPIPELINEID' => '\d+',
                              'OWNERID' => '\d+',

                              'CONTAINERREGISTRYID' => '\d+',
                              'PROPOSALID' => '\d+',
                              't' => '\w+',

                              'RETURN' => '\d+',
                              'DECLAREDVALUE' => '\d+',
                              'DESCRIPTION' => '.*',
                              'DEWARS' => '\d+',

                              'PHYSICALLOCATION' => '[\s|\w|-]+',
                              'READYBYTIME' => '\d\d:\d\d',
                              'CLOSETIME' => '\d\d:\d\d',
                              'PRODUCTCODE' => '\w',
                              'BEAMLINENAME' => '[\w-]+',

                              'manifest' => '\d',
                              'currentuser' => '\d',

                              );
        

        public static $dispatch = array(array('/shipments(/:sid)', 'get', '_get_shipments'),
                              array('/shipments', 'post', '_add_shipment'),
                              array('/shipments/:sid', 'patch', '_update_shipment'),
                              array('/send/:sid', 'get', '_send_shipment'),
                              array('/countries', 'get', '_get_countries'),


                              array('/dewars(/:did)(/sid/:sid)(/fc/:FACILITYCODE)', 'get', '_get_dewars'),
                              array('/dewars', 'post', '_add_dewar'),
                              array('/dewars/:did', 'patch', '_update_dewar'),
                              array('/dewars/comments/:did', 'patch', '_update_dewar_comments'), // endpoint to allow bcr to update comments

                              array('/dewars/history(/did/:did)', 'get', '_get_history'),
                              array('/dewars/history', 'post', '_add_history'),

                              array('/dewars/registry/proposals', 'get', '_get_prop_dewar'),
                              array('/dewars/registry/proposals', 'post', '_add_prop_dewar'),
                              array('/dewars/registry/proposals/:DEWARREGISTRYHASPROPOSALID', 'delete', '_rem_prop_dewar'),

                              array('/dewars/registry(/:FACILITYCODE)', 'get', '_dewar_registry'),
                              array('/dewars/registry/:FACILITYCODE', 'patch', '_update_dewar_registry'),
                              array('/dewars/registry/:FACILITYCODE', 'put', '_add_dewar_registry'),

                              array('/dewars/reports(/:drid)', 'get', '_get_dewar_reports'),
                              array('/dewars/reports', 'post', '_add_dewar_report'),

                              array('/dewars/default', 'get', '_get_default_dewar'),

                              array('/dewars/transfer', 'post', '_transfer_dewar'),
                              array('/dewars/dispatch', 'post', '_dispatch_dewar'),

                              array('/dewars/tracking(/:DEWARID)', 'get', '_get_dewar_tracking'),



                              array('/containers(/:cid)(/did/:did)', 'get', '_get_all_containers'),
                              array('/containers/', 'post', '_add_container'),
                              array('/containers/:cid', 'patch', '_update_container'),
                              array('/containers/move', 'get', '_move_container'),

                              // TODO: Need to have a separate method for handling queueing and unqueueing of containers
                              array('/containers/queue(/:cid)', 'patch', '_queue_container'),
                              array('/containers/queue(/:cid)', 'get', '_queue_container'),
                              array('/containers/barcode/:BARCODE', 'get', '_check_container'),


                              array('/containers/registry(/:CONTAINERREGISTRYID)', 'get', '_container_registry'),
                              array('/containers/registry', 'post', '_add_container_registry'),
                              array('/containers/registry/:CONTAINERREGISTRYID', 'patch', '_update_container_registry'),

                              array('/containers/registry/proposals', 'get', '_get_prop_container'),
                              array('/containers/registry/proposals', 'post', '_add_prop_container'),
                              array('/containers/registry/proposals/:CONTAINERREGISTRYHASPROPOSALID', 'delete', '_rem_prop_container'),

                              array('/containers/history', 'get', '_container_history'),
                              array('/containers/history', 'post', '_add_container_history'),
                              array('/containers/reports(/:CONTAINERREPORTID)', 'get', '_get_container_reports'),
                              array('/containers/reports', 'post', '_add_container_report'),
                              array('/containers/types', 'get', '_get_container_types'),
                              
                              array('/containers/notify/:BARCODE', 'get', '_notify_container'),

                              array('/cache/:name', 'put', '_session_cache'),
                              array('/cache/:name', 'get', '_get_session_cache'),


                              array('/terms/:sid', 'get', '_get_terms'),
                              array('/terms/:sid', 'patch', '_accept_terms'),

                              array('/awb/:sid', 'post', '_create_awb'),
                              array('/awb/quote', 'get', '_quote_awb'),

                              array('/pickup/:sid', 'post', '_rebook_pickup'),
                              array('/pickup/cancel/:sid', 'delete', '_cancel_pickup'),
        );

        // Keep session open so we can cache data
        var $session_close = False;
        

        function __construct() {
            call_user_func_array(array('parent', '__construct'), func_get_args());

            global $dhl_user, $dhl_pass, $dhl_env;
            $this->dhl = new DHL($dhl_user, $dhl_pass, $dhl_env);
        }


        
        # ------------------------------------------------------------------------
        # List of shipments for a proposal
        function _get_shipments() {
            if ($this->has_arg('all') && $this->user->has('view_manifest')) {
                $args = array();
                $where = '1=1';

            } else {
                if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'Please select a proposal first');
                $args = array($this->proposalid);
                $where = 'p.proposalid=:1';
            }

            if ($this->has_arg('sid')) {
                $where .= ' AND s.shippingid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));
            }
            
            if ($this->has_arg('manifest')) {
                $where .= ' AND s.deliveryagent_flightcodetimestamp is NOT NULL
                    AND d.deliveryagent_barcode IS NOT NULL';
            }

            if ($this->has_arg('s')) {
                $st = sizeof($args)+1;
                $where .= " AND (lower(s.shippingname) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(CONCAT(p.proposalcode,p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }

            $tot = $this->db->pq("SELECT count(distinct s.shippingid) as tot 
                FROM proposal p 
              INNER JOIN shipping s ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid 
              LEFT OUTER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid 
              LEFT OUTER JOIN dewar d ON d.shippingid = s.shippingid 
              WHERE $where", $args);
            $tot = sizeof($tot) ? intval($tot[0]['TOT']) : 0;
            
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 's.creationdate DESC';
            if ($this->has_arg('sort_by')) {
                $cols = array('SHIPPINGNAME' => 's.shippingname');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }

            $rows = $this->db->paginate("SELECT s.deliveryagent_agentname, s.deliveryagent_agentcode, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as deliveryagent_shippingdate, TO_CHAR(s.deliveryagent_deliverydate, 'DD-MM-YYYY') as deliveryagent_deliverydate, s.safetylevel, count(d.dewarid) as dcount,s.sendinglabcontactid, c.cardname as lcout, c2.cardname as lcret, s.returnlabcontactid, s.shippingid, s.shippingname, s.shippingstatus,TO_CHAR(s.creationdate, 'DD-MM-YYYY') as created, s.isstorageshipping, s.shippingtype, s.comments, s.deliveryagent_flightcode, IF(s.deliveryAgent_label IS NOT NULL, 1, 0) as deliveryagent_has_label, TO_CHAR(s.readybytime, 'HH24:MI') as readybytime, TO_CHAR(s.closetime, 'HH24:MI') as closetime, s.physicallocation, s.deliveryagent_pickupconfirmation, TO_CHAR(s.deliveryagent_readybytime, 'HH24:MI') as deliveryAgent_readybytime, TO_CHAR(s.deliveryAgent_callintime, 'HH24:MI') as deliveryAgent_callintime, CONCAT(p.proposalcode, p.proposalnumber) as prop, TO_CHAR(s.deliveryagent_flightcodetimestamp, 'HH24:MI DD-MM-YYYY') as deliveryagent_flightcodetimestamp, sum(d.weight) as weight, pe.givenname, pe.familyname, l.name as labname, l.address, l.city, l.postcode, l.country, CONCAT(p.proposalcode, p.proposalnumber) as prop, GROUP_CONCAT(IF(d.facilitycode, d.facilitycode, d.code)) as dewars, s.deliveryagent_productcode, IF(cta.couriertermsacceptedid,1,0) as termsaccepted, GROUP_CONCAT(d.deliveryagent_barcode) as deliveryagent_barcode, pe2.login as deliveryagent_flightcodeperson
              FROM proposal p 
              INNER JOIN shipping s ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid 
              LEFT OUTER JOIN dewar d ON d.shippingid = s.shippingid 
              LEFT OUTER JOIN couriertermsaccepted cta ON cta.shippingid = s.shippingid
              LEFT OUTER JOIN labcontact c ON c.labcontactid = s.sendinglabcontactid
              LEFT OUTER JOIN person pe ON c.personid = pe.personid 
              LEFT OUTER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid 
              LEFT OUTER JOIN person pe2 ON pe2.personid = s.deliveryagent_flightcodepersonid
              WHERE $where 
              GROUP BY s.sendinglabcontactid, s.returnlabcontactid, s.deliveryagent_agentname, s.deliveryagent_agentcode, s.deliveryagent_shippingdate, s.deliveryagent_deliverydate, s.safetylevel, c.cardname, c2.cardname, s.shippingid, s.shippingname, s.shippingstatus,TO_CHAR(s.creationdate, 'DD-MM-YYYY'), s.isstorageshipping, s.shippingtype, s.comments, s.creationdate 
              ORDER BY $order", $args);

            foreach ($rows as &$s) {
                $s['DELIVERYAGENT_BARCODE'] = str_replace(',', ', ', $s['DELIVERYAGENT_BARCODE']);
            }
            
            if ($this->has_arg('sid')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such shipment');
            } else $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }
        
        
        # ------------------------------------------------------------------------
        # Dewar history
        function _get_history() {
            if (!$this->has_arg('did') && !$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';
            if ($this->has_arg('all') && ($this->bcr() || $this->staff)) {
                $args = array();
                $where = '1=1';
            }

            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            } else {
                $where .= ' AND d.facilitycode=:'.(sizeof($args)+1);
                array_push($args, $this->arg('FACILITYCODE'));
            }

            $tot = $this->db->pq("SELECT count(h.dewartransporthistoryid) as tot 
              FROM dewartransporthistory h 
              INNER JOIN dewar d ON d.dewarid = h.dewarid 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT s.shippingid, s.shippingname as shipment, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), b.visit_number) as visit, b.beamlinename as bl, b.beamlineoperator as localcontact, h.dewarid, h.dewarstatus,h.storagelocation,TO_CHAR(h.arrivaldate, 'DD-MM-YYYY HH24:MI') as arrival, d.comments
              FROM dewartransporthistory h 
              INNER JOIN dewar d ON d.dewarid = h.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession b ON b.sessionid = d.firstexperimentid
              WHERE $where ORDER BY h.arrivaldate DESC", $args);
            
            $this->_output(array('total' => $tot, 'data' => $rows));
        }


        function _add_history() {
            global $in_contacts, $transfer_email;
            global $dewar_complete_email; // Email list to cc if dewar back from beamline
            # Flag to indicate we should e-mail users their dewar has returned from BL
            $from_beamline = False;

            if (!$this->bcr()) $this->_error('You need to be on the internal network to add history');

            if (!$this->has_arg('BARCODE')) $this->_error('No barcode specified');
            if (!$this->has_arg('LOCATION')) $this->_error('No location specified');

            $dew = $this->db->pq("SELECT CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as lcout, pe.emailaddress as lcoutemail, CONCAT(CONCAT(pe2.givenname, ' '), pe2.familyname) as lcret, pe2.emailaddress as lcretemail, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), e.visit_number) as firstexp, TO_CHAR(e.startdate, 'DD-MM-YYYY HH24:MI') as firstexpst, e.beamlinename, e.beamlineoperator, d.dewarid, d.trackingnumberfromsynchrotron, s.shippingid, s.shippingname, p.proposalcode, CONCAT(p.proposalcode, p.proposalnumber) as prop, d.barcode, d.facilitycode, d.firstexperimentid, d.dewarstatus
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid 
              LEFT OUTER JOIN person pe ON pe.personid = c.personid
              LEFT OUTER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid  
              LEFT OUTER JOIN person pe2 ON pe2.personid = c2.personid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              LEFT OUTER JOIN blsession e ON e.sessionid = d.firstexperimentid
              WHERE lower(barcode) LIKE lower(:1)", array($this->arg('BARCODE')));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            $track = $this->has_arg('TRACKINGNUMBERFROMSYNCHROTRON') ? $this->arg('TRACKINGNUMBERFROMSYNCHROTRON') : $dew['TRACKINGNUMBERFROMSYNCHROTRON'];

            // What was the last history entry for this dewar?
            // If it's come from a beamline, register flag so we can e-mail further down...
            $last_history_results = $this->db->pq("SELECT storageLocation FROM dewartransporthistory WHERE dewarId = :1 ORDER BY DewarTransportHistoryId DESC LIMIT 1", array($dew['DEWARID']));

            if (sizeof($last_history_results)) {
                $last_history = $last_history_results[0];
                // We only add data to dewar history in lower case from this method.
                // If that ever changes, update this to become case insensitive search
                $last_location = $last_history['STORAGELOCATION'];

                // Why don't we have beamline names in the database...?
                // Currently grabbing them from the config object
                // Not particularly efficient, but this is not a time critical operation so
                // this approach covers all beamlines for future proofing.
                // Stop/break if we find a match
                $bls = $this->_get_beamlines_from_type('all');

                if (in_array($last_location, $bls)) {
                    $from_beamline = True;
                }
            } else {
                // No history - could be a new dewar, so not necessarily an error...
                if ($this->debug) error_log("No previous dewar transport history for DewarId ". $dew['DEWARID']);
            }
            // If dewar status is dispatch-requested - don't change it.
            // This way the dewar can be moved between storage locations and keep the record that a user requested the dispatch
            // Default status is 'at-facility'
            $dewarstatus = strtolower($dew['DEWARSTATUS']) == 'dispatch-requested' ? 'dispatch-requested' : 'at facility';

            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) VALUES (s_dewartransporthistory.nextval,:1,lower(:2),lower(:3),CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", array($dew['DEWARID'], $dewarstatus, $this->arg('LOCATION')));
            $dhid = $this->db->id();

            $this->db->pq("UPDATE dewar set dewarstatus=lower(:4), storagelocation=lower(:2), trackingnumberfromsynchrotron=:3 WHERE dewarid=:1", array($dew['DEWARID'], $this->arg('LOCATION'), $track, $dewarstatus));
            $this->db->pq("UPDATE shipping set shippingstatus=lower(:2) WHERE shippingid=:1", array($dew['SHIPPINGID'], $dewarstatus));

            $containers = $this->db->pq("SELECT containerid 
                FROM container 
                WHERE dewarid=:1", array($dew['DEWARID']));
            foreach ($containers as $c) {
                $this->db->pq("INSERT INTO containerhistory (containerid,status) VALUES (:1,:2)", array($c['CONTAINERID'], 'at facility'));
            }

            // Email
            // EHCs, local contact(s), labcontact, dh, pa
            $dew['NOW'] = strftime('%d-%m-%Y %H:%M');
            $dew['INCONTACTS'] = $in_contacts;
            $dew['TRACKINGNUMBERFROMSYNCHROTRON'] = $track;

            if (strtolower($this->arg('LOCATION')) == 'stores-in' && $dew['LCOUTEMAIL']) {
                $lcs = $this->db->pq("SELECT p.login
                  FROM person p 
                  INNER JOIN session_has_person shp ON shp.personid = p.personid
                  WHERE shp.sessionid=:1 AND (shp.role = 'Local Contact' OR shp.role = 'Local Contact 2')", array($dew['FIRSTEXPERIMENTID']));
                $emails = array($dew['LCOUTEMAIL'],$transfer_email);
                foreach ($lcs as $lc) {
                    array_push($emails, $this->_get_email($lc['LOGIN']));
                }

                $email = new Email($dew['PROPOSALCODE'] == 'in' ? 'dewar-stores-in-in' : 'dewar-stores-in', '*** Dewar Received for '.$dew['PROP'].' at '.$dew['NOW'].' ***');
                $email->data = $dew;
                $email->send(implode(', ', $emails));
            }

            if (strtolower($this->arg('LOCATION')) == 'stores-out' && $dew['LCRETEMAIL']) {
                $email = new Email('dewar-stores-out', '*** Dewar ready to leave Synchrotron ***');
                $email->data = $dew;
                $email->send($dew['LCRETEMAIL']);
            }

            if (strpos(strtolower($this->arg('LOCATION')),'-rack') !== false && $dew['LCRETEMAIL']) {
                $dew['LOCATION'] = $this->arg('LOCATION');

                $email = new Email('dewar-rack', '*** Dewar now outside Beamline ***');
                $email->data = $dew;
                $email->send($dew['LCRETEMAIL']);
            }

            // Change this so it checks if the boolean flag "from_beamline" is set
            // The old version assumed rack-<word>-from-bl
            //if (preg_match('/rack-\w+-from-bl/', strtolower($this->arg('LOCATION'))) && $dew['LCRETEMAIL']) {
            if ($from_beamline && $dew['LCRETEMAIL']) {
                // Any data collections for this dewar's containers?
                // Note this counts data collection ids for containers and uses the DataCollection.SESSIONID to determine the session/visit
                // Should work for UDC (where container.sessionid is set) as well as any normal scheduled session (where container.sessionid is not set)
                $rows = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber, '-', ses.visit_number) as visit, dc.sessionid, count(dc.datacollectionid) as dccount
                    FROM Dewar d
                    INNER JOIN Container c on c.dewarid = d.dewarid
                    INNER JOIN BLSample bls ON bls.containerid = c.containerid
                    INNER JOIN DataCollection dc ON dc.blsampleid = bls.blsampleid
                    INNER JOIN BLSession ses ON dc.sessionid = ses.sessionid
                    INNER JOIN Proposal p ON p.proposalid = ses.proposalid
                    WHERE d.dewarid = :1
                    GROUP BY dc.sessionid", array($dew['DEWARID']));

                if (sizeof($rows)) $dew['DC'] = $rows;

                $cc = $dewar_complete_email ? $dewar_complete_email : null;
                // Log the event if debugging
                if ($this->debug) error_log("Dewar " . $dew['DEWARID'] . " back from beamline...");

                $email = new Email('storage-rack', '*** Visit finished, dewar awaiting instructions ***');
                $email->data = $dew;
                $email->send($dew['LCRETEMAIL'], $cc);
            }

            $this->_output(array('DEWARHISTORYID' => $dhid));
        }



        function _dewar_registry() {
            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';

            $fields = "r.dewarregistryid, max(CONCAT(p.proposalcode, p.proposalnumber)) as prop, r.facilitycode, TO_CHAR(r.purchasedate, 'DD-MM-YYYY') as purchasedate, ROUND(TIMESTAMPDIFF('DAY',r.purchasedate, CURRENT_TIMESTAMP)/30.42,1) as age, r.labcontactid, count(d.dewarid) as dewars, GROUP_CONCAT(distinct CONCAT(p.proposalcode,p.proposalnumber) SEPARATOR ', ') as proposals, r.bltimestamp, TO_CHAR(max(d.bltimestamp),'DD-MM-YYYY') as lastuse, count(dr.dewarreportid) as reports";
            $group = "r.facilitycode";

            if ($this->has_arg('all') && $this->staff) {
                $args = array();
                $where = '1=1';
            }

            if ($this->has_arg('FACILITYCODE')) {
                $where .= ' AND r.facilitycode=:'.(sizeof($args)+1);
                array_push($args, $this->arg('FACILITYCODE'));
            }

            if ($this->has_arg('s')) {
                $where .= " AND lower(r.facilitycode) LIKE lower(CONCAT(CONCAT('%', :".(sizeof($args)+1)."), '%'))";
                array_push($args, $this->arg('s'));
            }

            if ($this->has_arg('t')) {
                if ($this->arg('t') == 'orphan') $where .= " AND rhp.dewarregistryid IS NULL";
            }


            $tot = $this->db->pq("SELECT count(r.facilitycode) as tot 
              FROM dewarregistry r 
              LEFT OUTER JOIN dewarregistry_has_proposal rhp ON r.dewarregistryid = rhp.dewarregistryid
              LEFT OUTER JOIN proposal p ON p.proposalid = r.proposalid 
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $order = 'r.facilitycode';
            if ($this->has_arg('sort_by')) {
                $cols = array(
                  'FACILITYCODE' => 'r.facilitycode', 'DEWARS' => 'count(distinct d.dewarid)', 
                  'LASTUSE' => 'max(d.bltimestamp)', 'BLTIMESTAMP' => 'r.bltimestamp',
                  'REPORTS' => 'count(dr.dewarreportid)'
                );
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }

            $rows = $this->db->paginate("SELECT $fields
              FROM dewarregistry r 
              LEFT OUTER JOIN dewarregistry_has_proposal rhp ON r.dewarregistryid = rhp.dewarregistryid
              LEFT OUTER JOIN dewarreport dr ON r.facilitycode = dr.facilitycode
              LEFT OUTER JOIN proposal p ON p.proposalid = rhp.proposalid 
              LEFT OUTER JOIN dewar d ON d.facilitycode = r.facilitycode
              LEFT OUTER JOIN shipping s ON d.shippingid = s.shippingid 

              WHERE $where 
              GROUP BY $group
              ORDER BY $order", $args);
            
            if ($this->has_arg('FACILITYCODE')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such dewar');

            } else  $this->_output(array('total' => $tot, 'data' => $rows));
        }



        function _add_dewar_registry() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar code specified');

            $fc = strtoupper($this->arg('FACILITYCODE'));
            $check = $this->db->pq("SELECT dewarregistryid FROM dewarregistry WHERE facilitycode=:1", array($fc));

            if (sizeof($check)) {
              $this->_error('That facility code is already in use');
            }

            $purchase = $this->has_arg('PURCHASEDATE') ? $this->arg('PURCHASEDATE') : '';
            $this->db->pq("INSERT INTO dewarregistry (facilitycode, purchasedate, bltimestamp) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), SYSDATE)", array($fc, $purchase));

            $this->_output(array('FACILITYCODE' => $fc, 'DEWARREGISTRYID' => $this->db->id()));
        }


        function _update_dewar_registry() {
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar code specified');

            $dew = $this->db->pq("SELECT facilitycode FROM dewarregistry WHERE facilitycode LIKE :1 AND proposalid = :2", array($this->arg('FACILITYCODE'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            $fields = array('PURCHASEDATE');
            if ($this->staff) array_push($fields, 'NEWFACILITYCODE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $fl = ':1';
                    if (in_array($f, array('PURCHASEDATE'))) {
                        $fl = "TO_DATE(:1, 'DD-MM-YYYY')"; 
                    }

                    if ($f == 'NEWFACILITYCODE') {
                        $this->db->pq("UPDATE dewarregistry SET FACILITYCODE=$fl WHERE facilitycode=:2", array($this->arg($f), $this->arg('FACILITYCODE')));
                        $this->_output(array('FACILITYCODE' => $this->arg($f)));

                    } else {
                        $this->db->pq("UPDATE dewarregistry SET $f=$fl WHERE facilitycode=:2", array($this->arg($f), $this->arg('FACILITYCODE')));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }
        }

        function _get_prop_dewar() {
            if (!$this->has_arg('DEWARREGISTRYID')) $this->_error('No dewar specified');

            $rows = $this->db->pq("SELECT drhp.dewarregistryhasproposalid,drhp.dewarregistryid,drhp.proposalid,CONCAT(p.proposalcode, p.proposalnumber) as proposal, pe.familyname, pe.givenname, pe.phonenumber, pe.emailaddress, lc.cardname, l.name as labname, l.address, l.city, l.postcode, l.country
              FROM dewarregistry_has_proposal drhp
              INNER JOIN proposal p ON p.proposalid = drhp.proposalid
              LEFT OUTER JOIN labcontact lc ON drhp.labcontactid = lc.labcontactid
              LEFT OUTER JOIN person pe ON pe.personid = lc.personid
              LEFT OUTER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid
              
              WHERE drhp.dewarregistryid = :1", array($this->arg('DEWARREGISTRYID')));

            $this->_output($rows);
        }

        function _add_prop_dewar() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('DEWARREGISTRYID')) $this->_error('No dewar specified');
            if (!$this->has_arg('PROPOSALID')) $this->_error('No proposal specified');
            if (!$this->has_arg('LABCONTACTID')) $this->_error('No lab contact specified');

            $chk = $this->db->pq("SELECT dewarregistryid 
              FROM dewarregistry_has_proposal
              WHERE dewarregistryid = :1 AND proposalid = :2", array($this->arg('DEWARREGISTRYID'), $this->arg('PROPOSALID')));
            if (sizeof($chk)) $this->_error('That dewar is already registered to that proposal');

            $this->db->pq("INSERT INTO dewarregistry_has_proposal (dewarregistryid,proposalid,personid,labcontactid) 
              VALUES (:1,:2,:3,:4)", array($this->arg('DEWARREGISTRYID'), $this->arg('PROPOSALID'), $this->user->personid, $this->arg('LABCONTACTID')));

            $this->_output(array('DEWARREGISTRYHASPROPOSALID' => $this->db->id()));
        }

        function _rem_prop_dewar() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('DEWARREGISTRYHASPROPOSALID')) $this->_error('No dewar proposal specified');

            $this->db->pq("DELETE FROM dewarregistry_has_proposal WHERE dewarregistryhasproposalid=:1", array($this->arg('DEWARREGISTRYHASPROPOSALID')));
        }


        function _get_dewar_reports() {
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $where = 'r.facilitycode=:1';
            $args = array($this->arg('FACILITYCODE'));


            $tot = $this->db->pq("SELECT count(r.dewarreportid) as tot 
              FROM dewarreport r
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT r.dewarreportid, r.report, TO_CHAR(r.bltimestamp, 'HH24:MI DD-MM-YYYY') as bltimestamp, r.attachment
                FROM dewarreport r
              WHERE $where ORDER BY r.bltimestamp DESC", $args);

            foreach ($rows as $i => &$row) {
              $row['REPORT'] = $this->db->read($row['REPORT']);
            }

            $this->_output(array('total' => $tot, 'data' => $rows));
        }

        function _add_dewar_report() {
            if (!$this->has_arg('REPORT')) $this->_error('No report specified');
            if (!$this->has_arg('FACILITYCODE')) $this->_error('No dewar specified');

            $last_visits = $this->db->pq("SELECT s.beamlineoperator as localcontact, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'YYYY') as year, s.beamlinename
              FROM dewar d
              INNER JOIN blsession s ON d.firstexperimentid = s.sessionid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE d.facilitycode = :1
              ORDER BY s.startdate DESC", array($this->arg('FACILITYCODE')));

            if (!sizeof($last_visits)) $this->_error('Cant find a visit for that dewar');
            else $lv = $last_visits[0];

            if (array_key_exists('ATTACHMENT', $_FILES)) {
                if ($_FILES['ATTACHMENT']['name']) {
                    $info = pathinfo($_FILES['ATTACHMENT']['name']);

                    if ($info['extension'] == 'jpg') {
                        # dls_mxweb cant write to visits...
                        #$root = '/dls/'.$lv['BEAMLINENAME'].'/data/'.$lv['YEAR'].'/'.$lv['VISIT'].'/.ispyb/';

                        $root = '/dls_sw/dasc/ispyb2/uploads/'.$lv['YEAR'].'/'.$lv['VISIT'].'/';
                        if (!is_dir($root)) {
                            mkdir($root, 0755, true);
                        }

                        $file = strftime('%Y-%m-%d_%H%M').'dewarreport.jpg';

                        $this->db->pq("INSERT INTO dewarreport (dewarreportid,facilitycode,report,attachment,bltimestamp) VALUES (s_dewarreport.nextval,:1,:2,:3,SYSDATE) RETURNING dewarreportid INTO :id", 
                        array($this->arg('FACILITYCODE'), $this->arg('REPORT'), $root.$file));
                        move_uploaded_file($_FILES['ATTACHMENT']['tmp_name'], $root.$file);

                        $lc = $this->db->pq("SELECT p.emailaddress
                          FROM dewarregistry r 
                          INNER JOIN labcontact l ON l.labcontactid = r.labcontactid
                          INNER JOIN person p ON p.personid = l.personid
                          WHERE r.facilitycode=:1", array($this->arg('FACILITYCODE')));

                        if (sizeof($lc)) {
                            $recpts = array($lc[0]['EMAILADDRESS']);
                            $local = $this->_get_email_fn($lv['LOCALCONTACT']);
                            if ($local) array_push($recpts, $local);

                            $this->args['NOW'] = strftime('%d-%m-%Y %H:%M');
                            $email = new Email('dewar-report', '*** Status Report for Dewar '.$this->arg('FACILITYCODE').' at '.$this->arg('NOW').' ***');
                            $email->data = $this->args;
                            $email->send(implode(', ', $recpts));
                        }


                        $this->_output(array('DEWARREPORTID' => $this->db->id()));


                    }
                }
            }
        }


        function _transfer_dewar() {
            global $transfer_email;
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $dew = $this->db->pq("SELECT d.dewarid,s.shippingid
              FROM dewar d
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 and p.proposalid=:2", array($this->arg('DEWARID'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];


            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) 
              VALUES (s_dewartransporthistory.nextval,:1,'transfer-requested',:2,CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id",
              array($dew['DEWARID'], $this->arg('LOCATION')));

            // Update dewar status to transfer-requested to keep consistent with history
            $this->db->pq("UPDATE dewar set dewarstatus='transfer-requested' WHERE dewarid=:1", array($dew['DEWARID']));

            if ($this->has_arg('NEXTVISIT')) {
                $sessions = $this->db->pq("SELECT s.sessionid
                  FROM blsession s
                  INNER JOIN proposal p ON p.proposalid = s.proposalid
                  WHERE p.proposalid=:1 AND CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :2",
                    array($this->proposalid, $this->arg('NEXTVISIT')));

                $sessionId = !empty($sessions) ? $sessions[0]['SESSIONID'] : NULL;

                $this->db->pq("UPDATE dewar SET firstexperimentid=:1 WHERE dewarid=:2", array($sessionId, $dew['DEWARID']));
            }


            $email = new Email('dewar-transfer', '*** Dewar ready for internal transfer ***');

            $nextLocalContact = $this->arg('NEXTLOCALCONTACT');
            $newContact = !empty($nextLocalContact) ? $nextLocalContact : $this->arg('LOCALCONTACT');
            $nextLocation = $this->arg('NEXTLOCATION');

            $this->args['LCEMAIL'] = $this->_get_email_fn($this->arg('LOCALCONTACT'));
            $this->args['LCNEXTEMAIL'] = $this->_get_email_fn($newContact);
            $this->args['NEXTLOCATION'] = !empty($nextLocation) ? $nextLocation : $this->arg('LOCATION');

            $data = $this->args;
            if (!array_key_exists('FACILITYCODE', $data)) $data['FACILITYCODE'] = '';
            $email->data = $data;

            $recpts = $transfer_email.', '.$this->arg('EMAILADDRESS');
            if ($this->args['LCEMAIL']) $recpts .= ', '.$this->arg('LCEMAIL');
            if ($this->args['LCNEXTEMAIL']) $recpts .= ', '.$this->arg('LCNEXTEMAIL');

            $email->send($recpts);

            $this->_output(1);
        }


        function _dispatch_dewar() {
            global $dispatch_email;
            // Variable to store where the dewar is (Synchrotron or eBIC building)
            // Could map this to dewar storage locations in ISPyB to make more generic...?
            $dispatch_from_location = 'Synchrotron';

            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $dew = $this->db->pq("SELECT d.dewarid, d.barcode, d.storagelocation, s.shippingid
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 and p.proposalid=:2", array($this->arg('DEWARID'), $this->proposalid));

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            // If dewar is from  eBIC, we want to update the e-mail subect line...
            // Location is provided on form.
            // If no location specified (i.e. deleted), then read from dewar transport history.
            // If no dewar transport history fall back to dewar location
            // We still update history based on provided location to record action from user
            $dewar_location = $this->arg('LOCATION');

            if (empty($dewar_location)) {
              // What was the last history entry for this dewar?
              // User may have accidentally removed location from form
              $last_history_results = $this->db->pq("SELECT storageLocation FROM dewartransporthistory WHERE dewarId = :1 ORDER BY DewarTransportHistoryId DESC LIMIT 1", array($dew['DEWARID']));

              if (sizeof($last_history_results)) {
                  $last_history = $last_history_results[0];
                  
                  $dewar_location = $last_history['STORAGELOCATION'];
              } else {
                  // Use the current location of the dewar instead if no history
                  $dewar_location = $dew['STORAGELOCATION'];
              }              
            }
            // Check if the last history storage location is an EBIC prefix or not
            // Case insensitive search
            if (stripos($dewar_location, 'ebic') !== false) {
                $dispatch_from_location = 'eBIC';
            }

            // Update dewar transport history with provided location.
            $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) 
              VALUES (s_dewartransporthistory.nextval,:1,'dispatch-requested',:2,CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
              array($dew['DEWARID'], $this->arg('LOCATION')));

            // Also update the dewar status and storage location to keep it in sync with history...
            $this->db->pq("UPDATE dewar set dewarstatus='dispatch-requested', storagelocation=lower(:2) WHERE dewarid=:1", array($dew['DEWARID'], $this->arg('LOCATION')));

            # Prepare e-mail response for dispatch request
            $subject_line = '*** Dispatch requested for Dewar '.$dew['BARCODE'].' from '.$dispatch_from_location.' - Pickup Date: '.$this->args['DELIVERYAGENT_SHIPPINGDATE'].' ***';
            $email = new Email('dewar-dispatch', $subject_line);

            $this->args['LCEMAIL'] = $this->_get_email_fn($this->arg('LOCALCONTACT'));

            // LDAP email search does not always provide a match
            // So look at the ISPyB person record for a matching staff user
            if (!$this->args['LCEMAIL'] && $this->args['LOCALCONTACT']) {
              $this->args['LCEMAIL'] = $this->_get_ispyb_email_fn($this->args['LOCALCONTACT']);
            }

            $data = $this->args;
            if (!array_key_exists('FACILITYCODE', $data)) $data['FACILITYCODE'] = '';
            if (!array_key_exists('AWBNUMBER', $data)) $data['AWBNUMBER'] = '';
            if (!array_key_exists('DELIVERYAGENT_AGENTCODE', $data)) $data['DELIVERYAGENT_AGENTCODE'] = '';
            $email->data = $data;

            $recpts = $dispatch_email.', '.$this->arg('EMAILADDRESS');
            if ($this->args['LCEMAIL']) $recpts .= ', '.$this->args['LCEMAIL'];

            $email->send($recpts);

            $this->_output(1);
        }



        function _get_dewar_tracking() {
            if (!$this->has_arg('prop') && !$this->user->can('all_dewars')) $this->_error('No proposal id specified');
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar specified');

            $where = 'AND p.proposalid=:1';
            $args = array($this->arg('DEWARID'), $this->proposalid);

            if ($this->user->can('all_dewars')) {
                $where = '';
                $args = array($this->arg('DEWARID'));
            }

            $dew = $this->db->pq("SELECT d.trackingnumbertosynchrotron,d.trackingnumberfromsynchrotron, LOWER(s.deliveryagent_agentname) as deliveryagent_agentname
              FROM dewar d 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE d.dewarid=:1 $where", $args);

            if (!sizeof($dew)) $this->_error('No such dewar');
            else $dew = $dew[0];

            if ($dew['DELIVERYAGENT_AGENTNAME'] == 'dhl' 
                  && (($dew['TRACKINGNUMBERTOSYNCHROTRON'] && strlen($dew['TRACKINGNUMBERTOSYNCHROTRON']) <= 10) || 
                     ($dew['TRACKINGNUMBERFROMSYNCHROTRON'] && strlen($dew['TRACKINGNUMBERFROMSYNCHROTRON']) <= 10))
            ) {
                $tr = $this->_dewar_tracking($dew);

                $this->_output(array(
                  'ORIGIN' => (string)$tr['status']->AWBInfo->ShipmentInfo->OriginServiceArea->Description,
                  'DESTINATION' => (string)$tr['status']->AWBInfo->ShipmentInfo->DestinationServiceArea->Description,
                  'EVENTS' => $tr['events']
                ));

            } else {
                $this->_output();
            }
        }

        function _dewar_tracking($dewar) {
            if ($dewar['TRACKINGNUMBERFROMSYNCHROTRON']) $status = $this->dhl->get_tracking_info(array('AWB' => $dewar['TRACKINGNUMBERFROMSYNCHROTRON']));
            else $status = $this->dhl->get_tracking_info(array('AWB' => (string)($dewar['TRACKINGNUMBERTOSYNCHROTRON'])));

            if ($status->Response->Status) $this->_error($status->Response->Status);
            else {
                if ($status->AWBInfo->Status->ActionStatus != 'success') $this->_error((string)$status->AWBInfo->Status->ActionStatus);
                else {
                    $events = array();
                    // print_r($status->AWBInfo->ShipmentInfo);
                    $i = 1;
                    foreach ($status->AWBInfo->ShipmentInfo->ShipmentEvent as $e) {
                        $st = (string)$e->ServiceEvent->EventCode;
                        $event = array(
                            'EVENTID' => $i++,
                            'STISO' => (string)$e->Date.'T'.(string)$e->Time,
                            'DATE' => (string)$e->Date.' '.(string)$e->Time,
                            'EVENT' => (string)$e->ServiceEvent->EventCode,
                            'STATE' => $this->dhl->tracking_status($st),
                            'LOCATION' => (string)$e->ServiceArea->Description,
                            'SIGNATORY' => (string)$e->Signatory
                        );

                        array_push($events, $event);
                    }

                    return array('status' => $status, 'events' => $events);
                }
            }
        }

        
        # ------------------------------------------------------------------------
        # List of dewars for a shipment
        function _get_dewars() {
            if (!$this->has_arg('prop') && !$this->user->has('all_dewars')) $this->_error('No proposal id specified');

            $where = 's.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->user->has('all_dewars') && $this->has_arg('all')) {
                $where = '1=1';
                $args = array();
            }

            if ($this->has_arg('visit')) { 
                $where .= " AND CONCAT(p.proposalcode, p.proposalnumber, '-', se.visit_number)=:".(sizeof($args)+1);
                array_push($args, $this->arg('visit'));
            }

            if ($this->has_arg('bl')) { 
                $where .= ' AND se.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            } 

            if ($this->has_arg('FACILITYCODE')) { 
                $where .= ' AND d.facilitycode=:'.(sizeof($args)+1);
                array_push($args, $this->arg('FACILITYCODE'));
            }

            if ($this->has_arg('sid')) { 
                $where .= ' AND d.shippingid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));
            }

            if ($this->has_arg('current')) {
                $where .= ' AND (se.startdate > CURRENT_TIMESTAMP)';
            }

            if ($this->has_arg('ty')) {
                $bls_tmp = $this->_get_beamlines_from_type($this->arg('ty'));
                if (!empty($bls_tmp)) {
                    $bls = implode("', '", $bls_tmp);
                    $where .= " AND se.beamlinename IN ('$bls')";
                }
            }

            if ($this->has_arg('requestedimager')) {
                $where .= ' AND c.requestedimagerid IS NOT NULL';
            }

            if ($this->has_arg('firstexperimentdate')) {
                $where .= " AND DATE(se.startdate) = TO_DATE(:".(sizeof($args)+1).", 'DD-MM-YYYY')";
                array_push($args, $this->arg('firstexperimentdate'));
            }


            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(d.code) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(d.facilitycode) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(CONCAT(p.proposalcode, p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }

            $tot = $this->db->pq("SELECT count(distinct d.dewarid) as tot
              FROM dewar d 
              LEFT OUTER JOIN container c ON c.dewarid = d.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession se ON d.firstexperimentid = se.sessionid 
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'd.dewarid DESC';
            if ($this->has_arg('sort_by')) {
                $cols = array('FIRSTEXPERIMENTST' => 'se.startdate');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $dewars = $this->db->paginate("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number) as firstexperiment, r.labcontactid, se.beamlineoperator as localcontact, se.beamlinename, TO_CHAR(se.startdate, 'HH24:MI DD-MM-YYYY') as firstexperimentst, d.firstexperimentid, s.shippingid, s.shippingname, d.facilitycode, count(c.containerid) as ccount, (case when se.visit_number > 0 then (CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number)) else '' end) as exp, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron, s.deliveryagent_agentname, d.weight, d.deliveryagent_barcode, GROUP_CONCAT(c.code SEPARATOR ', ') as containers, s.sendinglabcontactid, s.returnlabcontactid
              FROM dewar d 
              LEFT OUTER JOIN container c ON c.dewarid = d.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession se ON d.firstexperimentid = se.sessionid 
              LEFT OUTER JOIN dewarregistry r ON r.facilitycode = d.facilitycode
              WHERE $where 
              GROUP BY CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number), r.labcontactid, se.beamlineoperator, TO_CHAR(se.startdate, 'HH24:MI DD-MM-YYYY'), (case when se.visit_number > 0 then (CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), se.visit_number)) else '' end),s.shippingid, s.shippingname, d.code, d.barcode, d.storagelocation, d.dewarstatus, d.dewarid,  d.trackingnumbertosynchrotron, d.trackingnumberfromsynchrotron, d.facilitycode, d.firstexperimentid
              ORDER BY $order", $args);
            
            if ($this->has_arg('did')) {
                if (sizeof($dewars)) $this->_output($dewars[0]);
                else $this->_error('No such dewar');
            } else $this->_output(array('total' => $tot, 'data' => $dewars));
            
        }
        
        # ------------------------------------------------------------------------
        # Add a dewar to a shipment
        function _add_dewar() {
            global $dewar_weight;
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('SHIPPINGID')) $this->_error('No shipping id specified');
            if (!$this->has_arg('CODE')) $this->_error('No dewar name specified');
            
            $ship = $this->db->pq("SELECT s.shippingid 
              FROM shipping s 
              WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('SHIPPINGID')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            
            $to = $this->has_arg('TRACKINGNUMBERTOSYNCHROTRON') ? $this->arg('TRACKINGNUMBERTOSYNCHROTRON') : '';
            $from = $this->has_arg('TRACKINGNUMBERFROMSYNCHROTRON') ? $this->arg('TRACKINGNUMBERFROMSYNCHROTRON') : '';
            $fc = $this->has_arg('FACILITYCODE') ? $this->arg('FACILITYCODE') : '';
            $wg = $this->has_arg('WEIGHT') ? $this->arg('WEIGHT') : $dewar_weight;
            $exp = null;

            if ($this->has_arg('FIRSTEXPERIMENTID')) {
                $experimentId = $this->arg('FIRSTEXPERIMENTID');
                $exp = !empty($experimentId) ? $this->arg('FIRSTEXPERIMENTID') : NULL;
            }
            
            $this->db->pq("INSERT INTO dewar (dewarid,code,trackingnumbertosynchrotron,trackingnumberfromsynchrotron,shippingid,bltimestamp,dewarstatus,firstexperimentid,facilitycode,weight) 
              VALUES (s_dewar.nextval,:1,:2,:3,:4,CURRENT_TIMESTAMP,'opened',:5,:6,:7) RETURNING dewarid INTO :id", 
              array($this->arg('CODE'), $to, $from, $this->arg('SHIPPINGID'), $exp, $fc,$wg));
            
            $id = $this->db->id();
            
            # Need to generate barcode
            $vis = '';
            if ($exp) {
                $vr = $this->db->pq("SELECT s.beamlinename as bl,s.visit_number as vis FROM blsession s WHERE s.sessionid=:1", array($exp));
                if (sizeof($vr)) $vis = '-'.$vr[0]['VIS'].'-'.$vr[0]['BL'];
            }
            
            $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($this->arg('prop').$vis.'-'.str_pad($id,7,'0',STR_PAD_LEFT), $id));
            
            $this->_output(array('DEWARID' => $id));
        }
        

        
        
        # Update shipment
        function _update_shipment() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT s.shippingid FROM shipping s WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            
            $fields = array('SHIPPINGNAME', 'SAFETYLEVEL', 'COMMENTS', 'DELIVERYAGENT_AGENTNAME', 'DELIVERYAGENT_AGENTCODE', 'DELIVERYAGENT_SHIPPINGDATE', 'DELIVERYAGENT_DELIVERYDATE', 'SENDINGLABCONTACTID', 'RETURNLABCONTACTID', 'READYBYTIME', 'CLOSETIME', 'PHYSICALLOCATION');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $fl = ':1';
                    if (in_array($f, array('DELIVERYAGENT_DELIVERYDATE', 'DELIVERYAGENT_SHIPPINGDATE'))) {
                        $fl = "TO_DATE(:1, 'DD-MM-YYYY')"; 
                    }

                    $this->db->pq("UPDATE shipping SET $f=$fl WHERE shippingid=:2", array($this->arg($f), $this->arg('sid')));

                    $lcf = array('SENDINGLABCONTACTID' => 'LCOUT', 'RETURNLABCONTACTID' => 'LCRET');
                    if (array_key_exists($f, $lcf)) {
                        $lc = $this->db->pq('SELECT cardname FROM labcontact WHERE labcontactid=:1', array($this->arg($f)));
                        if (sizeof($lc)) {
                            $this->_output(array($lcf[$f] => $lc[0]['CARDNAME']));
                        }

                    } else $this->_output(array($f => $this->arg($f)));

                }
            }

        }
        
        
        # Update dewar in shipment
        function _update_dewar() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('did')) $this->_error('No dewar id specified');

            $dewar = $this->db->pq("SELECT d.dewarid,d.shippingid FROM dewar d
              INNER JOIN shipping s ON d.shippingid = s.shippingid
              WHERE s.proposalid = :1 AND d.dewarid = :2", array($this->proposalid,$this->arg('did')));

            if (!sizeof($dewar)) $this->_error('No such dewar');

            if ($this->has_arg('FIRSTEXPERIMENTID')) {
                $experimentId = $this->arg('FIRSTEXPERIMENTID');
                $sessionId = !empty($experimentId) ? $this->arg('FIRSTEXPERIMENTID') : NULL;
                $chk = $this->db->pq("SELECT 1 FROM shippinghassession WHERE shippingid=:1 AND sessionid=:2", array($dewar[0]['SHIPPINGID'], $this->arg('FIRSTEXPERIMENTID')));

                if (!sizeof($chk) && !is_null($sessionId)) {
                    $this->db->pq("INSERT INTO shippinghassession (shippingid, sessionid)  VALUES (:1,:2)", array($dewar[0]['SHIPPINGID'], $this->arg('FIRSTEXPERIMENTID')));
                }
            }

            $fields = array('CODE', 'TRACKINGNUMBERTOSYNCHROTRON', 'TRACKINGNUMBERFROMSYNCHROTRON', 'FIRSTEXPERIMENTID', 'FACILITYCODE', 'WEIGHT');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    if ($f === 'FIRSTEXPERIMENTID') {
                        $experimentId = $this->arg('FIRSTEXPERIMENTID');
                        $sessionId = !empty($experimentId) ? $this->arg('FIRSTEXPERIMENTID') : NULL;
                        $this->db->pq("UPDATE dewar SET $f=:1 WHERE dewarid=:2", array($sessionId, $this->arg('did')));

                        $visit = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit
                          FROM blsession s
                          INNER JOIN proposal p ON p.proposalid = s.proposalid
                          WHERE s.sessionid=:1", array($sessionId));

                        if (sizeof($visit)) {
                            $this->_output(array($f => $sessionId, 'EXP' => $visit[0]['VISIT']));
                        } else {
                            $this->_output(1);
                        }
                    } else {
                        $this->db->pq("UPDATE dewar SET $f=:1 WHERE dewarid=:2", array($this->arg($f), $this->arg('did')));
                        $this->_output(array($f => $this->arg($f)));
                    }

                }
            }
        }
        /*
        * Added for Logistics App. Stores basic info about state of the dewar via comments.
        * No user is logged in hence this is provided as extra end point.
        * Once authentication/authorization is moved into separate service merge this with other patch request.
        */        
        function _update_dewar_comments() {
            if (!$this->has_arg('did')) $this->_error('No dewar specified');
            if (!$this->has_arg('COMMENTS')) $this->_error('No dewar comments specified');

            $dewars = $this->db->pq("SELECT d.dewarid
              FROM dewar d
              WHERE d.dewarid = :1", array($this->arg('did')));

            if (!sizeof($dewars)) $this->_error('Dewar ' . $this->arg('did') . ' not found', 404);

            $dewar = $dewars[0];

            $this->db->pq("UPDATE dewar set comments=:2 WHERE dewarid=:1", array($dewar['DEWARID'], $this->arg('COMMENTS')));

            $this->_output(array('DEWARID' => $dewar['DEWARID']));
        }

        
        # Update shipping status to sent, email for CL3
        function _send_shipment() {
            global $cl3_email;
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, s.safetylevel, s.shippingid, s.deliveryagent_agentname, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as shippingdate, TO_CHAR(s.deliveryagent_deliverydate, 'DD-MM-YYYY') as deliverydate, s.shippingname, s.comments, c.cardname as lcout FROM shipping s INNER JOIN proposal p ON s.proposalid = p.proposalid LEFT OUTER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid WHERE p.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];
            
            $this->db->pq("UPDATE shipping SET shippingstatus='sent to facility' where shippingid=:1", array($ship['SHIPPINGID']));
            $this->db->pq("UPDATE dewar SET dewarstatus='sent to facility' where shippingid=:1", array($ship['SHIPPINGID']));
            
            $dewars = $this->db->pq("SELECT d.dewarid, s.visit_number as vn, s.beamlinename as bl, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as startdate 
              FROM dewar d 
              LEFT OUTER JOIN blsession s ON s.sessionid = d.firstexperimentid 
              WHERE d.shippingid=:1", array($ship['SHIPPINGID']));
            foreach ($dewars as $d) {
                $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,arrivaldate) 
                  VALUES (s_dewartransporthistory.nextval,:1,'sent to facility',CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
                  array($d['DEWARID']));
            }

            # Send email if CL3
            if ($ship['SAFETYLEVEL'] == 'Red') {
                $exps = array();
                foreach ($dewars as $d) {
                    array_push($exps, $ship['PROP'].'-'.$d['VN'].' on '.$d['BL'].' starting '.$d['STARTDATE']);
                }
                $ship['EXPS'] = $exps;
                
                $email = new Email('dewar-redexp', '*** RED safety level shipment sent for '.$ship['PROP'].' ***');
                $email->data = $ship;
                $email->send($cl3_email);
            }
            
            $this->_output(1);
            
        }
        
        
        # Show and accept terms to use diamonds shipping account
        function _get_terms() {
            global $dhl_terms;

            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipment specified');

            $terms = $this->db->pq("SELECT p.givenname, p.familyname, TO_CHAR(cta.timestamp, 'HH24:MI DD-MM-YYYY') as timestamp, 1 as accepted
                FROM couriertermsaccepted cta
                INNER JOIN person p ON p.personid = cta.personid
                WHERE cta.proposalid=:1 AND cta.shippingid=:2", array($this->proposalid, $this->arg('sid')));

            $terms_list = file_exists($dhl_terms) ? file_get_contents($dhl_terms) : '';
            if (sizeof($terms)) {
                $terms[0]['TERMS'] = $terms_list;
                $this->_output($terms[0]);
            } else {
                $this->_output(array('TERMS' => $terms_list));
            }
        }
        
        function _accept_terms() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipment specified');
            
            $this->db->pq("INSERT INTO couriertermsaccepted (couriertermsacceptedid,proposalid,personid,shippingid,timestamp) 
              VALUES (s_dhltermsaccepted.nextval, :1, :2, :3, CURRENT_TIMESTAMP)", array($this->proposalid, $this->user->personid, $this->arg('sid')));
            
            $this->_output(array('ACCEPTED' => 1));
        }

        
        # Check if a barcode exists
        function _check_container() {
            $cont = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, c.barcode 
              FROM container c
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = s.proposalid
              WHERE c.barcode=:1", array($this->arg('BARCODE')));

            if (!sizeof($cont)) $this->_error('Barcode not used');
            $this->_output($cont[0]);
        }



        function _get_all_containers() {
            //$this->db->set_debug(True);
            if (!$this->has_arg('prop') && !$this->has_arg('visit') && !$this->staff) $this->_error('No proposal specified');
            
            $having = '';
            
            if ($this->has_arg('visit')) {
                $join = " INNER JOIN blsession ses2 ON ses2.proposalid = p.proposalid";
                $args = array($this->arg('visit'));
                $where = "CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses2.visit_number) LIKE :1";

            } else if ($this->has_arg('all') && $this->staff) {
                $join = '';
                $args = array();
                $where = '1=1';

            } else {
                $join = '';
                $args = array($this->proposalid);
                $where = 'sh.proposalid=:1';
            }


            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'plate') {
                    $where .= " AND c.containertype NOT LIKE '%puck'";
                } else if ($this->arg('ty') == 'puck') {
                    $where .= " AND c.containertype LIKE '%puck'";
                } else if ($this->arg('ty') == 'imager') {
                    $where .= " AND c.imagerid IS NOT NULL";
                } else if ($this->arg('ty') == 'todispose') {
                    $where .= " AND c.imagerid IS NOT NULL";
                    $having .= " HAVING (TIMESTAMPDIFF('HOUR', min(ci.bltimestamp), CURRENT_TIMESTAMP)/24) > 42";
                } else if ($this->arg('ty') == 'queued') {
                    $where .= " AND cq.containerqueueid IS NOT NULL";
                } else if ($this->arg('ty') == 'completed') {
                    $where .= " AND cq2.completedtimestamp IS NOT NULL";
                    $this->args['sort_by'] = 'COMPLETEDTIMESTAMP';
                    $this->args['order'] = 'desc';
                } else if ($this->arg('ty') == 'processing') {
                    $where .= " AND c.containerstatus = 'processing'";
                } else if ($this->arg('ty') == 'subsamples') {
                    $having .= " HAVING COUNT(distinct ss.blsubsampleid) > 0";
                } 
            }


            if ($this->has_arg('PUCK')) {
                $where .= " AND c.containertype LIKE '%puck'";
            }

            
            if ($this->has_arg('did')) {
                $where .= ' AND d.dewarid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }
            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }

            if ($this->has_arg('pid')) {
                // $this->db->set_debug(True);
                $where .= ' AND pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
            }
            
            if ($this->has_arg('assigned')) {
                $where .= " AND d.dewarstatus LIKE 'processing' AND c.samplechangerlocation > 0";
            }
                
            if ($this->has_arg('bl')) {
                $where .= " AND c.beamlinelocation LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('unassigned')) {
                $where  .= " AND c.containerid NOT IN (SELECT c.containerid FROM container c INNER JOIN dewar d ON d.dewarid = c.dewarid WHERE d.dewarstatus LIKE 'processing' AND c.samplechangerlocation > 0 AND c.beamlinelocation=:".(sizeof($args)+1).")";
                
                array_push($args, $this->arg('unassigned'));
                $this->args['sort_by'] = 'SHIPPINGID';
                $this->args['order'] = 'desc';
            }

            if ($this->has_arg('imager')) {
                if ($this->arg('imager') == '1') $where .= ' AND c.imagerid IS NOT NULL';
                else $where .= ' AND c.imagerid IS NULL AND c.requestedimagerid IS NULL';
            }


            if ($this->has_arg('iid')) {
                $where .= ' AND c.imagerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('iid'));
            }

            if ($this->has_arg('CONTAINERREGISTRYID')) {
                $where .= ' AND c.containerregistryid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERREGISTRYID'));
            }

            if ($this->has_arg('currentuser')) {
                $where .= ' AND c.ownerid = :'.(sizeof($args)+1);
                array_push($args, $this->user->personid);
            }

            $tot = $this->db->pq("SELECT count(distinct c.containerid) as tot 
                FROM container c 
                INNER JOIN dewar d ON d.dewarid = c.dewarid 
                INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = sh.proposalid
                LEFT OUTER JOIN blsample s ON s.containerid = c.containerid 
                LEFT OUTER JOIN blsubsample ss ON s.blsampleid = ss.blsampleid AND ss.source='manual'
                LEFT OUTER JOIN crystal cr ON cr.crystalid = s.crystalid
                LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                LEFT OUTER JOIN containerinspection ci ON ci.containerid = c.containerid AND ci.state = 'Completed'
                LEFT OUTER JOIN containerqueue cq ON cq.containerid = c.containerid AND cq.completedtimestamp IS NULL
                LEFT OUTER JOIN containerqueue cq2 ON cq2.containerid = c.containerid AND cq2.completedtimestamp IS NOT NULL
                $join 
                WHERE $where
                $having", $args);
            $tot = sizeof($tot) ? intval($tot[0]['TOT']) : 0;
            
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(c.code) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(c.barcode) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }
            
            
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'c.bltimestamp DESC';

            if ($this->has_arg('ty')) {
                if ($this->arg('ty') == 'todispose') {
                    $order = 'c.requestedreturn DESC, age DESC';
                } 

                if ($this->arg('ty') == 'queued') {
                    $order = 'cq.containerqueueid ASC';
                }
            }
            
            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'c.code', 'DEWAR' => 'd.code', 'SHIPMENT' => 'sh.shippingname', 'SAMPLES' => 'count(s.blsampleid)', 'SHIPPINGID' =>'sh.shippingid', 'LASTINSPECTION' => 'max(ci.bltimestamp)', 'INSPECTIONS' => 'count(ci.containerinspectionid)',
                  'DCCOUNT' => 'COUNT(distinct dc.datacollectionid)', 'SUBSAMPLES' => 'count(distinct ss.blsubsampleid)',
                  'LASTQUEUECOMPLETED' => 'max(cq2.completedtimestamp)', 'QUEUEDTIMESTAMP' => 'max(cq.createdtimestamp)'
                  );
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            // $this->db->set_debug(True);
            $rows = $this->db->paginate("SELECT round(TIMESTAMPDIFF('HOUR', min(ci.bltimestamp), CURRENT_TIMESTAMP)/24,1) as age, case when count(ci2.containerinspectionid) > 1 then 0 else 1 end as allow_adhoc, sch.name as schedule, c.scheduleid, c.screenid, sc.name as screen, c.imagerid, i.temperature as temperature, i.name as imager, TO_CHAR(max(ci.bltimestamp), 'HH24:MI DD-MM-YYYY') as lastinspection, round(TIMESTAMPDIFF('HOUR', max(ci.bltimestamp), CURRENT_TIMESTAMP)/24,1) as lastinspectiondays, count(distinct ci.containerinspectionid) as inspections, CONCAT(p.proposalcode, p.proposalnumber) as prop, c.bltimestamp, c.samplechangerlocation, c.beamlinelocation, d.dewarstatus, c.containertype, c.capacity, c.containerstatus, c.containerid, c.code as name, d.code as dewar, sh.shippingname as shipment, d.dewarid, sh.shippingid, count(distinct s.blsampleid) as samples, cq.containerqueueid, TO_CHAR(cq.createdtimestamp, 'DD-MM-YYYY HH24:MI') as queuedtimestamp, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses.visit_number) as visit, ses.beamlinename, c.requestedreturn, c.requestedimagerid, i2.name as requestedimager, c.comments, c.experimenttype, c.storagetemperature, c.barcode, reg.barcode as registry, reg.containerregistryid, 
                count(distinct ss.blsubsampleid) as subsamples, 
                ses3.beamlinename as firstexperimentbeamline,
                pp.name as pipeline,
                TO_CHAR(max(cq2.completedtimestamp), 'HH24:MI DD-MM-YYYY') as lastqueuecompleted, TIMESTAMPDIFF('MINUTE', max(cq2.completedtimestamp), max(cq2.createdtimestamp)) as lastqueuedwell,
                c.ownerid, CONCAT(pe.givenname, ' ', pe.familyname) as owner
                                  FROM container c 
                                  INNER JOIN dewar d ON d.dewarid = c.dewarid 
                                  LEFT OUTER JOIN blsession ses3 ON d.firstexperimentid = ses3.sessionid
                                  INNER JOIN shipping sh ON sh.shippingid = d.shippingid 
                                  INNER JOIN proposal p ON p.proposalid = sh.proposalid 
                                  LEFT OUTER JOIN blsample s ON s.containerid = c.containerid 
                                  LEFT OUTER JOIN blsubsample ss ON s.blsampleid = ss.blsampleid AND ss.source='manual'
                                  LEFT OUTER JOIN crystal cr ON cr.crystalid = s.crystalid
                                  LEFT OUTER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN containerinspection ci ON ci.containerid = c.containerid AND ci.state = 'Completed'
                                  LEFT OUTER JOIN imager i ON i.imagerid = c.imagerid
                                  LEFT OUTER JOIN imager i2 ON i2.imagerid = c.requestedimagerid
                                  LEFT OUTER JOIN screen sc ON sc.screenid = c.screenid
                                  LEFT OUTER JOIN schedule sch ON sch.scheduleid = c.scheduleid
                                  LEFT OUTER JOIN containerinspection ci2 ON ci2.containerid = c.containerid AND ci2.state != 'Completed' AND ci2.manual!=1 AND ci2.schedulecomponentid IS NULL
                                  LEFT OUTER JOIN containerqueue cq ON cq.containerid = c.containerid AND cq.completedtimestamp IS NULL
                                  LEFT OUTER JOIN containerqueue cq2 ON cq2.containerid = c.containerid AND cq2.completedtimestamp IS NOT NULL
                                  LEFT OUTER JOIN containerregistry reg ON reg.containerregistryid = c.containerregistryid

                                  LEFT OUTER JOIN blsession ses ON c.sessionid = ses.sessionid
                                  LEFT OUTER JOIN processingpipeline pp ON c.prioritypipelineid = pp.processingpipelineid
                                  LEFT OUTER JOIN person pe ON c.ownerid = pe.personid

                                  $join
                                  WHERE $where
                                  GROUP BY c.containerid
                                  $having
                                  ORDER BY $order", $args);

            if ($this->has_arg('cid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such container');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                                 ));   
        
        }
        
        

        function _queue_container() {
            if (!$this->has_arg('CONTAINERID')) $this->_error('No container specified');

            $chkc = $this->db->pq("SELECT c.containerid,c.containerstatus,c.containertype FROM container c
                INNER JOIN dewar d ON c.dewarid = d.dewarid 
                INNER JOIN shipping s ON s.shippingid = d.shippingid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE c.containerid=:1 AND p.proposalid=:2", array($this->arg('CONTAINERID'), $this->proposalid));
            
            if (!sizeof($chkc)) $this->_error('No such container');


            if ($this->has_arg('UNQUEUE')) {
                $chkq = $this->db->pq("SELECT containerqueueid FROM containerqueue WHERE containerid=:1 AND completedtimestamp IS NULL", array($this->arg('CONTAINERID')));
                if (!sizeof($chkq)) $this->_error('That container is not queued');

                $validRequest = false;

                if (stripos($chkc[0]['CONTAINERTYPE'], 'puck') !== false) {
                    // Then we are a puck type and we allow pucks to be unqueued at any time
                    $validRequest = true;
                } else {
                    if (in_array($chkc[0]['CONTAINERSTATUS'], array('in_storage', 'disposed', null))) {
                        $validRequest = true;
                    }
                }
                if (!$validRequest) {
                    $this->_error('Container is awaiting data collection and cannot be unqueued');
                }

                $cqid = $chkq[0]['CONTAINERQUEUEID'];

                $this->db->pq("UPDATE containerqueuesample SET containerqueueid = NULL WHERE containerqueueid=:1", array($cqid));
                $this->db->pq("DELETE FROM containerqueue WHERE containerqueueid=:1", array($cqid));
                $this->_output();

            } else {
                $chkq = $this->db->pq("SELECT containerid, containerqueueid FROM containerqueue WHERE containerid=:1 AND completedtimestamp IS NULL", array($this->arg('CONTAINERID')));
                if (!sizeof($chkq)) {
                    $this->db->pq("INSERT INTO containerqueue (containerid, personid) VALUES (:1, :2)", array($this->arg('CONTAINERID'), $this->user->personid));
                    $qid = $this->db->id();
                } else {
                    $qid = $chkq[0]['CONTAINERQUEUEID'];
                }


                $samples = $this->db->pq("SELECT ss.blsubsampleid, cqs.containerqueuesampleid FROM blsubsample ss
                  INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
                  INNER JOIN container c ON c.containerid = s.containerid
                  INNER JOIN dewar d ON d.dewarid = c.dewarid
                  INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                  INNER JOIN proposal p ON p.proposalid = sh.proposalid
                  INNER JOIN containerqueuesample cqs ON cqs.blsubsampleid = ss.blsubsampleid
                  WHERE p.proposalid=:1 AND c.containerid=:2 AND cqs.containerqueueid IS NULL AND ss.source='manual'", array($this->proposalid, $this->arg('CONTAINERID')));

                foreach ($samples as $s) {
                    $this->db->pq("UPDATE containerqueuesample SET containerqueueid=:1 WHERE containerqueuesampleid=:2", array($qid, $s['CONTAINERQUEUESAMPLEID']));
                }

                $this->_output(array('CONTAINERQUEUEID' => $qid));
            }
        }

        
        # Move Container
        function _move_container() {
            if (!$this->has_arg('cid')) $this->_error('No container specified');
            if (!$this->has_arg('did')) $this->_error('No dewar specified');
            
            $chkd = $this->db->pq("SELECT d.dewarid FROM dewar d INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE d.dewarid=:1 AND p.proposalid=:2", array($this->arg('did'), $this->proposalid));
            $chkc = $this->db->pq("SELECT c.containerid FROM container c INNER JOIN dewar d ON c.dewarid = d.dewarid INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE c.containerid=:1 AND p.proposalid=:2", array($this->arg('cid'), $this->proposalid));
            
            if (sizeof($chkd) && sizeof($chkc)) {
                $this->db->pq("UPDATE container SET dewarid=:1 WHERE containerid=:2", array($this->arg('did'), $this->arg('cid')));
                $this->_output(1);
            }
            
        }
        
        
        # Update Container
        function _update_container() {
            if (!$this->has_arg('cid')) $this->_error('No container specified');
            
            $where = 'c.containerid=:1';
            $args = array($this->arg('cid'));

            if (!$this->user->has('disp_cont')) {
                $where .= ' AND p.proposalid=:'.(sizeof($args)+1);
                array_push($args, $this->proposalid);
            }

            $chkc = $this->db->pq("SELECT c.containerid FROM container c INNER JOIN dewar d ON c.dewarid = d.dewarid INNER JOIN shipping s ON s.shippingid = d.shippingid INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
            
            if (!sizeof($chkc)) $this->_error('No such container');

            $fields = array('NAME' => 'CODE', 'REQUESTEDRETURN' => 'REQUESTEDRETURN', 'REQUESTEDIMAGERID' => 'REQUESTEDIMAGERID', 'COMMENTS' => 'COMMENTS', 'BARCODE' => 'BARCODE', 'CONTAINERTYPE' => 'CONTAINERTYPE', 'EXPERIMENTTYPE' => 'EXPERIMENTTYPE', 'STORAGETEMPERATURE' => 'STORAGETEMPERATURE', 'CONTAINERREGISTRYID' => 'CONTAINERREGISTRYID', 'PROCESSINGPIPELINEID' => 'PRIORITYPIPELINEID', 'OWNERID' => 'OWNERID');
            foreach ($fields as $k => $f) {
                if ($this->has_arg($k)) {
                    $this->db->pq("UPDATE container SET $f=:1 WHERE containerid=:2", array($this->arg($k), $this->arg('cid')));
                    $this->_output(array($k => $this->arg($k)));
                }
            }

            if ($this->user->has('disp_cont') && $this->has_arg('DISPOSE')) {
                $this->db->pq("UPDATE container SET imagerid=NULL,containerstatus='disposed' WHERE containerid=:1", array($this->arg('cid')));
                $this->db->pq("INSERT INTO containerhistory (containerid,status) VALUES (:1,'disposed')", array($this->arg('cid')));
                $this->_output(array('IMAGERID' => null));
            }
        }
        

        
        
        # Add container
        function _add_container() {
            if (!$this->has_arg('NAME')) $this->_error('No container name specified');
            if (!$this->has_arg('CONTAINERTYPE')) $this->_error('No container type specified');
            if (!$this->has_arg('DEWARID')) $this->_error('No dewar id specified');


            $cap = $this->has_arg('CAPACITY') ? $this->arg('CAPACITY') : 16;
            $sch = $this->has_arg('SCHEDULEID') ? $this->arg('SCHEDULEID') : null;
            $scr = $this->has_arg('SCREENID') ? $this->arg('SCREENID') : null;
            $own = $this->has_arg('PERSONID') ? $this->arg('PERSONID') : null;
            $rid = $this->has_arg('REQUESTEDIMAGERID') ? $this->arg('REQUESTEDIMAGERID') : null;
            $com = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : null;
            $bar = $this->has_arg('BARCODE') ? $this->arg('BARCODE') : null;
            $ext = $this->has_arg('EXPERIMENTTYPE') ? $this->arg('EXPERIMENTTYPE') : null;
            $tem = $this->has_arg('STORAGETEMPERATURE') ? $this->arg('STORAGETEMPERATURE') : null;

            $crid = $this->has_arg('CONTAINERREGISTRYID') ? $this->arg('CONTAINERREGISTRYID') : null;

            $pipeline = $this->has_arg('PROCESSINGPIPELINEID') ? $this->arg('PROCESSINGPIPELINEID') : null;

            $this->db->pq("INSERT INTO container (containerid,dewarid,code,bltimestamp,capacity,containertype,scheduleid,screenid,ownerid,requestedimagerid,comments,barcode,experimenttype,storagetemperature,containerregistryid,prioritypipelineid)
              VALUES (s_container.nextval,:1,:2,CURRENT_TIMESTAMP,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14) RETURNING containerid INTO :id",
              array($this->arg('DEWARID'), $this->arg('NAME'), $cap, $this->arg('CONTAINERTYPE'), $sch, $scr, $own, $rid, $com, $bar, $ext, $tem, $crid, $pipeline));

            $cid = $this->db->id();

            if ($this->has_arg('SCHEDULEID')) {
                $sh = new ImagingShared($this->db);
                $sh->_generate_schedule(array(
                    'CONTAINERID' => $cid,
                    'SCHEDULEID' => $this->arg('SCHEDULEID'),
                ));
            }

            if ($this->has_arg('AUTOMATED')) {
                $this->db->pq("INSERT INTO containerqueue (containerid, personid) VALUES (:1, :2)", array($cid, $this->user->personid));
            }

            $this->_output(array('CONTAINERID' => $cid));
        }




        function _container_history() {
            if (!$this->has_arg('cid') && !$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container specified');

            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';

            if ($this->has_arg('all') && ($this->bcr() || $this->staff)) {
                $args = array();
                $where = '1=1';
            }

            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            } else {
                $where .= ' AND c.containerregistryid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERREGISTRYID'));
            }

            $tot = $this->db->pq("SELECT count(h.containerhistoryid) as tot 
              FROM containerhistory h 
              INNER JOIN container c ON c.containerid = h.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid 
              INNER JOIN shipping s ON s.shippingid = d.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT h.containerhistoryid, s.shippingid, s.shippingname as shipment, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), b.visit_number) as visit, b.beamlinename as bl, b.beamlineoperator as localcontact, h.containerid, h.status,h.location,TO_CHAR(h.bltimestamp, 'DD-MM-YYYY HH24:MI') as bltimestamp, h.beamlinename
              FROM containerhistory h 
              INNER JOIN container c ON c.containerid = h.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid 
              INNER JOIN shipping s ON d.shippingid = s.shippingid 
              INNER JOIN proposal p ON p.proposalid = s.proposalid 
              LEFT OUTER JOIN blsession b ON b.sessionid = d.firstexperimentid
              WHERE $where ORDER BY h.bltimestamp DESC", $args);
            
            $this->_output(array('total' => $tot, 'data' => $rows));
        }


        /**
         * Controller method for add container history endpoint.
         * This is called from another service when the container is scanned into a location.
         * 
         * The calling application must be in the bcr whitelist group and include the CONTAINERID and LOCATION in the parameters
         * On success, a new entry in ContainerHistory is created with the location updated.
         * The ContainerHistory.status can be changed with the optional STATUS argument.
         * The ContainerHistory.beamlineName can be changed with the optional BEAMLINE argument.
         * It returns error if CONTAINERID does not refer to an existing container.
         */
        function _add_container_history() {
            if (!$this->bcr()) $this->_error('You need to be on the internal network to add history');

            if (!$this->has_arg('CONTAINERID') && !$this->has_arg('CODE')) $this->_error('No container id or code specified');
            if (!$this->has_arg('LOCATION')) $this->_error('No location specified');

            $where = '1=1';
            $args = array();

            if ($this->has_arg('CONTAINERID')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERID'));
            } else if ($this->has_arg('CODE')) {
                $where .= ' AND c.code=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CODE'));
            }

            $cont = $this->db->pq("SELECT c.containerid, d.dewarid, s.shippingid, d.dewarstatus
              FROM container c
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping s ON s.shippingid = d.shippingid
              WHERE $where ORDER BY c.containerid DESC", $args);

            if (!sizeof($cont)) $this->_error('No such container', 404);
            else $cont = $cont[0];

            // We may need to update the dewar and shipping status - for now leave them alone

            // Optionally we can set the beamlinename in ContainerHistory
            $beamline_name = $this->has_arg('BEAMLINENAME') ? $this->arg('BEAMLINENAME') : null;

            // Figure out the most recent status for this container
            // Initially use the dewar status unless its been set previously
            $container_status = strtolower($cont['DEWARSTATUS']);

            if ($this->has_arg('STATUS')) $container_status = $this->arg('STATUS');
            else {
                // Get last status for this container - we are only going to change its location
                $container_history = $this->db->pq("SELECT status FROM containerhistory WHERE containerid = :1 ORDER BY containerhistoryid DESC LIMIT 1", array($cont['CONTAINERID']));

                if (sizeof($container_history)) $container_status = $container_history[0]['STATUS'];
            }

            // Insert new record to store container location
            $this->db->pq("INSERT INTO containerhistory (containerid,status,location,beamlinename) VALUES (:1,:2,:3,:4)", array($cont['CONTAINERID'], $container_status, $this->arg('LOCATION'), $beamline_name));
            $chid = $this->db->id();

            // Update the container beamlinelocation so we can filter out duplicate container history entries
            $this->db->pq("UPDATE container SET beamlinelocation=:1 WHERE containerid=:2", array($this->arg('LOCATION'), $cont['CONTAINERID']));

            $this->_output(array('CONTAINERHISTORYID' => $chid));
        }

        function _get_container_types() {
            $where = '';
            // By default only return active container types.
            // If all param set return everything
            if ($this->has_arg('all')) {
                $where .= '1=1';
            } else {
                $where .= 'ct.active = 1';
            }
            $rows = $this->db->pq("SELECT ct.containerTypeId, name, ct.proposalType, ct.capacity, ct.wellPerRow, ct.dropPerWellX, ct.dropPerWellY, ct.dropHeight, ct.dropWidth, ct.wellDrop FROM ContainerType ct WHERE $where");
            $this->_output(array('total' => count($rows), 'data' => $rows));
        }

        function _container_registry() {
            $args = array($this->proposalid);
            $where = 'p.proposalid=:1';

            if ($this->has_arg('all') && $this->staff) {
                $args = array();
                $where = '1=1';
            }

            if ($this->has_arg('CONTAINERREGISTRYID')) {
                $where .= ' AND r.containerregistryid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CONTAINERREGISTRYID'));
            }

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(r.barcode) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(r.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(CONCAT(p.proposalcode,p.proposalnumber)) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
                array_push($args, $this->arg('s'));
            }

            if ($this->has_arg('t')) {
                if ($this->arg('t') == 'orphan') $where .= " AND rhp.containerregistryid IS NULL";
            }


            $tot = $this->db->pq("SELECT count(r.containerregistryid) as tot 
              FROM containerregistry r 
              LEFT OUTER JOIN containerregistry_has_proposal rhp on rhp.containerregistryid = r.containerregistryid
              LEFT OUTER JOIN proposal p ON p.proposalid = rhp.proposalid 
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $order = 'r.barcode';
            if ($this->has_arg('sort_by')) {
                $cols = array(
                  'BARCODE' => 'r.barcode', 'INSTANCES' => 'count(distinct c.containerid)', 
                  'LASTUSE' => 'max(c.bltimestamp)', 'RECORDTIMESTAMP' => 'r.recordtimestamp',
                  'REPORTS' => 'count(cr.containerreportid)'
                );
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }

            $rows = $this->db->paginate("SELECT r.containerregistryid, r.barcode, GROUP_CONCAT(distinct CONCAT(p.proposalcode,p.proposalnumber) SEPARATOR ', ') as proposals, count(distinct c.containerid) as instances, TO_CHAR(r.recordtimestamp, 'DD-MM-YYYY') as recordtimestamp, 
              TO_CHAR(max(c.bltimestamp),'DD-MM-YYYY') as lastuse, max(CONCAT(p.proposalcode,p.proposalnumber)) as prop, r.comments, COUNT(distinct cr.containerreportid) as reports
              FROM containerregistry r 
              LEFT OUTER JOIN containerregistry_has_proposal rhp on rhp.containerregistryid = r.containerregistryid
              LEFT OUTER JOIN proposal p ON p.proposalid = rhp.proposalid 
              LEFT OUTER JOIN container c ON c.containerregistryid = r.containerregistryid
              LEFT OUTER JOIN containerreport cr ON cr.containerregistryid = r.containerregistryid

              WHERE $where 
              GROUP BY r.containerregistryid

              ORDER BY $order", $args);
            
            if ($this->has_arg('CONTAINERREGISTRYID')) {
                if (sizeof($rows)) $this->_output($rows[0]);
                else $this->_error('No such container');

            } else  $this->_output(array('total' => $tot, 'data' => $rows));
        }


        function _add_container_registry() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('BARCODE')) $this->_error('No barcode specified');

            $chk = $this->db->pq("SELECT containerregistryid 
              FROM containerregistry 
              WHERE lower(barcode) LIKE lower(:1)", array($this->arg('BARCODE')));

            if (sizeof($chk)) $this->_error('That barcode is already registered');

            $com = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : '';

            $this->db->pq("INSERT INTO containerregistry (barcode,comments) VALUES (:1,:2)", array($this->arg('BARCODE'), $com));
            $this->_output(array('CONTAINERREGISTRYID' => $this->db->id()));
        }


        function _update_container_registry() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container id specified');
            
            $fields = array('COMMENTS');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE containerregistry SET $f=:1 WHERE containerregistryid=:2", array($this->arg($f), $this->arg('CONTAINERREGISTRYID')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }



        function _get_prop_container() {
            if (!$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container specified');

            $rows = $this->db->pq("SELECT crhp.containerregistryhasproposalid,crhp.containerregistryid,crhp.proposalid,CONCAT(p.proposalcode, p.proposalnumber) as proposal
              FROM containerregistry_has_proposal crhp
              INNER JOIN proposal p ON p.proposalid = crhp.proposalid
              WHERE crhp.containerregistryid = :1", array($this->arg('CONTAINERREGISTRYID')));

            $this->_output($rows);
        }

        function _add_prop_container() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container specified');
            if (!$this->has_arg('PROPOSALID')) $this->_error('No proposal specified');

            $chk = $this->db->pq("SELECT containerregistryid FROM containerregistry_has_proposal
              WHERE containerregistryid = :1 AND proposalid = :2", array($this->arg('CONTAINERREGISTRYID'), $this->arg('PROPOSALID')));
            if (sizeof($chk)) $this->_error('That container is already registered to that proposal');

            $this->db->pq("INSERT INTO containerregistry_has_proposal (containerregistryid,proposalid,personid) 
              VALUES (:1,:2,:3)", array($this->arg('CONTAINERREGISTRYID'), $this->arg('PROPOSALID'), $this->user->personid));

            $this->_output(array('CONTAINERREGISTRYHASPROPOSALID' => $this->db->id()));

        }

        function _rem_prop_container() {
            if (!$this->staff) $this->_error('No access');
            if (!$this->has_arg('CONTAINERREGISTRYHASPROPOSALID')) $this->_error('No container proposal specified');

            $this->db->pq("DELETE FROM containerregistry_has_proposal WHERE containerregistryhasproposalid=:1", array($this->arg('CONTAINERREGISTRYHASPROPOSALID')));
        }


        function _get_container_reports() {
            if (!$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container specified');

            $where = 'r.containerregistryid=:1';
            $args = array($this->arg('CONTAINERREGISTRYID'));

            $tot = $this->db->pq("SELECT count(r.containerregistryid) as tot 
              FROM containerreport r
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $pg = $this->has_arg('page') ? $this->arg('page')-1 : 0;
            $start = $pg*$pp;
            $end = $pg*$pp+$pp;
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT r.containerreportid, r.report, TO_CHAR(r.recordtimestamp, 'HH24:MI DD-MM-YYYY') as recordtimestamp, IF(r.attachmentfilepath IS NOT NULL,1,0) as attachment, CONCAT(p.givenname, ' ', p.familyname) as reporter
                FROM containerreport r
                INNER JOIN person p ON p.personid = r.personid
              WHERE $where ORDER BY r.recordtimestamp DESC", $args);

            foreach ($rows as $i => &$row) {
              $row['REPORT'] = $this->db->read($row['REPORT']);
            }

            $this->_output(array('total' => $tot, 'data' => $rows));
        }

        function _add_container_report() {
            if (!$this->has_arg('REPORT')) $this->_error('No report specified');
            if (!$this->has_arg('CONTAINERREGISTRYID')) $this->_error('No container specified');

            $last_visits = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'YYYY') as year, s.beamlinename, s.beamlineoperator as localcontact, pe.emailaddress, r.containerregistryid, r.barcode, CONCAT(p.proposalcode, p.proposalnumber) as prop
              FROM containerregistry r
              INNER JOIN container c ON c.containerregistryid = r.containerregistryid
              LEFT OUTER JOIN person pe ON pe.personid = c.ownerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN blsession s ON d.firstexperimentid = s.sessionid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE r.containerregistryid = :1
              ORDER BY c.containerid DESC
              LIMIT 1", array($this->arg('CONTAINERREGISTRYID')));

            if (!sizeof($last_visits)) $this->_error('Cant find a visit for that container');
            else $lv = $last_visits[0];

            $path = null;
            if (array_key_exists('ATTACHMENT', $_FILES)) {
                if ($_FILES['ATTACHMENT']['name']) {
                    $info = pathinfo($_FILES['ATTACHMENT']['name']);

                    if ($info['extension'] == 'jpg' || $info['extension'] == 'jpeg') {
                        # dls_mxweb cant write to visits...
                        #$root = '/dls/'.$lv['BEAMLINENAME'].'/data/'.$lv['YEAR'].'/'.$lv['VISIT'].'/.ispyb/';

                        $root = '/dls_sw/dasc/ispyb2/uploads/'.$lv['YEAR'].'/'.$lv['VISIT'].'/';
                        if (!is_dir($root)) {
                            mkdir($root, 0755, true);
                        }

                        $file = strftime('%Y-%m-%d_%H%M').'containerreport.jpg';
                        $path = $root.$file;

                        move_uploaded_file($_FILES['ATTACHMENT']['tmp_name'], $path);
                    }
                }
            }

            $this->db->pq("INSERT INTO containerreport (containerregistryid,report,attachmentfilepath,personid,recordtimestamp) VALUES (:1,:2,:3,:4,CURRENT_TIMESTAMP)", 
            array($this->arg('CONTAINERREGISTRYID'), $this->arg('REPORT'), $path, $this->user->personid));
            if ($lv['EMAILADDRESS']) {
                $recpts = array($lv['EMAILADDRESS']);
                $local = $this->_get_email_fn($lv['LOCALCONTACT']);
                if ($local) array_push($recpts, $local);

                $lv['NOW'] = strftime('%d-%m-%Y %H:%M');
                $lv['REPORT'] = $this->arg('REPORT');
                $email = new Email('container-report', '*** Status Report for Container '.$lv['BARCODE'].' at '.$lv['NOW'].' ***');
                $email->data = $lv;
                $email->send(implode(', ', $recpts));
            }


            $this->_output(array('CONTAINERREPORTID' => $this->db->id()));
        }




        
        
        # Cache form temporary data to session
        function _session_cache() {
            $data = array_key_exists('data', $this->request) ? $this->request['data'] : null;
            if (!$this->has_arg('name') || !$data) $this->_error('No key and data specified');

            $this->user->set_cache($this->arg('name'), $data);
            $this->_output(array('data' => $data));
        }
        
        
        function _get_session_cache() {
            if (!$this->has_arg('name')) $this->_error('No key specified');
            $this->_output($this->user->cache($this->arg('name')));
        }
        
        
        # Ajax shipment registration
        function _add_shipment() {
            global $dewar_weight;
            if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'Please select a proposal first');
        
            if (!$this->has_arg('SHIPPINGNAME')) $this->_error('No shipment name specified', 'Please specify a shipment name');
            
            $an = $this->has_arg('DELIVERYAGENT_AGENTNAME') ? $this->arg('DELIVERYAGENT_AGENTNAME') : '';
            $ac = $this->has_arg('DELIVERYAGENT_AGENTCODE') ? $this->arg('DELIVERYAGENT_AGENTCODE') : '';

            $sd = $this->has_arg('DELIVERYAGENT_SHIPPINGDATE') ? $this->arg('DELIVERYAGENT_SHIPPINGDATE') : '';
            $dd = $this->has_arg('DELIVERYAGENT_DELIVERYDATE') ? $this->arg('DELIVERYAGENT_DELIVERYDATE') : '';
            $com = $this->has_arg('COMMENTS') ? $this->arg('COMMENTS') : '';

            $rt = $this->has_arg('READYBYTIME') ? $this->arg('READYBYTIME') : null;
            $ct = $this->has_arg('CLOSETIME') ? $this->arg('CLOSETIME') : null;
            $loc = $this->has_arg('PHYSICALLOCATION') ? $this->arg('PHYSICALLOCATION') : null;

            
            $this->db->pq("INSERT INTO shipping (shippingid, proposalid, shippingname, deliveryagent_agentname, deliveryagent_agentcode, deliveryagent_shippingdate, deliveryagent_deliverydate, bltimestamp, creationdate, comments, sendinglabcontactid, returnlabcontactid, shippingstatus, safetylevel, readybytime, closetime, physicallocation) 
              VALUES (s_shipping.nextval,:1,:2,:3,:4,TO_DATE(:5,'DD-MM-YYYY'), TO_DATE(:6,'DD-MM-YYYY'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,:7,:8,:9,'opened',:10, :11, :12, :13) RETURNING shippingid INTO :id", 
              array($this->proposalid, $this->arg('SHIPPINGNAME'), $an, $ac, $sd, $dd, $com, $this->arg('SENDINGLABCONTACTID'), $this->arg('RETURNLABCONTACTID'), $this->arg('SAFETYLEVEL'), $rt, $ct, $loc));
            
            $sid = $this->db->id();
            
            if ($this->has_arg('DEWARS')) {
                if ($this->arg('DEWARS') > 0) {
                    $exp = $this->has_arg('FIRSTEXPERIMENTID') ? $this->arg('FIRSTEXPERIMENTID') : null;

                    if ($exp) {
                        $this->db->pq("INSERT INTO shippinghassession (shippingid, sessionid) 
                            VALUES (:1,:2)", array($sid, $exp));
                    }
                    
                    $fcs = $this->arg('FCODES');
                    for ($i = 0; $i < $this->arg('DEWARS'); $i++) {
                        $fc = $i < sizeof($this->arg('FCODES')) ? $fcs[$i] : ''; 
                        $n = $fc ? $fc : ('Dewar'.($i+1));
                        
                        $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus,firstexperimentid,facilitycode,weight) 
                          VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'opened',:3,:4,$dewar_weight) RETURNING dewarid INTO :id", 
                          array($n, $sid, $exp, $fc));
                        
                        $id = $this->db->id();
                        
                        $vis = '';
                        if ($exp) {
                            $vr = $this->db->pq("SELECT s.beamlinename as bl,s.visit_number as vis FROM blsession s WHERE s.sessionid=:1", array($exp));
                            if (sizeof($vr)) $vis = '-'.$vr[0]['VIS'].'-'.$vr[0]['BL'];
                        }
                        
                        $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($this->arg('prop').$vis.'-'.str_pad($id,7,'0',STR_PAD_LEFT), $id));
                    }
                }
            }
            
            $this->_output(array('SHIPPINGID' => $sid));
        }

        function _get_default_dewar() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified');
            
            $sids = $this->db->pq("SELECT s.sessionid FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1 AND p.proposalid=:2", array($this->arg('visit'), $this->proposalid));
            
            if (!sizeof($sids)) $this->_error('No such visit');
            else $sid = $sids[0]['SESSIONID'];
            
            
            $shids = $this->db->pq("SELECT shippingid FROM shipping WHERE proposalid LIKE :1 AND shippingname LIKE :2", array($this->proposalid, $this->arg('visit').'_Shipment1'));
            
            if (sizeof($shids) > 0) {
                $shid = $shids[0]['SHIPPINGID'];
            } else {
                $this->db->pq("INSERT INTO shipping (shippingid,proposalid,shippingname,bltimestamp,creationdate,shippingstatus) VALUES (s_shipping.nextval,:1,:2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'processing') RETURNING shippingid INTO :id", array($this->proposalid, $this->arg('visit').'_Shipment1'));
                
                $shid = $this->db->id();
                
                $vals = $this->db->pq("INSERT INTO shippinghassession (shippingid,sessionid) VALUES (:1,:2)", array($shid, $sid));
                
            }
            
            $did = -1;
            if ($sid) {
                $dids = $this->db->pq("SELECT dewarid from dewar WHERE shippingid LIKE :1 AND code LIKE :2", array($shid, $this->arg('visit').'_Dewar1'));
                
                if (sizeof($dids) > 0) {
                    $did = $dids[0]['DEWARID'];
                    
                } else {
                    $this->db->pq("INSERT INTO dewar (dewarid,code,shippingid,bltimestamp,dewarstatus,firstexperimentid) VALUES (s_dewar.nextval,:1,:2,CURRENT_TIMESTAMP,'processing',:3) RETURNING dewarid INTO :id", array($this->arg('visit').'_Dewar1', $shid, $sid));
                    
                    $did = $this->db->id();

                    # Need to generate barcode
                    $bl = $this->db->pq("SELECT s.beamlinename as bl FROM blsession s WHERE s.sessionid=:1", array($sid));
                    $this->db->pq("UPDATE dewar set barcode=:1 WHERE dewarid=:2", array($this->arg('visit').'-'.$bl[0]['BL'].'-'.str_pad($did,7,'0',STR_PAD_LEFT), $did));
                }
            }
            
            if ($did == -1) $this->_error('Couldn\'t create default dewar');
            $this->_output($did);
        }


        function _create_awb() {
            global $dhl_service, $dhl_service_eu, $dhl_acc, $dhl_acc_import, $facility_courier_countries, $facility_courier_countries_nde;

            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');

            if (!$this->has_arg('DECLAREDVALUE')) $this->_error('No delcared value specified');
            if (!$this->has_arg('DESCRIPTION')) $this->_error('No description specified');
            if (!$this->has_arg('DEWARS')) $this->_error('No dewars specified');
            if (!is_array($this->arg('DEWARS'))) $this->_error('No dewars specified');
            
            $ship = $this->db->pq("SELECT s.shippingid,s.sendinglabcontactid,s.returnlabcontactid, s.deliveryagent_agentcode, s.deliveryagent_flightcode, TO_CHAR(s.deliveryagent_shippingdate, 'YYYY-MM-DD') as deliveryagent_shippingdate, s.deliveryagent_pickupconfirmation, TO_CHAR(s.readybytime, 'HH24:MI') as readybytime, TO_CHAR(s.closetime, 'HH24:MI') as closetime, s.physicallocation, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.shippingname
                FROM shipping s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];

            $ids = range(2,sizeof($this->arg('DEWARS'))+1);
            $args = array_merge(array($ship['SHIPPINGID']), $this->arg('DEWARS'));
            $dewars = $this->db->pq("SELECT d.dewarid, d.weight, IF(d.facilitycode, d.facilitycode, d.code) as name
                FROM dewar d
                WHERE d.shippingid=:1 AND d.dewarid IN (:".implode(',:', $ids).")", $args);

            $terms = $this->db->pq("SELECT cta.couriertermsacceptedid
                FROM couriertermsaccepted cta
                INNER JOIN person p ON p.personid = cta.personid
                WHERE cta.proposalid=:1 AND cta.shippingid=:2", array($this->proposalid, $ship['SHIPPINGID']));
            $terms = sizeof($terms) ? true : false;

            $cont = $this->db->pq("SELECT p.givenname, p.familyname, p.phonenumber, p.emailaddress, l.name, l.address, l.city, l.country, l.postcode
                FROM labcontact c 
                INNER JOIN person p ON p.personid = c.personid 
                INNER JOIN laboratory l ON l.laboratoryid = p.laboratoryid 
                WHERE c.labcontactid=:1 and c.proposalid=:2", array($this->has_arg('RETURN') ? $ship['RETURNLABCONTACTID'] : $ship['SENDINGLABCONTACTID'], $this->proposalid));

            if (!sizeof($cont)) $this->_error('No such lab contact');
            $cont = $cont[0];
            
            if (in_array($cont['COUNTRY'], $facility_courier_countries) && $terms) {
                $accno = $dhl_acc;
                $payee = 'R';
                $product =  $dhl_service;
            } else if (in_array($cont['COUNTRY'], $facility_courier_countries_nde) && $terms) {
                $accno = $dhl_acc_import;
                $payee = 'R';
                $product =  $dhl_service_eu;
            } else {
                $accno = $ship['DELIVERYAGENT_AGENTCODE'];
                $payee = 'S';

                if (!$this->has_arg('PRODUCTCODE')) $this->_error('No product code specified');
                $product = $this->arg('PRODUCTCODE');
            }
            // Catch programmatic use of awb - suspend international shipments
            // facility_courier_countries is an array containing United Kingdom
            if (!in_array($cont['COUNTRY'], $facility_courier_countries)) {
                $this->_error('International shipment bookings currently suspended. Please see MX manual for instructions');
            }
            if ($this->has_arg('RETURN')) {
                $accno = $ship['DELIVERYAGENT_AGENTCODE'];
                $payee = 'R';
            }

            $user = array(
                'company' => $cont['NAME'],
                'address' => $cont['ADDRESS'],
                'city' => $cont['CITY'],
                'postcode' => $cont['POSTCODE'],
                'country' => $cont['COUNTRY'],
                'name' => $cont['GIVENNAME'].' '.$cont['FAMILYNAME'],
                'phone' => $cont['PHONENUMBER'],
                'email' => $cont['EMAILADDRESS'],
            );

            global $facility_company, $facility_address, $facility_city, $facility_postcode, $facility_country, $facility_contact, $facility_phone, $facility_email;
            $facility = array(
                'company' => $facility_company,
                'address' => $facility_address,
                'city' => $facility_city,
                'postcode' => $facility_postcode,
                'country' => $facility_country,
                'name' => $facility_contact,
                'phone' => $facility_phone,
                'email' => $facility_email,
            );

            $pieces = array();
            $totalweight = 0;
            $names = array();
            foreach ($dewars as $d) {
                array_push($pieces, array(
                    'weight' => $d['WEIGHT'],
                    'width' => 40,
                    'height' => 60,
                    'depth' => 40,
                ));
                $totalweight += $d['WEIGHT'];
                array_push($names, $d['NAME']);
            }

            $emails = array($cont['EMAILADDRESS']);
            global $shipbooked_email;
            array_push($emails, str_replace(',', ';', $shipbooked_email));

            $awb = null;
            if (!$ship['DELIVERYAGENT_FLIGHTCODE']) {
                try {
                    $awb = $this->dhl->create_awb(array(
                        'payee' => $payee,
                        'accountnumber' => $accno,
                        'service' => $product,
                        'date' => $ship['DELIVERYAGENT_SHIPPINGDATE'],
                        'declaredvalue' => $this->arg('DECLAREDVALUE'),
                        'description' => $this->arg('DESCRIPTION'),

                        'sender' => $this->has_arg('RETURN') ? $facility : $user,
                        'receiver' => $this->has_arg('RETURN') ? $user : $facility,

                        'pieces' => $pieces,
                        'notification' => implode(';', $emails),
                        'message' => $facility_company.': Shipment booked from ISPyB for '.$ship['PROP'].' '.$ship['SHIPPINGNAME'].' containing '.implode(',', $names)
                    ));

                    $this->db->pq("UPDATE shipping 
                    SET deliveryagent_flightcode=:1, deliveryagent_flightcodetimestamp=CURRENT_TIMESTAMP, deliveryagent_label=:2, deliveryagent_productcode=:3, deliveryagent_flightcodepersonid=:4, shippingstatus='awb created', deliveryagent_agentname='DHL'
                    WHERE shippingid=:5", array($awb['awb'], $awb['label'], $product, $this->user->personid, $ship['SHIPPINGID']));

                    $tno = $this->has_arg('RETURN') ? 'trackingnumberfromsynchrotron' : 'trackingnumbertosynchrotron';
                    foreach ($dewars as $i => $d) {
                        if ($i >= sizeof($awb['pieces'])) continue;

                        $p = $awb['pieces'][$i];
                        $this->db->pq("UPDATE dewar SET $tno=:1, deliveryAgent_barcode=:2, dewarstatus='awb created' WHERE dewarid=:3", array($awb['awb'], $p['licenseplate'], $d['DEWARID']));

                        $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,arrivaldate) 
                        VALUES (s_dewartransporthistory.nextval,:1,'awb created',CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
                        array($d['DEWARID']));
                    }

                    $ship['DELIVERYAGENT_FLIGHTCODE'] = $awb['awb'];

                } catch (\Exception $e) {
                    $this->_error($e->getMessage());
                }
            }

            $pickup = null;
            if (!$ship['DELIVERYAGENT_PICKUPCONFIRMATION']) {
                $pickup = $this->_do_request_pickup(array(
                    'shippingid' => $ship['SHIPPINGID'],
                    'accountnumber' => $accno,
                    'requestor' => $this->has_arg('RETURN') ? $facility : $user,
                    'packagelocation' => $ship['PHYSICALLOCATION'],

                    'pickupdate' => $ship['DELIVERYAGENT_SHIPPINGDATE'],
                    'readyby' => $ship['READYBYTIME'],
                    'closetime' => $ship['CLOSETIME'],

                    'dewars' => $dewars,
                    'weight' => $totalweight,

                    'awbnumber' => $ship['DELIVERYAGENT_FLIGHTCODE'], 
                ));        
            }

            $this->_output(array('AWB' => $awb ? 1 : 0, 'PICKUP' => $pickup ? 1 : 0));
        }



        function _rebook_pickup() {
            global $dhl_acc, $dhl_acc_import, $facility_courier_countries, $facility_courier_countries_nde;
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $ship = $this->db->pq("SELECT s.shippingid, s.deliveryagent_pickupconfirmation, TO_CHAR(s.deliveryagent_shippingdate, 'YYYY-MM-DD') as deliveryagent_shippingdate, s.sendinglabcontactid, s.returnlabcontactid, TO_CHAR(s.readybytime, 'HH24:MI') as readybytime, TO_CHAR(s.closetime, 'HH24:MI') as closetime, s.physicallocation, s.deliveryagent_flightcode, s.deliveryagent_agentcode
                FROM shipping s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];

            if (!$ship['DELIVERYAGENT_FLIGHTCODE']) $this->_error('That shipment does not have an airway bill');

            $cont = $this->db->pq("SELECT p.givenname, p.familyname, p.phonenumber, p.emailaddress, l.name, l.address, l.city, l.country, l.postcode
                FROM labcontact c 
                INNER JOIN person p ON p.personid = c.personid 
                INNER JOIN laboratory l ON l.laboratoryid = p.laboratoryid 
                WHERE c.labcontactid=:1 and c.proposalid=:2", array($this->has_arg('RETURN') ? $ship['RETURNLABCONTACTID'] : $ship['SENDINGLABCONTACTID'], $this->proposalid));

            if (!sizeof($cont)) $this->_error('No such lab contact');
            $cont = $cont[0];

            $terms = $this->db->pq("SELECT cta.couriertermsacceptedid
                FROM couriertermsaccepted cta
                INNER JOIN person p ON p.personid = cta.personid
                WHERE cta.proposalid=:1 AND cta.shippingid=:2", array($this->proposalid, $ship['SHIPPINGID']));
            $terms = sizeof($terms) ? true : false;
            
            if (in_array($cont['COUNTRY'], $facility_courier_countries) && $terms) {
                $accno = $dhl_acc;
            } else if (in_array($cont['COUNTRY'], $facility_courier_countries_nde) && $terms) {
                $accno = $dhl_acc_import;
            } else {
                $accno = $ship['DELIVERYAGENT_AGENTCODE'];
            }


            $user = array(
                'company' => $cont['NAME'],
                'address' => $cont['ADDRESS'],
                'city' => $cont['CITY'],
                'postcode' => $cont['POSTCODE'],
                'country' => $cont['COUNTRY'],
                'name' => $cont['GIVENNAME'].' '.$cont['FAMILYNAME'],
                'phone' => $cont['PHONENUMBER'],
                'email' => $cont['EMAILADDRESS'],
            );

            global $facility_company, $facility_address, $facility_city, $facility_postcode, $facility_country, $facility_contact, $facility_phone, $facility_email;
            $facility = array(
                'company' => $facility_company,
                'address' => $facility_address,
                'city' => $facility_city,
                'postcode' => $facility_postcode,
                'country' => $facility_country,
                'name' => $facility_contact,
                'phone' => $facility_phone,
                'email' => $facility_email,
            );

            $dewars = $this->db->pq("SELECT d.dewarid, d.weight
                FROM dewar d
                WHERE d.shippingid=:1 AND d.deliveryagent_barcode IS NOT NULL", array($this->arg('sid')));
            if (!sizeof($dewars)) $this->_error('No dewars selected to ship');

            $totalweight = 0;
            foreach ($dewars as $d) {
                $totalweight += $d['WEIGHT'];
            }

            $pickup = $this->_do_request_pickup(array(
                'shippingid' => $ship['SHIPPINGID'],
                'accountnumber' => $accno,
                'requestor' => $this->has_arg('RETURN') ? $facility : $user,
                'packagelocation' => $ship['PHYSICALLOCATION'],

                'pickupdate' => $ship['DELIVERYAGENT_SHIPPINGDATE'],
                'readyby' => $ship['READYBYTIME'],
                'closetime' => $ship['CLOSETIME'],

                'dewars' => $dewars,
                'weight' => $totalweight,

                'awbnumber' => $ship['DELIVERYAGENT_FLIGHTCODE'],
            ));

            $this->_output(array('PICKUP' => $pickup ? 1 : 0));
        }



        function _do_request_pickup($options) {
            $pickup = null;
            try {
                $pickup = $this->dhl->request_pickup(array(
                    'accountnumber' => $options['accountnumber'],
                    'requestor' => $options['requestor'],
                    'packagelocation' => $options['packagelocation'],

                    'pickupdate' => $options['pickupdate'],
                    'readyby' => $options['readyby'],
                    'closetime' => $options['closetime'],

                    'pieces' => sizeof($options['dewars']),
                    'weight' => $options['weight'],

                    'awbnumber' => $options['awbnumber'],
                ));

                $this->db->pq("UPDATE shipping 
                SET deliveryagent_pickupconfirmation=:1, deliveryagent_pickupconfirmationtimestamp=CURRENT_TIMESTAMP, deliveryAgent_readybytime=TO_DATE(:2, 'HH24:MI'), deliveryAgent_callintime=TO_DATE(:3, 'HH24:MI'), shippingstatus='pickup booked'
                WHERE shippingid=:4", array($pickup['confirmationnumber'], $pickup['readybytime'], $pickup['callintime'], $options['shippingid']));

                foreach ($options['dewars'] as $i => $d) {
                    $this->db->pq("UPDATE dewar SET dewarstatus='pickup booked' WHERE dewarid=:1", array($d['DEWARID']));
                    $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,arrivaldate) 
                    VALUES (s_dewartransporthistory.nextval,:1,'pickup booked',CURRENT_TIMESTAMP) RETURNING dewartransporthistoryid INTO :id", 
                    array($d['DEWARID']));
                }

            } catch (\Exception $e) {
                $this->_error($e->getMessage());
            }   

            return $pickup;
        }


        function _quote_awb() {
            global $facility_city, $facility_postcode, $facility_country, $facility_courier_countries;

            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');

            if (!$this->has_arg('DECLAREDVALUE')) $this->_error('No delcared value specified');
            if (!$this->has_arg('DEWARS')) $this->_error('No dewars specified');
            if (!is_array($this->arg('DEWARS'))) $this->_error('No dewars specified');
            
            $ship = $this->db->pq("SELECT s.shippingid,s.sendinglabcontactid,s.returnlabcontactid, TO_CHAR(s.deliveryagent_shippingdate, 'YYYY-MM-DD') as deliveryagent_shippingdate, TO_CHAR(s.readybytime, 'HH24:MI') as readybytime
                FROM shipping s 
                WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];

            $ids = range(2,sizeof($this->arg('DEWARS'))+1);
            $args = array_merge(array($ship['SHIPPINGID']), $this->arg('DEWARS'));
            $dewars = $this->db->pq("SELECT d.dewarid, d.weight
                FROM dewar d
                WHERE d.shippingid=:1 AND d.dewarid IN (:".implode(',:', $ids).")", $args);

            $cont = $this->db->pq("SELECT l.city, l.country, l.postcode
                FROM labcontact c 
                INNER JOIN person p ON p.personid = c.personid 
                INNER JOIN laboratory l ON l.laboratoryid = p.laboratoryid 
                WHERE c.labcontactid=:1 and c.proposalid=:2", array($this->has_arg('RETURN') ? $ship['RETURNLABCONTACTID'] : $ship['SENDINGLABCONTACTID'], $this->proposalid));

            if (!sizeof($cont)) $this->_error('No such lab contact');
            $cont = $cont[0];

            $user = array(
                'city' => $cont['CITY'],
                'postcode' => $cont['POSTCODE'],
                'country' => $cont['COUNTRY'],
            );

            // Catch programmatic use of awb - suspend international shipments
            // facility_courier_countries is an array containing United Kingdom
            if (!in_array($cont['COUNTRY'], $facility_courier_countries)) {
                $this->_error('International shipment bookings currently suspended. Please see MX manual for instructions');
            }

            $facility = array(
                'city' => $facility_city,
                'postcode' => $facility_postcode,
                'country' => $facility_country,
            );

            $pieces = array();
            foreach ($dewars as $d) {
                array_push($pieces, array(
                    'weight' => $d['WEIGHT'],
                    'width' => 40,
                    'height' => 60,
                    'depth' => 40,
                ));
            }


            try {
                $products = $this->dhl->get_quote(array(
                    'date' => $ship['DELIVERYAGENT_SHIPPINGDATE'],
                    'declaredvalue' => $this->arg('DECLAREDVALUE'),
                    'readyby' => $ship['READYBYTIME'],

                    'sender' => $this->has_arg('RETURN') ? $facility : $user,
                    'receiver' => $this->has_arg('RETURN') ? $user : $facility,

                    'pieces' => $pieces,
                ));

                $this->_output($products);

            } catch (\Exception $e) {
                $this->_error($e->getMessage());
            }
        }


        function _cancel_pickup() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $ship = $this->db->pq("SELECT s.shippingid, s.deliveryagent_pickupconfirmation, TO_CHAR(s.deliveryagent_shippingdate, 'YYYY-MM-DD') as deliveryagent_shippingdate, s.sendinglabcontactid, s.returnlabcontactid
                FROM shipping s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            if (!sizeof($ship)) $this->_error('No such shipment');
            $ship = $ship[0];

            $cont = $this->db->pq("SELECT l.country
                FROM labcontact c 
                INNER JOIN person p ON p.personid = c.personid 
                INNER JOIN laboratory l ON l.laboratoryid = p.laboratoryid 
                WHERE c.labcontactid=:1 and c.proposalid=:2", array($this->has_arg('RETURN') ? $ship['RETURNLABCONTACTID'] : $ship['SENDINGLABCONTACTID'], $this->proposalid));

            if (!sizeof($cont)) $this->_error('No such lab contact');
            $cont = $cont[0];

            $dewars = $this->db->pq("SELECT d.dewarid
                FROM dewar d
                WHERE d.shippingid=:1 AND d.deliveryagent_barcode IS NOT NULL", array($this->arg('sid')));

            $person = $this->user->givenname.' '.$this->user->familyname;

            $cancel = null;
            try {
                $cancel = $this->dhl->cancel_pickup(array(
                    'name' => $person,
                    'country' => $cont['COUNTRY'],
                    'confirmationnumber' => $ship['DELIVERYAGENT_PICKUPCONFIRMATION'],
                    'pickupdate' => $ship['DELIVERYAGENT_SHIPPINGDATE']
                ));

                $this->db->pq("UPDATE shipping 
                    SET deliveryagent_pickupconfirmation=NULL, deliveryagent_pickupconfirmationtimestamp=NULL, deliveryAgent_readybytime=NULL, deliveryAgent_callintime=NULL, shippingstatus='pickup cancelled'
                    WHERE shippingid=:1", array($ship['SHIPPINGID']));

                foreach ($dewars as $i => $d) {
                    $this->db->pq("UPDATE dewar SET dewarstatus='pickup cancelled' WHERE dewarid=:1", array($d['DEWARID']));
                    $this->db->pq("INSERT INTO dewartransporthistory (dewarid,dewarstatus,arrivaldate) 
                    VALUES (:1,'pickup cancelled',CURRENT_TIMESTAMP)", 
                    array($d['DEWARID']));
                }

            } catch (\Exception $e) {
                $this->_error($e->getMessage());
            }

            $this->_output(array('CANCEL' => $cancel ? 1 : 0));
        }



        function _get_countries() {
            $data = array();
            foreach ($this->dhl->get_countries() as $c) {
                array_push($data, array('TITLE' => $c));
            }

            $this->_output($data);
        }

        /**
         * Controller method for notify container endpoint.
         * This is called from an acquisition system when new data is available.
         * 
         * The calling application must be in the auto whitelist group and include the BARCODE in the URL
         * On success, the container status is updated to "notify_email".
         * If the container status is anything other than "notify_email", send email if preconditions met.
         * Preconditions are that the container has an owner with an email address and the container has entries in container history.
         * Returns 200 on success or if status is notify_email. Response body is {'EMAIL_SENT' => 1 or 0} depending on if email was sent.
         * Returns 404 if no container found, 412 if preconditions not met
         */
        function _notify_container() {
            global $auto;

            if (!(in_array($_SERVER["REMOTE_ADDR"], $auto))) $this->_error('You do not have access to that resource');
            if (!$this->has_arg('BARCODE')) $this->_error('No container specified');

            $cont = $this->db->pq("SELECT c.containerid, pe.emailaddress, pe.givenname, pe.familyname, CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) as visit, CONCAT(p.proposalcode, p.proposalnumber) as prop, c.code, sh.shippingname
                FROM container c
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                INNER JOIN person pe ON pe.personid = c.ownerid
                INNER JOIN blsession s ON s.sessionid = c.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE c.barcode=:1", array($this->arg('BARCODE')));

            if (!sizeof($cont)) $this->_error('Container not found', 404);

            $cont = $cont[0];

            if (!$cont['EMAILADDRESS']) $this->_error('Precondition failed, no email address for this container owner', 412);

            $hist = $this->db->pq("SELECT h.containerhistoryid, h.status, h.bltimestamp
                FROM containerhistory h
                WHERE h.containerid=:1
                ORDER BY h.containerhistoryid DESC
                LIMIT 1", array($cont['CONTAINERID']));

            if (!sizeof($hist)) $this->_error('Precondition failed, no history for this container', 412);

            // Case insensitive check. If we have already sent an email, return.
            if (strcasecmp($hist[0]['STATUS'], 'notify_email') == 0) {
                $this->_output(array('EMAIL_SENT' => 0));
            } else {
                $email = new Email('data-new', '*** New data available for your container ***');
                $email->data = $cont;
                $email->send($cont['EMAILADDRESS']);

                $this->db->pq("INSERT INTO containerhistory (status,containerid) VALUES (:1, :2)", array('notify_email', $cont['CONTAINERID']));

                // Everything OK, send result
                $this->_output(array('EMAIL_SENT' => 1));
           }
        }
    }
