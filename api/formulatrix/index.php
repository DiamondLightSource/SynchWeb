<?php

/*
 Copyright 2015 Diamond Light Source <stuart.fisher@diamond.ac.uk>
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* SynchWeb implementation of a sufficient subset of WSPlate.wsdl to satisfy
 * RockImager, RockImagerProcessor and ImageUploader.
 * stuart.fisher@diamond.ac.uk
 *
 * Jon Diprose, 2015/10/07
 * Stu Fisher, 2016/03/15 - Initial Implementation
 */

date_default_timezone_set('Europe/London');

// Return if theres no config
if (!file_exists('config.php'))
    exit;
require_once('config.php');

/*******************************************************************
 ************************* ACCESS CONTROL ***************************
 *******************************************************************/

if (
(!isset($_SERVER['PHP_AUTH_USER'])) ||
(!isset($_SERVER['PHP_AUTH_PW'])) ||
($username != $_SERVER['PHP_AUTH_USER']) ||
($password != $_SERVER['PHP_AUTH_PW'])
) {
    header('WWW-Authenticate: Basic realm="WSPlate"');
    header('HTTP/1.1 401 Unauthorized');
    echo 'Unauthorized';
    exit;
}

/*******************************************************************
 *********************** END ACCESS CONTROL *************************
 *******************************************************************/



/*******************************************************************
 *********************** Load Synchweb Funcs ************************
 *******************************************************************/

include_once('../includes/pages/class.imaging.shared.php');
$imaging = new ImagingShared();


$states = array(
    1 => 'Not completed',
    'Skipped',
    'Pending',
    'Queued',
    'Imaging',
    'Completed',
    'Cancelled',
);

/*******************************************************************
 ********************* AUTOLOAD XSD BINDINGS ************************
 *******************************************************************/

// Autoload the xsd binding classes
function __autoload($class)
{
    if (strpos($class, '\\') !== FALSE) {
        $parts = explode('\\', $class);
        $path = 'bindings/' . end($parts) . '.php';
        if (file_exists($path)) {
            require_once($path);
            return;
        }
    }
    trigger_error('autoload failed for ' . $class, E_USER_WARNING);
}

/*******************************************************************
 ******************* END AUTOLOAD XSD BINDINGS **********************
 *******************************************************************/

/*******************************************************************
 ****************** IMPLEMENTED WSDL OPERATIONS *********************
 *******************************************************************/

// SynchWeb getPlateInfo implementation
function getPlateInfo($getPlateInfo)
{
    global $imaging, $plate_types;

    // Attempt to extract something useful for plate number
    // - note it must fit in an int
    // Stu - Not sure what this is used for?
    $plateNumber = 0;
    $matches = array();
    if (preg_match('#(\d{1,8})$#', $getPlateInfo->plateID, $matches)) {
        $plateNumber = $matches[1];
    }

    // Get plateinfo from SynchWeb
    $info = $imaging->_get_plate_info(array('BARCODE' => $getPlateInfo->plateID, 'SERIAL' => $getPlateInfo->robot->name));

    $plateInfo = new uk\ac\ox\oppf\www\WSPlate\PlateInfo();
    $plateInfo->dateDispensed = date("c", strtotime($info['BLTIMESTAMP']));
    $plateInfo->experimentName = $info['SHIPMENT'] . ' - ' . $info['DEWAR'];
    $plateInfo->plateNumber = $plateNumber;
    $plateInfo->projectName = $info['PROP'];

    // This MUST match the rockimager plate definitions or we'll destroy all plate training
    //   config.php has a mapping between internal and ispyb plate names
    if (!array_key_exists($info['CONTAINERTYPE'], $plate_types))
        return;
    $plateInfo->plateTypeID = $plate_types[$info['CONTAINERTYPE']];

    $plateInfo->userEmail = $info['EMAILADDRESS'];
    $plateInfo->userName = $info['LOGIN'];

    // error_log(print_r($plateInfo, true));

    $response = new uk\ac\ox\oppf\www\WSPlate\getPlateInfoResponse();
    $response->getPlateInfoReturn = $plateInfo;

    return $response;
}

// SynchWeb getImagingTasks implementation
function getImagingTasks($getImagingTasks)
{
    global $imaging, $states;

    /*
     * States:
     * 1 - NotCompleted
     * 2 - Skipped
     * 3 - Pending    - not valid server-side
     * 4 - Queued     - not valid server-side
     * 5 - Imaging    - not valid server-side
     * 6 - Completed
     * 7 - Cancelled  - not valid server-side
     */

    $arrayImagingTask = new uk\ac\ox\oppf\www\WSPlate\ArrayImagingTask();
    $arrayImagingTask->item = array();

    $inspections = $imaging->_get_plate_inspections(array('BARCODE' => $getImagingTasks->plateID, 'ALL' => 1));
    foreach ($inspections as $i) {
        $imagingTask = new uk\ac\ox\oppf\www\WSPlate\ImagingTask();

        $dateToImage = strtotime($i['DATETOIMAGE']);
        $imagingTask->dateToImage = date('c', $dateToImage);
        $imagingTask->dateImaged = $dateToImage >= time() ? null : ($i['DATEIMAGED'] ? date('c', $dateToImage) : null);
        $imagingTask->state = array_search($i['STATE'], $states);
        $imagingTask->priority = $i['PRIORITY'];
        $imagingTask->inQueue = 1 === $imagingTask->state;

        $arrayImagingTask->item[] = $imagingTask;
    }

    $response = new uk\ac\ox\oppf\www\WSPlate\getImagingTasksResponse();
    $response->wrapper = $arrayImagingTask;

    return $response;

}

// SynchWeb imagingPlate implementation
function imagingPlate($imagingPlate)
{
    global $imaging, $states;
    // state = 5

    // SoapServer DateTime handling bug
    $dateToImage = date_create_from_format(DATE_ATOM, preg_replace('/\.\d+(\w)$/', '$1', $imagingPlate->dateToImage));

    // This has come from ISPyB
    if ($imagingPlate->scheduled) {
        // This is totally nuts, we now have to magically retrive the containerinspectionid
        // based on the timestamp and barcode, we could have passed a unique id from
        // getImagingTasks which RockImager could internally use. Sigh :(
        $inspectionid = $imaging->_update_inspection(array(
            'DATETOIMAGE' => $dateToImage->format('d-m-Y H:i'),
            'BARCODE' => $imagingPlate->plateID,
            'VALUES' => array(
                'STATE' => $states[5],
                'BLTIMESTAMP' => date('d-m-Y H:i')
            )
        ));

        // The first task of the schedule if scheduled when the container is originally
        // created so is always overdue by the time it gets to site.

        // If this is the first imaging for this plate, now schedule the rest of the tasks
        // from this current timestamp (what we'll define as zero)
        $imaging->_check_schedule_from_zero(array('BARCODE' => $imagingPlate->plateID));


    // This one is a manual inspection from RockImager
    }
    else {
        $container = $imaging->_get_plate_info(array('BARCODE' => $imagingPlate->plateID));

        $args = array(
            'CONTAINERID' => $container['CONTAINERID'],
            'INSPECTIONTYPEID' => 1, // configure me
            'DATETOIMAGE' => $dateToImage->format('d-m-Y H:i'),
            'BARCODE' => $imagingPlate->plateID,
            'MANUAL' => 1,
            'STATE' => $states[5],
            'BLTIMESTAMP' => date('d-m-Y H:i')
        );

        if ($container['TEMPERATURE'])
            $args['TEMPERATURE'] = $container['TEMPERATURE'];
        if ($container['IMAGERID'])
            $args['IMAGERID'] = $container['IMAGERID'];

        $inspectionid = $imaging->_do_insert_inspection($args);
    }


    $response = new uk\ac\ox\oppf\www\WSPlate\imagingPlateResponse();
    // sigh
    $response->imagingPlateReturn = $inspectionid . date('-Ymd-His');

    return $response;

}

// SynchWeb imagedPlate implementation
// ... Sanity ...
function imagedPlate($imagedPlate)
{
    global $imaging, $states;

    // so close to sanity...
    $id = preg_replace('/\-.*/', '', $imagedPlate->imagingID);

    // Mark imaging session $imagedPlate->imagingID as completed
    // - state 6
    $inspection = $imaging->_do_update_inspection(array(
        'CONTAINERINSPECTIONID' => $id,
        'VALUES' => array(
            'STATE' => $states[6],
            'COMPLETEDTIMESTAMP' => date('d-m-Y H:i')
        )
    ));

    $imaging->_email_status_update($id);

    $response = new uk\ac\ox\oppf\www\WSPlate\imagedPlateResponse();
    $response->imagedPlateReturn = true;

    return $response;

}

// SynchWeb skippedImaging implementation
function skippedImaging($skippedImaging)
{
    global $imaging, $states;

    // Mark imaging session $skippedImaging->dateToImage for
    // $skippedImaging->plateID as skipped
    // - state 2
    $dateToImage = date_create_from_format(DATE_ATOM, $skippedImaging->dateToImage);
    $imaging->_update_inspection(array(
        'DATETOIMAGE' => $dateToImage->format('d-m-Y H:i'),
        'BARCODE' => $skippedImaging->plateID,
        'VALUES' => array(
            'STATE' => $states[2],
        )
    ));

    $response = new uk\ac\ox\oppf\www\WSPlate\skippedImagingResponse();
    $response->skippedImagingReturn = true;

    return $response;

}

// SynchWeb updatedPriority implementation
function updatedPriority($updatedPriority)
{
    global $imaging;

    // Mark imaging session $updatedPriority->dateToImage for
    // $updatedPriority->plateID as having priority
    // $updatedPriority->priority
    $dateToImage = date_create_from_format(DATE_ATOM, $updatedPriority->dateToImage);
    $imaging->_update_inspection(array(
        'DATETOIMAGE' => $dateToImage->format('d-m-Y H:i'),
        'BARCODE' => $updatedPriority->plateID,
        'VALUES' => array(
            'PRIORITY' => $updatedPriority->priority
        )
    ));

    $response = new uk\ac\ox\oppf\www\WSPlate\updatedPriorityResponse();
    $response->updatedPriorityReturn = true;

    return $response;

}

// SynchWeb uploadImages implementation
function uploadImages($uploadImages)
{

    $arrayUploadImage = $uploadImages->wrapper;

    // From here we could directly upload the images, but i guess we might
    // timeout the request

    // Client gets informed of per-image success/failure
    $arrayUploadImageResponse = new uk\ac\ox\oppf\www\WSPlate\ArrayUploadImageResponse();

    foreach ($arrayUploadImage->item as $item) {
        /* Update records to add the image details using:
         *   $item->robot
         *   $item->imagingID
         *   $item->plateID
         *   $item->well
         *   $item->url - at which this image is already available
         *   $item->image->height, $item->image->width - image size in pxiels
         *   $item->pixel->height, $item->pixel->width - pixel size in microns
         *   $item->colourDepth
         *   $item->dateImaged
         *   $item->type - composite, slice or zoomed
         */

        // Populate an UploadImageResponse for this image so the client
        // knows what happened
        $uploadImageResponse = new uk\ac\ox\oppf\www\WSPlate\UploadImageResponse();
        $uploadImageResponse->ok = true;
        $uploadImageResponse->url = $item->url;
        $uploadImageResponse->reason = null;

        $arrayUploadImageResponse->item[] = $uploadImageResponse;
    }

    $uploadImagesResponse = new uk\ac\ox\oppf\www\WSPlate\uploadImagesResponse();
    $uploadImagesResponse->wrapper = $arrayUploadImageResponse;

    return $uploadImagesResponse;

}

/*******************************************************************
 **************** END IMPLEMENTED WSDL OPERATIONS *******************
 *******************************************************************/

/*******************************************************************
 *********************** SOAPSERVER SETUP  **************************
 *******************************************************************/

$server = new SoapServer(
    "WSPlate.wsdl",
    array(
    'cache_wsdl' => WSDL_CACHE_MEMORY,
    'classmap' => array(
        'ArrayCapturePoint' => "uk\ac\ox\oppf\www\WSPlate\ArrayCapturePoint",
        'ArrayCaptureProfile' => "uk\ac\ox\oppf\www\WSPlate\ArrayCaptureProfile",
        'ArrayFocalPoint' => "uk\ac\ox\oppf\www\WSPlate\ArrayFocalPoint",
        'ArrayImagingTask' => "uk\ac\ox\oppf\www\WSPlate\ArrayImagingTask",
        'ArrayPlateType' => "uk\ac\ox\oppf\www\WSPlate\ArrayPlateType",
        'ArrayProject' => "uk\ac\ox\oppf\www\WSPlate\ArrayProject",
        'ArrayProperty' => "uk\ac\ox\oppf\www\WSPlate\ArrayProperty",
        'ArraySample' => "uk\ac\ox\oppf\www\WSPlate\ArraySample",
        'ArrayUploadImage' => "uk\ac\ox\oppf\www\WSPlate\ArrayUploadImage",
        'ArrayUploadImageResponse' => "uk\ac\ox\oppf\www\WSPlate\ArrayUploadImageResponse",
        'CanListSamplesFault' => "uk\ac\ox\oppf\www\WSPlate\CanListSamplesFault",
        'CanListSamplesResponse' => "uk\ac\ox\oppf\www\WSPlate\CanListSamplesResponse",
        'CaptureInfo' => "uk\ac\ox\oppf\www\WSPlate\CaptureInfo",
        'CapturePointList' => "uk\ac\ox\oppf\www\WSPlate\CapturePointList",
        'CapturePoint' => "uk\ac\ox\oppf\www\WSPlate\CapturePoint",
        'CaptureProfile' => "uk\ac\ox\oppf\www\WSPlate\CaptureProfile",
        'FocalPoint' => "uk\ac\ox\oppf\www\WSPlate\FocalPoint",
        'GetCapturePointsFault' => "uk\ac\ox\oppf\www\WSPlate\GetCapturePointsFault",
        'getCapturePoints' => "uk\ac\ox\oppf\www\WSPlate\getCapturePoints",
        'getCapturePointsResponse' => "uk\ac\ox\oppf\www\WSPlate\getCapturePointsResponse",
        'GetDefaultCaptureProfileFault' => "uk\ac\ox\oppf\www\WSPlate\GetDefaultCaptureProfileFault",
        'getDefaultCaptureProfile' => "uk\ac\ox\oppf\www\WSPlate\getDefaultCaptureProfile",
        'getDefaultCaptureProfileResponse' => "uk\ac\ox\oppf\www\WSPlate\getDefaultCaptureProfileResponse",
        'GetFirstDropFault' => "uk\ac\ox\oppf\www\WSPlate\GetFirstDropFault",
        'getFirstDrop' => "uk\ac\ox\oppf\www\WSPlate\getFirstDrop",
        'getFirstDropResponse' => "uk\ac\ox\oppf\www\WSPlate\getFirstDropResponse",
        'GetFirstDropReturn' => "uk\ac\ox\oppf\www\WSPlate\GetFirstDropReturn",
        'GetImageProcessorFault' => "uk\ac\ox\oppf\www\WSPlate\GetImageProcessorFault",
        'getImageProcessor' => "uk\ac\ox\oppf\www\WSPlate\getImageProcessor",
        'getImageProcessorResponse' => "uk\ac\ox\oppf\www\WSPlate\getImageProcessorResponse",
        'GetImagingTasksFault' => "uk\ac\ox\oppf\www\WSPlate\GetImagingTasksFault",
        'getImagingTasks' => "uk\ac\ox\oppf\www\WSPlate\getImagingTasks",
        'getImagingTasksResponse' => "uk\ac\ox\oppf\www\WSPlate\getImagingTasksResponse",
        'GetPlateIDFault' => "uk\ac\ox\oppf\www\WSPlate\GetPlateIDFault",
        'getPlateID' => "uk\ac\ox\oppf\www\WSPlate\getPlateID",
        'getPlateIDResponse' => "uk\ac\ox\oppf\www\WSPlate\getPlateIDResponse",
        'GetPlateInfoFault' => "uk\ac\ox\oppf\www\WSPlate\GetPlateInfoFault",
        'getPlateInfo' => "uk\ac\ox\oppf\www\WSPlate\getPlateInfo",
        'getPlateInfoResponse' => "uk\ac\ox\oppf\www\WSPlate\getPlateInfoResponse",
        'GetPlateTypeFault' => "uk\ac\ox\oppf\www\WSPlate\GetPlateTypeFault",
        'getPlateType' => "uk\ac\ox\oppf\www\WSPlate\getPlateType",
        'getPlateTypeResponse' => "uk\ac\ox\oppf\www\WSPlate\getPlateTypeResponse",
        'GetPlateTypesFault' => "uk\ac\ox\oppf\www\WSPlate\GetPlateTypesFault",
        'getPlateTypes' => "uk\ac\ox\oppf\www\WSPlate\getPlateTypes",
        'getPlateTypesResponse' => "uk\ac\ox\oppf\www\WSPlate\getPlateTypesResponse",
        'ImagedPlateFault' => "uk\ac\ox\oppf\www\WSPlate\ImagedPlateFault",
        'imagedPlate' => "uk\ac\ox\oppf\www\WSPlate\imagedPlate",
        'imagedPlateResponse' => "uk\ac\ox\oppf\www\WSPlate\imagedPlateResponse",
        'ImageInfo' => "uk\ac\ox\oppf\www\WSPlate\ImageInfo",
        'ImageType' => "uk\ac\ox\oppf\www\WSPlate\ImageType",
        'ImagingPlateFault' => "uk\ac\ox\oppf\www\WSPlate\ImagingPlateFault",
        'imagingPlate' => "uk\ac\ox\oppf\www\WSPlate\imagingPlate",
        'imagingPlateResponse' => "uk\ac\ox\oppf\www\WSPlate\imagingPlateResponse",
        'ImagingTask' => "uk\ac\ox\oppf\www\WSPlate\ImagingTask",
        'ListProjectsFault' => "uk\ac\ox\oppf\www\WSPlate\ListProjectsFault",
        'listProjects' => "uk\ac\ox\oppf\www\WSPlate\listProjects",
        'listProjectsResponse' => "uk\ac\ox\oppf\www\WSPlate\listProjectsResponse",
        'ListSamplesFault' => "uk\ac\ox\oppf\www\WSPlate\ListSamplesFault",
        'listSamples' => "uk\ac\ox\oppf\www\WSPlate\listSamples",
        'listSamplesResponse' => "uk\ac\ox\oppf\www\WSPlate\listSamplesResponse",
        'PlateInfo' => "uk\ac\ox\oppf\www\WSPlate\PlateInfo",
        'PlateType' => "uk\ac\ox\oppf\www\WSPlate\PlateType",
        'Point' => "uk\ac\ox\oppf\www\WSPlate\Point",
        'ProcessingInfo' => "uk\ac\ox\oppf\www\WSPlate\ProcessingInfo",
        'Project' => "uk\ac\ox\oppf\www\WSPlate\Project",
        'Property' => "uk\ac\ox\oppf\www\WSPlate\Property",
        'Robot' => "uk\ac\ox\oppf\www\WSPlate\Robot",
        'Sample' => "uk\ac\ox\oppf\www\WSPlate\Sample",
        'Size' => "uk\ac\ox\oppf\www\WSPlate\Size",
        'SkippedImagingFault' => "uk\ac\ox\oppf\www\WSPlate\SkippedImagingFault",
        'skippedImaging' => "uk\ac\ox\oppf\www\WSPlate\skippedImaging",
        'skippedImagingResponse' => "uk\ac\ox\oppf\www\WSPlate\skippedImagingResponse",
        'SupportsPriorityFault' => "uk\ac\ox\oppf\www\WSPlate\SupportsPriorityFault",
        'supportsPriority' => "uk\ac\ox\oppf\www\WSPlate\supportsPriority",
        'supportsPriorityResponse' => "uk\ac\ox\oppf\www\WSPlate\supportsPriorityResponse",
        'UpdatedPriorityFault' => "uk\ac\ox\oppf\www\WSPlate\UpdatedPriorityFault",
        'updatedPriority' => "uk\ac\ox\oppf\www\WSPlate\updatedPriority",
        'updatedPriorityResponse' => "uk\ac\ox\oppf\www\WSPlate\updatedPriorityResponse",
        'UploadImage' => "uk\ac\ox\oppf\www\WSPlate\UploadImage",
        'UploadImageResponse' => "uk\ac\ox\oppf\www\WSPlate\UploadImageResponse",
        'UploadImagesFault' => "uk\ac\ox\oppf\www\WSPlate\UploadImagesFault",
        'uploadImages' => "uk\ac\ox\oppf\www\WSPlate\uploadImages",
        'uploadImagesResponse' => "uk\ac\ox\oppf\www\WSPlate\uploadImagesResponse",
        'WSPlateError' => "uk\ac\ox\oppf\www\WSPlate\WSPlateError"
    )
)
    );

// WSDL operations - PlateInfoProvider
//getPlateID         - not used
//getPlateInfo       - required
//getPlateType       - not used
//getPlateTypes      - not used

// WSDL operations - ImageProcessorProvider
//getImageProcessor  - WSDL bug - should not be present

// WSDL operations - ImagingTaskProvider
//getImagingTasks    - required
//imagingPlate       - required
//imagedPlate        - required
//skippedImaging     - required
//supportsPriority   - not used
//updatedPriority    - required

// WSDL operations - CaptureProvider
//getDefaultCaptureProfile - not used
//getCapturePoints         - not used
//getFirstDrop             - not used

// WSDL operations - SampleProvider
//uploadImages       - required for ImageUploader
//listSamples        - required for CartWrapper
//listProjects       - required for CartWrapper
//canListSamples     - required for CartWrapper

// Implemented WSDL operations
$server->addFunction("getPlateInfo");
$server->addFunction("getImagingTasks");
$server->addFunction("imagingPlate");
$server->addFunction("imagedPlate");
$server->addFunction("skippedImaging");
$server->addFunction("updatedPriority");
$server->addFunction("uploadImages");

/*******************************************************************
 ********************** END SOAPSERVER SETUP ************************
 *******************************************************************/

/*******************************************************************
 ********************** HANDLE SOAP REQUESTS ************************
 *******************************************************************/

// Handle the SOAP request
try {
    // ob_start();
    $server->handle();
// $xml = ob_get_contents();
// ob_end_clean();
// error_log($xml);
// echo $xml;
}
catch (Exception $e) {
    $server->fault('Sender', $e->getMessage());
}

?>