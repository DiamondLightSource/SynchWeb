<?php

namespace SynchWeb\Page\EM;

use DateTime;
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
                /* [SCI-10082] Nowhere currently to store it.
                   onSelect, here is a temporary hack for the meantime:
                */
                'onSelect' => function ($row) {
                    $template = $row['fileTemplate'];
                    if (preg_match('/GridSquare_\*\/Data\/\*/', $template) == 1) {
                        return 'EPU';
                    }
                    if (preg_match('/Frames\/\*/', $template) == 1) {
                        return 'SerialEM';
                    }
                    return '';
                }
            ),
            'imageDirectory' => array(
                'label' => 'Movie File Directory',
                'required' => true,
                'default' => 'raw',
                'pattern' => 'directory',
                'display' => false,
            ),
            'shortImageDirectory' => array(
                'required' => false,
                'display' => false,
                'stored' => false,
                'onSelect' => function ($row) {
                    $visitCode = $row['proposal'] . '-' . $row['visit_number'];
                    return preg_replace(
                        "#.*/{$visitCode}/#",
                        '',
                        $row['imageDirectory']
                    );
                }
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
            /* We could include `binning` here but it's something of a can of
               worms... Sometimes binning is done on the microscope, sometimes
               during motion correction. If `binning` in the data collection is
               "1", then `motioncor_binning` in Relion should be "2" and vice-versa.
               To avoid confusion, we've decided to omit it here because
               (quote) "it's obvious from the image size" */
            'pixelSizeOnImage' => array(
                'label' => 'Pixel Size',
                'unit' => 'Å/pixel',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'type' => 'real'
            ),
            /**
             * In SynchWeb, imageSize is displayed as a string, but in ISpyB
             * it is stored as two integers.
             */
            'imageSizeX' => array(
                'label' => 'Image Size X',
                'unit' => 'Pixels',
                'required' => false,
                'type' => 'integer',
                'display' => false,
                'onUpdate' => function ($postData) {
                    preg_match(
                        '/(\d+)\sX\s(\d+)/i',
                        $postData['imageSize'],
                        $matches
                    );
                    return $matches[1];
                },
            ),
            'imageSizeY' => array(
                'label' => 'Image Size Y',
                'unit' => 'Pixels',
                'required' => false,
                'type' => 'integer',
                'display' => false,
                'onUpdate' => function ($postData) {
                    preg_match(
                        '/(\d+)\sX\s(\d+)/i',
                        $postData['imageSize'],
                        $matches
                    );
                    return $matches[2];
                },
            ),
            'imageSize' => array(
                'label' => 'Image Size',
                'unit' => 'Pixels',
                'required' => true,
                'stored' => false,
                'options' => array('11520 x 8184', '5760 x 4092', '4096 x 4096'),
                'default' => '5760 x 4092',
                'onSelect' => function ($row) {
                    $isx = $row['imageSizeX'];
                    $isy = $row['imageSizeY'];
                    return "$isx x $isy";
                }
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
                'stored' => false,
                'onSelect' => function ($row) {
                    return $row['numberOfPasses'] > 0 ?
                        $row['exposureTime'] / $row['numberOfPasses'] : 0;
                }
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
                'default' => '50',
                'type' => 'integer',
            ),
            'objAperture' => array(
                'label' => 'Objective Aperture',
                'unit' => 'μm',
                'required' => true,
                'options' => array('100', '70'),
                'default' => '100',
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
                'label' => 'Illuminated Area X',
                'unit' => 'nm',
                'required' => true,
                'minValue' => 320,
                'maxValue' => 1500,
                'default' => 600,
                'type' => 'integer',
                'display' => false,
                'onUpdate' => function ($postData) {
                    // ISpyB uses 'μm' - SynchWeb uses 'nm'
                    return $postData['beamSizeAtSampleX'] * 1000.0;
                },
            ),
            'beamSizeAtSampleY' => array(
                'label' => 'Illuminated Area Y',
                'unit' => 'nm', // ISpyB "uses" 'μm',
                'required' => true,
                'minValue' => 320,
                'maxValue' => 1500,
                'default' => 600,
                'type' => 'integer',
                'display' => false,
                'onUpdate' => function ($postData) {
                    // ISpyB uses 'μm' - SynchWeb uses 'nm'
                    return $postData['beamSizeAtSampleY'] * 1000.0;
                },
            ),
            'beamSizeAtSample' => array(
                'label' => 'Illuminated Area',
                'unit' => 'nm',
                'required' => false,
                'stored' => false,
                'onSelect' => function ($row) {
                    // ISpyB uses 'μm' - SynchWeb uses 'nm'
                    $bsx = $row['beamSizeAtSampleX'] / 1000.0;
                    $bsy = $row['beamSizeAtSampleY'] / 1000.0;
                    return "$bsx x $bsy";
                },
            ),
            'totalExposedDose' => array(
                'label' => 'Total Dose',
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
                'stored' => false,
                'onSelect' => function ($row) {
                    return $row['numberOfPasses'] > 0 ?
                        $row['totalExposedDose'] / $row['numberOfPasses'] : 0;
                }
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
                'required' => false,
                // TODO: store it!
                'stored' => false,
                // TODO max length 255
            ),
            'detectorModel' => array(
                'label' => 'Detector Model',
                'required' => false,
                // TODO: store it!
                'stored' => false,
                // TODO max length 255
            ),
            'detectorMode' => array(
                'label' => 'Detector Mode',
                'required' => true,
                'options' => array('Counted', 'Super Resolution Counted', 'Linear'),
                'default' => 'Counted',
            ),
            // Miscellanea
            'comments' => array(
                'label' => 'Comments',
                'required' => 'optional',
            ),
            'dataCollectionId' => array(
                'display' => false,
                'required' => false,
            ),
            'dataCollectionGroupId' => array(
                'display' => false,
                'required' => false,
            ),
            'startTime' => array(
                'display' => false,
                'required' => false,
                'select' => 'DATE_FORMAT(DataCollection.startTime, "%d-%m-%Y %k:%i:%s")',
                'onUpdate' => function ($postData) {
                    return (new DateTime())->format('Y-m-d H:i:s');
                }
            ),
            'endTime' => array(
                'display' => false,
                'required' => false,
                'select' => 'DATE_FORMAT(DataCollection.endTime, "%d-%m-%Y %k:%i:%s")',
            ),
            'visit_number' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'BLSession.visit_number',
            ),
            'archived' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'BLSession.archived',
            ),
            'beamLineName' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'BLSession.beamLineName',
            ),
            'proposal' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'CONCAT(Proposal.proposalCode, Proposal.proposalNumber)',
            ),
            'attachmentsCount' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'COUNT(DataCollectionFileAttachment.dataCollectionFileAttachmentId)',
            ),
            'commentsCount' => array(
                'display' => false,
                'required' => false,
                'stored' => false,
                'select' => 'COUNT(DataCollectionComment.dataCollectionCommentId)',
            ),
        );
    }
}
