<?php

    class Tracking extends Page {
        
        var $arg_list = array('submit' => '\d',
                              'dewar' => '([\w-])+',
                              'location' => '([\w-])+');
        var $dispatch = array('main' => '_index');
        var $def = 'main';
        
        var $root = 'Track Dewars';
        var $root_link = '/';
    
        #var $debug = True;
        
        # Dewar tracking / shipping from barcode reader
        function _index() {
            if (!$this->bcr()) $this->error('Access Denied', 'You need to be using a hand held scanner to access this page');
            
            $this->template('Dewar Tracking');
            $this->t->minimal();
            $this->t->error = '';
            $this->t->submit = $this->has_arg('submit');
            
            if ($this->t->submit) {
                if ($this->has_arg('dewar') && $this->has_arg('location')) {
                    $dew = $this->db->pq("SELECT d.dewarid,s.shippingid FROM dewar d INNER JOIN shipping s ON s.shippingid = d.shippingid WHERE lower(barcode) LIKE lower(:1)", array($this->arg('dewar')));
                    if (!sizeof($dew)) {
                        $this->t->error = 'The specified dewar doesnt exist';
                    
                    } else {
                        $dew = $dew[0];
                        $this->db->pq("INSERT INTO dewartransporthistory (dewartransporthistoryid,dewarid,dewarstatus,storagelocation,arrivaldate) VALUES (s_dewartransporthistory.nextval,:1,'at DLS',:2,CURRENT_TIMESTAMP)", array($dew['DEWARID'], $this->arg('location')));
                        
                        $this->db->pq("UPDATE dewar set dewarstatus='at DLS', storagelocation=:2 WHERE dewarid=:1", array($dew['DEWARID'], $this->arg('location')));
                        $this->db->pq("UPDATE shipping set shippingstatus='at DLS' WHERE shippingid=:1", array($dew['SHIPPINGID']));
                    }
                }

            }
            
            $this->render('tracking');
        }
        
    
    }

?>