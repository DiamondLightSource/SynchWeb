<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Queue;

class EM extends Page
{
    use \SynchWeb\Page\EM\Attachments;
    use \SynchWeb\Page\EM\Classification;
    use \SynchWeb\Page\EM\Ctf;
    use \SynchWeb\Page\EM\MotionCorrection;
    use \SynchWeb\Page\EM\Picker;
    use \SynchWeb\Page\EM\ProcessingJobs;
    use \SynchWeb\Page\EM\Relion;
    use \SynchWeb\Page\EM\Scipion;
    use \SynchWeb\Page\EM\Session;

    public static $arg_list = array(
        'id' => '\d+',
        'ids' => '\d+',
        'visit' => '\w+\d+-\d+',
        'session' => '\w+\d+-\d+',
        'n' => '\d+',
        't' => '\d+',
        'IMAGENUMBER' => '\d+',
        'movieNumber' => '\d+',
        'processingJobId' => '\d+',

        // EM PROCESSING
        // Parameters with user specified values
        // Note boolean value true in JSON POST request is cast to to 1, false to nothing.

        // RELION

        'projectAcquisitionSoftware' => '\w+', // String
        'projectMovieRawFolder' => '[\w-]+', // String
        'projectMovieFileNameExtension' => '[\w]{3,4}', // String (File name extension)
        'projectGainReferenceFile' => '1?', // Boolean
        'projectGainReferenceFileName' => '[\w-]+\.[\w]{3,4}', // String (File name + extension)

        'voltage' => '\d+', // Integer
        'sphericalAberration' => '\d*(\.\d+)?', // Decimal
        'findPhaseShift' => '1?', // Boolean
        'pixelSize' => '\d*(\.\d+)?', // Decimal
        'motionCorrectionBinning' => '\d+', // Integer
        'dosePerFrame' => '\d*(\.\d+)?', // Decimal

        'pipelineDo1stPass' => '1?', // Boolean
        'pipelineDo1stPassClassification2d' => '1?', // Boolean
        'pipelineDo1stPassClassification3d' => '1?', // Boolean

        'particleUseCryolo' => '1?', // Boolean
        'particleDiameterMin' => '\d+', // Integer
        'particleDiameterMax' => '\d+', // Integer
        'particleMaskDiameter' => '\d+', // Integer
        'particleBoxSize' => '\d+', // Integer
        'particleBoxSizeSmall' => '\d+', // Integer
        'particleCalculateForMe' => '1?', // Boolean

        'pipelineDo2ndPass' => '1?', // Boolean
        'pipelineDo2ndPassClassification2d' => '1?', // Boolean
        'pipelineDo2ndPassClassification3d' => '1?', // Boolean

        // SCIPION

        'numberOfIndividualFrames' => '\d+', // Integer
        'patchX' => '\d+', // Integer
        'patchY' => '\d+', // Integer
        'samplingRate' => '\d*(\.\d+)?', // Decimal
        'particleSize' => '\d+', // Integer
        'minDist' => '\d+', // Integer
        'windowSize' => '\d+', // Integer
    );

    public static $dispatch = array(
        array('/aps', 'post', '_ap_status'),

        // See Synchweb\Page\EM\ProcessingJobs
        array('/jobs/:id', 'get', 'processingJobsByCollection'),
        array('/process/relion/jobs/:session', 'get', 'processingJobsBySession'),

        array('/mc/fft/image/:id(/n/:IMAGENUMBER)(/t/:t)', 'get', '_mc_fft'),
        array('/mc/histogram', 'get', '_mc_drift_histogram'),
        array('/ctf/histogram', 'get', '_ctf_histogram'),

        // See Synchweb\Page\EM\Attachments
        array('/attachments/:id', 'get', 'attachmentsGetAll'),
        array('/attachment/:id', 'get', 'attachmentsGetOne'),

        // See Synchweb\Page\EM\MotionCorrection
        array('/mc/:id', 'get', 'motionCorrectionMovies'),
        array('/mc/:id/n/:movieNumber', 'get', 'motionCorrectionResult'),
        array('/mc/drift/:id(/n/:movieNumber)', 'get', 'motionCorrectionDriftPlot'),
        array('/mc/snapshot/:id(/n/:movieNumber)', 'get', 'motionCorrectionSnapshot'),

        // See Synchweb\Page\EM\Ctf
        array('/ctf/:id', 'get', 'ctfMovies'),
        array('/ctf/:id/n/:movieNumber', 'get', 'ctfResult'),
        array('/ctf/image/:id(/n/:movieNumber)', 'get', 'ctfImage'),
        array('/ctf/summary/:id', 'get', 'ctfSummary'),

        // See SynchWeb\Page\EM\Picker:
        array('/picker/:id', 'get', 'pickerMovies'),
        array('/picker/:id/n/:movieNumber', 'get', 'pickerResult'),
        array('/picker/image/:id(/n/:movieNumber)', 'get', 'pickerImage'),

        // See SynchWeb\Page\EM\Classification:
        array('/classification/:id', 'get', 'classificationResult'),
        array('/classification/image/:id', 'get', 'classificationImage'),

        // See Synchweb\Page\EM\Relion
        array('/relion/schema/', 'get', 'relionSchema'),
        array('/process/relion/session/:session', 'post', 'relionStart'),
        array('/process/relion/session/:session', 'get', 'relionStatus'),
        array('/process/relion/job/:processingJobId', 'patch', 'relionStop'),
        array('/process/relion/job/parameters', 'get', 'relionParameters'),

        array('/process/scipion/session/:session', 'post', 'scipionStart')
    );


    private function exitIfElectronMicroscopesAreNotConfigured()
    {
        // Check electron microscopes are listed in global variables - see $bl_types in config.php.
        $bls = $this->_get_beamlines_from_type('em');

        if (empty($bls)) {
            $message = 'Electron microscopes are not specified';

            error_log($message);
            $this->_error($message, 500);
        }
    }



    private function enqueue($zocalo_queue, $zocalo_message)
    {
        global $zocalo_server,
               $zocalo_username,
               $zocalo_password;

        if (empty($zocalo_server) || empty($zocalo_queue)) {
            $message = 'Zocalo server not specified.';

            error_log($message);
            $this->_error($message, 500);
        }

        try {
            $queue = new Queue($zocalo_server, $zocalo_username, $zocalo_password);
            $queue->send($zocalo_queue, $zocalo_message, true, $this->user->login);
        } catch (Exception $e) {
            $this->_error($e->getMessage(), 500);
        }
    }

    function _ap_status()
    {
        if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');

        $where = array();
        $ids = array();
        if ($this->has_arg('ids')) {
            if (is_array($this->arg('ids'))) {
                foreach ($this->arg('ids') as $i) {
                    array_push($ids, $i);
                    array_push($where, 'm.datacollectionid=:' . sizeof($ids));
                }
            }
        }

        if (!sizeof($ids)) {
            $this->_output(array());
            return;
        }

        $where = '(' . implode(' OR ', $where) . ')';

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($ids) + 1);
            array_push($ids, $this->arg('visit'));
        } else {
            $where .= " AND s.proposalid = :" . (sizeof($ids) + 1);
            array_push($ids, $this->proposalid);
        }

        $statuses = array();
        foreach ($this->arg('ids') as $d) {
            $statuses[$d] = array('ID' => $d, 'MC' => array(), 'CTF' => array());
        }

        $mc = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM motioncorrection mc
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($mc as $m) {
            $statuses[$m['DATACOLLECTIONID']]['MC'][$m['MOVIENUMBER']] = $m['PROCESSINGSTATUS'];
        }


        $ctf = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = c.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($ctf as $c) {
            $statuses[$c['DATACOLLECTIONID']]['CTF'][$c['MOVIENUMBER']] = $c['PROCESSINGSTATUS'];
        }

        $this->_output(array_values($statuses));
    }

    private function paginationArguments($args)
    {
        $perPage = $this->has_arg('per_page') ?
            $this->arg('per_page') : 15;
        $page = ($this->has_arg('page') && $this->arg('page') > 0) ?
            $this->arg('page') - 1 : 0;

        array_push($args, $page * $perPage); // Offset
        array_push($args, $perPage);         // Row Count

        return $args;
    }

    private function sendImage($file)
    {
        $this->browserCache();
        $size = filesize($file);
        $this->app->response->headers->set("Content-length", $size);
        $this->app->contentType('image/' . pathinfo($file, PATHINFO_EXTENSION));
        readfile($file);
    }

    private function sendDownload($file)
    {
        $this->browserCache();
        $pathInfo = pathinfo($file);
        $this->app->response->headers->set('Content-length', filesize($file));
        $this->app->response->headers->set(
            'Content-Disposition',
            'attachment; filename="' . $pathInfo['basename']
        );
        $this->app->contentType('application/' . $pathInfo['extension']);
        readfile($file);
    }

    private function browserCache()
    {
        $expires = 60 * 60 * 24 * 14;
        $this->app->response->headers->set('Pragma', 'public');
        $this->app->response->headers->set('Cache-Control', 'maxage=' . $expires);
        $this->app->response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');
    }

    function _mc_fft()
    {
        $im = $this->has_arg('n') ? $this->arg('n') : 1;
        $t = $this->has_arg('t') ? 2 : 1;

        $imgs = $this->db->pq("SELECT mc.fftcorrectedfullpath, mc.fftfullpath 
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $im));

        if (!sizeof($imgs)) $this->_error('No such fft');
        $img = $imgs[0];

        $file = $t == 2 ? $img['FFTCORRECTEDFULLPATH'] : $img['FFTFULLPATH'];

        if (file_exists($file)) {
            $this->sendImage($file);

        } else {
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
        }
    }

    function _mc_drift_histogram()
    {
        $where = '';
        $args = array();

        if ($this->has_arg('bl')) {
            $where .= ' AND s.beamlinename=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('bl'));
        }

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($args) + 1);
            array_push($args, $this->arg('visit'));
        }

        if ($this->has_arg('runid')) {
            $where .= ' AND vr.runid=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('runid'));
        }

        $bs = 1;
        $hist = $this->db->pq("SELECT 
                AVG(diff) as avgdiff, MIN(diff) as mindiff, MAX(diff) as maxdiff, COUNT(diff) as countdiff,
                framediff, beamlinename FROM (
                    SELECT SQRT(POW(mcd.deltax - @diffx,2) + POW(mcd.deltay - @diffy, 2)) as diff,
                        mcd.deltax - @diffx as diffx, @diffx := mcd.deltax as deltax, mcd.deltay - @diffy as diffy, @diffy := mcd.deltay as deltay, 
                        CONCAT(ABS(mcd.framenumber-1), '-', mcd.framenumber) as framediff, s.beamlinename
                    FROM motioncorrectiondrift mcd
                    JOIN (SELECT @diffx := 0) r
                    JOIN (SELECT @diffy := 0) r2
                    INNER JOIN motioncorrection mc ON mc.motioncorrectionid = mcd.motioncorrectionid
                    INNER JOIN movie m ON m.movieid = mc.movieid
                    INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                    INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                    INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                    WHERE 1=1 $where
                    GROUP BY s.beamlinename,CONCAT(ABS(mcd.framenumber-1), '-', mcd.framenumber), mcd.motioncorrectionid
                    ORDER BY mcd.motioncorrectionid,mcd.framenumber
                    ) inr
                    GROUP BY framediff, beamlinename
                    ORDER BY framediff+0, beamlinename
                ", $args);

        // print_r($hist);

        $bls = array();
        foreach ($hist as $h) $bls[$h['BEAMLINENAME']] = 1;
        if ($this->has_arg('visit')) {
            if (!sizeof(array_keys($bls))) {
                $bl_temp = $this->db->pq("SELECT s.beamlinename 
                        FROM blsession s
                        INNER JOIN proposal p ON p.proposalid = s.proposalid
                        WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1", array($this->arg('visit')));

                if (sizeof($bl_temp)) $bls[$bl_temp[0]['BEAMLINENAME']] = 1;
            }
        }

        $data = array();
        $ticks = array();
        foreach ($bls as $bl => $y) {
            $ha = array();
            $max = array();
            $min = array();

            foreach ($hist as $i => &$h) {
                if ($h['FRAMEDIFF'] == '0-1') continue;
                if ($h['BEAMLINENAME'] != $bl) continue;
                $ha[$i - 1] = floatval($h['AVGDIFF']);
                $min[$i - 1] = floatval($h['MINDIFF']);
                $max[$i - 1] = floatval($h['MAXDIFF']);
                $ticks[$h['FRAMEDIFF']] = 1;
            }

            array_push($data, array('label' => $bl, 'min' => $min, 'max' => $max, 'avg' => $ha));
        }

        $this->_output(array('data' => $data, 'ticks' => array_keys($ticks)));
    }

    function _ctf_plot()
    {

    }

    function _ctf_histogram()
    {
        $types = array(
            'defocus' => array('unit' => 'A', 'st' => 0, 'en' => 60000, 'bin_size' => 1000, 'col' => 'c.estimateddefocus', 'count' => 'c.estimateddefocus'),
            'astigmatism' => array('unit' => 'Number', 'st' => 0.5, 'en' => 1.5, 'bin_size' => 0.005, 'col' => 'c.astigmatism', 'count' => 'c.astigmatism'),
            'resolution' => array('unit' => 'A', 'st' => 0, 'en' => 30, 'bin_size' => 1, 'col' => 'c.estimatedresolution', 'count' => 'c.estimatedresolution'),
        );

        $k = 'defocus';
        $t = $types[$k];
        if ($this->has_arg('ty')) {
            if (array_key_exists($this->arg('ty'), $types)) {
                $k = $this->arg('ty');
                $t = $types[$k];
            }
        }

        $where = '';
        $args = array();

        if ($this->has_arg('bl')) {
            $where .= ' AND s.beamlinename=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('bl'));
        }

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($args) + 1);
            array_push($args, $this->arg('visit'));
        }

        if ($this->has_arg('runid')) {
            $where .= ' AND vr.runid=:' . (sizeof($args) + 1);
            array_push($args, $this->arg('runid'));
        }

        $col = $t['col'];
        $ct = $t['count'];
        $bs = $t['bin_size'];

        $limits = $this->db->pq("SELECT max($col) as max, min($col) as min, s.beamlinename
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE $col < 1e38 $where
                GROUP BY s.beamlinename", $args);

        // print_r($limits);

        if (sizeof($limits)) {
            $limits = $limits[0];
            $max = floatval(($limits['MAX']));
            $min = floatval(($limits['MIN']));

            $range = $max - $min;

            if ($range > 0) {
                $bs = $range / 50;

                if ($bs < 0) {
                    $zeros = strspn($bs, '0', strpos($bs, '.') + 1);
                    $bs = round($bs, $zeros);
                } else if ($bs < 1) {
                    $bs = round($bs, 3);
                } else {
                    $zeros = strlen(number_format($bs, 0, '.', ''));
                    $mp = pow(1, $zeros);
                    $bs = ceil($bs / $mp) * $mp;
                }

                $t['bin_size'] = $bs;
                $t['st'] = $min - fmod($min, $bs);
                $t['en'] = $max - fmod($max, $bs) + $bs;
            }
        }

        $hist = $this->db->pq("SELECT ($col div $bs) * $bs as x, count($ct) as y, s.beamlinename
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                INNER JOIN v_run vr ON s.startdate BETWEEN vr.startdate AND vr.enddate
                WHERE $col < 1e38 $where
                GROUP BY s.beamlinename,x
                ORDER BY s.beamlinename", $args);

        $bls = array();
        foreach ($hist as $h) $bls[$h['BEAMLINENAME']] = 1;
        if ($this->has_arg('visit')) {
            if (!sizeof(array_keys($bls))) {
                $bl_temp = $this->db->pq("SELECT s.beamlinename 
                        FROM blsession s
                        INNER JOIN proposal p ON p.proposalid = s.proposalid
                        WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1", array($this->arg('visit')));

                if (sizeof($bl_temp)) $bls[$bl_temp[0]['BEAMLINENAME']] = 1;
            }
        }

        $data = array();
        foreach ($bls as $bl => $y) {
            $ha = array();
            foreach ($hist as &$h) {
                if ($h['BEAMLINENAME'] != $bl) continue;
                $ha[$h['X']] = floatval($h['Y']);
            }

            $gram = array();
            for ($bin = $t['st']; $bin <= $t['en']; $bin += $t['bin_size']) {
                $bin_s = number_format($bin, strlen(substr(strrchr($t['bin_size'], '.'), 1)), '.', '');
                $gram[$bin_s] = array_key_exists($bin_s, $ha) ? $ha[$bin_s] : 0;
            }

            $lab = ucfirst($k) . ' (' . $t['unit'] . ')';
            if (!$this->has_arg('bl')) $lab = $bl . ': ' . $lab;

            array_push($data, array('label' => $lab, 'data' => $gram));
        }

        $this->_output(array('histograms' => $data));
    }

}
