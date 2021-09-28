<?php

namespace SynchWeb\Page\EM;

trait Classification
{
    public function classificationImage()
    {
        $images = $this->db->pq(
            "SELECT ParticleClassification.classImageFullPath
            FROM ParticleClassification
            INNER JOIN ParticleClassificationGroup
                ON ParticleClassificationGroup.particleClassificationGroupId
                    = ParticleClassification.particleClassificationGroupId
            INNER JOIN AutoProcProgram
                ON AutoProcProgram.autoProcProgramId
                    = ParticleClassificationGroup.programId
            INNER JOIN ProcessingJob
                ON ProcessingJob.processingJobId
                    = AutoProcProgram.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId
                    = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId
                    = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId
                    = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId
                    = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND ParticleClassification.particleClassificationId = :2",
            array($this->arg('prop'), $this->arg('id')),
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
        $args = array($this->arg('prop'), $this->arg('id'));

        $total = $this->classificationQuery(
            'COUNT(ParticleClassification.particleClassificationId) AS total',
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
                'ParticleClassificationGroup.type',
                'ParticleClassificationGroup.batchNumber',
                'ParticleClassificationGroup.numberOfParticlesPerBatch',
                'ParticleClassificationGroup.numberOfClassesPerBatch',
                'ParticleClassificationGroup.symmetry',
                'ParticleClassification.particleClassificationId',
                'ParticleClassification.classNumber',
                'ParticleClassification.classDistribution',
                'ParticleClassification.particlesPerClass',
                'ParticleClassification.rotationAccuracy',
                'ParticleClassification.translationAccuracy',
                'ParticleClassification.estimatedResolution',
                'ParticleClassification.overallFourierCompleteness',
                'CryoemInitialModel.resolution',
                'CryoemInitialModel.numberOfParticles'
            )),
            $this->paginationArguments($args),
            "ORDER BY $order LIMIT :3, :4"
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
            FROM ParticleClassificationGroup
            LEFT JOIN ParticleClassification
                ON ParticleClassification.particleClassificationGroupId
                    = ParticleClassificationGroup.particleClassificationGroupId
            LEFT JOIN ParticleClassification_has_CryoemInitialModel
                ON ParticleClassification_has_CryoemInitialModel.particleClassificationId
                    = ParticleClassification.particleClassificationId
            LEFT JOIN CryoemInitialModel
                ON CryoemInitialModel.cryoemInitialModelId
                    = ParticleClassification_has_CryoemInitialModel.cryoemInitialModelId
            INNER JOIN AutoProcProgram
                ON AutoProcProgram.autoProcProgramId
                    = ParticleClassificationGroup.programId
            INNER JOIN ProcessingJob
                ON ProcessingJob.processingJobId
                    = AutoProcProgram.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId
                    = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId
                    = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId
                    = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId
                    = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND ParticleClassificationGroup.programId = :2
            $options",
            $args,
            false
        );
    }
}
