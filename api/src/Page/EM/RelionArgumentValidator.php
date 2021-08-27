<?php

namespace SynchWeb\Page\EM;

class RelionArgumentValidator extends ArgumentValidator
{
    protected function updateRulesFromArguments()
    {
        // Require the following arguments if projectMovieFileNameExtension == "eer"
        if ($this->checkArgument('projectMovieFileNameExtension', 'eer')) {
            $this->updateRequiredArguments(array(
                'eerGrouping'
            ));
        }

        // Require projectGainReferenceFileName if projectGainReferenceFile is true
        if ($this->checkArgument('projectGainReferenceFile')) {
            $this->updateRequiredArguments(array(
                'projectGainReferenceFileName'
            ));
        }

        // Require the following arguments if pipelineDo1stPass is true
        if ($this->checkArgument('pipelineDo1stPass')) {
            $this->updateRequiredArguments(array(
                'pipelineDo1stPassClassification2d',
                'pipelineDo1stPassClassification3d',
                'particleUseCryolo',
                'particleDiameterMin',
                'particleDiameterMax',
                'particleMaskDiameter',
                'particleBoxSize',
                'particleBoxSizeSmall',
                'particleCalculateForMe',
                'pipelineDo2ndPass'
            );

            if ($this->checkArgument('pipelineDo1stPassClassification3d')) {
                $this->updateRequiredArguments(array(
                    'useFscCriterion'
                ));
            }

            // Require the following arguments if pipelineDo2ndPass is true
            if ($this->checkArgument('pipelineDo2ndPass')) {
                $this->updateRequiredArguments(array(
                    'pipelineDo2ndPassClassification2d',
                    'pipelineDo2ndPassClassification3d'
                ));
            }
        }
    }

    protected protected function defaultRules()
    {
        $this->validationRules = array(
            'projectAcquisitionSoftware' => array(
                'isRequired' => true,
                'inArray' => array('EPU', 'SerialEM'),
                'outputType' => 'string'
            ),
            'projectMovieRawFolder' => array(
                'isRequired' => true,
                'outputType' => 'string'
            ),
            'projectMovieFileNameExtension' => array(
                'isRequired' => true,
                'inArray' => array('tif', 'tiff', 'mrc', 'eer'),
                'outputType' => 'string'
            ),
            'projectGainReferenceFile' => array(
                'isRequired' => true,
                'outputType' => 'boolean'
            ),
            'projectGainReferenceFileName' => array(
                'isRequired' => false,
                'outputType' => 'string'
            ),
            'voltage' => array(
                'isRequired' => true,
                'minValue' => 100,
                'maxValue' => 300,
                'outputType' => 'integer'
            ),
            'sphericalAberration' => array(
                'isRequired' => true,
                'inArray' => array(1.4, 2.0, 2.7),
                'outputType' => 'float'
            ),
            'findPhaseShift' => array(
                'isRequired' => true,
                'outputType' => 'boolean'
            ),
            'pixelSize' => array(
                'isRequired' => true,
                'minValue' => 0.02,
                'maxValue' => 100,
                'outputType' => 'float'
            ),
            'eerGrouping' => array(
                'isRequired' => false,
                'minValue' => 1,
                'outputType' => 'integer'
            ),
            'motionCorrectionBinning' => array(
                'isRequired' => false,
                'inArray' => array(1, 2),
                'outputType' => 'integer'
            ),
            'dosePerFrame' => array(
                'isRequired' => true,
                'minValue' => 0,
                'maxValue' => 10,
                'outputType' => 'float'
            ),
            'pipelineDo1stPass' => array(
                'isRequired' => true,
                'outputType' => 'boolean'
            ),
            'pipelineDo1stPassClassification2d' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'pipelineDo1stPassClassification3d' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'useFscCriterion' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'particleUseCryolo' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'particleDiameterMin' => array(
                'isRequired' => false,
                'minValue' => 0.02,
                'maxValue' => 1024,
                'outputType' => 'float'
            ),
            'particleDiameterMax' => array(
                'isRequired' => false,
                'minValue' => 0.02,
                'maxValue' => 4000,
                'outputType' => 'float'
            ),
            'particleMaskDiameter' => array(
                'isRequired' => false,
                'minValue' => 1,
                'maxValue' => 1024,
                'outputType' => 'integer'
            ),
            'particleBoxSize' => array(
                'isRequired' => false,
                'minValue' => 1,
                'maxValue' => 1024,
                'outputType' => 'integer'
            ),
            'particleBoxSizeSmall' => array(
                'isRequired' => false,
                'minValue' => 1,
                'maxValue' => 1024,
                'outputType' => 'integer'
            ),
            'particleCalculateForMe' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'pipelineDo2ndPass' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'pipelineDo2ndPassClassification2d' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
            'pipelineDo2ndPassClassification3d' => array(
                'isRequired' => false,
                'outputType' => 'boolean'
            ),
        );
    }
}
