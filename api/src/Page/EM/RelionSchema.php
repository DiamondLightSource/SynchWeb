<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Page\EM\Schema;

class RelionSchema extends Schema
{
    protected function defaultTable()
    {
        return 'ProcessingJobParameter';
    }

    /**
     * Default validation and conversion rules for Relion processing job parameters
     *
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */
    public function schema()
    {
        return array(
            'acquisition_software' => array(
                'label' => 'Acquisition Software',
                'required' => true,
                'default' => 'EPU',
                'options' => array('EPU', 'SerialEM'),
            ),
            'import_images_dir' => array(
                // exists in form data only - on server see import_images
                'label' => 'Raw Folder',
                'required' => true,
                'default' => 'raw',
                'pattern' => 'directory',
                'options' => array(
                    'raw', 'raw2', 'raw3', 'raw4', 'raw5',
                    'raw6', 'raw7', 'raw8', 'raw9'
                ),
                'validateOptions' => false,
            ),
            'import_images_ext' => array(
                // exists in form data only - on server see import_images
                'label' => 'Movie File Name Extension',
                'required' => true,
                'default' => 'tiff',
                'options' => array('tif', 'tiff', 'mrc', 'eer'),
                'displayOptions' => array('.tif', '.tiff', '.mrc', '.eer'),
            ),
            'import_images' => array(
                // exists in server data only
                // in form see import_images_dir & import_images_ext
                'label' => 'Import Images',
                'required' => false,
            ),
            'wantGainReferenceFile' => array(
                'label' => 'Gain Reference File',
                'default' => false,
                'required' => false,
            ),
            'motioncor_gainreference' => array(
                'label' => "Gain Reference File Name",
                'pattern' => 'filename',
                'default' => 'gain.mrc',
                'required' => array (
                    'wantGainReferenceFile' => true
                ),
            ),
            'voltage' => array(
                'label' => "Voltage (kV)",
                'default' => '300',
                'required' => true,
                'options' => array('200', '300'),
                /*
                'minValue' => 100,
                'maxValue' => 300,
                'checkType' => 'integer'
                */
            ),
            'Cs' => array(
                'label' => 'Spherical Aberration (mm)',
                'default' => '2.7',
                'required' => true,
                'options' => array('2.7'),
                'displayOptions' => array('2.7 (Talos/Krios)'),
                /*
                'options' => array(1.4, 2.0, 2.7),
                'checkType' => 'real'
                */
            ),
            'ctffind_do_phaseshift' => array(
                'label' => 'Phase Plate Used',
                'default' => false,
                'required' => true,
                'checkType' => 'boolean'
            ),
            'angpix' => array(
                'label' => 'Pixel Size (Å/pixel)',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'checkType' => 'real'
            ),
            'eer_grouping' => array(
                'label' => 'EER fractionation',
                'extraDescription' => array(
                    'Number of frames to group into a fraction.',
                    'Excess frames are discarded.'
                ),
                'default' => '20',
                'required' => array(
                    'import_images_ext' => 'eer'
                ),
                'minValue' => 1,
                'checkType' => 'integer'
            ),
            'motioncor_binning' => array(
                'label' => 'Motion Correction Binning',
                'default' => '1',
                'required' => true,
                'options' => array('1', '2'),
                'checkType' => 'integer'
            ),
            'motioncor_doseperframe' => array(
                'label' => 'Dose per frame (e⁻/Å²)',
                'default' => '0.5',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 10.0,
                'checkType' => 'real'
            ),
            'stop_after_ctf_estimation' => array(
                // This field is a bit bonkers.
                // It's displayed in the form as "don't stop" but is used for "stop"
                'label' => 'Stop after CTF estimation',
                'default' => false,
                'required' => true,
                'checkType' => 'boolean'
            ),
            'do_class2d' => array(
                'label' => 'Do 2D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'checkType' => 'boolean'
            ),
            'do_class3d' => array(
                'label' => 'Do 3D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'checkType' => 'boolean'
            ),
            'use_fsc_criterion' => array(
                'label' => 'Best initial model from FSC',
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'do_class3d' => true
                ),
                'checkType' => 'boolean'
            ),
            'autopick_do_cryolo' => array(
                'label' => 'Use crYOLO',
                'extraDescription' => array(
                    'Academic users only.',
                    'Not licensed for industry users.'
                ),
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'checkType' => 'boolean'
            ),
            /* TODO In new validator,
               ensure autopick_LoG_diam_min < autopick_LoG_diam_max. (JPH) */
            'autopick_LoG_diam_min' => array(
                'label' => 'Minimum Diameter (Å)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.02,
                'maxValue' => 1024.0,
                'lessThan' => 'autopick_LoG_diam_max',
                'checkType' => 'real'
            ),
            'autopick_LoG_diam_max' => array(
                'label' => 'Maximum Diameter (Å)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                ),
                'minValue' => 0.02,
                'maxValue' => 4000.0,
                'greaterThan' => 'autopick_LoG_diam_min',
                'checkType' => 'real'
            ),
            'mask_diameter' => array(
                'label' => 'Mask Diameter (Å)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024,
                'checkType' => 'real'
            ),
            'extract_downscale' => array(
                // doesn't exist in form
                // set to true if stop_after_ctf_estimation is false
                'label' => 'Extract Downscale',
                'required' => false,
            ),
            'extract_boxsize' => array(
                'label' => 'Box Size (pixels)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024.0,
                'checkType' => 'real'
            ),
            'extract_small_boxsize' => array(
                'label' => 'Downsample Box Size (pixels)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024.0,
                'checkType' => 'real'
            ),
            'want2ndPass' => array(
                'label' => 'Do Second Pass',
                'default' => false,
                'required' => false,
            ),
            'do_class2d_pass2' => array(
                'label' => 'Do 2D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'want2ndPass' => true
                ),
                'checkType' => 'boolean'
            ),
            'do_class3d_pass2' => array(
                'label' => 'Do 3D Classification',
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'want2ndPass' => true
                ),
                'checkType' => 'boolean'
            ),
            'wantCalculate' => array(
                // Only a form checkbox - not sent to or retrieved from the server
                // TODO: Should be default true for forms with default data
                // TODO: Should be default false for forms with "recovered" data
                'label' => 'Calculate For Me',
                'default' => true,
                'required' => false
            )
        );
    }
}
