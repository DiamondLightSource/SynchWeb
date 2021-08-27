<?php

namespace SynchWeb\Page\EM;

trait Relion
{
    public function relionStart()
    {
        global $visit_directory/*,
            $zocalo_mx_reprocess_queue*/;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
        // TODO Temporary override to make session available for testing after session has ended (JPH)
        // $this->exitIfSessionIsNotActive($session);
        $this->exitIfUnfinishedProcessingJobsExist($session);

        $session_path = $this->substituteSessionValuesInPath($session, $visit_directory);

        // Validate form parameters

        // Setup rules to validate each parameter by isRequired, inArray, minValue, maxValue.
        // Specify outputType so json_encode casts value correctly. This determines whether value is quoted.

        $validation_rules = array(
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

        // Require the following parameters if projectMovieFileNameExtension == "eer"

        if ($this->has_arg('projectMovieFileNameExtension') && $this->arg('projectMovieFileNameExtension') == 'eer') {
            $required_parameters = array(
                'eerGrouping'
            );
            $this->updateRequiredParameters($validation_rules, $required_parameters);
        }

        // Require projectGainReferenceFileName if projectGainReferenceFile is true

        if ($this->has_arg('projectGainReferenceFile') && $this->arg('projectGainReferenceFile')) {
            $required_parameters = array(
                'projectGainReferenceFileName'
            );
            $this->updateRequiredParameters($validation_rules, $required_parameters);
        }

        // Require the following parameters if pipelineDo1stPass is true

        if ($this->has_arg('pipelineDo1stPass') && $this->arg('pipelineDo1stPass')) {
            $required_parameters = array(
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
            $this->updateRequiredParameters($validation_rules, $required_parameters);

            if (
                $this->has_arg('pipelineDo1stPassClassification3d') &&
                $this->arg('pipelineDo1stPassClassification3d')
            ) {
                $required_parameters = array(
                    'useFscCriterion'
                );
                $this->updateRequiredParameters($validation_rules, $required_parameters);
            }

            // Require the following parameters if pipelineDo2ndPass is true

            if ($this->has_arg('pipelineDo2ndPass') && $this->arg('pipelineDo2ndPass')) {
                $required_parameters = array(
                    'pipelineDo2ndPassClassification2d',
                    'pipelineDo2ndPassClassification3d'
                );
                $this->updateRequiredParameters($validation_rules, $required_parameters);
            }
        }

        // TODO Replace bespoke conditional parameter validation with symfony/validator. (JPH)

        list($invalid_parameters, $valid_parameters) = $this->validateParameters($validation_rules);

        // TODO Better to return an array of invalid parameters for front end to display. (JPH)

        if (sizeof($invalid_parameters) > 0) {
            $message = 'Invalid parameters: ' . implode('; ', $invalid_parameters) . '.';

            error_log($message);
            $this->_error($message, 400);
        }

        $workflow_parameters = array();

        $workflow_parameters['acquisition_software'] = $valid_parameters['projectAcquisitionSoftware'];

        if ($valid_parameters['projectAcquisitionSoftware'] == 'EPU') {
            $fileTemplate = "GridSquare_*/Data/*.{$valid_parameters['projectMovieFileNameExtension']}";
        } elseif ($valid_parameters['projectAcquisitionSoftware'] == 'SerialEM') {
            $fileTemplate = "Frames/*.{$valid_parameters['projectMovieFileNameExtension']}";
        } else {
            $fileTemplate = null;
        }

        $imageDirectory = "{$session_path}/{$valid_parameters['projectMovieRawFolder']}/";

        $workflow_parameters['import_images'] = "{$imageDirectory}{$fileTemplate}";

        if ($valid_parameters['projectGainReferenceFile'] && $valid_parameters['projectGainReferenceFileName']) {
            $workflow_parameters['motioncor_gainreference'] = "{$session_path}/processing/{$valid_parameters['projectGainReferenceFileName']}";
        }

        $workflow_parameters['voltage'] = $valid_parameters['voltage'];
        $workflow_parameters['Cs'] = $valid_parameters['sphericalAberration'];
        $workflow_parameters['ctffind_do_phaseshift'] = $valid_parameters['findPhaseShift'];
        $workflow_parameters['angpix'] = $valid_parameters['pixelSize'];
        $workflow_parameters['motioncor_binning'] = $valid_parameters['motionCorrectionBinning'];
        $workflow_parameters['motioncor_doseperframe'] = $valid_parameters['dosePerFrame'];

        $workflow_parameters['stop_after_ctf_estimation'] = !$valid_parameters['pipelineDo1stPass'];

        if ($valid_parameters['projectMovieFileNameExtension'] == 'eer') {
            $workflow_parameters['eer_grouping'] = $valid_parameters['eerGrouping'];
        }

        if ($valid_parameters['pipelineDo1stPass']) {
            $workflow_parameters['do_class2d'] = $valid_parameters['pipelineDo1stPassClassification2d'];
            $workflow_parameters['do_class3d'] = $valid_parameters['pipelineDo1stPassClassification3d'];
            if ($valid_parameters['pipelineDo1stPassClassification3d']) {
                $workflow_parameters['use_fsc_criterion'] = $valid_parameters['useFscCriterion'];
            }

            $workflow_parameters['autopick_do_cryolo'] = $valid_parameters['particleUseCryolo'];
            // TODO In new validator, ensure particleDiameterMin < particleDiameterMax. (JPH)
            $workflow_parameters['autopick_LoG_diam_min'] = $valid_parameters['particleDiameterMin'];
            $workflow_parameters['autopick_LoG_diam_max'] = $valid_parameters['particleDiameterMax'];
            $workflow_parameters['mask_diameter'] = $valid_parameters['particleMaskDiameter'];
            $workflow_parameters['extract_downscale'] = true;
            $workflow_parameters['extract_boxsize'] = $valid_parameters['particleBoxSize'];
            $workflow_parameters['extract_small_boxsize'] = $valid_parameters['particleBoxSizeSmall'];

            if ($valid_parameters['pipelineDo2ndPass']) {
                $workflow_parameters['do_class2d_pass2'] = $valid_parameters['pipelineDo2ndPassClassification2d'];
                $workflow_parameters['do_class3d_pass2'] = $valid_parameters['pipelineDo2ndPassClassification3d'];
            }
        }

        // Create a ProcessingJob with ProcessingJobParameters for Zocalo to trigger RELION processing.
        // This requires a DataCollection which in turn requires a DataCollectionGroup.

        $dataCollectionId = $this->findExistingDataCollection($session, $imageDirectory, $fileTemplate);

        if (!$dataCollectionId) {
            $dataCollectionId = $this->addDataCollectionForEM(
                $session,
                $imageDirectory,
                $valid_parameters['projectMovieFileNameExtension'],
                $fileTemplate
            );
        }

        $processingJobId = null;

        if ($dataCollectionId) {
            $processingJobId = $this->addProcessingJobForRelion($dataCollectionId, $workflow_parameters);
        }

        // Send job to processing queue

        // TODO Add provenance

        $message = array(
            'parameters' => array(
                'ispyb_process' => $processingJobId
            )
        );

         //$this->enqueue($zocalo_mx_reprocess_queue, $message);

        // TODO Remove temporary output of message and workflow_parameters

        $output = array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
        );

        error_log(var_export($output, true));
        $this->_output($output);
    }

    public function relionStatus()
    {
        // global $visit_directory;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
        // TODO RESTORE FOR PRODUCTION
        // $this->exitIfSessionIsNotActive($session);

        $output = array(
            'timestamp' => gmdate('c', time()),
            'processingIsActive' => false, // $session['processingIsActive'],
            'processingTimestamp' => ($session['processingTimestamp'] ? gmdate('c', $session['processingTimestamp']) : null)
        );

        $this->_output($output);
    }

    public function relionStop()
    {
        // global $zocalo_mx_reprocess_queue;

        // $session = $this->determineSession($this->arg('session'));
        // $this->exitIfSessionIsNotActive($session);

        // Finds queued and running ProcessingJobs associated with session
        // Returns null otherwise

        if ($this->arg('processingJobId')) {
            $result = $this->db->pq("
                SELECT processingJobId, dataCollectionId
                FROM ProcessingJob
                WHERE processingJobId = :1", array($this->arg('processingJobId')));

            if (count($result)) {
                $message = array(
                    'parameters' => array(
                        'ispyb_process' => $result[0]['PROCESSINGJOBID']
                    ),
                    'recipes' => ['relion-stop']
                );

                error_log(var_export($message, true));

                // $this->enqueue($zocalo_mx_reprocess_queue, $message);
            } else {
                $message = 'Processing job not found!';

                error_log($message);
                $this->_error($message, 400);
            }
        }

        $output = array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
        );

        $this->_output($output);
    }

    public function relionParameters() {
        if (!$this->has_arg('processingJobId')) {
            $this->_error('Processing Job ID not provided');
        }

        $parameters = $this->db->pq("
            SELECT pj.processingjobparameterid,
                pj.processingjobid,
                pj.parameterkey,
                pj.parametervalue
            FROM ProcessingJobParameter pj
            WHERE pj.processingjobid = :1", array($this->arg('processingJobId')));

        if (!sizeof($parameters)) {
            $this->_error('No parameters for processing job');
        }

        $this->_output(array('data' => $parameters, 'total' => sizeof($parameters)));
    }

}
