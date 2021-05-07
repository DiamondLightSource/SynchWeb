<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Queue;

class EM extends Page
{
    public static $arg_list = array(
        'id' => '\d+',
        'ids' => '\d+',
        'visit' => '\w+\d+-\d+',
        'session' => '\w+\d+-\d+',
        'n' => '\d+',
        't' => '\d+',
        'IMAGENUMBER' => '\d+',

        'processingJobId' => '\d+',

        // EM PROCESSING
        // Parameters with user specified values
        // Note boolean value true in JSON POST request is cast to to 1, false to nothing.

        // RELION

        'projectAcquisitionSoftware' => '\w+', // String
        'projectMovieFileNameExtension' => '[\w]{3,4}', // String (File name extension)
        'projectGainReferenceFile' => '1?', // Boolean
        'projectGainReferenceFileName' => '[\w-]+\.[\w]{3,4}', // String (File name + extension)

        'voltage' => '\d+', // Integer
        'sphericalAberration' => '\d*(\.\d+)?', // Decimal
        'findPhaseShift' => '1?', // Boolean
        'pixelSize' => '\d*(\.\d+)?', // Decimal
        'motionCorrectionBinning' => '\d+', // Integer
        'dosePerFrame' => '\d*(\.\d+)?', // Decimal

        'pipelineDo1stPass' => '1?', // Boolean
        'pipelineDo1stPassClassification2d' => '1?', // Boolean
        'pipelineDo1stPassClassification3d' => '1?', // Boolean

        'particleUseCryolo' => '1?', // Boolean
        'particleDiameterMin' => '\d+', // Integer
        'particleDiameterMax' => '\d+', // Integer
        'particleMaskDiameter' => '\d+', // Integer
        'particleBoxSize' => '\d+', // Integer
        'particleBoxSizeSmall' => '\d+', // Integer
        'particleCalculateForMe' => '1?', // Boolean

        'pipelineDo2ndPass' => '1?', // Boolean
        'pipelineDo2ndPassClassification2d' => '1?', // Boolean
        'pipelineDo2ndPassClassification3d' => '1?', // Boolean

        // SCIPION

        'numberOfIndividualFrames' => '\d+', // Integer
        'patchX' => '\d+', // Integer
        'patchY' => '\d+', // Integer
        'samplingRate' => '\d*(\.\d+)?', // Decimal
        'particleSize' => '\d+', // Integer
        'minDist' => '\d+', // Integer
        'windowSize' => '\d+', // Integer
    );

    public static $dispatch = array(
        array('/aps', 'post', '_ap_status'),

        array('/mc/:id', 'get', '_mc_result'),
        array('/mc/image/:id(/n/:IMAGENUMBER)', 'get', '_mc_image'),
        array('/mc/fft/image/:id(/n/:IMAGENUMBER)(/t/:t)', 'get', '_mc_fft'),
        array('/mc/drift/:id(/n/:IMAGENUMBER)', 'get', '_mc_plot'),
        array('/mc/histogram', 'get', '_mc_drift_histogram'),

        array('/ctf/:id', 'get', '_ctf_result'),
        array('/ctf/image/:id(/n/:IMAGENUMBER)', 'get', '_ctf_image'),
        array('/ctf/histogram', 'get', '_ctf_histogram'),

        array('/process/relion/session/:session', 'post', '_relion_start'),
        array('/process/relion/session/:session', 'get', '_relion_status'),
        array('/process/relion/jobs/:session', 'get', '_relion_jobs'),
        array('/process/relion/job/:processingJobId', 'patch', '_relion_stop'),
        array('/process/relion/job/parameters', 'get', '_relion_parameters'),

        array('/process/scipion/session/:session', 'post', '_scipion_start')
    );

    function _relion_start()
    {
        global $visit_directory,
               $zocalo_mx_reprocess_queue; // Find $zocalo_relion_start_queue...

//        $this->db->set_debug(True);
//$message = 'Relion is already processing this session! Processing started at ' . date('H:i:s \o\n jS F Y', $session['processingTimestamp']) . '.';

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
//        $this->exitIfSessionIsNotActive($session); // TODO Temporary override to make session available for testing after session has ended (JPH)
        $this->exitIfUnfinishedProcessingJobsExist($session);

        $session_path = $this->substituteSessionValuesInPath($session, $visit_directory);

        // Validate form parameters

        // Setup rules to validate each parameter by isRequired, inArray, minValue, maxValue.
        // Specify outputType so json_encode casts value correctly. This determines whether value is quoted.

        $validation_rules = array(
            'projectAcquisitionSoftware' => array('isRequired' => true, 'inArray' => array('EPU', 'SerialEM'), 'outputType' => 'string'),
            'projectMovieFileNameExtension' => array('isRequired' => true, 'inArray' => array('tif', 'tiff', 'mrc'), 'outputType' => 'string'),
            'projectGainReferenceFile' => array('isRequired' => true, 'outputType' => 'boolean'),
            'projectGainReferenceFileName' => array('isRequired' => false, 'outputType' => 'string'),

            'voltage' => array('isRequired' => true, 'minValue' => 100, 'maxValue' => 300, 'outputType' => 'integer'),
            'sphericalAberration' => array('isRequired' => true, 'inArray' => array(1.4, 2.0, 2.7), 'outputType' => 'float'),
            'findPhaseShift' => array('isRequired' => true, 'outputType' => 'boolean'),
            'pixelSize' => array('isRequired' => true, 'minValue' => 0.02, 'maxValue' => 100, 'outputType' => 'float'),
            'motionCorrectionBinning' => array('isRequired' => true, 'inArray' => array(1, 2), 'outputType' => 'integer'),
            'dosePerFrame' => array('isRequired' => true, 'minValue' => 0, 'maxValue' => 10, 'outputType' => 'float'),

            'pipelineDo1stPass' => array('isRequired' => true, 'outputType' => 'boolean'),
            'pipelineDo1stPassClassification2d' => array('isRequired' => false, 'outputType' => 'boolean'),
            'pipelineDo1stPassClassification3d' => array('isRequired' => false, 'outputType' => 'boolean'),

            'particleUseCryolo' => array('isRequired' => false, 'outputType' => 'boolean'),
            'particleDiameterMin' => array('isRequired' => false, 'minValue' => 0.02, 'maxValue' => 1000, 'outputType' => 'float'),
            'particleDiameterMax' => array('isRequired' => false, 'minValue' => 0.02, 'maxValue' => 4000, 'outputType' => 'float'),
            'particleMaskDiameter' => array('isRequired' => false, 'minValue' => 1, 'maxValue' => 1024, 'outputType' => 'integer'),
            'particleBoxSize' => array('isRequired' => false, 'minValue' => 1, 'maxValue' => 1024, 'outputType' => 'integer'),
            'particleBoxSizeSmall' => array('isRequired' => false, 'minValue' => 1, 'maxValue' => 1024, 'outputType' => 'integer'),
            'particleCalculateForMe' => array('isRequired' => false, 'outputType' => 'boolean'),

            'pipelineDo2ndPass' => array('isRequired' => false, 'outputType' => 'boolean'),
            'pipelineDo2ndPassClassification2d' => array('isRequired' => false, 'outputType' => 'boolean'),
            'pipelineDo2ndPassClassification3d' => array('isRequired' => false, 'outputType' => 'boolean'),
        );

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
            $workflow_parameters['import_images'] = "{$session_path}/raw/GridSquare_*/Data/*.{$valid_parameters['projectMovieFileNameExtension']}";
        } else if ($valid_parameters['projectAcquisitionSoftware'] == 'SerialEM') {
            $workflow_parameters['import_images'] = "{$session_path}/raw/Frames/*.{$valid_parameters['projectMovieFileNameExtension']}";
        }

        // TODO Remove projectGainReferenceFileName from form? File name gain.mrc specified in standard operating procedure. (JPH)

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

        if ($valid_parameters['pipelineDo1stPass']) {
            $workflow_parameters['do_class2d'] = $valid_parameters['pipelineDo1stPassClassification2d'];
            $workflow_parameters['do_class3d'] = $valid_parameters['pipelineDo1stPassClassification3d'];

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

        $dataCollectionId = $this->findExistingDataCollection($session);

        if (!$dataCollectionId) {
            $dataCollectionId = $this->addDataCollectionForEM($session, "{$session_path}/raw/", $valid_parameters['projectMovieFileNameExtension'], "Frames/*.{$valid_parameters['projectMovieFileNameExtension']}");
        }

        // TODO PREVENT ADDITION OF PROCESSING JOB WHERE NONE PROCESSING...

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

        // TODO Enable write to queue

         $this->enqueue($zocalo_mx_reprocess_queue, $message);

        // TODO Remove temporary output of message and workflow_parameters

        $output = array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
        );

        $this->_output($output);
    }

    private function exitIfElectronMicroscopesAreNotConfigured()
    {
        // Check electron microscopes are listed in global variables - see $bl_types in config.php.
        $bls = $this->_get_beamlines_from_type('em');

        if (empty($bls)) {
            $message = 'Electron microscopes are not specified';

            error_log($message);
            $this->_error($message, 500);
        }
    }

    private function determineSession($session_reference)
    {
        if (!$this->has_arg('session')) {
            $message = 'Session not specified!';

            error_log($message);
            $this->_error($message, 400);
        }

        // Lookup session in ISPyB
        $session = $this->db->pq("
            SELECT b.SESSIONID,
                b.beamlinename AS beamlinename,
                YEAR(b.startDate) AS year,
                CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) AS session,
                CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) AS visit,
                b.startdate AS startdate,
                b.enddate AS enddate,
                CURRENT_TIMESTAMP BETWEEN b.startdate AND b.enddate AS active
            FROM proposal AS p
                JOIN blsession AS b ON p.proposalid = b.proposalid
            WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) LIKE :1", array($session_reference));

        if (!sizeof($session)) $this->_error('Session not found');

        $session = $session[0];

        // Temporary fudge until Zocalo and Relion use ISPyB

//        list($processingIsActive, $processingTimestamp) = $this->determineProcessingStatus($session);
//
//        $session['processingIsActive'] = $processingIsActive;
//        $session['processingTimestamp'] = $processingTimestamp;

//        list($processingIsActive, $processingTimestamp) = $this->determineProcessingStatus($session);

        $session['processingIsActive'] = false;
        $session['processingTimestamp'] = null;

        return $session;
    }

    // TODO Review Scipion code following Relion implementation e.g. changes to Stomp queue, globals from config.php, etc. (JPH)

    private function determineProcessingStatus($session)
    {
//        // Temporary fudge until Zocalo and Relion can update ISPyB
//        // RUNNING_RELION_IT file indicates Relion is processing
//
//        global $visit_directory;
//
//        $filename = $this->substituteSessionValuesInPath($session, $visit_directory . '/.ispyb/processed/RUNNING_RELION_IT');
//
//        $isActive = false;
//        $timestamp = null;
//
//        clearstatcache();
//
//        try {
//            $isActive = file_exists($filename);
//
//            if ($isActive) {
//                $stat = stat($filename);
//
//                if ($stat) $timestamp = $stat['mtime'];
//            }
//        } catch (Exception $e) {
//            error_log("Failed to check status file: {$filename}");
//            $this->_error('Failed to check status file.', 500);
//        }
//
//        return array($isActive, $timestamp);

        return array(false, null);
    }

    private function substituteSessionValuesInPath($session, $path)
    {
        // Substitute session values in file or directory path i.e. BEAMLINENAME, YEAR, and SESSION / VISIT.

        foreach ($session as $key => $value) {
            $path = str_replace("<%={$key}%>", $value, $path);
        }

        return $path;
    }

    public function _relion_jobs()
    {
        // Finds queued and running ProcessingJobs associated with session
        // Returns null otherwise
        $session = $this->determineSession($this->arg('session'));

        if (!$session['SESSIONID']) $this->_error('No session provided');

        $processingJobs = null;

        $where = "WHERE BLS.sessionId = :1";
        $args = array($session['SESSIONID']);

        $total = $this->db->pq("
            SELECT count(PJ.processingJobId) as total
            FROM ProcessingJob PJ
            JOIN DataCollection DC ON PJ.dataCollectionId = DC.dataCollectionId
            JOIN BLSession BLS ON DC.SESSIONID = BLS.sessionId
            LEFT JOIN AutoProcProgram app ON PJ.processingJobId = app.processingJobId
            $where", $args);
        $total = intval($total[0]['TOTAL']);

        $args = $this->handlePaginationArguments($args);

        $processingJobs = $this->db->paginate("
            SELECT PJ.processingJobId,
                    PJ.dataCollectionId,
                    PJ.recordTimestamp,
                    APP.processingStatus,
                    APP.processingStartTime,
                    APP.processingEndTime,
                    CASE
                        WHEN (APP.processingJobId IS NULL) THEN 'submitted'
                        WHEN (APP.processingStartTime IS NULL AND APP.processingStatus IS NULL) THEN 'queued'
                        WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus IS NULL) THEN 'running'
                        WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus = 0) THEN 'failure'
                        WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus = 1) THEN 'success'
                        END AS processingStatusDescription
            FROM ProcessingJob PJ
                        JOIN DataCollection DC ON PJ.dataCollectionId = DC.dataCollectionId
                        JOIN BLSession BLS ON DC.SESSIONID = BLS.sessionId
                        LEFT JOIN AutoProcProgram APP ON PJ.processingJobId = APP.processingJobId
            $where", $args);

        $this->_output(array(
            'total'=> $total,
            'data'=> $processingJobs
        ));
    }

    private function exitIfUnfinishedProcessingJobsExist($session)
    {
        // Finds queued and running ProcessingJobs associated with session
        // Returns null otherwise

        if ($session['SESSIONID']) {
            $result = $this->db->pq("
                SELECT APP.autoProcProgramId,
                       APP.processingStartTime,
                       APP.processingJobId,
                       CASE
                           WHEN (processingStartTime IS NULL AND processingEndTime IS NULL AND processingStatus IS NULL) THEN 'queued'
                           WHEN (processingStartTime IS NOT NULL AND processingEndTime IS NULL AND processingStatus IS NULL) THEN 'running'
                           END AS processingStatusDescription
                FROM AutoProcProgram APP
                         JOIN ProcessingJob PJ ON PJ.processingJobId = APP.processingJobId
                         JOIN DataCollection DC ON PJ.dataCollectionId = DC.dataCollectionId
                         JOIN BLSession BLS ON DC.SESSIONID = BLS.sessionId
                WHERE processingStatus IS NULL
                  AND BLS.sessionId = :1", array($session['SESSIONID']));

            if (count($result)) {
                $message = 'Relion processing job already exists for this session!';

                error_log($message);
                $this->_error($message, 400);

                return $result;
            }
        }

        return null;
    }

    private function updateRequiredParameters(array &$validation_rules, array $required_parameters)
    {
        // Iterate over validation rules
        foreach ($validation_rules as $parameter => $validations) {

            // Determine whether parameter is in array of required parameters
            if (in_array($parameter, $required_parameters)) {

                // Update validation rule
                $validation_rules[$parameter]['isRequired'] = true;
            }
        }
    }

    private function validateParameters(array $validation_rules)
    {
        $valid_parameters = array();
        $invalid_parameters = array();

        foreach ($validation_rules as $parameter => $validations) {
            // Determine whether request includes parameter
            if ($this->has_arg($parameter)) {
                if ($this->arg($parameter) === '') {
                    array_push($invalid_parameters, "{$parameter} is not specified");
                    continue;
                }

                // Check parameter is more than minimum value
                if (array_key_exists('minValue', $validations)) {
                    if ($this->arg($parameter) < $validations['minValue']) {
                        array_push($invalid_parameters, "{$parameter} is too small");
                        continue;
                    }
                }

                // Check parameter is less than maximum value
                if (array_key_exists('maxValue', $validations)) {
                    if ($this->arg($parameter) > $validations['maxValue']) {
                        array_push($invalid_parameters, "{$parameter} is too large");
                        continue;
                    }
                }

                // Check parameter is in array of expected inputs
                if (array_key_exists('inArray', $validations)) {
                    if (is_array($validations['inArray'])) {
                        if (!in_array($this->arg($parameter), $validations['inArray'])) {
                            array_push($invalid_parameters, "{$parameter} is not known");
                            continue;
                        }
                    }
                }

                // Parameter has passed validation checks so add to list of valid parameters.
                $valid_parameters[$parameter] = $this->arg($parameter);

                // Set type if outputType is specified, otherwise default to string. Note json_encode quotes value of type string.

                $outputType = array_key_exists('outputType', $validations) ? $validations['outputType'] : 'string';

                settype($valid_parameters[$parameter], $outputType);
            } else {
                // Check whether a missing parameter is required.
                if (array_key_exists('isRequired', $validations)) {
                    if ($validations['isRequired']) {
                        array_push($invalid_parameters, "{$parameter} is required");
                    }
                }
            }
        }

        return array($invalid_parameters, $valid_parameters);
    }

    private function findExistingDataCollection($session)
    {
        // Returns dataCollectionId of first DataCollection associated with session
        // Returns null otherwise

        if ($session['SESSIONID']) {
            $result = $this->db->pq("
            SELECT dataCollectionId
            FROM DataCollection
            WHERE SESSIONID = :1
            LIMIT 1", array($session['SESSIONID']));

            if (count($result)) {
                return $result[0]['DATACOLLECTIONID'];
            }
        }

        return null;
    }

    private function addDataCollectionForEM($session, $imageDirectory, $imageSuffix, $fileTemplate)
    {
        $dataCollectionId = null;

        try {
            $this->db->start_transaction();

            // Add DataCollectionGroup

            $this->db->pq("
                INSERT INTO DataCollectionGroup (sessionId, comments, experimentType)
                VALUES (:1, :2, :3) RETURNING dataCollectionGroupId INTO :id",
                array($session['SESSIONID'], 'Created by SynchWeb', 'EM')
            );

            $dataCollectionGroupId = $this->db->id();

            // Add DataCollection

            $this->db->pq("
                    INSERT INTO DataCollection (sessionId, dataCollectionGroupId, dataCollectionNumber, startTime, endTime, runStatus, imageDirectory, imageSuffix, fileTemplate, comments)
                    VALUES (:1, :2, :3, NOW(), NOW(), :4, :5, :6, :7, :8) RETURNING dataCollectionId INTO :id",
                array($session['SESSIONID'], $dataCollectionGroupId, 1, 'DataCollection Simulated', $imageDirectory, $imageSuffix, $fileTemplate, 'Created by SynchWeb')
            );

            $dataCollectionId = $this->db->id();

            $this->db->end_transaction();
        } catch (Exception $e) {
            error_log("Failed to add DataCollection to database.");
            $this->_error("Failed to add DataCollection to database.", 500);
        }

        return $dataCollectionId;
    }

    private function addProcessingJobForRelion($dataCollectionId, $workflowParameters)
    {
        $processingJobId = null;

        try {
            $this->db->start_transaction();

            // Add ProcessingJob

            $this->db->pq("
                INSERT INTO ProcessingJob (dataCollectionId, displayName, comments, recipe, automatic)
                VALUES (:1, :2, :3, :4, :5) RETURNING processingJobId INTO :id",
                array($dataCollectionId, 'RELION', 'Submitted via SynchWeb', 'relion', 0)
            );

            $processingJobId = $this->db->id();

            // Add ProcessingJobParameters

            foreach ($workflowParameters as $key => $value) {
                $this->db->pq("
                    INSERT INTO ProcessingJobParameter (processingJobId, parameterKey, parameterValue)
                    VALUES (:1, :2, :3)",
                    array($processingJobId, $key, (is_bool($value) ? var_export($value, true) : $value)) // TODO REMOVE QUOTES FROM STRINGS
                );
            }

//            array($processingJobId, $key, var_export($value, true)) // TODO REMOVE QUOTES FROM STRINGS

            $this->db->end_transaction();
        } catch (Exception $e) {
            error_log("Failed to add ProcessingJob to database.");
            $this->_error("Failed to add ProcessingJob to database.", 500);
        }

        return $processingJobId;
    }

    function _relion_stop()
    {
        global $zocalo_mx_reprocess_queue;

//        $session = $this->determineSession($this->arg('session'));
//        $this->exitIfSessionIsNotActive($session);

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

                // TODO Enable write to queue

                 $this->enqueue($zocalo_mx_reprocess_queue, $message);
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

    private function exitIfSessionIsNotActive($session)
    {
        // Do not permit processing before session has started or after session has ended

        if (!$session['ACTIVE']) {
            $message = 'This session ended at ' . date('H:i:s \o\n jS F Y', strtotime($session['ENDDATE'])) . '.';

            error_log($message);
            $this->_error($message, 400);
        }
    }

    function _relion_status()
    {
        global $visit_directory;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
//        $this->exitIfSessionIsNotActive($session); // TODO RESTORE FOR PRODUCTION

        $output = array(
            'timestamp' => gmdate('c', time()),
            'processingIsActive' => false, // $session['processingIsActive'],
            'processingTimestamp' => ($session['processingTimestamp'] ? gmdate('c', $session['processingTimestamp']) : null)
        );

        $this->_output($output);
    }

    function _scipion_start()
    {
        global $visit_directory,
               $zocalo_scipion_template_path,
               $zocalo_scipion_template_file,
               $zocalo_scipion_workflow_path,
               $zocalo_scipion_start_queue;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
        $this->exitIfSessionIsNotActive($session);

        $session_path = $this->substituteSessionValuesInPath($session, $visit_directory);
        $template_path = $this->substituteSessionValuesInPath($session, $zocalo_scipion_template_path);
        $template_file = $zocalo_scipion_template_file;
        $workflow_path = $this->substituteSessionValuesInPath($session, $zocalo_scipion_workflow_path);

        // Validate form parameters

        // Setup rules to validate each parameter by isRequired, inArray, minValue, maxValue.
        // Specify outputType so json_encode casts value correctly. This determines whether value is quoted.

        $validation_rules = array(
            'dosePerFrame' => array('isRequired' => true, 'minValue' => 0, 'maxValue' => 10, 'outputType' => 'float'),
            'numberOfIndividualFrames' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 500, 'outputType' => 'integer'),
            'patchX' => array('isRequired' => true, 'minValue' => 1, 'outputType' => 'integer'),
            'patchY' => array('isRequired' => true, 'minValue' => 1, 'outputType' => 'integer'),
            'samplingRate' => array('isRequired' => true, 'minValue' => 0.1, 'maxValue' => 10, 'outputType' => 'float'),
            'particleSize' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 1000, 'outputType' => 'integer'),
            'minDist' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 1000, 'outputType' => 'integer'),
            'windowSize' => array('isRequired' => true, 'minValue' => 128, 'maxValue' => 2048, 'outputType' => 'integer'),
            'findPhaseShift' => array('isRequired' => true, 'outputType' => 'boolean'),
        );

        list($invalid_parameters, $valid_parameters) = $this->validateParameters($validation_rules);

        // Determine other values to substitute in JSON i.e. parameters not specified in form submission.
        $valid_parameters['filesPath'] = $session_path . '/raw/GridSquare_*/Data';
        $valid_parameters['session'] = $session['SESSION'];

        // TODO Better to return an array of invalid parameters for front end to display. (JPH)
        if (sizeof($invalid_parameters) > 0) {
            $message = 'Invalid parameters: ' . implode('; ', $invalid_parameters) . '.';

            error_log($message);
            $this->_error($message, 400);
        }

        $template_json_string = null;

        // Read workflow template file
        try {
            $template_json_string = file_get_contents("{$template_path}/{$template_file}");
        } catch (Exception $e) {
            error_log("Failed to read workflow template: {$template_path}/{$template_file}");
            $this->_error("Failed to read workflow template for electron microscopy “{$session['BEAMLINENAME']}”.", 500);
        }

        // Decode JSON string
        $template_array = json_decode($template_json_string, true);

        // JSON is invalid if it cannot be decoded
        if ($template_array == null) {
            error_log("Invalid workflow template: {$template_path}/{$template_file}");
            $this->_error("Invalid workflow template for electron microscopy “{$session['BEAMLINENAME']}”.", 500);
        }

        $updated_parameters = array();

        // Iterate over each step in workflow template e.g. 0, 1, 2, etc.
        foreach (array_keys($template_array) as $step_no) {

            // Iterate over each parameter in step e.g. acquisitionWizard, amplitudeContrast, copyFiles, etc.
            foreach (array_keys($template_array[$step_no]) as $parameter) {

                // Determine whether user has specified value for parameter
                if (array_key_exists($parameter, $valid_parameters)) {

                    // Set parameter to user specified value
                    $template_array[$step_no][$parameter] = $valid_parameters[$parameter];

                    // Record parameters set to user specified value
                    array_push($updated_parameters, $parameter);
                }
            }
        }

        // Determine which parameters with user specified values are absent from workflow template
        $absent_parameters = array_diff(array_keys($valid_parameters), $updated_parameters);

        if (sizeof($absent_parameters) > 0) {
            error_log("Parameters absent from workflow template: {$template_path}/{$template_file}");

            $message = 'Parameters absent from workflow template: ' . implode('; ', $absent_parameters) . '.';
            error_log($message);
            $this->_error($message, 500);
        }

        // json_encode does not preserve zero fractions e.g. “1.0” is encoded as “1”.
        // The json_encode option JSON_PRESERVE_ZERO_FRACTION was not introduced until PHP 5.6.6.
        $workflow_json_string = json_encode($template_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        // Write workflow file

        $timestamp_epoch = time();

        $workflow_file = 'scipion_workflow_' . gmdate('ymd.His', $timestamp_epoch) . '.json';

        try {
            file_put_contents("{$workflow_path}/{$workflow_file}", $workflow_json_string);
        } catch (Exception $e) {
            error_log("Failed to write workflow file: {$workflow_path}/{$workflow_file}");
            $this->_error('Failed to write workflow file.', 500);
        }

        // Send job to processing queue

        $message = array(
            'scipion_workflow' => "{$workflow_path}/{$workflow_file}"
        );

        $this->enqueue($zocalo_scipion_start_queue, $message);

        $output = array(
            'timestamp_iso8601' => gmdate('c', $timestamp_epoch),
            'template_path' => $template_path,
            'template_file' => $template_file,
            'workflow_path' => $workflow_path,
            'workflow_file' => $workflow_file
        );

        $this->_output($output);
    }

    private function enqueue($zocalo_queue, $zocalo_message)
    {
        global $zocalo_server,
               $zocalo_username,
               $zocalo_password;

        if (empty($zocalo_server) || empty($zocalo_queue)) {
            $message = 'Zocalo server not specified.';

            error_log($message);
            $this->_error($message, 500);
        }

        try {
            $queue = new Queue($zocalo_server, $zocalo_username, $zocalo_password);
            $queue->send($zocalo_queue, $zocalo_message, true);
        } catch (Exception $e) {
            $this->_error($e->getMessage(), 500);
        }
    }

    function _ap_status()
    {
        if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');

        $where = array();
        $ids = array();
        if ($this->has_arg('ids')) {
            if (is_array($this->arg('ids'))) {
                foreach ($this->arg('ids') as $i) {
                    array_push($ids, $i);
                    array_push($where, 'm.datacollectionid=:' . sizeof($ids));
                }
            }
        }

        if (!sizeof($ids)) {
            $this->_output(array());
            return;
        }

        $where = '(' . implode(' OR ', $where) . ')';

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($ids) + 1);
            array_push($ids, $this->arg('visit'));
        } else {
            $where .= " AND s.proposalid = :" . (sizeof($ids) + 1);
            array_push($ids, $this->proposalid);
        }

        $statuses = array();
        foreach ($this->arg('ids') as $d) {
            $statuses[$d] = array('ID' => $d, 'MC' => array(), 'CTF' => array());
        }

        $mc = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM motioncorrection mc
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($mc as $m) {
            $statuses[$m['DATACOLLECTIONID']]['MC'][$m['MOVIENUMBER']] = $m['PROCESSINGSTATUS'];
        }


        $ctf = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = c.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($ctf as $c) {
            $statuses[$c['DATACOLLECTIONID']]['CTF'][$c['MOVIENUMBER']] = $c['PROCESSINGSTATUS'];
        }

        $this->_output(array_values($statuses));
    }

    function _mc_result()
    {
        $in = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

        $rows = $this->db->pq("SELECT mc.motioncorrectionid, mc.firstframe, mc.lastframe, mc.doseperframe, mc.doseweight, mc.totalmotion, mc.averagemotionperframe, mc.micrographsnapshotfullpath, mc.patchesusedx, mc.patchesusedy, mc.fftfullpath, mc.fftcorrectedfullpath, mc.comments, mc.autoprocprogramid, m.movienumber AS imagenumber, dc.datacollectionid
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2 AND app.processingstatus = 1", array($this->arg('id'), $in));

        if (!sizeof($rows)) $this->_error('No such motion correction');
        $row = $rows[0];

        $row['FFTFULLPATH'] = file_exists($row['FFTFULLPATH']) ? 1 : 0;
        $row['FFTCORRECTEDFULLPATH'] = file_exists($row['FFTCORRECTEDFULLPATH']) ? 1 : 0;
        $row['MICROGRAPHSNAPSHOTFULLPATH'] = file_exists($row['MICROGRAPHSNAPSHOTFULLPATH']) ? 1 : 0;

        foreach (array('TOTALMOTION' => 1, 'AVERAGEMOTIONPERFRAME' => 2) as $k => $r) {
            $row[$k] = number_format($row[$k], $r);
        }

        $this->_output($row);
    }

    function _mc_image()
    {
        $n = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;
        if ($n < 1) $n = 1;

        $imgs = $this->db->pq("SELECT mc.micrographsnapshotfullpath 
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $n));

        if (!sizeof($imgs)) $this->_error('No such micrograph');
        $img = $imgs[0];

        if (file_exists($img['MICROGRAPHSNAPSHOTFULLPATH'])) {
            $this->_send_image($img['MICROGRAPHSNAPSHOTFULLPATH']);

        } else {
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
        }
    }

    function _send_image($file)
    {
        $this->_browser_cache();
        $size = filesize($file);
        $this->app->response->headers->set("Content-length", $size);
        $this->app->contentType('image/' . pathinfo($file, PATHINFO_EXTENSION));
        readfile($file);
    }

    function _browser_cache()
    {
        $expires = 60 * 60 * 24 * 14;
        $this->app->response->headers->set('Pragma', 'public');
        $this->app->response->headers->set('Cache-Control', 'maxage=' . $expires);
        $this->app->response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');
    }

    function _mc_fft()
    {
        $im = $this->has_arg('n') ? $this->arg('n') : 1;
        $t = $this->has_arg('t') ? 2 : 1;

        $imgs = $this->db->pq("SELECT mc.fftcorrectedfullpath, mc.fftfullpath 
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $im));

        if (!sizeof($imgs)) $this->_error('No such fft');
        $img = $imgs[0];

        $file = $t == 2 ? $img['FFTCORRECTEDFULLPATH'] : $img['FFTFULLPATH'];

        if (file_exists($file)) {
            $this->_send_image($file);

        } else {
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
        }
    }

    function _mc_plot()
    {
        $im = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

        $rows = $this->db->pq("SELECT mcd.deltax, mcd.deltay, mcd.framenumber 
                FROM motioncorrectiondrift mcd
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = mcd.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2
                ORDER BY mcd.framenumber", array($this->arg('id'), $im));

        $data = array();
        foreach ($rows as $r) {
            array_push($data, array($r['DELTAX'], $r['DELTAY']));
        }

        $this->_output($data);
    }

    function _mc_drift_histogram()
    {
        $where = '';
        $args = array();

        if ($this->has_arg('bl')) {
            $where .= ' AND s.beamlinename=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('bl'));
        }

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($args) + 1);
            array_push($args, $this->arg('visit'));
        }

        if ($this->has_arg('runid')) {
            $where .= ' AND vr.runid=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('runid'));
        }

        $bs = 1;
        $hist = $this->db->pq("SELECT 
                AVG(diff) as avgdiff, MIN(diff) as mindiff, MAX(diff) as maxdiff, COUNT(diff) as countdiff,
                framediff, beamlinename FROM (
                    SELECT SQRT(POW(mcd.deltax - @diffx,2) + POW(mcd.deltay - @diffy, 2)) as diff,
                        mcd.deltax - @diffx as diffx, @diffx := mcd.deltax as deltax, mcd.deltay - @diffy as diffy, @diffy := mcd.deltay as deltay, 
                        CONCAT(ABS(mcd.framenumber-1), '-', mcd.framenumber) as framediff, s.beamlinename
                    FROM motioncorrectiondrift mcd
                    JOIN (SELECT @diffx := 0) r
                    JOIN (SELECT @diffy := 0) r2
                    INNER JOIN motioncorrection mc ON mc.motioncorrectionid = mcd.motioncorrectionid
                    INNER JOIN movie m ON m.movieid = mc.movieid
                    INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where
                    GROUP BY s.beamlinename,CONCAT(ABS(mcd.framenumber-1), '-', mcd.framenumber), mcd.motioncorrectionid
                    ORDER BY mcd.motioncorrectionid,mcd.framenumber
                    ) inr
                    GROUP BY framediff, beamlinename
                    ORDER BY framediff+0, beamlinename
                ", $args);

        // print_r($hist);

        $bls = array();
        foreach ($hist as $h) $bls[$h['BEAMLINENAME']] = 1;
        if ($this->has_arg('visit')) {
            if (!sizeof(array_keys($bls))) {
                $bl_temp = $this->db->pq("SELECT s.beamlinename 
                        FROM blsession s
                        INNER JOIN proposal p ON p.proposalid = s.proposalid
                        WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1", array($this->arg('visit')));

                if (sizeof($bl_temp)) $bls[$bl_temp[0]['BEAMLINENAME']] = 1;
            }
        }

        $data = array();
        $ticks = array();
        foreach ($bls as $bl => $y) {
            $ha = array();
            $max = array();
            $min = array();

            foreach ($hist as $i => &$h) {
                if ($h['FRAMEDIFF'] == '0-1') continue;
                if ($h['BEAMLINENAME'] != $bl) continue;
                $ha[$i - 1] = floatval($h['AVGDIFF']);
                $min[$i - 1] = floatval($h['MINDIFF']);
                $max[$i - 1] = floatval($h['MAXDIFF']);
                $ticks[$h['FRAMEDIFF']] = 1;
            }

            array_push($data, array('label' => $bl, 'min' => $min, 'max' => $max, 'avg' => $ha));
        }

        $this->_output(array('data' => $data, 'ticks' => array_keys($ticks)));
    }

    function _ctf_result()
    {
        $in = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

        $rows = $this->db->pq("SELECT c.ctfid, c.boxsizex, c.boxsizey, c.minresolution, c.maxresolution, c.mindefocus, c.maxdefocus, c.defocusstepsize, c.astigmatism, c.astigmatismangle, c.estimatedresolution, c.estimateddefocus, c.amplitudecontrast, c.ccvalue, c.ffttheoreticalfullpath, c.comments, c.autoprocprogramid, m.movienumber AS imagenumber, dc.datacollectionid
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2 AND app.processingstatus = 1", array($this->arg('id'), $in));

        if (!sizeof($rows)) $this->_error('No such ctf correction');
        $row = $rows[0];

        $row['FFTTHEORETICALFULLPATH'] = file_exists($row['FFTTHEORETICALFULLPATH']) ? 1 : 0;

        foreach (array('ASTIGMATISM' => 2, 'ASTIGMATISMANGLE' => 1, 'ESTIMATEDRESOLUTION' => 2, 'ESTIMATEDDEFOCUS' => 0) as $k => $r) {
            $row[$k] = number_format($row[$k], $r, '.', '');
        }

        $this->_output($row);
    }

    function _ctf_image()
    {
        $n = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;
        if ($n < 1) $n = 1;

        $imgs = $this->db->pq("SELECT c.ffttheoreticalfullpath 
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $n));

        if (!sizeof($imgs)) $this->_error('No such ctf correction');
        $img = $imgs[0];

        if (file_exists($img['FFTTHEORETICALFULLPATH'])) {
            $this->_send_image($img['FFTTHEORETICALFULLPATH']);

        } else {
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
        }
    }

    function _ctf_plot()
    {

    }

    function _ctf_histogram()
    {
        $types = array(
            'defocus' => array('unit' => 'A', 'st' => 0, 'en' => 60000, 'bin_size' => 1000, 'col' => 'c.estimateddefocus', 'count' => 'c.estimateddefocus'),
            'astigmatism' => array('unit' => 'Number', 'st' => 0.5, 'en' => 1.5, 'bin_size' => 0.005, 'col' => 'c.astigmatism', 'count' => 'c.astigmatism'),
            'resolution' => array('unit' => 'A', 'st' => 0, 'en' => 30, 'bin_size' => 1, 'col' => 'c.estimatedresolution', 'count' => 'c.estimatedresolution'),
        );

        $k = 'defocus';
        $t = $types[$k];
        if ($this->has_arg('ty')) {
            if (array_key_exists($this->arg('ty'), $types)) {
                $k = $this->arg('ty');
                $t = $types[$k];
            }
        }

        $where = '';
        $args = array();

        if ($this->has_arg('bl')) {
            $where .= ' AND s.beamlinename=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('bl'));
        }

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($args) + 1);
            array_push($args, $this->arg('visit'));
        }

        if ($this->has_arg('runid')) {
            $where .= ' AND vr.runid=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('runid'));
        }

        $col = $t['col'];
        $ct = $t['count'];
        $bs = $t['bin_size'];

        $limits = $this->db->pq("SELECT max($col) as max, min($col) as min, s.beamlinename
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE $col < 1e38 $where
                GROUP BY s.beamlinename", $args);

        // print_r($limits);

        if (sizeof($limits)) {
            $limits = $limits[0];
            $max = floatval(($limits['MAX']));
            $min = floatval(($limits['MIN']));

            $range = $max - $min;

            if ($range > 0) {
                $bs = $range / 50;

                if ($bs < 0) {
                    $zeros = strspn($bs, '0', strpos($bs, '.') + 1);
                    $bs = round($bs, $zeros);
                } else if ($bs < 1) {
                    $bs = round($bs, 3);
                } else {
                    $zeros = strlen(number_format($bs, 0, '.', ''));
                    $mp = pow(1, $zeros);
                    $bs = ceil($bs / $mp) * $mp;
                }

                $t['bin_size'] = $bs;
                $t['st'] = $min - fmod($min, $bs);
                $t['en'] = $max - fmod($max, $bs) + $bs;
            }
        }

        $hist = $this->db->pq("SELECT ($col div $bs) * $bs as x, count($ct) as y, s.beamlinename
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE $col < 1e38 $where
                GROUP BY s.beamlinename,x
                ORDER BY s.beamlinename", $args);

        $bls = array();
        foreach ($hist as $h) $bls[$h['BEAMLINENAME']] = 1;
        if ($this->has_arg('visit')) {
            if (!sizeof(array_keys($bls))) {
                $bl_temp = $this->db->pq("SELECT s.beamlinename 
                        FROM blsession s
                        INNER JOIN proposal p ON p.proposalid = s.proposalid
                        WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1", array($this->arg('visit')));

                if (sizeof($bl_temp)) $bls[$bl_temp[0]['BEAMLINENAME']] = 1;
            }
        }

        $data = array();
        foreach ($bls as $bl => $y) {
            $ha = array();
            foreach ($hist as &$h) {
                if ($h['BEAMLINENAME'] != $bl) continue;
                $ha[$h['X']] = floatval($h['Y']);
            }

            $gram = array();
            for ($bin = $t['st']; $bin <= $t['en']; $bin += $t['bin_size']) {
                $bin_s = number_format($bin, strlen(substr(strrchr($t['bin_size'], '.'), 1)), '.', '');
                $gram[$bin_s] = array_key_exists($bin_s, $ha) ? $ha[$bin_s] : 0;
            }

            $lab = ucfirst($k) . ' (' . $t['unit'] . ')';
            if (!$this->has_arg('bl')) $lab = $bl . ': ' . $lab;

            array_push($data, array('label' => $lab, 'data' => $gram));
        }

        $this->_output(array('histograms' => $data));
    }

    function _relion_parameters() {
        if (!$this->has_arg('processingJobId')) $this->_error('Processing Job ID not provided');

        $parameters = $this->db->pq("
            SELECT pj.processingjobparameterid,
                pj.processingjobid,
                pj.parameterkey,
                pj.parametervalue
            FROM ProcessingJobParameter pj
            WHERE pj.processingjobid = :1", array($this->arg('processingJobId')));

        if (!sizeof($parameters)) $this->_error('No parameters for processing job');

        $this->_output( array('data'=>$parameters, 'total'=>sizeof($parameters)));
    }

    function handlePaginationArguments($args) {
        $perPage = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
        $start = 0;
        $end = $perPage;
            
        if ($this->has_arg('page') && $this->arg('page') > 0) {
            $page = $this->arg('page') - 1;
            $start = $page*$perPage;
            $end = $page*$perPage+$perPage;
        }
            
        array_push($args, $start);
        array_push($args, $end);

        return $args;
    }
}