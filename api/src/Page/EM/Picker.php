<?php

namespace SynchWeb\Page\EM;

trait Picker
{
    public function pickerMovies()
    {
        $rows = $this->db->pq(
            "SELECT Movie.movieNumber
            FROM ParticlePicker
            LEFT JOIN MotionCorrection
                ON MotionCorrection.motionCorrectionId
                    = ParticlePicker.firstMotionCorrectionId
            LEFT JOIN Movie
                ON Movie.movieId = MotionCorrection.movieId
            WHERE ParticlePicker.programId = :1",
            array($this->arg('id')),
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
                ParticlePicker.particleDiameter,
                ParticlePicker.numberOfParticles,
                ParticlePicker.summaryImageFullPath,
                Movie.movieNumber
            FROM ParticlePicker
            LEFT JOIN MotionCorrection
                ON MotionCorrection.motionCorrectionId
                    = ParticlePicker.firstMotionCorrectionId
            LEFT JOIN Movie
                ON Movie.movieId = MotionCorrection.movieId
            WHERE ParticlePicker.programId = :1 AND Movie.movieNumber = :2",
            array(
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such ctf correction');
        }
        $row = $rows[0];

        $row['summaryImageFullPath'] = file_exists($row['summaryImageFullPath']) ? 1 : 0;

        $this->_output($row);
    }

    public function pickerImage()
    {
        $rows = $this->db->pq(
            "SELECT ParticlePicker.summaryImageFullPath
            FROM ParticlePicker
            LEFT JOIN MotionCorrection
                ON MotionCorrection.motionCorrectionId
                    = ParticlePicker.firstMotionCorrectionId
            LEFT JOIN Movie
                ON Movie.movieId = MotionCorrection.movieId
            WHERE ParticlePicker.programId = :1 AND Movie.movieNumber = :2",
            array(
                $this->arg('id'),
                $this->has_arg('movieNumber') ? $this->arg('movieNumber') : 1
            ),
            false
        );

        if (!sizeof($rows)) {
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
