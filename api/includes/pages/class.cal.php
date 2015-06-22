<?php
    
    class Cal extends Page {
        
        public static $arg_list = array('mon' => '\w+', 'year' => '\d\d\d\d', 'bl' => '\w\d\d(-\d)?', 'h' => '\w+');
        
        public static $dispatch = array(array('/ics/h/:h/calendar.ics', 'get', '_export_ics'),
                              array('/ext', 'get', '_external_link'),
        );


        # Generate private url
        function _external_link() {
            if ($this->has_arg('prop') || $this->has_arg('bl')) {
                $arg = $this->has_arg('bl') ? $this->arg('bl') : $this->arg('prop');
                $args = $this->db->pq("SELECT parametercomments as p FROM genericdata WHERE parametervaluestring LIKE :1", array($arg));
                
                if (sizeof($args)) {
                    $this->_output('/api/cal/ics/h/'.$args[0]['P'].'/calendar.ics');
                } else {
                    $h = md5(uniqid());
                    $this->db->pq("INSERT INTO genericdata (genericdataid,parametervaluestring,parametercomments) VALUES (s_genericdata.nextval, :1, :2)", array($arg, $h));
                    
                    $this->_output('/api/cal/ics/h/'.$h.'/calendar.ics');
                }
            }
        }
        
        
        # Calendar ics export
        function _export_ics() {
            $where = '';
            $args = array(date('Y'));
            
            if (!$this->has_arg('h')) $this->_error('No proposal specified', 'You must specify a proposal to view a calendar');

            $hash = $this->db->pq("SELECT parametervaluestring as p FROM genericdata WHERE parametercomments LIKE :1", array($this->arg('h')));
            $bls = array('i02', 'i03', 'i04', 'i04-1', 'i24', 'i23');
            
            
            if (!sizeof($hash)) $this->_error('No proposal specified', 'The specified proposal doesnt appear to exist');
            $arg = $hash[0]['P'];
            
            if (in_array($arg, $bls)) {
                $where .= ' AND s.beamlinename LIKE :'.(sizeof($args)+1);
                array_push($args, $arg);
                
            } else {
                $where = ' AND p.proposalcode||p.proposalnumber=:'.(sizeof($args)+1);
                array_push($args, $arg);
            }
            
            $visits = $this->db->pq("SELECT s.beamlineoperator as lc, p.proposalcode || p.proposalnumber || '-' || s.visit_number as vis, p.proposalcode || p.proposalnumber as prop, s.beamlinename as bl, TO_CHAR(s.startdate, 'DD-MM-YYYY') as d, TO_CHAR(s.enddate, 'DD-MM-YYYY') as e, TO_CHAR(s.startdate, 'HH24:MI') as st, TO_CHAR(s.enddate, 'HH24:MI') as en, s.sessionid FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) WHERE (s.beamlinename LIKE 'i02' OR s.beamlinename LIKE 'i03' OR s.beamlinename LIKE 'i04' OR s.beamlinename LIKE 'i04-1' OR s.beamlinename LIKE 'i24') AND s.startdate > TO_DATE(:1,'YYYY') $where ORDER BY s.startdate, s.beamlinename", $args);
            
            $user_tmp = $this->db->pq("SELECT u.name,u.fullname,s.sessionid FROM blsession s INNER JOIN proposal p ON (p.proposalid = s.proposalid) INNER JOIN investigation@DICAT_RO i ON lower(i.visit_id) = p.proposalcode||p.proposalnumber||'-'||s.visit_number INNER JOIN investigationuser@DICAT_RO iu on i.id = iu.investigation_id INNER JOIN user_@DICAT_RO u on u.id = iu.user_id WHERE (s.beamlinename LIKE 'i02' OR s.beamlinename LIKE 'i03' OR s.beamlinename LIKE 'i04' OR s.beamlinename LIKE 'i04-1' OR s.beamlinename LIKE 'i24') AND s.startdate > TO_DATE(:1,'YYYY') AND iu.role='NORMAL_USER' $where", $args);
            
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
                if (!in_array($arg, $bls)) $title = $v['BL'].': '.$title;
                
                $us = '';
                if (array_key_exists($v['SESSIONID'], $users)) {
                    foreach ($users[$v['SESSIONID']] as $u) {
                        $us .= 'ATTENDEE;CN="'.$u['FULLNAME']."\":MAILTO:".$u['NAME']."\r\n";
                    }
                }
                
                
                $output .= "BEGIN:VEVENT\r\nDTSTAMP:".date('Ymd\THi',$st)."00Z\r\nDTSTART:".date('Ymd\THi', $st)."00Z\r\nDTEND:".date('Ymd\THi', $en)."00Z\r\nSUMMARY:".$title."\r\n".$us."\r\nEND:VEVENT\r\n";
            }
            
            $this->app->contentType("text/calendar; charset=utf-8");
            $this->app->response()->body("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n$output\r\nEND:VCALENDAR\r\n");
        }
        
    }
    
?>