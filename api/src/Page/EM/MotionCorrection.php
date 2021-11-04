<?php

namespace SynchWeb\Page\EM;

trait MotionCorrection
{
    public function motionCorrectionResult()
    {
        $movie = $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1;
        $programId = $this->arg('id');

        $rows = $this->db->pq(
            "SELECT
                mc.motionCorrectionId,
                mc.firstFrame,
                mc.lastFrame,
                mc.dosePerFrame,
                mc.doseWeight,
                mc.totalMotion,
                mc.averageMotionPerFrame,
                mc.micrographSnapshotFullPath,
                mc.patchesUsedX,
                mc.patchesUsedY,
                mc.fftFullPath,
                mc.fftCorrectedFullPath,
                mc.comments,
                mc.autoProcProgramId,
                m.movieNumber,
                m.createdTimeStamp
            FROM MotionCorrection mc
            INNER JOIN AutoProcProgram app ON app.autoProcProgramId = mc.autoProcProgramId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND mc.autoProcProgramId = :2
            AND m.movieNumber = :3",
            array($this->arg('prop'), $programId, $movie),
            false
        );

        $this->motionControlErrorCheck(sizeof($rows), $movie, $programId);

        $row = $rows[0];

        $row['fftFullPath'] = file_exists($row['fftFullPath']) ? 1 : 0;
        $row['fftCorrectedFullPath'] = file_exists($row['fftCorrectedFullPath']) ? 1 : 0;
        $row['micrographSnapshotFullPath'] = file_exists($row['micrographSnapshotFullPath']) ? 1 : 0;

        $formatColumns = array(
            'totalMotion' => 1,
            'averageMotionPerFrame' => 2
        );
        foreach ($formatColumns as $column => $decimals) {
            $row[$column] = number_format($row[$column], $decimals, '.', '');
        }

        $this->_output($row);
    }

    public function motionCorrectionDriftPlot()
    {
        $rows = $this->db->pq(
            "SELECT mcd.deltaX, mcd.deltaY
            FROM MotionCorrectionDrift mcd
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = mcd.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND mc.autoProcProgramId = :2
            AND m.movieNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );
        $xAxis = array();
        $yAxis = array();
        foreach ($rows as $row) {
            array_push($xAxis, $row['deltaX']);
            array_push($yAxis, $row['deltaY']);
        }
        $this->_output(array('xAxis' => $xAxis, 'yAxis' => $yAxis));
    }

    private function motionCorrectionImage($imageName)
    {
        $movie = $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1;
        $programId = $this->arg('id');

        $rows = $this->db->pq(
            "SELECT mc.{$imageName}
            FROM MotionCorrection mc
            INNER JOIN AutoProcProgram ap ON ap.autoProcProgramId = mc.autoProcProgramId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND mc.autoProcProgramId = :2
            AND m.movieNumber = :3",
            array($this->arg('prop'), $programId, $movie),
            false
        );

        $this->motionControlErrorCheck(sizeof($rows), $movie, $programId);

        $this->sendImage($rows[0][$imageName]);
    }

    public function motionCorrectionSnapshot()
    {
        $this->motionCorrectionImage('micrographSnapshotFullPath');
    }

    private function motionControlErrorCheck($size, $movie, $programId)
    {
        if ($size == 0) {
            $this->_error('No such micrograph');
        }
        if ($size > 1) {
            error_log(
                "$size motion correction entries for movie: $movie autoProcProgramId: $programId"
            );
        }
    }
}
