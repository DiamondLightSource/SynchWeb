<?php

namespace SynchWeb\Page\EM;

class RelionParameterBuilder
{
    private $sessionPath;
    private $imageDirectory;
    private $fileTemplate;
    private $arguments;

    public function __construct(string $sessionPath)
    {
        $this->sessionPath = $sessionPath;
    }

    public function workflowParameters(array $arguments)
    {
        $this->arguments = $arguments;

        $result = array(
            'acquisition_software' => $this->arguments['projectAcquisitionSoftware'],
            'import_images' => $this->imagePath(),
            'voltage' => $this->arguments['voltage'],
            'Cs' => $this->arguments['sphericalAberration'],
            'ctffind_do_phaseshift' => $this->arguments['findPhaseShift'],
            'angpix' => $this->arguments['pixelSize'],
            'motioncor_binning' => $this->arguments['motionCorrectionBinning'],
            'motioncor_doseperframe' => $this->arguments['dosePerFrame'],
            'stop_after_ctf_estimation' => !$this->arguments['pipelineDo1stPass'],
        );

        if (
            $this->arguments['projectGainReferenceFile'] &&
            $this->arguments['projectGainReferenceFileName']
        ) {
            $result['motioncor_gainreference'] = $this->session_path .
                '/processing/' .
                $this->arguments['projectGainReferenceFileName'];
        }

        if ($this->arguments['projectMovieFileNameExtension'] == 'eer') {
            $result['eer_grouping'] = $this->arguments['eerGrouping'];
        }

        if ($this->arguments['pipelineDo1stPass']) {
            $result = array_merge($result, array(
                'do_class2d' => $this->arguments['pipelineDo1stPassClassification2d'],
                'do_class3d' => $this->arguments['pipelineDo1stPassClassification3d'],
                'autopick_do_cryolo' => $this->arguments['particleUseCryolo'],
                // TODO In new validator, ensure particleDiameterMin < particleDiameterMax. (JPH)
                'autopick_LoG_diam_min' => $this->arguments['particleDiameterMin'],
                'autopick_LoG_diam_max' => $this->arguments['particleDiameterMax'],
                'mask_diameter' => $this->arguments['particleMaskDiameter'],
                'extract_downscale' => true,
                'extract_boxsize' => $this->arguments['particleBoxSize'],
                'extract_small_boxsize' => $thisvalidArguments['particleBoxSizeSmall'],
            );

            if ($this->arguments['pipelineDo1stPassClassification3d']) {
                $result['use_fsc_criterion'] = $this->arguments['useFscCriterion'];
            }
            if ($this->arguments['pipelineDo2ndPass']) {
                $result['do_class2d_pass2'] = $this->arguments['pipelineDo2ndPassClassification2d'];
                $result['do_class3d_pass2'] = $this->arguments['pipelineDo2ndPassClassification3d'];
            }
        }
        return $result;
    }

    private function imagePath()
    {
        if ($this->arguments['projectAcquisitionSoftware'] == 'EPU') {
            $this->fileTemplate = 'GridSquare_*/Data/*.';
        } elseif ($this->arguments['projectAcquisitionSoftware'] == 'SerialEM') {
            $this->fileTemplate = 'Frames/*.';
        } else {
            $this->fileTemplate = null;
        }

        if ($this->fileTemplate) {
            $this->fileTemplate .= $this->arguments['projectMovieFileNameExtension'];
        }

        $this->imageDirectory = $this->sessionPath . '/' .
            $this->arguments['projectMovieRawFolder'] . '/';

        return $this->imageDirectory . $this->fileTemplate;
    }

    public function getImageDirectory()
    {
        return $this->imageDirectory;
    }

    public function getFileTemplate()
    {
        return $this->fileTemplate;
    }
}
