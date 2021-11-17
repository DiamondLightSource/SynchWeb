<?php

namespace SynchWeb\Page\EM;

trait Config
{
    /**
     * Check electron microscopes are listed in global variables
     *
     * See $bl_types in config.php
     */
    private function configExitIfNoMicroscopes()
    {
        if (count($this->_get_beamlines_from_type('em')) == 0) {
            $message = 'Electron microscopes are not specified';
            error_log($message);
            $this->_error($message, 500);
        }
    }
}
