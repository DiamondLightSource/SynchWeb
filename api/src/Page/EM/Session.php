<?php

namespace SynchWeb\Page\EM;

trait Session
{
    /**
     * Fetch a session from a dataCollectionId
     *
     * Also check the dataCollection and proposal exist and match
     *
     * @param string $proposal
     * @param string $dataCollectionId
     */
    private function sessionFromDataCollection($proposal, $dataCollectionId)
    {
        $selects = $this->sessionSelects();

        $rows = $this->db->pq(
            "SELECT $selects
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
                $proposal,
                $dataCollectionId
            ),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('Session not found');
        }

        return $rows[0];
    }

    private function sessionFetch($sessionReference)
    {
        $selects = $this->sessionSelects();
        $rows = $this->db->pq(
            "SELECT $selects
            FROM BLSession
            INNER JOIN Proposal ON Proposal.proposalId = BLSession.proposalId
            WHERE CONCAT(
                Proposal.proposalCode,
                Proposal.proposalNumber,
                '-',
                BLSession.visit_number
            ) LIKE :1",
            array($sessionReference),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('Session not found');
        }

        return $rows[0];
    }

    ///////////////////////////////////////////////////////////////////////////

    private function sessionSelects()
    {
        return implode(', ', array(
            'BLSession.sessionId',
            'BLSession.beamLineName',
            'YEAR(BLSession.startDate) AS year',
            'CONCAT(
                Proposal.proposalCode,
                Proposal.proposalNumber,
                "-",
                BLSession.visit_number
            ) AS session',
            'CONCAT(
                Proposal.proposalCode,
                Proposal.proposalNumber,
                "-",
                BLSession.visit_number
            ) AS visit',
            'BLSession.startDate',
            'BLSession.endDate',
            'CURRENT_TIMESTAMP BETWEEN BLSession.startDate AND BLSession.endDate AS active',
        ));
    }

    /**
     * Substitute session values in file or directory path
     *
     * Session keys are converted to upper case
     * i.e. BEAMLINENAME, YEAR, and SESSION / VISIT
     * so it's not required to use "old synchweb style all-upper-case"
     * query results
     *
     * @param array $session
     * @param string $path
     *
     * @return string
     */
    private function sessionSubstituteValuesInPath($session, $path)
    {
        foreach ($session as $key => $value) {
            $path = str_replace(
                strtoupper("<%={$key}%>"),
                $value,
                $path
            );
        }

        return $path;
    }

    /**
     * Do not permit processing before session has started or after session has ended
     *
     * @param array $session
     */
    private function sessionExitIfNotActive($session)
    {
        if (!$session['active']) {
            $message = 'This visit ended at ' . date(
                'H:i:s \o\n jS F Y',
                strtotime($session['endDate'])
            ) . '.';
            error_log($message);
            $this->_error($message, 400);
        }
    }
}
