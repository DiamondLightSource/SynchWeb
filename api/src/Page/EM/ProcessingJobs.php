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
                ProcessingJob.processingJobId,
                ProcessingJob.dataCollectionId,
                ProcessingJob.recordTimestamp,
                AutoProcProgram.autoProcProgramId,
                AutoProcProgram.processingStartTime,
                AutoProcProgram.processingEndTime,
                (SELECT COUNT(DISTINCT Movie.movieNumber)
                    FROM MotionCorrection
                    LEFT JOIN Movie ON Movie.movieId = MotionCorrection.movieId
                    WHERE MotionCorrection.autoProcProgramId = AutoProcProgram.autoProcProgramId
                ) AS movieCount,
                (SELECT COUNT(MotionCorrection.motionCorrectionId)
                    FROM MotionCorrection
                    WHERE MotionCorrection.autoProcProgramId = AutoProcProgram.autoProcProgramId
                ) AS mcCount,
                (SELECT COUNT(CTF.ctfId)
                    FROM CTF
                    WHERE CTF.autoProcProgramId = AutoProcProgram.autoProcProgramId
                ) AS ctfCount,
                (SELECT COUNT(ParticlePicker.particlePickerId)
                    FROM ParticlePicker
                    WHERE ParticlePicker.programId = AutoProcProgram.autoProcProgramId
                ) AS pickCount,
                NOW() as fetchTime,
                CASE
                    WHEN (
                        AutoProcProgram.processingJobId IS NULL
                    ) THEN 'submitted'
                    WHEN (
                        AutoProcProgram.processingStartTime IS NULL
                        AND AutoProcProgram.processingStatus IS NULL
                    ) THEN 'queued'
                    WHEN (
                        AutoProcProgram.processingStartTime IS NOT NULL
                        AND AutoProcProgram.processingStatus IS NULL
                    ) THEN 'running'
                    WHEN (
                        AutoProcProgram.processingStartTime IS NOT NULL
                        AND AutoProcProgram.processingStatus = 0
                    ) THEN 'failure'
                    WHEN (
                        AutoProcProgram.processingStartTime IS NOT NULL
                        AND AutoProcProgram.processingStatus = 1
                    ) THEN 'success'
                    ELSE ''
                END AS processingStatusDescription
            FROM ProcessingJob
            LEFT JOIN AutoProcProgram
                ON AutoProcProgram.processingJobId = ProcessingJob.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND DataCollection.dataCollectionId = :2
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
