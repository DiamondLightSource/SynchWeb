<?php

namespace SynchWeb\Page\EM;

trait ProcessingJobs
{
    public function processingJobsByCollection()
    {
        if (!$this->has_arg('id')) {
            $this->_error('No data collection provided');
        }

        $this->_output($this->processingJobsQuery(
            'WHERE DC.dataCollectionId = :1',
            array($this->arg('id'))
        ));
    }

    public function processingJobsBySession()
    {
        // Finds queued and running ProcessingJobs associated with session
        // Returns null otherwise
        $session = $this->determineSession($this->arg('session'));

        if (!$session['SESSIONID']) {
            $this->_error('No session provided');
        }

        $this->_output($this->processingJobs(
            'WHERE BLS.sessionId = :1',
            array($session['SESSIONID'])
        ));
    }

    private function processingJobsQuery($where, $args)
    {
        $total = $this->db->pq(
            "SELECT count(PJ.processingJobId) as total
            FROM ProcessingJob PJ
            JOIN DataCollection DC ON PJ.dataCollectionId = DC.dataCollectionId
            JOIN BLSession BLS ON DC.SESSIONID = BLS.sessionId
            LEFT JOIN AutoProcProgram app ON PJ.processingJobId = app.processingJobId
            $where",
            $args,
            false
        );

        // In the test data, there are a few occurrences of multiple
        // AutoProcProgram rows on a single ProcessingJob.
        // Andy Preston didn't know if this was a testing artifact or expected
        // in normal operation, autoProcProgramId is included here just in case
        $processingJobs = $this->db->pq(
            "SELECT
                PJ.processingJobId,
                PJ.dataCollectionId,
                PJ.recordTimestamp,
                APP.autoProcProgramId,
                APP.processingStatus,
                APP.processingStartTime,
                APP.processingEndTime,
                (SELECT COUNT(MotionCorrection.motionCorrectionId)
                    FROM MotionCorrection
                    WHERE MotionCorrection.autoProcProgramId = APP.autoProcProgramId
                ) AS mcCount,
                (SELECT COUNT(CTF.ctfId)
                    FROM CTF
                    WHERE CTF.autoProcProgramId = APP.autoProcProgramId
                ) AS ctfCount,
                CASE
                    WHEN (APP.processingJobId IS NULL) THEN 'submitted'
                    WHEN (APP.processingStartTime IS NULL AND APP.processingStatus IS NULL) THEN 'queued'
                    WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus IS NULL) THEN 'running'
                    WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus = 0) THEN 'failure'
                    WHEN (APP.processingStartTime IS NOT NULL AND APP.processingStatus = 1) THEN 'success'
                    ELSE ''
                END AS processingStatusDescription
            FROM ProcessingJob PJ
            INNER JOIN DataCollection DC ON PJ.dataCollectionId = DC.dataCollectionId
            INNER JOIN BLSession BLS ON DC.SESSIONID = BLS.sessionId
            LEFT JOIN AutoProcProgram APP ON PJ.processingJobId = APP.processingJobId
            $where
            LIMIT :2, :3",
            $this->paginationArguments($args)
        );

        return array(
            'total' => intval($total[0]['total']),
            'data' => $processingJobs,
        );
    }
}
