<?php
    
    class Cal extends Page {
        
        public static $arg_list = array('mon' => '\w+', 'year' => '\d\d\d\d', 'bl' => '[\w-]+', 'h' => '\w+');
        
        public static $dispatch = array(array('/ics/h/:h/calendar.ics', 'get', '_export_ics'),
                              array('/ext', 'get', '_external_link'),
        );


        # Generate private url
        function _external_link() {
            if ($this->has_arg('prop') || $this->has_arg('bl')) {
                $arg = $this->has_arg('bl') ? $this->arg('bl') : $this->arg('prop');

                $args = $this->db->pq("SELECT hash FROM calendarhash WHERE ckey LIKE :1", array($arg));
                
                if (sizeof($args)) {
                    $this->_output('/cal/ics/h/'.$args[0]['HASH'].'/calendar.ics');
                } else {
                    $h = md5(uniqid());
                    $this->db->pq("INSERT INTO calendarhash (calendarhashid,ckey,hash,beamline) 
                        VALUES (s_calendarhash.nextval, :1, :2, :3)", array($arg, $h, $this->has_arg('bl') ? 1 : 0));
                    
                    $this->_output('/cal/ics/h/'.$h.'/calendar.ics');
                }
            }
        }
        
        
        # Calendar ics export
        function _export_ics() {
            $where = '';
            $args = array(date('Y'));
            
            if (!$this->has_arg('h')) $this->_error('No proposal specified', 'You must specify a proposal to view a calendar');
            $hash = $this->db->pq("SELECT ckey,beamline FROM calendarhash WHERE hash LIKE :1", array($this->arg('h')));
            
            
            if (!sizeof($hash)) $this->_error('No proposal specified', 'The specified proposal doesnt appear to exist');
            $hash = $hash[0];
            
            if ($hash['BEAMLINE']) {
                $where .= ' AND s.beamlinename LIKE :'.(sizeof($args)+1);
                array_push($args, $hash['CKEY']);
                
            } else {
                $where = ' AND CONCAT(p.proposalcode,p.proposalnumber) LIKE :'.(sizeof($args)+1);
                array_push($args, $hash['CKEY']);
            }
            
            $visits = $this->db->pq("SELECT s.beamlineoperator as lc, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as vis, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.beamlinename as bl, TO_CHAR(s.startdate, 'DD-MM-YYYY') as d, TO_CHAR(s.enddate, 'DD-MM-YYYY') as e, TO_CHAR(s.startdate, 'HH24:MI') as st, TO_CHAR(s.enddate, 'HH24:MI') as en, s.sessionid 
                FROM blsession s 
                INNER JOIN proposal p ON (p.proposalid = s.proposalid) 
                WHERE s.startdate > TO_DATE(:1,'YYYY') $where ORDER BY s.startdate, s.beamlinename", $args);
            

            $user_tmp = $this->db->pq("SELECT s.sessionid, pe.login, CONCAT(CONCAT(pe.givenname, ' '), pe.familyname) as fullname, shp.role
                FROM person pe
                INNER JOIN session_has_person shp ON shp.personid = pe.personid
                INNER JOIN blsession s ON s.sessionid = shp.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE s.startdate > TO_DATE(:1,'YYYY') $where
                ", $args);

            $users = array();
            foreach ($user_tmp as $u) {
                if (!array_key_exists($u['SESSIONID'], $users)) $users[$u['SESSIONID']] = array();
                array_push($users[$u['SESSIONID']], $u);
            }

            
            $output = '';
            foreach ($visits as $v) {
                $st = strtotime($v['D'].' '.$v['ST']);
                $en = strtotime($v['E'].' '.$v['EN']);
                
                $title = $v['VIS'].($v['LC'] ? ' LC: '.$v['LC'] : '');
                if (!$hash['BEAMLINE']) $title = $v['BL'].': '.$title;
                
                $us = '';
                if (array_key_exists($v['SESSIONID'], $users)) {
                    foreach ($users[$v['SESSIONID']] as $u) {
                        $us .= 'ATTENDEE;CN="'.$u['FULLNAME']."\":MAILTO:".$u['ROLE']."\r\n";
                    }
                }
                
                
                $output .= "BEGIN:VEVENT\r\nDTSTAMP:".date('Ymd\THi',$st)."00Z\r\nDTSTART:".date('Ymd\THi', $st)."00Z\r\nDTEND:".date('Ymd\THi', $en)."00Z\r\nSUMMARY:".$title."\r\n".$us."\r\nEND:VEVENT\r\n";
            }
            
            $this->app->contentType("text/calendar; charset=utf-8");
            $this->app->response()->body("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n$output\r\nEND:VCALENDAR\r\n");
        }
        
    }
    
?>