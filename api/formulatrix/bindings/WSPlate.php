<?php

namespace uk\ac\ox\oppf\www\WSPlate;

include_once('Point.php');
include_once('Size.php');
include_once('PlateInfo.php');
include_once('PlateType.php');
include_once('Property.php');
include_once('Robot.php');
include_once('ImagingTask.php');
include_once('CapturePoint.php');
include_once('CapturePointList.php');
include_once('CaptureProfile.php');
include_once('GetFirstDropReturn.php');
include_once('CaptureInfo.php');
include_once('FocalPoint.php');
include_once('ImageInfo.php');
include_once('ProcessingInfo.php');
include_once('ImageType.php');
include_once('UploadImage.php');
include_once('UploadImageResponse.php');
include_once('Sample.php');
include_once('Project.php');
include_once('WSPlateError.php');
include_once('ArrayPlateType.php');
include_once('ArrayProperty.php');
include_once('ArrayImagingTask.php');
include_once('ArrayCapturePoint.php');
include_once('ArrayCaptureProfile.php');
include_once('ArrayFocalPoint.php');
include_once('ArrayUploadImage.php');
include_once('ArrayUploadImageResponse.php');
include_once('ArraySample.php');
include_once('ArrayProject.php');
include_once('getPlateID.php');
include_once('getPlateIDResponse.php');
include_once('getPlateInfo.php');
include_once('getPlateInfoResponse.php');
include_once('getPlateType.php');
include_once('getPlateTypeResponse.php');
include_once('getPlateTypes.php');
include_once('getPlateTypesResponse.php');
include_once('getImagingTasks.php');
include_once('getImagingTasksResponse.php');
include_once('supportsPriority.php');
include_once('supportsPriorityResponse.php');
include_once('updatedPriority.php');
include_once('updatedPriorityResponse.php');
include_once('imagingPlate.php');
include_once('imagingPlateResponse.php');
include_once('imagedPlate.php');
include_once('imagedPlateResponse.php');
include_once('skippedImaging.php');
include_once('skippedImagingResponse.php');
include_once('getCapturePoints.php');
include_once('getCapturePointsResponse.php');
include_once('getDefaultCaptureProfile.php');
include_once('getDefaultCaptureProfileResponse.php');
include_once('getFirstDrop.php');
include_once('getFirstDropResponse.php');
include_once('getImageProcessor.php');
include_once('getImageProcessorResponse.php');
include_once('uploadImages.php');
include_once('uploadImagesResponse.php');
include_once('listSamples.php');
include_once('listSamplesResponse.php');
include_once('listProjects.php');
include_once('listProjectsResponse.php');
include_once('GetPlateIDFault.php');
include_once('GetPlateInfoFault.php');
include_once('GetPlateTypeFault.php');
include_once('GetPlateTypesFault.php');
include_once('GetImagingTasksFault.php');
include_once('SupportsPriorityFault.php');
include_once('UpdatedPriorityFault.php');
include_once('ImagingPlateFault.php');
include_once('ImagedPlateFault.php');
include_once('SkippedImagingFault.php');
include_once('GetCapturePointsFault.php');
include_once('GetDefaultCaptureProfileFault.php');
include_once('GetFirstDropFault.php');
include_once('GetImageProcessorFault.php');
include_once('UploadImagesFault.php');
include_once('ListSamplesFault.php');
include_once('ListProjectsFault.php');
include_once('CanListSamplesFault.php');

class WSPlate extends \SoapClient
{

    /**
     * @var array $classmap The defined classes
     * @access private
     */
    private static $classmap = array(
      'Point' => 'uk\ac\ox\oppf\www\WSPlate\Point',
      'Size' => 'uk\ac\ox\oppf\www\WSPlate\Size',
      'PlateInfo' => 'uk\ac\ox\oppf\www\WSPlate\PlateInfo',
      'PlateType' => 'uk\ac\ox\oppf\www\WSPlate\PlateType',
      'Property' => 'uk\ac\ox\oppf\www\WSPlate\Property',
      'Robot' => 'uk\ac\ox\oppf\www\WSPlate\Robot',
      'ImagingTask' => 'uk\ac\ox\oppf\www\WSPlate\ImagingTask',
      'CapturePoint' => 'uk\ac\ox\oppf\www\WSPlate\CapturePoint',
      'CapturePointList' => 'uk\ac\ox\oppf\www\WSPlate\CapturePointList',
      'CaptureProfile' => 'uk\ac\ox\oppf\www\WSPlate\CaptureProfile',
      'GetFirstDropReturn' => 'uk\ac\ox\oppf\www\WSPlate\GetFirstDropReturn',
      'CaptureInfo' => 'uk\ac\ox\oppf\www\WSPlate\CaptureInfo',
      'FocalPoint' => 'uk\ac\ox\oppf\www\WSPlate\FocalPoint',
      'ImageInfo' => 'uk\ac\ox\oppf\www\WSPlate\ImageInfo',
      'ProcessingInfo' => 'uk\ac\ox\oppf\www\WSPlate\ProcessingInfo',
      'UploadImage' => 'uk\ac\ox\oppf\www\WSPlate\UploadImage',
      'UploadImageResponse' => 'uk\ac\ox\oppf\www\WSPlate\UploadImageResponse',
      'Sample' => 'uk\ac\ox\oppf\www\WSPlate\Sample',
      'Project' => 'uk\ac\ox\oppf\www\WSPlate\Project',
      'WSPlateError' => 'uk\ac\ox\oppf\www\WSPlate\WSPlateError',
      'ArrayPlateType' => 'uk\ac\ox\oppf\www\WSPlate\ArrayPlateType',
      'ArrayProperty' => 'uk\ac\ox\oppf\www\WSPlate\ArrayProperty',
      'ArrayImagingTask' => 'uk\ac\ox\oppf\www\WSPlate\ArrayImagingTask',
      'ArrayCapturePoint' => 'uk\ac\ox\oppf\www\WSPlate\ArrayCapturePoint',
      'ArrayCaptureProfile' => 'uk\ac\ox\oppf\www\WSPlate\ArrayCaptureProfile',
      'ArrayFocalPoint' => 'uk\ac\ox\oppf\www\WSPlate\ArrayFocalPoint',
      'ArrayUploadImage' => 'uk\ac\ox\oppf\www\WSPlate\ArrayUploadImage',
      'ArrayUploadImageResponse' => 'uk\ac\ox\oppf\www\WSPlate\ArrayUploadImageResponse',
      'ArraySample' => 'uk\ac\ox\oppf\www\WSPlate\ArraySample',
      'ArrayProject' => 'uk\ac\ox\oppf\www\WSPlate\ArrayProject',
      'getPlateID' => 'uk\ac\ox\oppf\www\WSPlate\getPlateID',
      'getPlateIDResponse' => 'uk\ac\ox\oppf\www\WSPlate\getPlateIDResponse',
      'getPlateInfo' => 'uk\ac\ox\oppf\www\WSPlate\getPlateInfo',
      'getPlateInfoResponse' => 'uk\ac\ox\oppf\www\WSPlate\getPlateInfoResponse',
      'getPlateType' => 'uk\ac\ox\oppf\www\WSPlate\getPlateType',
      'getPlateTypeResponse' => 'uk\ac\ox\oppf\www\WSPlate\getPlateTypeResponse',
      'getPlateTypes' => 'uk\ac\ox\oppf\www\WSPlate\getPlateTypes',
      'getPlateTypesResponse' => 'uk\ac\ox\oppf\www\WSPlate\getPlateTypesResponse',
      'getImagingTasks' => 'uk\ac\ox\oppf\www\WSPlate\getImagingTasks',
      'getImagingTasksResponse' => 'uk\ac\ox\oppf\www\WSPlate\getImagingTasksResponse',
      'supportsPriority' => 'uk\ac\ox\oppf\www\WSPlate\supportsPriority',
      'supportsPriorityResponse' => 'uk\ac\ox\oppf\www\WSPlate\supportsPriorityResponse',
      'updatedPriority' => 'uk\ac\ox\oppf\www\WSPlate\updatedPriority',
      'updatedPriorityResponse' => 'uk\ac\ox\oppf\www\WSPlate\updatedPriorityResponse',
      'imagingPlate' => 'uk\ac\ox\oppf\www\WSPlate\imagingPlate',
      'imagingPlateResponse' => 'uk\ac\ox\oppf\www\WSPlate\imagingPlateResponse',
      'imagedPlate' => 'uk\ac\ox\oppf\www\WSPlate\imagedPlate',
      'imagedPlateResponse' => 'uk\ac\ox\oppf\www\WSPlate\imagedPlateResponse',
      'skippedImaging' => 'uk\ac\ox\oppf\www\WSPlate\skippedImaging',
      'skippedImagingResponse' => 'uk\ac\ox\oppf\www\WSPlate\skippedImagingResponse',
      'getCapturePoints' => 'uk\ac\ox\oppf\www\WSPlate\getCapturePoints',
      'getCapturePointsResponse' => 'uk\ac\ox\oppf\www\WSPlate\getCapturePointsResponse',
      'getDefaultCaptureProfile' => 'uk\ac\ox\oppf\www\WSPlate\getDefaultCaptureProfile',
      'getDefaultCaptureProfileResponse' => 'uk\ac\ox\oppf\www\WSPlate\getDefaultCaptureProfileResponse',
      'getFirstDrop' => 'uk\ac\ox\oppf\www\WSPlate\getFirstDrop',
      'getFirstDropResponse' => 'uk\ac\ox\oppf\www\WSPlate\getFirstDropResponse',
      'getImageProcessor' => 'uk\ac\ox\oppf\www\WSPlate\getImageProcessor',
      'getImageProcessorResponse' => 'uk\ac\ox\oppf\www\WSPlate\getImageProcessorResponse',
      'uploadImages' => 'uk\ac\ox\oppf\www\WSPlate\uploadImages',
      'uploadImagesResponse' => 'uk\ac\ox\oppf\www\WSPlate\uploadImagesResponse',
      'listSamples' => 'uk\ac\ox\oppf\www\WSPlate\listSamples',
      'listSamplesResponse' => 'uk\ac\ox\oppf\www\WSPlate\listSamplesResponse',
      'listProjects' => 'uk\ac\ox\oppf\www\WSPlate\listProjects',
      'listProjectsResponse' => 'uk\ac\ox\oppf\www\WSPlate\listProjectsResponse',
      'GetPlateIDFault' => 'uk\ac\ox\oppf\www\WSPlate\GetPlateIDFault',
      'GetPlateInfoFault' => 'uk\ac\ox\oppf\www\WSPlate\GetPlateInfoFault',
      'GetPlateTypeFault' => 'uk\ac\ox\oppf\www\WSPlate\GetPlateTypeFault',
      'GetPlateTypesFault' => 'uk\ac\ox\oppf\www\WSPlate\GetPlateTypesFault',
      'GetImagingTasksFault' => 'uk\ac\ox\oppf\www\WSPlate\GetImagingTasksFault',
      'SupportsPriorityFault' => 'uk\ac\ox\oppf\www\WSPlate\SupportsPriorityFault',
      'UpdatedPriorityFault' => 'uk\ac\ox\oppf\www\WSPlate\UpdatedPriorityFault',
      'ImagingPlateFault' => 'uk\ac\ox\oppf\www\WSPlate\ImagingPlateFault',
      'ImagedPlateFault' => 'uk\ac\ox\oppf\www\WSPlate\ImagedPlateFault',
      'SkippedImagingFault' => 'uk\ac\ox\oppf\www\WSPlate\SkippedImagingFault',
      'GetCapturePointsFault' => 'uk\ac\ox\oppf\www\WSPlate\GetCapturePointsFault',
      'GetDefaultCaptureProfileFault' => 'uk\ac\ox\oppf\www\WSPlate\GetDefaultCaptureProfileFault',
      'GetFirstDropFault' => 'uk\ac\ox\oppf\www\WSPlate\GetFirstDropFault',
      'GetImageProcessorFault' => 'uk\ac\ox\oppf\www\WSPlate\GetImageProcessorFault',
      'UploadImagesFault' => 'uk\ac\ox\oppf\www\WSPlate\UploadImagesFault',
      'ListSamplesFault' => 'uk\ac\ox\oppf\www\WSPlate\ListSamplesFault',
      'ListProjectsFault' => 'uk\ac\ox\oppf\www\WSPlate\ListProjectsFault',
      'CanListSamplesFault' => 'uk\ac\ox\oppf\www\WSPlate\CanListSamplesFault');

    /**
     * @param array $options A array of config values
     * @param string $wsdl The wsdl file to use
     * @access public
     */
    public function __construct(array $options = array(), $wsdl = 'WSPlate.wsdl')
    {
      foreach (self::$classmap as $key => $value) {
        if (!isset($options['classmap'][$key])) {
          $options['classmap'][$key] = $value;
        }
      }
      
      parent::__construct($wsdl, $options);
    }

    /**
     * @param getPlateID $part1
     * @access public
     * @return getPlateIDResponse
     */
    public function getPlateID(getPlateID $part1)
    {
      return $this->__soapCall('getPlateID', array($part1));
    }

    /**
     * @param getCapturePoints $part1
     * @access public
     * @return getCapturePointsResponse
     */
    public function getCapturePoints(getCapturePoints $part1)
    {
      return $this->__soapCall('getCapturePoints', array($part1));
    }

    /**
     * @param getDefaultCaptureProfile $part1
     * @access public
     * @return getDefaultCaptureProfileResponse
     */
    public function getDefaultCaptureProfile(getDefaultCaptureProfile $part1)
    {
      return $this->__soapCall('getDefaultCaptureProfile', array($part1));
    }

    /**
     * @param updatedPriority $part1
     * @access public
     * @return updatedPriorityResponse
     */
    public function updatedPriority(updatedPriority $part1)
    {
      return $this->__soapCall('updatedPriority', array($part1));
    }

    /**
     * @param getPlateInfo $part1
     * @access public
     * @return getPlateInfoResponse
     */
    public function getPlateInfo(getPlateInfo $part1)
    {
      return $this->__soapCall('getPlateInfo', array($part1));
    }

    /**
     * @param getPlateTypes $part1
     * @access public
     * @return getPlateTypesResponse
     */
    public function getPlateTypes(getPlateTypes $part1)
    {
      return $this->__soapCall('getPlateTypes', array($part1));
    }

    /**
     * @param imagingPlate $part1
     * @access public
     * @return imagingPlateResponse
     */
    public function imagingPlate(imagingPlate $part1)
    {
      return $this->__soapCall('imagingPlate', array($part1));
    }

    /**
     * @param imagedPlate $part1
     * @access public
     * @return imagedPlateResponse
     */
    public function imagedPlate(imagedPlate $part1)
    {
      return $this->__soapCall('imagedPlate', array($part1));
    }

    /**
     * @param getImagingTasks $part1
     * @access public
     * @return getImagingTasksResponse
     */
    public function getImagingTasks(getImagingTasks $part1)
    {
      return $this->__soapCall('getImagingTasks', array($part1));
    }

    /**
     * @param getImageProcessor $part1
     * @access public
     * @return getImageProcessorResponse
     */
    public function getImageProcessor(getImageProcessor $part1)
    {
      return $this->__soapCall('getImageProcessor', array($part1));
    }

    /**
     * @param getPlateType $part1
     * @access public
     * @return getPlateTypeResponse
     */
    public function getPlateType(getPlateType $part1)
    {
      return $this->__soapCall('getPlateType', array($part1));
    }

    /**
     * @param supportsPriority $part1
     * @access public
     * @return supportsPriorityResponse
     */
    public function supportsPriority(supportsPriority $part1)
    {
      return $this->__soapCall('supportsPriority', array($part1));
    }

    /**
     * @param getFirstDrop $part1
     * @access public
     * @return getFirstDropResponse
     */
    public function getFirstDrop(getFirstDrop $part1)
    {
      return $this->__soapCall('getFirstDrop', array($part1));
    }

    /**
     * @param skippedImaging $part1
     * @access public
     * @return skippedImagingResponse
     */
    public function skippedImaging(skippedImaging $part1)
    {
      return $this->__soapCall('skippedImaging', array($part1));
    }

    /**
     * @param uploadImages $part1
     * @access public
     * @return uploadImagesResponse
     */
    public function uploadImages(uploadImages $part1)
    {
      return $this->__soapCall('uploadImages', array($part1));
    }

    /**
     * @param listSamples $part1
     * @access public
     * @return listSamplesResponse
     */
    public function listSamples(listSamples $part1)
    {
      return $this->__soapCall('listSamples', array($part1));
    }

    /**
     * @param listProjects $part1
     * @access public
     * @return listProjectsResponse
     */
    public function listProjects(listProjects $part1)
    {
      return $this->__soapCall('listProjects', array($part1));
    }

    /**
     * @access public
     * @return boolean
     */
    public function canListSamples()
    {
      return $this->__soapCall('canListSamples', array());
    }

}
