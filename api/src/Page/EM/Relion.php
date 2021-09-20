<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Page\EM\PostDataValidator;
use SynchWeb\Page\EM\RelionParameterTransformer;
use SynchWeb\Page\EM\RelionSchema;

trait Relion
{
    /**
     * Output the schema for client-side use
     *
     * @SuppressWarnings(PHPMD.StaticAccess)
     */
    public function relionSchema()
    {
        $this->_output(RelionSchema::schema());
    }

    /**
     * Create a data collection and a processing job then enqueue the job
     *
     * @SuppressWarnings(PHPMD.StaticAccess)
     * @SuppressWarnings(PHPMD.LongVariable)
     */
    public function relionStart()
    {
        global $visit_directory, $zocalo_mx_reprocess_queue;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->sessionFetch($this->arg('session'));

        /* TODO Temporary override to make session available for testing
           after session has ended (JPH) */
        // $this->sessionExitIfNotActive($session);

        $sessionPath = $this->sessionSubstituteValuesInPath($session, $visit_directory);

        $validator = new PostDataValidator(RelionSchema::schema());
        list($invalid, $args) = $validator->validateJsonPostData(
            $this->app->request->getBody()
        );
        if (count($invalid) > 0) {
            $this->_error(array('invalid' => $invalid), 400);
        }

        $transformer = new RelionParameterTransformer($sessionPath);
        $workflowParameters = $transformer->postParameters($this->args);

        /* Create a ProcessingJob with ProcessingJobParameters
           for Zocalo to trigger RELION processing.
           This requires a DataCollection
           which in turn requires a DataCollectionGroup. */

        $dataCollectionId = $this->findExistingDataCollection(
            $session['sessionId'],
            $transformer->getImageDirectory(),
            $transformer->getFileTemplate()
        );

        if (
            $dataCollectionId &&
            $this->unfinishedProcessingJobsExist($dataCollectionId)
        ) {
            $message = 'Relion processing job already exists for this data collection!';
            error_log($message);
            $this->_error($message, 400);
        }

        if (!$dataCollectionId) {
            $dataCollectionId = $this->addDataCollection(
                $session,
                $transformer->getImageDirectory(),
                $this->args['import_images_ext'],
                $transformer->getFileTemplate()
            );
        }

        $processingJobId = $dataCollectionId ?
            $this->addProcessingJob($dataCollectionId, $workflowParameters) :
            null;

        // Send job to processing queue
        $message = array(
            'parameters' => array('ispyb_process' => $processingJobId)
        );

        $this->enqueue($zocalo_mx_reprocess_queue, $message);

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
        $session = $this->sessionFetch($this->arg('session'));

        // TODO RESTORE FOR PRODUCTION
        // $this->sessionExitIfNotActive($session);

        $output = array(
            'timestamp' => gmdate('c', time()),
            'processingIsActive' => false, // $session['processingIsActive'],
            'processingTimestamp' => $session['processingTimestamp'] ?
                gmdate('c', $session['processingTimestamp']) :
                null
        );

        $this->_output($output);
    }

    /**
     * Request that a currently running job be stopped
     *
     * @SuppressWarnings(PHPMD.LongVariable)
     */
    public function relionStop()
    {
        global $zocalo_mx_reprocess_queue;

        if ($this->arg('processingJobId')) {
            $result = $this->db->pq(
                "SELECT processingJobId, dataCollectionId
                FROM ProcessingJob
                WHERE processingJobId = :1",
                array($this->arg('processingJobId')),
                false
            );

            if (count($result)) {
                $message = array(
                    'parameters' => array(
                        'ispyb_process' => $result[0]['processingJobId']
                    ),
                    'recipes' => ['relion-stop']
                );

                $this->enqueue($zocalo_mx_reprocess_queue, $message);
                return;
            }

            $message = 'Processing job not found!';
            error_log($message);
            $this->_error($message, 400);
        }

        $this->_output(array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
        ));
    }

    /**
     * Output the parameters used for a given processing job
     *
     * @SuppressWarnings(PHPMD.StaticAccess)
     */
    public function relionParameters()
    {
        if (!$this->has_arg('processingJobId')) {
            $this->_error('Processing Job ID not provided');
        }

        $rows = $this->db->pq(
            "SELECT
                ProcessingJobParameter.parameterKey,
                ProcessingJobParameter.parameterValue
            FROM ProcessingJobParameter
            WHERE ProcessingJobParameter.processingJobId = :1",
            array($this->arg('processingJobId')),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No parameters for processing job');
        }

        $results = array();
        foreach ($rows as $row) {
            $results[$row['parameterKey']] = $row['parameterValue'];
        }

        $transformer = new RelionParameterTransformer(
            '',
            RelionSchema::schema()
        );
        $this->_output($transformer->fetchParameters($results));
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Returns dataCollectionId of first DataCollection associated with session
     *
     * Also checks for existing imageDirectory
     *
     * @param string $sessionId
     * @param string $imageDirectory
     * @param string $fileTemplate
     *
     * @return array|null
     */
    private function findExistingDataCollection(
        $sessionId,
        $imageDirectory,
        $fileTemplate
    ) {
        if (!$sessionId) {
            return null;
        }

        $rows = $this->db->pq(
            "SELECT dataCollectionId FROM DataCollection
                WHERE SESSIONID=:1 AND imageDirectory=:2 AND fileTemplate=:3
                LIMIT 1",
            array(
                $sessionId,
                $imageDirectory,
                $fileTemplate
            ),
            false
        );

        if (count($rows) == 0) {
            return null;
        }

        return $rows[0]['DataCollectionId'];
    }

    private function unfinishedProcessingJobsExist($dataCollectionId)
    {
        $result = $this->db->pq(
            "SELECT DC.dataCollectionId, APP.processingStatus
            FROM DataCollection DC
            INNER JOIN ProcessingJob PJ
                ON PJ.dataCollectionId = DC.dataCollectionId
            LEFT JOIN AutoProcProgram APP
                ON APP.processingJobId = PJ.processingJobId
            WHERE APP.processingStatus IS NULL AND DC.dataCollectionId = :1",
            array($dataCollectionId)
        );

        return count($result) > 0;
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Add a new data collection for processing jobs that don't yet have one
     *
     * @param array $session
     * @param string $imageDirectory
     * @param string $imageSuffix
     * @param string $fileTemplate
     *
     * @SuppressWarnings(PHPMD.LongVariable)
     */
    private function addDataCollection(
        $session,
        $imageDirectory,
        $imageSuffix,
        $fileTemplate
    ) {
        $dataCollectionId = null;

        try {
            $this->db->start_transaction();

            $this->db->pq(
                "INSERT INTO DataCollectionGroup (
                    sessionId,
                    comments,
                    experimentType
                )
                VALUES (:1, :2, :3)
                RETURNING dataCollectionGroupId INTO :id",
                array(
                    $session['SessionId'],
                    'Created by SynchWeb',
                    'EM'
                )
            );
            $dataCollectionGroupId = $this->db->id();

            $this->db->pq(
                "INSERT INTO DataCollection (
                    sessionId,
                    dataCollectionGroupId,
                    startTime,
                    endTime,
                    runStatus,
                    imageDirectory,
                    imageSuffix,
                    fileTemplate,
                    comments
                )
                VALUES (:1, :2, NOW(), :3, :4, :5, :6, :7, :8)
                RETURNING dataCollectionId INTO :id",
                array(
                    $session['SessionId'],
                    $dataCollectionGroupId,
                    // now()
                    $session['EndDate'],
                    'DataCollection Simulated',
                    $imageDirectory,
                    $imageSuffix,
                    $fileTemplate,
                    'Created by SynchWeb'
                )
            );
            $dataCollectionId = $this->db->id();

            $this->db->end_transaction();
        } catch (Exception $e) {
            error_log("Failed to add DataCollection to database.");
            $this->_error("Failed to add DataCollection to database.", 500);
        }

        return $dataCollectionId;
    }

    private function addProcessingJob($dataCollectionId, $workflowParameters)
    {
        $processingJobId = null;

        try {
            $this->db->start_transaction();

            // Add ProcessingJob

            $this->db->pq(
                "INSERT INTO ProcessingJob (
                    dataCollectionId,
                    displayName,
                    comments,
                    recipe,
                    automatic
                )
                VALUES (:1, :2, :3, :4, :5)
                RETURNING processingJobId INTO :id",
                array(
                    $dataCollectionId,
                    'RELION',
                    'Submitted via SynchWeb',
                    'relion',
                    0
                )
            );
            $processingJobId = $this->db->id();

            foreach ($workflowParameters as $key => $value) {
                $this->db->pq(
                    "INSERT INTO ProcessingJobParameter (
                        processingJobId,
                        parameterKey,
                        parameterValue
                    )
                    VALUES (:1, :2, :3)",
                    array(
                        $processingJobId,
                        $key,
                        (is_bool($value) ? var_export($value, true) : $value)
                    )
                );
            }

            $this->db->end_transaction();
        } catch (Exception $e) {
            error_log("Failed to add ProcessingJob to database.");
            $this->_error("Failed to add ProcessingJob to database.", 500);
        }

        return $processingJobId;
    }
}
