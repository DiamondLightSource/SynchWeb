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
            'voltage' => array(
                'label' => "Voltage (kV)",
                'default' => '300',
                'required' => true,
                'options' => array('200', '300'),
            ),
            'phasePlate' => array(
                'label' => 'Phase Plate Used',
                'default' => false,
                'required' => true,
                'checkType' => 'boolean'
            ),
            'pixelSizeOnImage' => array(
                'label' => 'Pixel Size (Å/pixel)',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'checkType' => 'real'
            ),
            'totalExposedDose' => array(
                'label' => 'Dose per frame (e<span class="super">-</span>/Å<span class="super">2</span>)',
                'default' => '0.5',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 10.0,
                'checkType' => 'real'
            )
        );
    }
}
