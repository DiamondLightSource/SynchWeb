<?php

namespace SynchWeb\Page\EM;

trait ProcessingJobs
{
    public function processingJobs()
    {
        if (!$this->has_arg('id')) {
            $this->_error('No data collection provided');
        }

        $total = $this->db->pq(
            "SELECT count(pj.processingJobId) as total
            FROM ProcessingJob pj
            LEFT JOIN AutoProcProgram app ON pj.processingJobId = app.processingJobId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = pj.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND dc.dataCollectionId = :2",
            array($this->arg('prop'), $this->arg('id')),
            false
        );

        /* In the test data, there are a few occurrences of multiple
           AutoProcProgram rows on a single ProcessingJob.
           Andy Preston didn't know if this was a testing artifact or expected
           in normal operation, autoProcProgramId is included here just in case
         * FetchTime is to trigger re-fetches of the entities that depend on
           ProcessingJob
         */
        $processingJobs = $this->db->pq(
            "SELECT
                pj.processingJobId,
                pj.dataCollectionId,
                pj.recordTimestamp,
                app.autoProcProgramId,
                app.processingStartTime,
                app.processingEndTime,
                NOW() as fetchTime,
                CASE
                    WHEN (app.processingJobId IS NULL) THEN 'submitted'
                    WHEN (app.processingStartTime IS NULL AND app.processingStatus IS NULL) THEN 'queued'
                    WHEN (app.processingStartTime IS NOT NULL AND app.processingStatus IS NULL) THEN 'running'
                    WHEN (app.processingStartTime IS NOT NULL AND app.processingStatus = 0) THEN 'failure'
                    WHEN (app.processingStartTime IS NOT NULL AND app.processingStatus = 1) THEN 'success'
                    ELSE ''
                END AS processingStatusDescription
            FROM ProcessingJob pj
            LEFT JOIN AutoProcProgram app ON app.processingJobId = pj.processingJobId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = pj.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND dc.dataCollectionId = :2
            LIMIT :3, :4",
            $this->paginationArguments(
                array($this->arg('prop'), $this->arg('id'))
            ),
            false
        );

        $this->_output(array(
            'total' => intval($total[0]['total']),
            'data' => $processingJobs,
        ));
    }
}
