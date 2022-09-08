<?php

namespace SynchWeb\Page\EM;

trait Ctf
{
    public function ctfResult()
    {
        $rows = $this->db->pq(
            "SELECT
                c.ctfId,
                c.boxSizeX,
                c.boxSizeY,
                c.minResolution,
                c.maxResolution,
                c.minDefocus,
                c.maxDefocus,
                c.defocusStepSize,
                c.astigmatism / 10.0 as astigmatism,
                c.astigmatismAngle,
                c.estimatedResolution,
                c.estimatedDefocus / 10000.0 as estimatedDefocus,
                c.amplitudeContrast,
                c.ccValue,
                c.comments,
                m.createdTimeStamp,
                mc.imageNumber
            FROM CTF c
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = c.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND c.autoProcProgramId = :2
            AND mc.imageNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('programId'),
                $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such ctf correction');
        }
        $row = $rows[0];

        $row['estimatedResolution'] =
            number_format($row['estimatedResolution'], 2, '.', '');
        $row['astigmatismAngle'] =
            number_format($row['astigmatismAngle'], 1, '.', '');
        $row['astigmatism'] =
            number_format($row['astigmatism'], 4, '.', '');
        $row['estimatedDefocus'] =
            number_format($row['estimatedDefocus'], 5, '.', '');

        $this->_output($row);
    }

    public function ctfImage()
    {
        $rows = $this->db->pq(
            "SELECT c.fftTheoreticalFullPath
            FROM CTF c
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = c.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND c.autoProcProgramId = :2
            AND mc.imageNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('programId'),
                $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such ctf correction');
        }

        $this->sendImage($rows[0]['fftTheoreticalFullPath']);
    }

    public function ctfSummary()
    {
        $rows = $this->db->pq(
            "SELECT
                mc.imageNumber,
                m.createdTimeStamp,
                c.astigmatism / 10.0 as astigmatism,
                c.estimatedResolution,
                c.estimatedDefocus / 10000.0 as estimatedDefocus
            FROM CTF c
            INNER JOIN AutoProcProgram app ON app.autoProcProgramId = c.autoProcProgramId
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = c.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND c.autoProcProgramId = :2
            ORDER BY m.createdTimeStamp",
            array($this->arg('prop'), $this->arg('programId')),
            false
        );
        $this->_output($rows);
    }
}
