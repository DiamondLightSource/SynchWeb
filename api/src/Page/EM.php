<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Queue;

class EM extends Page
{
    use \SynchWeb\Page\EM\Attachments;
    use \SynchWeb\Page\EM\Ctf;
    use \SynchWeb\Page\EM\MotionCorrection;
    use \SynchWeb\Page\EM\Particle;
    use \SynchWeb\Page\EM\ProcessingJobs;
    use \SynchWeb\Page\EM\Relion;

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
        array('/mc/:id(/n/:movieNumber)', 'get', 'motionCorrectionResult'),
        array('/mc/drift/:id(/n/:movieNumber)', 'get', 'motionCorrectionDriftPlot'),
        array('/mc/snapshot/:id(/n/:movieNumber)', 'get', 'motionCorrectionSnapshot'),

        // See Synchweb\Page\EM\Ctf
        array('/ctf/:id(/n/:movieNumber)', 'get', 'ctfResult'),
        array('/ctf/image/:id(/n/:movieNumber)', 'get', 'ctfImage'),
        array('/ctf/summary/:id', 'get', 'ctfSummary'),

        // See Synchweb\Page\EM\Relion
        array('/process/relion/session/:session', 'post', 'relionStart'),
        array('/process/relion/session/:session', 'get', 'relionStatus'),
        array('/process/relion/job/:processingJobId', 'patch', 'relionStop'),
        array('/process/relion/job/parameters', 'get', 'relionParameters'),

        array('/process/scipion/session/:session', 'post', '_scipion_start'),

        // See SynchWeb\Page\EM\Particle:
        array('/particle/:id', 'get', 'particlePicker'),
        array('/particle/image/:id', 'get', 'particleImage')
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

    private function determineSession($session_reference)
    {
        if (!$this->has_arg('session')) {
            $message = 'Session not specified!';

            error_log($message);
            $this->_error($message, 400);
        }

        // Lookup session in ISPyB
        $session = $this->db->pq("
            SELECT b.SESSIONID,
                b.beamlinename AS beamlinename,
                YEAR(b.startDate) AS year,
                CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) AS session,
                CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) AS visit,
                b.startdate AS startdate,
                b.enddate AS enddate,
                CURRENT_TIMESTAMP BETWEEN b.startdate AND b.enddate AS active
            FROM proposal AS p
                JOIN blsession AS b ON p.proposalid = b.proposalid
            WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', b.visit_number) LIKE :1", array($session_reference));

        if (!sizeof($session)) $this->_error('Session not found');

        $session = $session[0];

        // Temporary fudge until Zocalo and Relion use ISPyB

//        list($processingIsActive, $processingTimestamp) = $this->determineProcessingStatus($session);
//
//        $session['processingIsActive'] = $processingIsActive;
//        $session['processingTimestamp'] = $processingTimestamp;

//        list($processingIsActive, $processingTimestamp) = $this->determineProcessingStatus($session);

        $session['processingIsActive'] = false;
        $session['processingTimestamp'] = null;

        return $session;
    }

    // TODO Review Scipion code following Relion implementation e.g. changes to Stomp queue, globals from config.php, etc. (JPH)

    private function determineProcessingStatus($session)
    {
//        // Temporary fudge until Zocalo and Relion can update ISPyB
//        // RUNNING_RELION_IT file indicates Relion is processing
//
//        global $visit_directory;
//
//        $filename = $this->substituteSessionValuesInPath($session, $visit_directory . '/.ispyb/processed/RUNNING_RELION_IT');
//
//        $isActive = false;
//        $timestamp = null;
//
//        clearstatcache();
//
//        try {
//            $isActive = file_exists($filename);
//
//            if ($isActive) {
//                $stat = stat($filename);
//
//                if ($stat) $timestamp = $stat['mtime'];
//            }
//        } catch (Exception $e) {
//            error_log("Failed to check status file: {$filename}");
//            $this->_error('Failed to check status file.', 500);
//        }
//
//        return array($isActive, $timestamp);

        return array(false, null);
    }

    private function substituteSessionValuesInPath($session, $path)
    {
        // Substitute session values in file or directory path i.e. BEAMLINENAME, YEAR, and SESSION / VISIT.

        foreach ($session as $key => $value) {
            $path = str_replace("<%={$key}%>", $value, $path);
        }

        return $path;
    }

    private function exitIfSessionIsNotActive($session)
    {
        // Do not permit processing before session has started or after session has ended

        if (!$session['ACTIVE']) {
            $message = 'This session ended at ' . date('H:i:s \o\n jS F Y', strtotime($session['ENDDATE'])) . '.';

            error_log($message);
            $this->_error($message, 400);
        }
    }

    function _scipion_start()
    {
        global $visit_directory,
               $zocalo_scipion_template_path,
               $zocalo_scipion_template_file,
               $zocalo_scipion_workflow_path,
               $zocalo_scipion_start_queue;

        $this->exitIfElectronMicroscopesAreNotConfigured();
        $session = $this->determineSession($this->arg('session'));
        $this->exitIfSessionIsNotActive($session);

        $session_path = $this->substituteSessionValuesInPath($session, $visit_directory);
        $template_path = $this->substituteSessionValuesInPath($session, $zocalo_scipion_template_path);
        $template_file = $zocalo_scipion_template_file;
        $workflow_path = $this->substituteSessionValuesInPath($session, $zocalo_scipion_workflow_path);

        // Validate form parameters

        // Setup rules to validate each parameter by isRequired, inArray, minValue, maxValue.
        // Specify outputType so json_encode casts value correctly. This determines whether value is quoted.

        $validation_rules = array(
            'dosePerFrame' => array('isRequired' => true, 'minValue' => 0, 'maxValue' => 10, 'outputType' => 'float'),
            'numberOfIndividualFrames' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 500, 'outputType' => 'integer'),
            'patchX' => array('isRequired' => true, 'minValue' => 1, 'outputType' => 'integer'),
            'patchY' => array('isRequired' => true, 'minValue' => 1, 'outputType' => 'integer'),
            'samplingRate' => array('isRequired' => true, 'minValue' => 0.1, 'maxValue' => 10, 'outputType' => 'float'),
            'particleSize' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 1000, 'outputType' => 'integer'),
            'minDist' => array('isRequired' => true, 'minValue' => 1, 'maxValue' => 1000, 'outputType' => 'integer'),
            'windowSize' => array('isRequired' => true, 'minValue' => 128, 'maxValue' => 2048, 'outputType' => 'integer'),
            'findPhaseShift' => array('isRequired' => true, 'outputType' => 'boolean'),
        );

        list($invalid_parameters, $valid_parameters) = $this->validateParameters($validation_rules);

        // Determine other values to substitute in JSON i.e. parameters not specified in form submission.
        $valid_parameters['filesPath'] = $session_path . '/raw/GridSquare_*/Data';
        $valid_parameters['session'] = $session['SESSION'];

        // TODO Better to return an array of invalid parameters for front end to display. (JPH)
        if (sizeof($invalid_parameters) > 0) {
            $message = 'Invalid parameters: ' . implode('; ', $invalid_parameters) . '.';

            error_log($message);
            $this->_error($message, 400);
        }

        $template_json_string = null;

        // Read workflow template file
        try {
            $template_json_string = file_get_contents("{$template_path}/{$template_file}");
        } catch (Exception $e) {
            error_log("Failed to read workflow template: {$template_path}/{$template_file}");
            $this->_error("Failed to read workflow template for electron microscopy “{$session['BEAMLINENAME']}”.", 500);
        }

        // Decode JSON string
        $template_array = json_decode($template_json_string, true);

        // JSON is invalid if it cannot be decoded
        if ($template_array == null) {
            error_log("Invalid workflow template: {$template_path}/{$template_file}");
            $this->_error("Invalid workflow template for electron microscopy “{$session['BEAMLINENAME']}”.", 500);
        }

        $updated_parameters = array();

        // Iterate over each step in workflow template e.g. 0, 1, 2, etc.
        foreach (array_keys($template_array) as $step_no) {

            // Iterate over each parameter in step e.g. acquisitionWizard, amplitudeContrast, copyFiles, etc.
            foreach (array_keys($template_array[$step_no]) as $parameter) {

                // Determine whether user has specified value for parameter
                if (array_key_exists($parameter, $valid_parameters)) {

                    // Set parameter to user specified value
                    $template_array[$step_no][$parameter] = $valid_parameters[$parameter];

                    // Record parameters set to user specified value
                    array_push($updated_parameters, $parameter);
                }
            }
        }

        // Determine which parameters with user specified values are absent from workflow template
        $absent_parameters = array_diff(array_keys($valid_parameters), $updated_parameters);

        if (sizeof($absent_parameters) > 0) {
            error_log("Parameters absent from workflow template: {$template_path}/{$template_file}");

            $message = 'Parameters absent from workflow template: ' . implode('; ', $absent_parameters) . '.';
            error_log($message);
            $this->_error($message, 500);
        }

        // json_encode does not preserve zero fractions e.g. “1.0” is encoded as “1”.
        // The json_encode option JSON_PRESERVE_ZERO_FRACTION was not introduced until PHP 5.6.6.
        $workflow_json_string = json_encode($template_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        // Write workflow file

        $timestamp_epoch = time();

        $workflow_file = 'scipion_workflow_' . gmdate('ymd.His', $timestamp_epoch) . '.json';

        try {
            file_put_contents("{$workflow_path}/{$workflow_file}", $workflow_json_string);
        } catch (Exception $e) {
            error_log("Failed to write workflow file: {$workflow_path}/{$workflow_file}");
            $this->_error('Failed to write workflow file.', 500);
        }

        // Send job to processing queue

        $message = array(
            'scipion_workflow' => "{$workflow_path}/{$workflow_file}"
        );

        $this->enqueue($zocalo_scipion_start_queue, $message);

        $output = array(
            'timestamp_iso8601' => gmdate('c', $timestamp_epoch),
            'template_path' => $template_path,
            'template_file' => $template_file,
            'workflow_path' => $workflow_path,
            'workflow_file' => $workflow_file
        );

        $this->_output($output);
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
