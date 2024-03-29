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
                        "/.*\/{$visitCode}\//",
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
                'required' => false,
                /*
                'default' => '',
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'type' => 'real'
                */
            ),
            /**
             * In SynchWeb, imageSize is displayed as a string, but in ISpyB
             * it is stored as two integers.
             */
            'imageSizeX' => array(
                'label' => 'Image Size X',
                'unit' => 'Pixels',
                'required' => false,
                'display' => false,
                /*
                'type' => 'integer',
                'onUpdate' => function ($postData) {
                    preg_match(
                        '/(\d+)\sX\s(\d+)/i',
                        $postData['imageSize'],
                        $matches
                    );
                    return $matches[1];
                },
                */
            ),
            'imageSizeY' => array(
                'label' => 'Image Size Y',
                'unit' => 'Pixels',
                'required' => false,
                'display' => false,
                /*
                'type' => 'integer',
                'onUpdate' => function ($postData) {
                    preg_match(
                        '/(\d+)\sX\s(\d+)/i',
                        $postData['imageSize'],
                        $matches
                    );
                    return $matches[2];
                },
                */
            ),
            'imageSize' => array(
                'label' => 'Image Size',
                'unit' => 'Pixels',
                'required' => false,
                'stored' => false,
                /*
                'options' => array('11520 x 8184', '5760 x 4092', '4096 x 4096'),
                'default' => '5760 x 4092',
                */
                'onSelect' => function ($row) {
                    $isx = $row['imageSizeX'];
                    if (!$isx) {
                        $isx = 0;
                    }
                    $isy = $row['imageSizeY'];
                    if (!$isy) {
                        $isy = 0;
                    }
                    return "$isx x $isy";
                }
            ),
            'numberOfImages' => array(
                'label' => 'Number of Movies',
                'required' => false,
                /*
                'minValue' => 1000,
                'maxValue' => 50000,
                'type' => 'integer',
                */
            ),
            'numberOfPasses' => array(
                'label' => 'Frames Per Movie',
                'display' => 'notBlank',
                'required' => false,
                /*
                'required' => array( // everything except eer
                    'imageSuffix' => array('tif', 'tiff', 'mrc'),
                ),
                'minValue' => 30,
                'maxValue' => 60,
                'type' => 'integer',
                */
            ),
            'exposureTime' => array(
                'label' => 'Total Exposure Time',
                'unit' => 'seconds',
                'required' => false,
                /*
                'minValue' => 1,
                'maxValue' => 10,
                'type' => 'real',
                */
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
            'phasePlate' => array(
                'label' => 'Phase Plate Used',
                'required' => false,
                /*
                'default' => 0,
                'options' => array('0', '1', '2', '3', '4', '5', '6'),
                'displayOptions' => array(
                    'None',
                    'Ph P1',
                    'Ph P2',
                    'Ph P3',
                    'Ph P4',
                    'Ph P5',
                    'Ph P6',
                ),
                */
                'onSelect' => function ($row) {
                    return $row['phasePlate'] ? $row['phasePlate'] : '0';
                },
            ),
            'c2lens' => array(
                'label' => 'C2 Lens',
                'unit' => '%',
                'required' => false,
                /*
                'minValue' => 40,
                'maxValue' => 65,
                'type' => 'integer',
                */
            ),
            'c2aperture' => array(
                'label' => 'C2 Aperture',
                'unit' => 'μm',
                'required' => false,
                /*
                'options' => array('50', '70'),
                'default' => '50',
                'type' => 'integer',
                */
            ),
            'objAperture' => array(
                'label' => 'Objective Aperture',
                'unit' => 'μm',
                'display' => 'notBlank',
                'required' => false,
                /*
                'required' => array(
                    'phasePlate' => '0',
                ),
                'options' => array('100', '70'),
                'default' => '100',
                'type' => 'integer',
                */
            ),
            'magnification' => array(
                'label' => 'Magnification',
                'required' => false,
                /*
                'minValue' => 53000,
                'maxValue' => 215000,
                'type' => 'integer',
                */
            ),
            // Electron Beam & Detector
            'voltage' => array(
                'label' => 'Voltage',
                'unit' => 'kV',
                'required' => false,
                /*
                'default' => '300',
                'options' => array('200', '300'),
                */
            ),
            'beamSizeAtSampleX' => array(
                'label' => 'Illuminated Area X',
                'unit' => 'nm',
                'display' => false,
                'required' => false,
                /*
                'minValue' => 320,
                'maxValue' => 1500,
                'default' => 600,
                'type' => 'integer',
                */
                // ISpyB uses 'μm' - SynchWeb uses 'nm'
                /*
                'onUpdate' => function ($postData) {
                    return $postData['beamSizeAtSampleX'] * 1000.0;
                },
                */
                'onSelect' => function ($row) {
                    return $row['beamSizeAtSampleX'] / 1000.0;
                },
            ),
            'beamSizeAtSampleY' => array(
                'label' => 'Illuminated Area Y',
                'unit' => 'nm', // ISpyB "uses" 'μm',
                'display' => false,
                'required' => false,
                /*
                'minValue' => 320,
                'maxValue' => 1500,
                'default' => 600,
                'type' => 'integer',
                */
                // ISpyB uses 'μm' - SynchWeb uses 'nm'
                /*
                'onUpdate' => function ($postData) {
                    return $postData['beamSizeAtSampleY'] * 1000.0;
                },
                */
                'onSelect' => function ($row) {
                    return $row['beamSizeAtSampleY'] / 1000.0;
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
                'required' => false,
                /*
                'default' => '0.5',
                'minValue' => 0.2,
                'maxValue' => 150.0,
                'type' => 'real',
                */
            ),
            'frameDose' => array(
                'label' => 'Frame Dose',
                'unit' => 'e⁻/Å²',
                'required' => false,
                'stored' => false,
                'onSelect' => function ($row) {
                    return $row['numberOfPasses'] > 0 ? round(
                        $row['totalExposedDose'] / $row['numberOfPasses'],
                        6
                    ) : 0;
                }
            ),
            'slitGapHorizontal' => array(
                'label' => 'Energy Filter / Slit Width',
                 'unit' => 'eV',
                 'required' => false,
                 /*
                 'minValue' => 5,
                 'maxValue' => 20,
                 'type' => 'real',
                 */
            ),
            'detectorManufacturer' => array(
                'label' => 'Detector Manufacturer',
                'required' => false,
                'stored' => false,
            ),
            'detectorModel' => array(
                'label' => 'Detector Model',
                'required' => false,
                'stored' => false,
            ),
            'detectorMode' => array(
                'label' => 'Detector Mode',
                'required' => false,
                /*
                'options' => array('Counted', 'Super Resolution Counted', 'Linear'),
                'default' => 'Counted',
                */
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
