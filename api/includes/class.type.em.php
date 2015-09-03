<?php

    require_once('includes/class.type.gen.php');
    
    class EM extends GEN {
		var $pages = array(
		               'image',
		               'dc',
		               );

		var $default = 'proposal';
		var $dir = 'em';

		var $staff_permission = 'em_admin';
    }

?>
