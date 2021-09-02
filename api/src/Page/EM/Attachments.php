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
            WHERE AutoProcProgramAttachment.autoProcProgramId = :1",
            array($this->arg('id')),
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
            WHERE AutoProcProgramAttachment.autoProcProgramAttachmentId = :1",
            array($this->arg('id')),
            false
        );

        if (!sizeof($rows)) {
            $this->_error('No such attachment');
        }

        $file = $rows[0]['file'];
        if (!file_exists($file)) {
            $this->_error('No such attachment');
        }

        $this->sendImage($file);
    }
}
