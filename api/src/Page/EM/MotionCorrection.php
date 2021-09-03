<?php

namespace SynchWeb\Page\EM;

trait MotionCorrection
{
    public function motionCorrectionResult()
    {
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
                m.movieNumber
            FROM MotionCorrection mc
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN AutoProcProgram app ON app.autoProcProgramId = mc.autoProcProgramId
            WHERE mc.autoProcProgramId = :1 AND m.movieNumber = :2",
            array(
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such motion correction');
        }
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
            WHERE mc.autoProcProgramId = :1 AND m.movieNumber = :2
            ORDER BY mcd.frameNumber",
            array(
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
        $rows = $this->db->pq(
            "SELECT mc.{$imageName}
            FROM MotionCorrection mc
                INNER JOIN Movie m ON m.movieId = mc.movieId
                INNER JOIN AutoProcProgram ap ON ap.autoProcProgramId = mc.autoProcProgramId
                WHERE ap.autoProcProgramId = :1 AND m.movieNumber = :2",
            array(
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such micrograph');
        }
        $image = $rows[0][$imageName];
        if (file_exists($image)) {
            $this->sendImage($image);
            return;
        }

        $this->app->contentType('image/png');
        readfile('assets/images/no_image.png');
    }

    public function motionCorrectionSnapshot()
    {
        $this->motionCorrectionImage('micrographSnapshotFullPath');
    }
}
