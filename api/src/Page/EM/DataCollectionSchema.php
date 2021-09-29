<?php

namespace SynchWeb\Page\EM;

class DataCollectionSchema
{
    /**
     * Default validation and conversion rules for EM Data Collection
     *
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */
    public static function schema()
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
            ),
            'imageSuffix' => array(
                'label' => 'Movie File Name Extension',
                'required' => true,
                'default' => 'tiff',
                'options' => array('tif', 'tiff', 'mrc', 'eer'),
                'displayOptions' => array('.tif', '.tiff', '.mrc', '.eer'),
            ),
            // TODO Binning
            'pixelSizeOnImage' => array(
                'label' => 'Pixel Size',
                'unit' => 'Å/pixel',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'checkType' => 'real'
            ),
            'imageSizeX' => array(
                'label' => 'Image Size X',
                'unit' => 'Pixels',
                'required' => true,
                'checkType' => 'integer',
            ),
            'imageSizeY' => array(
                'label' => 'Image Size Y',
                'unit' => 'Pixels',
                'required' => true,
                'checkType' => 'integer',
            ),
            'numberOfImages' => array(
                'label' => 'Number of Movies',
                'required' => true,
                'checkType' => 'integer',
            ),
            'numberOfPasses' => array(
                'label' => 'Frames Per Movie',
                'required' => true,
                'checkType' => 'integer',
            ),
            'exposureTime' => array(
                'label' => 'Exposure Time',
                'required' => true,
                'checkType' => 'real',
            ),
            // Optics
            'c1lens' => array(
                'label' => 'C1 Lens',
                'unit' => '%',
                'required' => true,
                'checkType' => 'integer',
            ),
            'c1aperture' => array(
                'label' => 'C1 Aperture',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'c2lens' => array(
                'label' => 'C2 Lens',
                'unit' => '%',
                'required' => true,
                'checkType' => 'integer',
            ),
            'c2aperture' => array(
                'label' => 'C2 Aperture',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'c3lens' => array(
                'label' => 'C3 Lens',
                'unit' => '%',
                'required' => true,
                'checkType' => 'integer',
            ),
            'c3aperture' => array(
                'label' => 'C3 Aperture',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'objAperture' => array(
                'label' => 'Objective Aperture',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'magnification' => array(
                'label' => 'Magnification',
                'required' => true,
                'checkType' => 'integer',
            ),
            // Electron Beam & Detector
            'voltage' => array(
                'label' => 'Voltage',
                'unit' => 'kV',
                'default' => '300',
                'required' => true,
                'options' => array('200', '300'),
            ),
            'beamSizeAtSampleX' => array(
                'label' => 'Beam Size X',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'beamSizeAtSampleY' => array(
                'label' => 'Beam Size Y',
                'unit' => 'μm',
                'required' => true,
                'checkType' => 'integer',
            ),
            'totalExposedDose' => array(
                'label' => 'Dose per frame',
                'unit' => 'e⁻/Å²',
                'default' => '0.5',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 10.0,
                'checkType' => 'real',
            ),
            // TODO Energy Filter ???
            'phasePlate' => array(
                'label' => 'Phase Plate Used',
                'default' => false,
                'required' => true,
                'checkType' => 'boolean'
            ),
            'detectorManufacturer' => array(
                'label' => 'Detector Manufacturer',
                'required' => true,
                // TODO max length 255
            ),
            'detectorModel' => array(
                'label' => 'Detector Model',
                'required' => true,
                // TODO max length 255
            ),
            'detectorMode' => array(
                'label' => 'Detector Mode',
                'required' => true,
                // TODO max length 255
            ),
        );
    }
}
