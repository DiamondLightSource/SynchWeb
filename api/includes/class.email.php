<?php

    class Email {
        private $vars = array();
        private $html = true;
        

        function __construct($template, $subject) {
            $this->template = $template.'.html';
            $this->subject = $subject;
        }

        public function __get($name) {
            return $this->vars[$name];
        }
    
        public function __set($name, $value) {
            $this->vars[$name] = $value;
        }


        public function send($recepients) {
            global $email_from;
            include(dirname(__FILE__).'/../config.php');
            ob_start();
            
            $path = dirname(__FILE__).'/../assets/emails/'.($this->html ? 'html/' : '');
            if (file_exists($path.$this->template)) {
                extract($this->vars);
                if ($this->html) include($path.'email-header.html');
                include($path.$this->template);
                if ($this->html) include($path.'email-footer.html');
            }

            $content = ob_get_contents();
            ob_end_clean();

            $headers = "From: ".$email_from."\r\n";
            $headers .= "Reply-To: ".$email_from."\r\n";

            if ($this->html) {
                $headers .= "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
            }

            mail($recepients, $this->subject, $content, $headers);
        }
                
        
    }
    
?>