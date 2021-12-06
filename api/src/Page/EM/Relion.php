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

        $this->sessionExitIfNotActive($session);

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

        $this->_send_zocalo_message($zocalo_mx_reprocess_queue, $message);

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

        $rows = $this->db->pq(
            "SELECT ProcessingJob.processingJobId
            FROM ProcessingJob
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND processingJobId = :2",
            array($this->arg('prop'), $this->arg('jobId')),
            false
        );

        if (count($rows) == 0) {
            $message = 'Processing job not found!';
            error_log($message);
            $this->_error($message, 400);
        }

        $result = $rows[0];

        $parameters = array(
            'ispyb_process' => $result['processingJobId'],
        );
        $recipe = 'relion-stop';
        $this->_submit_zocalo_recipe($recipe, $parameters);

        $this->_output(array(
            'timestamp' => gmdate('c', time()),
            'message' => array(
                'recipe' => $recipe,
                'parameters' => $parameters,
            )
        ));
    }

    /**
     * Output the parameters used for a given processing job
     *
     * @SuppressWarnings(PHPMD.StaticAccess)
     */
    public function relionParameters()
    {
        $rows = $this->db->pq(
            "SELECT
                ProcessingJobParameter.parameterKey,
                ProcessingJobParameter.parameterValue
            FROM ProcessingJobParameter
            INNER JOIN ProcessingJob
                ON ProcessingJob.processingJobId = ProcessingJobParameter.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND ProcessingJobParameter.processingJobId = :2",
            array($this->arg('prop'), $this->arg('jobId')),
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

        $postData = json_decode($this->app->request->getBody(), true);

        // used to validate eer_grouping
        preg_match('/\.([\w]*)$/', $dataCollection['fileTemplate'], $matches);
        $postData['import_images_ext'] = $matches[1];

        $schema = new RelionSchema();
        $validator = new SchemaValidator($schema);
        list($invalid, $cleanData) = $validator->validatePostData($postData);

        if (count($invalid) > 0) {
            $this->_error($invalid, 400);
        }

        // RelionSchema uses session_path to get a full path for gain_reference_file
        $cleanData['session_path'] = $this->sessionSubstituteValuesInPath(
            $session,
            $visit_directory
        );

        // Relion will need import_images to fetch the raw images
        $cleanData['import_images'] = $dataCollection['imageDirectory'] .
            '/' .  $dataCollection['fileTemplate'];
        return $schema->prepareDataForInsert($cleanData);
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
