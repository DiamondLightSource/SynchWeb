<?php

namespace SynchWeb\Page\EM;

trait MotionCorrection
{
    public function motionCorrectionResult()
    {
        $image = $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1;
        $programId = $this->arg('id');

        $rows = $this->db->pq(
            "SELECT
                mc.firstFrame,
                mc.lastFrame,
                mc.dosePerFrame,
                mc.doseWeight,
                mc.totalMotion,
                mc.averageMotionPerFrame,
                mc.patchesUsedX,
                mc.patchesUsedY,
                mc.comments,
                mc.imageNumber,
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
            AND mc.imageNumber = :3",
            array($this->arg('prop'), $programId, $image),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('No such micrograph');
        }

        $row = $rows[0];

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
            AND mc.imageNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('id'),
                $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1
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
        $image = $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1;
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
            AND mc.imageNumber = :3",
            array($this->arg('prop'), $programId, $image),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('No such micrograph');
        }

        $this->sendImage($rows[0][$imageName]);
    }

    public function motionCorrectionSnapshot()
    {
        $this->motionCorrectionImage('micrographSnapshotFullPath');
    }
}
