<?php

namespace SynchWeb\Page\EM;

trait Attachments
{
    public function attachmentsGetAll()
    {
        $rows = $this->db->pq(
            "SELECT
                AutoProcProgramAttachment.autoProcProgramAttachmentId,
                CONCAT(
                    AutoProcProgramAttachment.filePath,
                    '/',
                    AutoProcProgramAttachment.fileName
                ) AS file,
                AutoProcProgramAttachment.recordTimeStamp,
                AutoProcProgramAttachment.fileType,
                AutoProcProgramAttachment.importanceRank
            FROM AutoProcProgramAttachment
            INNER JOIN AutoProcProgram
                ON AutoProcProgram.autoProcProgramId = AutoProcProgramAttachment.autoProcProgramId
            INNER JOIN ProcessingJob
                ON ProcessingJob.processingJobId = AutoProcProgram.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND AutoProcProgramAttachment.autoProcProgramId = :2",
            array($this->arg('prop'), $this->arg('programId')),
            false
        );

        // Don't report an error if no attachments found, just return an
        // empty object
        if (sizeof($rows) == 0) {
            $this->_output(array());
            return;
        }

        $result = array();
        foreach ($rows as $row) {
            $file = $row['file'];
            if (!file_exists($file)) {
                continue;
            }

            if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) == 'json') {
                $row['JSON'] = file_get_contents($file);
            }
            array_push($result, $row);
        }

        $this->_output($result);
    }

    public function attachmentsGetOne()
    {
        $rows = $this->db->pq(
            "SELECT
                AutoProcProgramAttachment.autoProcProgramAttachmentId,
                CONCAT(
                    AutoProcProgramAttachment.filePath,
                    '/',
                    AutoProcProgramAttachment.fileName
                ) AS file,
                AutoProcProgramAttachment.fileType
            FROM AutoProcProgramAttachment
            INNER JOIN AutoProcProgram
                ON AutoProcProgram.autoProcProgramId = AutoProcProgramAttachment.autoProcProgramId
            INNER JOIN ProcessingJob
                ON ProcessingJob.processingJobId = AutoProcProgram.processingJobId
            INNER JOIN DataCollection
                ON DataCollection.dataCollectionId = ProcessingJob.dataCollectionId
            INNER JOIN DataCollectionGroup
                ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
            INNER JOIN BLSession
                ON BLSession.sessionId = DataCollectionGroup.sessionId
            INNER JOIN Proposal
                ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
            AND AutoProcProgramAttachment.autoProcProgramAttachmentId = :2",
            array($this->arg('prop'), $this->arg('attachId')),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such attachment');
        }

        $this->sendDownload($rows[0]['file']);
    }
}
