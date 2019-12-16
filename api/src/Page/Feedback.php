<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Email;

class Feedback extends Page
{
        
        public static $arg_list = array('name' => '.*',
                              'email' => '.*',
                              'feedback' => '.*',
                              'submit' => '\d',
                              );

        public static $dispatch = array(array('', 'post', '_feedback'));
        
        # Feedback form
        function _feedback() {
            global $email_admin;
            if (!($this->has_arg('name') && $this->has_arg('email') && $this->has_arg('feedback'))) $this->_error('Missing Fields: One of more fields was missing', 400);
            
            $email = new Email('site-feedback', 'ISPyB Site Feedback');
            $email->data = $this->args;
            $email->send($email_admin);
            
            $this->_output(1);
        }
}
