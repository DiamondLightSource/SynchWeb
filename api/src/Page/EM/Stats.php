<?php

namespace SynchWeb\Page\EM;

trait Stats
{
    public function statsMcDrift()
    {
        list($where, $args) = $this->statsWhereClause();

        $hist = $this->db->pq(
            "SELECT
                AVG(diff) as avgDiff,
                MIN(diff) as minDiff,
                MAX(diff) as maxDiff,
                COUNT(diff) as countDiff,
                frameDiff,
                beamLineName
            FROM (
                SELECT
                    SQRT(POW(mcd.deltaX - @diffx, 2) + POW(mcd.deltaY - @diffY, 2)) as diff,
                    mcd.deltaX - @diffX as diffX,
                    @diffX := mcd.deltaX as deltaX,
                    mcd.deltaY - @diffY as diffY,
                    @diffY := mcd.deltaY as deltaY,
                    CONCAT(ABS(mcd.frameNumber-1), '-', mcd.frameNumber) as frameDiff,
                    s.beamLineName
                FROM MotionCorrectionDrift mcd
                JOIN (SELECT @diffX := 0) r
                JOIN (SELECT @diffY := 0) r2
                INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = mcd.motionCorrectionId
                INNER JOIN Movie m ON m.movieId = mc.movieId
                INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
                INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
                INNER JOIN BLSession s ON s.sessionId = dcg.sessionId
                INNER JOIN Proposal p ON p.proposalId = s.proposalId
                INNER JOIN v_run vr ON s.startDate BETWEEN vr.startDate AND vr.endDate
                WHERE $where
                GROUP BY
                    s.beamLineName,
                    CONCAT(ABS(mcd.frameNumber-1), '-', mcd.frameNumber),
                    mcd.motionCorrectionId
                ORDER BY mcd.motionCorrectionId, mcd.frameNumber
            ) inr
            GROUP BY frameDiff, beamLineName
            ORDER BY frameDiff + 0, beamLineName",
            $args,
            false
        );

        $beamLines = $this->statsGetBeamLines($hist);

        $data = array();
        $ticks = array();
        foreach (array_keys($beamLines) as $beamLine) {
            $ha = array();
            $max = array();
            $min = array();
            foreach ($hist as $rowNum => &$row) {
                if ($row['frameDiff'] != '0-1' && $row['beamLineName'] == $beamLine) {
                    $ha[$rowNum - 1] = floatval($row['avgDiff']);
                    $min[$rowNum - 1] = floatval($row['minDiff']);
                    $max[$rowNum - 1] = floatval($row['maxDiff']);
                    $ticks[$row['frameDiff']] = 1;
                }
            }
            array_push($data, array(
                'label' => $beamLine,
                'min' => $min,
                'max' => $max,
                'avg' => $ha
            ));
        }
        $this->_output(array('data' => $data, 'ticks' => array_keys($ticks)));
    }

    public function statsCtf()
    {
        $types = array('defocus', 'astigmatism', 'resolution');

        $typeName = $this->has_arg('ty') && in_array($this->arg('ty'), $types) ?
            $this->args['ty'] : 'defocus';

        switch ($typeName) {
            case 'defocus':
                $unit = 'A';
                $startPoint = 0;
                $endPoint = 60000;
                $binSize = 1000;
                $column = 'c.estimatedDefocus';
                break;
            case 'astigmatism':
                $unit = 'Number';
                $startPoint = 0.5;
                $endPoint = 1.5;
                $binSize = 0.005;
                $column = 'c.astigmatism';
                break;
            case 'resolution':
                $unit = 'A';
                $startPoint = 0;
                $endPoint = 30;
                $binSize = 1;
                $column = 'c.estimatedResolution';
                break;
        }

        list($where, $args) = $this->statsWhereClause();

        $limits = $this->db->pq(
            "SELECT
                max($column) as max,
                min($column) as min,
                s.beamLineName
            FROM CTF c
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = c.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession s ON s.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = s.proposalId
            INNER JOIN v_run vr ON s.startDate BETWEEN vr.startDate AND vr.endDate
            WHERE $where
            GROUP BY s.beamLineName",
            $args,
            false
        );

        if (sizeof($limits) > 0) {
            $limits = $limits[0];
            $max = floatval(($limits['max']));
            $min = floatval(($limits['min']));
            $range = $max - $min;
            if ($range > 0) {
                $binSize = $range / 50;
                if ($binSize < 0) {
                    $zeros = strspn($binSize, '0', strpos($binSize, '.') + 1);
                    $binSize = round($binSize, $zeros);
                } elseif ($binSize < 1) {
                    $binSize = round($binSize, 3);
                } else {
                    $zeros = strlen(number_format($binSize, 0, '.', ''));
                    $mp = pow(1, $zeros);
                    $binSize = ceil($binSize / $mp) * $mp;
                }
                $startPoint = $min - fmod($min, $binSize);
                $endPoint = $max - fmod($max, $binSize) + $binSize;
            }
        }

        $hist = $this->db->pq(
            "SELECT
                ($column DIV $binSize) * $binSize as x,
                count($column) as y,
                s.beamLineName
            FROM CTF c
            INNER JOIN MotionCorrection mc ON mc.motionCorrectionId = c.motionCorrectionId
            INNER JOIN Movie m ON m.movieId = mc.movieId
            INNER JOIN DataCollection dc ON dc.dataCollectionId = m.dataCollectionId
            INNER JOIN DataCollectionGroup dcg ON dcg.dataCollectionGroupId = dc.dataCollectionGroupId
            INNER JOIN BLSession s ON s.sessionId = dcg.sessionId
            INNER JOIN Proposal p ON p.proposalId = s.proposalId
            INNER JOIN v_run vr ON s.startDate BETWEEN vr.startDate AND vr.endDate
            WHERE $where
            GROUP BY s.beamLineName, x
            ORDER BY s.beamLineName",
            $args,
            false
        );

        $beamLines = $this->statsGetBeamLines($hist);

        $data = array();
        foreach (array_keys($beamLines) as $beamLine) {
            $ha = array();
            foreach ($hist as &$row) {
                if ($row['beamLineName'] == $beamLine) {
                    $ha[$row['x']] = floatval($row['y']);
                }
            }
            $gram = array();
            for ($bin = $startPoint; $bin <= $endPoint; $bin += $binSize) {
                $binString = number_format(
                    $bin,
                    strlen(substr(strrchr($binSize, '.'), 1)),
                    '.',
                    ''
                );
                $gram[$binString] = array_key_exists($binString, $ha) ?
                    $ha[$binString] : 0;
            }

            $label = ucfirst($typeName) . ' (' . $unit . ')';
            if (!$this->has_arg('bl')) {
                $label = $beamLine . ': ' . $label;
            }
            array_push($data, array('label' => $label, 'data' => $gram));
        }

        $this->_output(array('histograms' => $data));
    }

    ////////////////////////////////////////////////////////////////////////////

    private function statsGetBeamLines($dataset)
    {
        $beamLines = array();
        foreach ($dataset as $row) {
            $beamLines[$row['beamLineName']] = 1;
        }

        if ($this->has_arg('visit') && sizeof(array_keys($beamLines)) == 0) {
            $inSession = $this->db->pq(
                "SELECT s.beamLineName
                FROM BLSession s
                INNER JOIN Proposal p ON p.proposalId = s.proposalId
                WHERE CONCAT(p.proposalCode, p.proposalNumber, '-', s.visit_number) LIKE :1",
                array($this->arg('visit'))
            );
            if (sizeof($inSession) > 0) {
                $beamLines[$inSession[0]['BeamLineName']] = 1;
            }
        }
        return $beamLines;
    }

    private function statsWhereClause()
    {
        $clauses = array(
            'bl' => 's.beamLineName=',
            'visit' => "CONCAT(p.proposalCode, p.proposalNumber, '-', s.visit_number) LIKE ",
            'runid' => 'vr.runId=',
        );
        $where = array();
        $args = array();
        foreach ($clauses as $arg => $clause) {
            if ($this->has_arg($arg)) {
                $where[] = $clause . ':' . (sizeof($args) + 1);
                $args[] = $this->arg($arg);
            }
        }
        return array(implode(' AND ', $where), $args);
    }


}
