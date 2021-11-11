<?php

namespace SynchWeb\Page\EM;

trait ProcessingJobs
{
    public function processingJobs()
    {
        if (!$this->has_arg('id')) {
            $this->_error('No data collection provided');
        }

        $subqueries = $this->processingJobsSubQueries();

        /* FetchTime is to trigger re-fetches of the entities that depend on
           ProcessingJob */
        $processingJobs = $this->db->pq(
            "SELECT
                ProcessingJob.processingJobId,
                ProcessingJob.dataCollectionId,
                ProcessingJob.recordTimestamp,
                AutoProcProgram.autoProcProgramId,
                AutoProcProgram.processingStartTime,
                AutoProcProgram.processingEndTime,
                $subqueries
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
            'total' => $this->processingJobsTotal(),
            'data' => $this->processingJobsTidy($processingJobs),
        ));
    }

    ////////////////////////////////////////////////////////////////////////////

    private function processingJobsTotal()
    {
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
        return intval($total[0]['total']);
    }

    ////////////////////////////////////////////////////////////////////////////

    private function processingJobsTidy($rows)
    {
        $noNullFields = array (
            'ctfLatest', 'ctfMax',
            'mcLatest', 'mcMax',
            'pickLatest', 'pickMax',
        );
        return array_map(
            function ($row) use ($noNullFields) {
                $result = array();
                foreach ($row as $key => $value) {
                    $result[$key] = in_array(
                        $key,
                        $noNullFields
                    ) && $value == null ? '' : $value;
                }
                return $result;
            },
            $rows
        );
    }


    ////////////////////////////////////////////////////////////////////////////

    private function processingJobsLatestQuery($tables, $key)
    {
        return "(SELECT MotionCorrection.imageNumber FROM $tables
        INNER JOIN Movie ON Movie.movieId = MotionCorrection.movieId
        WHERE MotionCorrection.autoProcProgramId = AutoProcProgram.autoProcProgramId
        ORDER BY Movie.createdTimeStamp DESC, MotionCorrection.imageNumber DESC
        LIMIT 1) AS {$key}Latest,";
    }

    private function processingJobsMaxQuery($tables, $key)
    {
        return "(SELECT MAX(MotionCorrection.imageNumber) FROM $tables
        WHERE MotionCorrection.autoProcProgramId = AutoProcProgram.autoProcProgramId) as {$key}Max,";
    }

    private function processingJobsSubQueries()
    {
        $specs = array(
            'mc' => 'MotionCorrection',
            'ctf' => 'CTF INNER JOIN MotionCorrection
                ON MotionCorrection.motionCorrectionId = CTF.motionCorrectionId',
            'pick' => 'ParticlePicker INNER JOIN MotionCorrection
                ON MotionCorrection.motionCorrectionId = ParticlePicker.firstMotionCorrectionId',
        );
        $subqueries = array();
        foreach ($specs as $key => $tables) {
            array_push(
                $subqueries,
                $this->processingJobsLatestQuery($tables, $key)
            );
            array_push(
                $subqueries,
                $this->processingJobsMaxQuery($tables, $key)
            );
        }
        return implode("\n", $subqueries);
    }
}
