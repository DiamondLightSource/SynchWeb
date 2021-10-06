<?php

namespace SynchWeb\Page\EM;

trait Picker
{
    public function pickerMovies()
    {
        $rows = $this->db->pq(
            "SELECT m.movieNumber
            FROM ParticlePicker pp
            LEFT JOIN MotionCorrection mc ON mc.motionCorrectionId = pp.firstMotionCorrectionId
            LEFT JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND pp.programId = :2",
            array($this->arg('prop'), $this->arg('id')),
            false
        );
        $this->_output(
            array_map(
                function ($row) {
                    return $row['movieNumber'];
                },
                $rows
            )
        );
    }

    public function pickerResult()
    {
        $rows = $this->db->pq(
            "SELECT
                pp.particleDiameter,
                pp.numberOfParticles,
                pp.summaryImageFullPath,
                m.movieNumber
            FROM ParticlePicker pp
            LEFT JOIN MotionCorrection mc ON mc.motionCorrectionId = pp.firstMotionCorrectionId
            LEFT JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND pp.programId = :2
            AND m.movieNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such pick');
        }
        $row = $rows[0];

        $row['summaryImageFullPath'] = file_exists($row['summaryImageFullPath']) ? 1 : 0;

        $this->_output($row);
    }

    public function pickerImage()
    {
        $rows = $this->db->pq(
            "SELECT pp.summaryImageFullPath
            FROM ParticlePicker pp
            LEFT JOIN MotionCorrection mc ON mc.motionCorrectionId = pp.firstMotionCorrectionId
            LEFT JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession bls ON bls.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = bls.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber) = :1
            AND pp.programId = :2
            AND m.movieNumber = :3",
            array(
                $this->arg('prop'),
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('No such particle picking');
        }

        $image = $rows[0]['summaryImageFullPath'];

        if (file_exists($image)) {
            $this->sendImage($image);
            return;
        }

        $this->app->contentType('image/png');
        readfile('assets/images/no_image.png');
    }
}
