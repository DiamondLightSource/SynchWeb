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
        global $zocalo_mx_reprocess_queue;

        $this->configExitIfNoMicroscopes();

        $proposalCode = $this->arg('prop');
        $dataCollectionId = $this->arg('id');

        $session = $this->sessionFromDataCollection(
            $proposalCode,
            $dataCollectionId
        );

        // $this->sessionExitIfNotActive($session);

        $dataCollection = $this->dataCollectionForProcessing(
            $proposalCode,
            $dataCollectionId
        );

        if ($dataCollection['runningJobs'] > 0) {
            $message = 'A Relion job is already running on this data collection!';
            error_log("$message - $proposalCode $dataCollectionId");
            $this->_error($message, 400);
        }

        $preparedData = $this->relionPreparePostData($dataCollection, $session);

        $processingJobId = $this->relionAddJob($dataCollectionId, $preparedData);

        // Send job to processing queue
        $message = array(
            'parameters' => array('ispyb_process' => $processingJobId)
        );

        $this->zocaloEnqueue($zocalo_mx_reprocess_queue, $message);

        $output = array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
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
                $this->zocaloEnqueue($zocalo_mx_reprocess_queue, $message);
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

        $schema = new RelionSchema();
        $this->_output($schema->processRow($results));
    }

    ////////////////////////////////////////////////////////////////////////////

    private function relionPreparePostData($dataCollection, $session)
    {
        global $visit_directory;

        $schema = new RelionSchema();
        $validator = new SchemaValidator($schema);
        list($invalid, $postData) = $validator->validateJsonPostData(
            $this->app->request->getBody()
        );
        /*  This comes from BLSession
            RelionSchema uses it to get the full path of the gain reference file
        */
        $postData['session_path'] = $this->sessionSubstituteValuesInPath(
            $session,
            $visit_directory
        );
        /*  This comes from the data collection
                Relion will need it to fetch the raw images
                Schema also uses it to check the image extension
        */
        $postData['import_images'] = $dataCollection['imageDirectory'] .
            $dataCollection['fileTemplate'];
        /*  TODO: This is a terrible bodge up
            But the validator can't see schema generated values
        */
        /*  RelionSchema needs this to validate eer_grouping
        */
        preg_match('/\.([\w]*)$/', $dataCollection['fileTemplate'], $matches);
        $postData['import_images_ext'] = $matches[1];

        if (count($invalid) > 0) {
            $this->_error($invalid, 400);
        }

        return $schema->prepareDataForInsert($postData);
    }

    private function relionAddJob($dataCollectionId, $workflowParameters)
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
        } catch (Exception $exception) {
            $message = 'Failed to add ProcessingJob to database.';
            error_log($message);
            error_log($exception->getMessage());
            $this->_error($message, 500);
        }

        return $processingJobId;
    }
}
