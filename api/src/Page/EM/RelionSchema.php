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
            /*
            'acquisition_software' => array(
                'label' => 'Acquisition Software',
                'required' => true,
                'default' => 'EPU',
                'options' => array('EPU', 'SerialEM'),
            ),
            'import_images_dir' => array(
                'label' => 'Raw Folder',
                'required' => true,
                'default' => 'raw',
                'pattern' => 'directory',
                'stored' => false,
                'onSelect' => function ($row) {
                    preg_match(
                        $row['acquisition_software'] == 'EPU' ?
                            '/\/([\w_-]*)\/GridSquare_\*\/Data\//' :
                            '/\/([\w_-]*)\/Frames\/\*\./',
                        $row['import_images'],
                        $matches
                    );
                    return $matches[1];
                },
            ),
            */
            'import_images_ext' => array(
                //'label' => 'Movie File Name Extension',
                'required' => false, // this is true if it's an on-screen field
                'display' => false, // this shouldn't be here for an on-screen field
                //'default' => 'tiff',
                //'options' => array('tif', 'tiff', 'mrc', 'eer'),
                //'displayOptions' => array('.tif', '.tiff', '.mrc', '.eer'),
                'stored' => false,
                'onSelect' => function ($row) {
                    preg_match('/\.([\w]*)$/', $row['import_images'], $matches);
                    return $matches[1];
                },
            ),
            'import_images' => array(
                'label' => 'Import Images',
                'required' => false,
                // 'onUpdate' => function ($postData) {
                //     // needs BLSession to build it
                //     $fileTemplate = $postData['acquisition_software'] == 'EPU' ?
                //         'GridSquare_*/Data/*.' : 'Frames/*.';
                //     return $postData['session_path'] .
                //         '/' . $postData['import_images_dir'] . '/' .
                //         $fileTemplate .
                //         $postData['import_images_ext'];
                // }
            ),
            'wantGainReferenceFile' => array(
                'label' => 'Gain Reference File',
                'default' => false,
                'required' => true,
                'stored' => false,
                'display' => false,
                'type' => 'boolean',
                'onSelect' => function ($row) {
                    return basename($row['motioncor_gainreference']) != 'gain.mrc';
                },
            ),
            'motioncor_gainreference' => array(
                'label' => 'Gain Reference File Name',
                'pattern' => 'filename',
                'default' => 'gain.mrc',
                'required' => array (
                    'wantGainReferenceFile' => true
                ),
                'onSelect' => function ($row) {
                    return basename($row['motioncor_gainreference']);
                },
                'onUpdate' => function ($postData) {
                    $name = array_key_exists('motioncor_gainreference', $postData) ?
                        $postData['motioncor_gainreference'] : 'gain.mrc';
                    return $postData['session_path'] .
                        "/processing/$name";
                },
            ),
            'voltage' => array(
                'label' => 'Voltage',
                'unit' => 'kV',
                'default' => '300',
                'required' => true,
                'options' => array('200', '300'),
                /*
                'minValue' => 100,
                'maxValue' => 300,
                'type' => 'integer'
                */
            ),
            'Cs' => array(
                'label' => 'Spherical Aberration',
                'unit' => 'mm',
                'default' => '2.7',
                'required' => true,
                'options' => array('2.7'),
                'displayOptions' => array('2.7 (Talos/Krios)'),
                /*
                'options' => array(1.4, 2.0, 2.7),
                'type' => 'real'
                */
            ),
            'ctffind_do_phaseshift' => array(
                'label' => 'Phase Plate Used',
                'default' => false,
                'required' => true,
                'type' => 'boolean'
            ),
            'angpix' => array(
                'label' => 'Pixel Size',
                'unit' => 'Å/pixel',
                'default' => '',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 100.0,
                'type' => 'real'
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
                'type' => 'integer'
            ),
            'motioncor_binning' => array(
                'label' => 'Motion Correction Binning',
                'default' => '1',
                'required' => true,
                'options' => array('1', '2'),
                'type' => 'integer'
            ),
            'motioncor_doseperframe' => array(
                'label' => 'Dose per frame',
                'unit' => 'e⁻/Å²',
                'default' => '0.5',
                'required' => true,
                'minValue' => 0.02,
                'maxValue' => 10.0,
                'type' => 'real'
            ),
            'stop_after_ctf_estimation' => array(
                'label' => 'Stop after CTF estimation',
                'default' => false,
                'required' => true,
                'type' => 'boolean'
            ),
            'do_class2d' => array(
                'label' => 'Do 2D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'type' => 'boolean'
            ),
            'do_class3d' => array(
                'label' => 'Do 3D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'type' => 'boolean'
            ),
            'use_fsc_criterion' => array(
                'label' => 'Best initial model from FSC',
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'do_class3d' => true,
                ),
                'type' => 'boolean',
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
                'type' => 'boolean',
                'onUpdate' => function ($postData) {
                    if ($postData['stop_after_ctf_estimation']) {
                        return false;
                    }
                    return $postData['autopick_do_cryolo'];
                }
            ),
            'autopick_LoG_diam_min' => array(
                'label' => 'Minimum Diameter (Å)',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.02,
                'maxValue' => 1024.0,
                'lessThan' => 'autopick_LoG_diam_max',
                'type' => 'real'
            ),
            'autopick_LoG_diam_max' => array(
                'label' => 'Maximum Diameter',
                'unit' => 'Å',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                ),
                'minValue' => 0.02,
                'maxValue' => 4000.0,
                'greaterThan' => 'autopick_LoG_diam_min',
                'type' => 'real'
            ),
            'mask_diameter' => array(
                'label' => 'Mask Diameter',
                'unit' => 'Å',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024,
                'type' => 'real'
            ),
            'extract_downscale' => array(
                // doesn't exist in form
                // set to true if stop_after_ctf_estimation is false
                'label' => 'Extract Downscale',
                'required' => false,
            ),
            'extract_boxsize' => array(
                'label' => 'Box Size',
                'unit' => 'pixels',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024.0,
                'type' => 'real'
            ),
            'extract_small_boxsize' => array(
                'label' => 'Downsample Box Size',
                'unit' => 'pixels',
                'default' => '',
                'required' => array(
                    'stop_after_ctf_estimation' => false
                ),
                'minValue' => 0.1,
                'maxValue' => 1024.0,
                'type' => 'real',
            ),
            'wantCalculate' => array(
                'label' => 'Calculate For Me',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                ),
                'stored' => false,
                'type' => 'boolean'
            ),
            'want2ndPass' => array(
                'label' => 'Do Second Pass',
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                ),
                'stored' => false,
                'type' => 'boolean',
            ),
            'do_class2d_pass2' => array(
                'label' => 'Do 2D Classification',
                'default' => true,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'want2ndPass' => true
                ),
                'type' => 'boolean',
                'onUpdate' => function ($postData) {
                    if (
                        $postData['stop_after_ctf_estimation'] ||
                        !$postData['want2ndPass']
                    ) {
                        return false;
                    }
                    return $postData['do_class2d_pass2'];
                }
            ),
            'do_class3d_pass2' => array(
                'label' => 'Do 3D Classification',
                'default' => false,
                'required' => array(
                    'stop_after_ctf_estimation' => false,
                    'want2ndPass' => true
                ),
                'type' => 'boolean',
                'onUpdate' => function ($postData) {
                    if (
                        $postData['stop_after_ctf_estimation'] ||
                        !$postData['want2ndPass']
                    ) {
                        return false;
                    }
                    return $postData['do_class3d_pass2'];
                }
            ),
        );
    }
}
