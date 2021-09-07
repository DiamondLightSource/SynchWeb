<?php

namespace SynchWeb\Page\EM;

trait Classification
{
    public function classificationImage()
    {
        $images = $this->db->pq(
            "SELECT ParticleClassification.classImageFullPath
            FROM ParticleClassification
            WHERE ParticleClassification.particleClassificationId = :1",
            array($this->arg('id')),
            false
        );

        if (sizeof($images) == 1) {
            $image = $images[0]['classImageFullPath'];
            if (file_exists($image)) {
                $this->sendImage($image);
                return;
            }
        }

        $this->app->contentType('image/png');
        readfile('assets/images/no_image.png');
    }

    /* ParticleClassificationGroup has load of null filled rows
       hence the INNER JOIN (is that wrong?) */
    public function classificationResult()
    {
        $args = array($this->arg('id'));

        $total = $this->classificationQuery(
            'COUNT(ParticlePicker.particlePickerId) AS total',
            $args
        );

        $sortBy = $this->has_arg('sort_by') ?
            strtolower($this->arg('sort_by')) :
            'particles';

        // 'CryoemInitialModel.numberOfParticles'
        // 'CryoemInitialModel.resolution'

        $order = $sortBy == 'particles' ?
            'ParticleClassification.particlesPerClass DESC' :
            // Sort in ascending order by with "0" last.
            "ParticleClassification.estimatedResolution = 0,
                ParticleClassification.estimatedResolution";

        $particles = $this->classificationQuery(
            implode(',', array(
                'ParticlePicker.firstMotionCorrectionId',
                'ParticlePicker.particleDiameter',
                'ParticlePicker.numberOfParticles',
                'ParticleClassificationGroup.type',
                'ParticleClassificationGroup.batchNumber',
                'ParticleClassificationGroup.numberOfParticlesPerBatch',
                'ParticleClassificationGroup.numberOfClassesPerBatch',
                'ParticleClassificationGroup.symmetry',
                'ParticleClassification.particleClassificationId',
                'ParticleClassification.classNumber',
                'ParticleClassification.particlesPerClass',
                'ParticleClassification.rotationAccuracy',
                'ParticleClassification.translationAccuracy',
                'ParticleClassification.estimatedResolution',
                'ParticleClassification.overallFourierCompleteness',
                'CryoemInitialModel.resolution',
                'CryoemInitialModel.numberOfParticles'
            )),
            $this->paginationArguments($args),
            "ORDER BY $order LIMIT :2, :3"
        );

        // No need for an error if no rows found
        $this->_output(array(
            'total' => intval($total[0]['total']),
            'classes' => $particles,
        ));
    }

    private function classificationQuery($selection, $args, $options = '')
    {
        return $this->db->pq(
            "SELECT $selection
            FROM ParticlePicker
            INNER JOIN ParticleClassificationGroup
                ON ParticleClassificationGroup.particlePickerId =
                    ParticlePicker.particlePickerId
            LEFT JOIN ParticleClassification
                ON ParticleClassification.particleClassificationGroupId =
                    ParticleClassificationGroup.particleClassificationGroupId
            LEFT JOIN ParticleClassification_has_CryoemInitialModel
                ON ParticleClassification_has_CryoemInitialModel.particleClassificationId =
                    ParticleClassification.particleClassificationId
            LEFT JOIN CryoemInitialModel
                ON CryoemInitialModel.cryoemInitialModelId =
                    ParticleClassification_has_CryoemInitialModel.cryoemInitialModelId
            WHERE ParticlePicker.programId = :1
            $options",
            $args,
            false
        );
    }
}
