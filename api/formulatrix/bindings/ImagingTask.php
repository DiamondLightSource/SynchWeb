<?php

namespace uk\ac\ox\oppf\www\WSPlate;

class ImagingTask
{

    /**
     * @var int $state
     * @access public
     */
    public $state = null;

    /**
     * @var dateTime $dateImaged
     * @access public
     */
    public $dateImaged = null;

    /**
     * @var int $priority
     * @access public
     */
    public $priority = null;

    /**
     * @var dateTime $dateToImage
     * @access public
     */
    public $dateToImage = null;

    /**
     * @var boolean $inQueue
     * @access public
     */
    public $inQueue = null;

}
