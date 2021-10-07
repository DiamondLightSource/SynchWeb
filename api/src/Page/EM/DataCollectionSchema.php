<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Page\EM\Schema;

class DataCollectionSchema extends Schema
{
    protected function defaultTable()
    {
        return 'DataCollection';
    }

    /**
     * Default validation and conversion rules for EM Data Collection
     *
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */
    public function schema()
    {
        return array(
            // Movies
            'acquisitionSoftware' => array(
                'label' => 'Acquisition Software',
                'required' => true,
                'default' => 'EPU',
                'options' => array('EPU', 'SerialEM'),
                'stored' => false,
            ),
            'imageDirectory' => array(
                'label' => 'Movie File Directory',
                'required' => true,
                'default' => 'raw',
                'pattern' => 'directory',
                'display' => false,
            ),
            'imageSuffix' => array(
                'label' => 'Movie File Name Extension',
                'required' => true,
                'default' => 'tiff',
                'options' => array('tif', 'tiff', 'mrc', 'eer'),
                'displayOptions' => array('.tif', '.tiff', '.mrc', '.eer'),
                'display' => false,
            ),
            'fileTemplate' => array(
                'required' => false,
                'display' => false,
            ),
            'pixelSizeOnImage' => array(
                'label' => 'Pixel Size',
                'unit' => 'Å/pixel',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'type' => 'real'
            ),
            'imageSize' => array(
                'label' => 'Image Size',
                'unit' => 'Pixels',
                'required' => true,
                'options' => array('11520, 8184', '5760, 4092', '4096, 4096'),
                'select' => 'CONCAT(DataCollection.imageSizeX, " x ", DataCollection.imageSizeY)',
            ),
            'numberOfImages' => array(
                'label' => 'Number of Movies',
                'required' => true,
                'minValue' => 1000,
                'maxValue' => 50000,
                'type' => 'integer',
            ),
            'numberOfPasses' => array(
                'label' => 'Frames Per Movie',
                'required' => true,
                'minValue' => 30,
                'maxValue' => 60,
                'type' => 'integer',
            ),
            'exposureTime' => array(
                'label' => 'Total Exposure Time',
                'unit' => 'seconds',
                'required' => true,
                'minValue' => 1,
                'maxValue' => 10,
                'type' => 'real',
            ),
            'frameLength' => array(
                'label' => 'Frame Length',
                'unit' => 'seconds',
                'required' => false,
                'select' => 'DataCollection.exposureTime / DataCollection.numberOfPasses'
            ),
            // Optics
            'c2lens' => array(
                'label' => 'C2 Lens',
                'unit' => '%',
                'required' => true,
                'minValue' => 40,
                'maxValue' => 65,
                'type' => 'integer',
            ),
            'c2aperture' => array(
                'label' => 'C2 Aperture',
                'unit' => 'μm',
                'required' => true,
                'options' => array('50', '70'),
                'type' => 'integer',
            ),
            'objAperture' => array(
                'label' => 'Objective Aperture',
                'unit' => 'μm',
                'required' => true,
                'options' => array('100', '70'),
                'type' => 'integer',
            ),
            'magnification' => array(
                'label' => 'Magnification',
                'required' => true,
                'minValue' => 53000,
                'maxValue' => 215000,
                'type' => 'integer',
            ),
            // Electron Beam & Detector
            'voltage' => array(
                'label' => 'Voltage',
                'unit' => 'kV',
                'default' => '300',
                'required' => true,
                'options' => array('200', '300'),
            ),
            /* On the input form, beamSizeAtSample will be 2 separate
              values for X & Y... in the display block, this will be a single
              value showing X & Y. */
            'beamSizeAtSampleX' => array(
                'label' => 'Beam Size X',
                'unit' => 'μm',
                'required' => true,
                'type' => 'integer',
                'display' => false,
            ),
            'beamSizeAtSampleY' => array(
                'label' => 'Beam Size Y',
                'unit' => 'μm',
                'required' => true,
                'type' => 'integer',
                'display' => false,
            ),
            'beamSizeAtSample' => array(
                'label' => 'Beam Size',
                'unit' => 'μm',
                'required' => false,
                'select' => 'CONCAT(DataCollection.beamSizeAtSampleX, " X ", DataCollection.beamSizeAtSampleY)',
            ),
            'totalExposedDose' => array(
                'label' => 'Dose per frame',
                'unit' => 'e⁻/Å²',
                'default' => '0.5',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 10.0,
                'type' => 'real',
            ),
            'frameDose' => array(
                'label' => 'Frame Dose',
                'unit' => 'e⁻/Å²',
                'required' => false,
                'select' => 'DataCollection.totalExposedDose / DataCollection.numberOfPasses'
            ),
            'slitGapHorizontal' => array(
                'label' => 'Energy Filter / Slit Width',
                 'unit' => 'eV',
                 'required' => true,
                 'minValue' => 5,
                 'maxValue' => 20,
                 'type' => 'real',
            ),
            'phasePlate' => array(
                'label' => 'Phase Plate Used',
                'default' => false,
                'required' => true,
                'type' => 'boolean'
            ),
            'detectorManufacturer' => array(
                'label' => 'Detector Manufacturer',
                'readOnly' => true,
                'stored' => false,
                'required' => true,
                // TODO max length 255
            ),
            'detectorModel' => array(
                'label' => 'Detector Model',
                'readOnly' => true,
                'required' => true,
                'stored' => false,
                // TODO max length 255
            ),
            'detectorMode' => array(
                'label' => 'Detector Mode',
                'required' => true,
                'options' => array('Counted', 'Super Resolution Counted', 'Linear'),
            ),
            // Miscellanea
            'comments' => array(
                'label' => 'Comments',
                'required' => 'optional',
            ),
            'dataCollectionId' => array(
                'display' => false,
                'required' => false,
                'select' => 'DataCollection.dataCollectionId',
            ),
            'dataCollectionGroupId' => array(
                'display' => false,
                'required' => false,
                'select' => 'DataCollection.dataCollectionGroupId',
            ),
            'startTime' => array(
                'display' => false,
                'required' => false,
                'select' => 'DATE_FORMAT(DataCollection.startTime, "%d-%m-%Y %k:%i:%s")',
            ),
            'visit_number' => array(
                'display' => false,
                'required' => false,
                'select' => 'BLSession.visit_number',
            ),
            'archived' => array(
                'display' => false,
                'required' => false,
                'select' => 'BLSession.archived',
            ),
            'beamLineName' => array(
                'display' => false,
                'required' => false,
                'select' => 'BLSession.beamLineName',
            ),
            'attachmentsCount' => array(
                'display' => false,
                'required' => false,
                'select' => 'COUNT(DataCollectionFileAttachment.dataCollectionFileAttachmentId)',
            ),
            'commentsCount' => array(
                'display' => false,
                'required' => false,
                'select' => 'COUNT(DataCollectionComment.dataCollectionCommentId)',
            ),
        );
    }
}
