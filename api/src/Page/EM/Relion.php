<?php

namespace SynchWeb\Page\EM;

use SynchWeb\Page\EM\RelionArgumentValidator;
use SynchWeb\Page\EM\RelionParameterBuilder;

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
        $sessionPath = $this->substituteSessionValuesInPath($session, $visit_directory);

        $argumentValidator = new RelionArgumentValidator();
        $validated = $argumentValidator->validate($this->args);

        if (count($validated['invalid']) > 0) {
            $message = 'Invalid parameters: ' . implode(
                '; ',
                $validated['invalid']
            ) . '.';
            error_log($message);
            $this->_error($message, 400);
        }

        $builder = new RelionParameterBuilder($sessionPath);
        $workflowParameters = $builder->parameters($validated['valid']);

        // Create a ProcessingJob with ProcessingJobParameters for Zocalo to trigger RELION processing.
        // This requires a DataCollection which in turn requires a DataCollectionGroup.

        $dataCollectionId = $this->findExistingDataCollection(
            $session,
            $builder->getImageDirectory(),
            $builder->getFileTemplate()
        );

        if (!$dataCollectionId) {
            $dataCollectionId = $this->addDataCollectionForEM(
                $session,
                $builder->getImageDirectory(),
                $validated['valid']['projectMovieFileNameExtension'],
                $builder->getFileTemplate()
            );
        }

        $processingJobId = null;

        if ($dataCollectionId) {
            $processingJobId = $this->addProcessingJobForRelion(
                $dataCollectionId,
                $workflowParameters
            );
        }

        // Send job to processing queue
        // TODO Add provenance

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

    private function findExistingDataCollection(
        $session,
        $imageDirectory,
        $fileTemplate
    ) {
        // Returns dataCollectionId of first DataCollection associated with session
        // Also checks for existing imageDirectory
        // Returns null otherwise

        if ($session['SESSIONID']) {
            $result = $this->db->pq(
                "SELECT dataCollectionId FROM DataCollection
                    WHERE SESSIONID = :1 AND imageDirectory = :2 AND fileTemplate = :3
                    LIMIT 1",
                array(
                    $session['SESSIONID'],
                    $imageDirectory,
                    $fileTemplate
                )
            );
            if (count($result)) {
                return $result[0]['DATACOLLECTIONID'];
            }
        }

        return null;
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
            'processingTimestamp' => $session['processingTimestamp'] ?
                gmdate('c', $session['processingTimestamp']) :
                null
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

                $this->enqueue($zocalo_mx_reprocess_queue, $message);
                return;
            }

            $message = 'Processing job not found!';
            error_log($message);
            $this->_error($message, 400);
        }

        $output = array(
            'timestamp' => gmdate('c', time()),
            'message' => $message
        );

        $this->_output($output);
    }

    public function relionParameters()
    {
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
