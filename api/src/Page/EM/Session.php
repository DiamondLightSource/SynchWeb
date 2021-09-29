<?php

namespace SynchWeb\Page\EM;

trait Session
{
    private function sessionFetch($session_reference)
    {
        if (!$this->has_arg('session')) {
            $message = 'Session not specified!';
            error_log($message);
            $this->_error($message, 400);
        }

        // Lookup session in ISPyB
        $rows = $this->db->pq(
            "SELECT
                b.sessionId,
                b.beamLineName,
                YEAR(b.startDate) AS year,
                CONCAT(p.proposalCode, p.proposalNumber, '-', b.visit_number) AS session,
                CONCAT(p.proposalCode, p.proposalNumber, '-', b.visit_number) AS visit,
                b.startDate,
                b.endDate,
                CURRENT_TIMESTAMP BETWEEN b.startDate AND b.endDate AS active
            FROM Proposal p
            INNER JOIN BLSession b ON p.proposalId = b.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber, '-', b.visit_number) LIKE :1",
            array($session_reference),
            false
        );

        if (sizeof($rows) == 0) {
            $this->_error('Session not found');
        }

        $session = $rows[0];

        $session['processingIsActive'] = false;
        $session['processingTimestamp'] = null;

        return $session;
    }

    /**
     * Substitute session values in file or directory path
     *
     * Session keys are expected to be upper case
     * i.e. BEAMLINENAME, YEAR, and SESSION / VISIT
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
