<?php
    include_once('includes/class.db.php');
    
    class OracleSessionHandler {
        private $db;

        public function __construct(){
            date_default_timezone_set('Europe/London');
        }

        public function _open(){
            $this->db = Database::get();
            
            // $this->db = new $dbclass($isb['user'], $isb['pass'], $isb['db']);
            if($this->db){
                return true;
            }
            return false;
        }

        public function _close(){
            $this->db->__destruct();
            return true;
        }

        
        public function _read($id){
            $rows = $this->db->pq("SELECT data FROM phpsession WHERE id = :1", array($id));
            
            if(sizeof($rows)){
                return $rows[0]['DATA'];
            } else {
                return '';
            }
        }


        public function _write($id, $data){
            $chk = $this->db->pq("SELECT data FROM phpsession WHERE id = :1", array($id));
            
            if (sizeof($chk)) {
                $this->db->pq("UPDATE phpsession SET data=:1,accessdate=SYSDATE WHERE id=:2", array($data,$id));
                
                return true;
                
            } else {
                $this->db->pq("INSERT INTO phpsession (id, accessdate, data) VALUES (:1,SYSDATE,:2)", array($id, $data));
                if (array_key_exists('phpCAS', $_SESSION)) $this->db->pq("INSERT INTO log4stat (id,priority,log4jtimestamp,msg,detail) VALUES (s_log4stat.nextval, 'ISPYB2_STAT', SYSDATE, 'LOGON', :1)", array($_SESSION['phpCAS']['user']));
                
                return true;
            }
            
            return false;
        }

        
        public function _destroy($id){
            $this->db->pq("DELETE FROM phpsession WHERE id = :1", array($id));
            return true;
        }


        public function _gc($max){
            $old = date('d-m-Y H:i', time() - $max);
            $this->db->pq("DELETE FROM phpsession WHERE accessdate < TO_DATE(:1, 'DD-MM-YYYY HH24:MI')", array($old));

            return true;
        }
    
    }
?>