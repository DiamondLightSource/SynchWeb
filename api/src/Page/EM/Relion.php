<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Page\EM\SchemaValidator;
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
        $schema = new RelionSchema();
        $this->_output($schema->clientSchema());
    }

    /**
     * Create a data collection and a processing job then enqueue the job
     *
     * @SuppressWarnings(PHPMD.LongVariable)
     */
    public function relionStart()
    {
        global $visit_directory, $zocalo_mx_reprocess_queue;

        $this->configExitIfNoMicroscopes();
        $session = $this->sessionFetch($this->arg('session'));

        /* TODO Temporary override to make session available for testing
           after session has ended (JPH) */
        // $this->sessionExitIfNotActive($session);

        $sessionPath = $this->sessionSubstituteValuesInPath($session, $visit_directory);

        $validator = new SchemaValidator(RelionSchema::schema());
        list($invalid, $args) = $validator->validateJsonPostData(
            $this->app->request->getBody()
        );
        if (count($invalid) > 0) {
            $this->_error(array('invalid' => $invalid), 400);
        }


        /* Create a ProcessingJob with ProcessingJobParameters
           for Zocalo to trigger RELION processing.
           This requires a DataCollection
           which in turn requires a DataCollectionGroup. */

        $dataCollectionId = $this->dataCollectionFindExisting(
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

        $schema = new RelionSchema();
        if (!$dataCollectionId) {
            $dataCollectionId = $this->dataCollectionAdd(
                $session,
                $transformer->getImageDirectory(),
                $args['import_images_ext'],
                $transformer->getFileTemplate()
            );
        }

        // "sneak" an extra value into the posted data
        // which RelionSchema can use to transform file-path items.
        $args['session_path'] = $this->sessionSubstituteValuesInPath(
            $session, // keys in the $session array MUST be all upper case
            $visit_directory
        );
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

        $this->configExitIfNoMicroscopes();
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

    private function addProcessingJob($dataCollectionId, $workflowParameters)
    {
        $processingJobId = null;

        try {
            $this->db->start_transaction();

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
