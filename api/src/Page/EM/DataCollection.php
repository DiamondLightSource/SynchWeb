<?php

namespace SynchWeb\Page\EM;

use DateTime;
use SynchWeb\Page\EM\DataCollectionSchema;
use SynchWeb\Page\EM\SchemaValidator;

trait DataCollection
{
    public function dataCollectionSchema()
    {
        $this->_output($this->schema()->clientSchema());
    }

    /**
     * This is a "long term temporary workaround" for creating Data Collections
     * via the Synchweb UI.
     */
    public function dataCollectionCreate()
    {
        global $visit_directory;

        $validator = new SchemaValidator($this->schema()->schema());
        list($invalid, $args) = $validator->validateJsonPostData(
            $this->app->request->getBody()
        );
        if (count($invalid) > 0) {
            $this->_error($invalid, 400);
        }

        $session = $this->sessionFetch($this->arg('session'));

        /* TODO: Temporary override to make session available for testing
           after session has ended */
        $session['active'] = true;

        $this->sessionExitIfNotActive($session);

        $sessionPath = $this->sessionSubstituteValuesInPath(
            $session,
            $visit_directory
        );

        $imageDirectory = $sessionPath . '/' . $args['imageDirectory'] . '/';
        $fileTemplate = (
            $args['acquisitionSoftware'] == 'EPU' ?
                'GridSquare_*/Data/*.' : 'Frames/*.'
        ) . $args['imageSuffix'];

        $existingCollection = $this->dataCollectionFindExisting(
            $session['sessionId'],
            $imageDirectory,
            $fileTemplate
        );

        if ($existingCollection !== null) {
            $message = "Data Collection already exists";
            $this->_error(array(
                'acquisitionSoftware' => $message,
                'imageDirectory' => $message,
                'imageSuffix' => $message,
            ), 400);
        }

        $dataCollectionId = $this->dataCollectionAdd(
            $session,
            $imageDirectory,
            $args['imageSuffix'],
            $fileTemplate,
            $args
        );

        $this->_output(array('id' => $dataCollectionId));
    }

    /**
     * Fetch the applicable (to EM) fields from the DataCollection
     *
     * Once the transfer script is available at eBIC, SynchWeb will no longer
     * be required to create DataCollections and the use of dataCollectionSchema
     * will be largely irrelevant and it may be worthwhile to just use an
     * "ordinary" query here.
     */
    public function dataCollectionFetch()
    {
        $selections = implode(', ', $this->schema()->selections());

        $rows = $this->db->pq(
            "SELECT
                $selections
                FROM DataCollection
                LEFT JOIN DataCollectionFileAttachment
                    ON DataCollectionFileAttachment.dataCollectionId = DataCollection.dataCollectionId
                LEFT JOIN DataCollectionComment
                    ON DataCollectionComment.dataCollectionId = DataCollection.dataCollectionId
                INNER JOIN DataCollectionGroup
                    ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
                INNER JOIN BLSession
                    ON BLSession.sessionId = DataCollectionGroup.sessionId
                INNER JOIN Proposal
                    ON Proposal.proposalId = BLSession.proposalId
                WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
                AND DataCollection.dataCollectionId = :2",
            array(
                $this->arg('prop'),
                $this->arg('id')
            ),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('No data collection');
        }

        $dataCollection = array_map(function ($item) {
            return strval($item);
        }, $rows[0]);

        $visitCode = $this->arg('prop') . '-' . $dataCollection['visit_number'];
        $dataCollection['shortImageDirectory'] = preg_replace(
            "#.*/{$visitCode}/#",
            '',
            $dataCollection['imageDirectory']
        );

        $this->_output($dataCollection);
    }

    public function dataCollectionComments()
    {
        $rows = $this->db->pq(
            "SELECT
                DataCollection.comments
                FROM DataCollection
                INNER JOIN DataCollectionGroup
                    ON DataCollectionGroup.dataCollectionGroupId = DataCollection.dataCollectionGroupId
                INNER JOIN BLSession
                    ON BLSession.sessionId = DataCollectionGroup.sessionId
                INNER JOIN Proposal
                    ON Proposal.proposalId = BLSession.proposalId
                WHERE CONCAT(Proposal.proposalCode, Proposal.proposalNumber) = :1
                AND DataCollection.dataCollectionId = :2",
            array(
                $this->arg('prop'),
                $this->arg('id')
            ),
            false
        );
        if (sizeof($rows) == 0) {
            $this->_error('No data collection');
        }

        $this->db->pq(
            "UPDATE DataCollection SET comments=:1 WHERE DataCollection.dataCollectionId = :2",
            array(
                json_decode($this->app->request->getBody(), true)['comments'],
                $this->arg('id')
            )
        );
        $this->_output(array('updated' => $this->arg('id')));
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Get the Data Collection Schema
     *
     * In a sensible world where these traits are classes, this would be a
     * constructor.
     */
    private function schema()
    {
        return new DataCollectionSchema();
    }

    /**
     * Returns dataCollectionId of first DataCollection associated with session
     *
     * Also checks for existing imageDirectory
     *
     * @param string $sessionId
     * @param string $imageDirectory
     * @param string $fileTemplate
     *
     * @return array|null
     */
    private function dataCollectionFindExisting(
        $sessionId,
        $imageDirectory,
        $fileTemplate
    ) {
        if (!$sessionId) {
            return null;
        }

        $rows = $this->db->pq(
            "SELECT dataCollectionId FROM DataCollection
                WHERE SESSIONID=:1 AND imageDirectory=:2 AND fileTemplate=:3
                LIMIT 1",
            array($sessionId, $imageDirectory, $fileTemplate),
            false
        );

        if (count($rows) == 0) {
            return null;
        }

        return $rows[0]['dataCollectionId'];
    }

    /**
     * Add a new data collection for processing jobs that don't yet have one
     *
     * @param array $session
     * @param string $imageDirectory
     * @param string $imageSuffix
     * @param string $fileTemplate
     *
     * @SuppressWarnings(PHPMD.LongVariable)
     */
    private function dataCollectionAdd(
        $session,
        $imageDirectory,
        $imageSuffix,
        $fileTemplate,
        $args = array()
    ) {
        $dataCollectionId = null;

        try {
            $this->db->start_transaction();

            $this->db->pq(
                "INSERT INTO DataCollectionGroup (
                    sessionId, comments, experimentType
                )
                VALUES (:1, :2, :3)
                RETURNING dataCollectionGroupId INTO :id",
                array($session['sessionId'], 'Created by SynchWeb', 'EM')
            );
            $dataCollectionGroupId = $this->db->id();

            $inserts = array(
                'sessionId' => $session['sessionId'],
                'dataCollectionGroupId' => $dataCollectionGroupId,
                'startTime' => (new DateTime())->format('Y-m-d H:i:s'),
                'endTime' => $session['endDate'],
                'runStatus' => 'DataCollection Simulated',
                'imageDirectory' => $imageDirectory,
                'imageSuffix' => $imageSuffix,
                'fileTemplate' => $fileTemplate,
                'comments' => 'Created by SynchWeb',
            );
            foreach ($this->schema()->schema() as $field => $schema) {
                if (
                    array_key_exists($field, $inserts) || (
                        array_key_exists('stored', $schema) &&
                        $schema['stored'] == false
                    )
                ) {
                    continue;
                }
                $arg = $args[$field];
                if (gettype($arg) == 'boolean') {
                    $arg = $arg ? 1 : 0;
                }
                $inserts[$field] = $arg;
            }
            $fieldNames = implode(',', array_keys($inserts));
            $values = array_values($inserts);
            $placeholders = implode(',', array_map(
                function ($number) {
                    return ':' . ($number + 1);
                },
                array_keys($values)
            ));
            $this->db->pq(
                "INSERT INTO DataCollection ($fieldNames) VALUES ($placeholders)
                    RETURNING dataCollectionId INTO :id",
                $values
            );
            $dataCollectionId = $this->db->id();

            $this->db->end_transaction();
        } catch (Exception $e) {
            error_log("Failed to add DataCollection to database.");
            $this->_error("Failed to add DataCollection to database.", 500);
        }

        return $dataCollectionId;
    }
}
