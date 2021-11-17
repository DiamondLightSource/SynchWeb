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
                c.astigmatism,
                c.astigmatismAngle,
                c.estimatedResolution,
                c.estimatedDefocus,
                c.amplitudeContrast,
                c.ccValue,
                c.fftTheoreticalFullPath,
                c.comments,
                c.autoProcProgramId,
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
            // Maybe c.autoProcProgramId should be mc. ?????
            array(
                $this->arg('prop'),
                $this->arg('id'),
                $this->has_arg('imageNumber') ? $this->arg('imageNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such ctf correction');
        }
        $row = $rows[0];

        $row['fftTheoreticalFullPath'] = file_exists($row['fftTheoreticalFullPath']) ? 1 : 0;

        $formatColumns = array(
            'astigmatism' => 2,
            'astigmatismAngle' => 1,
            'estimatedResolution' => 2,
            'estimatedDefocus' => 0
        );
        foreach ($formatColumns as $column => $decimals) {
            $row[$column] = number_format($row[$column], $decimals, '.', '');
        }

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
            // Maybe c.autoProcProgramId should be mc. ?????
            array(
                $this->arg('prop'),
                $this->arg('id'),
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
                c.astigmatism,
                c.estimatedResolution,
                c.estimatedDefocus
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
            // Maybe c.autoProcProgramId should be mc. ?????
            array($this->arg('prop'), $this->arg('id')),
            false
        );
        $this->_output($rows);
    }
}
