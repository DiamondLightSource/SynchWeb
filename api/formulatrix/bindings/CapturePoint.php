<?php

namespace uk\ac\ox\oppf\www\WSPlate;

class CapturePoint
{

    /**
     * @var Point $center
     * @access public
     */
    public $center = null;

    /**
     * @var boolean $isAbsolute
     * @access public
     */
    public $isAbsolute = null;

    /**
     * @var int $regionType
     * @access public
     */
    public $regionType = null;

    /**
     * @var string $regionID
     * @access public
     */
    public $regionID = null;

    /**
     * @var ArrayCaptureProfile $captureProfiles
     * @access public
     */
    public $captureProfiles = null;

    /**
     * @var Size $size
     * @access public
     */
    public $size = null;

    /**
     * @var int $dropNumber
     * @access public
     */
    public $dropNumber = null;

    /**
     * @var int $wellNumber
     * @access public
     */
    public $wellNumber = null;

    /**
     * @var CapturePoint $parent
     * @access public
     */
    public $parent = null;

}
