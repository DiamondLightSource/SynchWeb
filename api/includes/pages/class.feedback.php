<?php

    class Feedback extends Page {
        
        var $arg_list = array('name' => '.*',
                              'email' => '.*',
                              'feedback' => '.*',
                              'submit' => '\d',
                              );

        var $dispatch = array(array('', 'post', '_feedback'));
        
        # Feedback form
        function _feedback() {
            if (!($this->has_arg('name') && $this->has_arg('email') && $this->has_arg('feedback'))) $this->_error('Missing Fields', 'One of more fields was missing');
            
            # Email people
            mail('stuart.fisher@diamond.ac.uk', 'ISPyB-PHP Feedback', "Feedback from the ISPyB-PHP webappliction\n\nName: ".$this->arg('name')."\nEmail: ".$this->arg('email')."\nMessage:\n".$this->arg('feedback')."\n");
            
            $this->_output(1);
        }
    
    }

?>