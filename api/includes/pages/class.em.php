<?php

    class Em extends Page {


        public static $arg_list = array(
            'id' => '\d+',
            'ids' => '\d+',
            'visit' => '\w+\d+-\d+',
            'n' => '\d+',
            't' => '\d+',
            'IMAGENUMBER' => '\d+',

            // Scipion processing
            // Accept decimal request parameters for integers as values later cast to integer type.

            'dosePerFrame' => '\d*(\.\d+)?', // Decimal
            'numberOfIndividualFrames' => '\d*(\.\d+)?', // Integer
            'patchX' => '\d*(\.\d+)?', // Integer
            'patchY' => '\d*(\.\d+)?', // Integer
            'samplingRate' => '\d*(\.\d+)?', // Decimal
            'particleSize' => '\d*(\.\d+)?', // Integer
            'minDist' => '\d*(\.\d+)?', // Integer
            'windowSize' => '\d*(\.\d+)?', // Integer
            'findPhaseShift' => '1?', // Boolean : Note PHP casts boolean true to 1 and false to nothing.
        );

        public static $dispatch = array(
            array('/aps', 'post', '_ap_status'),

            array('/mc/:id', 'get', '_mc_result'),
            array('/mc/image/:id(/n/:IMAGENUMBER)', 'get', '_mc_image'),
            array('/mc/fft/image/:id(/n/:IMAGENUMBER)(/t/:t)', 'get', '_mc_fft'),
            array('/mc/drift/:id(/n/:IMAGENUMBER)', 'get', '_mc_plot'),
            array('/mc/histogram', 'get', '_mc_drift_histogram'),

            array('/ctf/:id', 'get', '_ctf_result'),
            array('/ctf/image/:id(/n/:IMAGENUMBER)', 'get', '_ctf_image'),
            array('/ctf/histogram', 'get', '_ctf_histogram'),

            array('/process/visit/:visit', 'post', '_process_visit')
        );

        function _process_visit()
        {
            global $bl_types,
                   $visit_directory,
                   $em_template_path,
                   $em_template_file,
                   $em_workflow_path,
                   $em_activemq_server,
                   $em_activemq_username,
                   $em_activemq_password,
                   $em_activemq_queue;

            // Check electron microscopes are listed in global variables - see $bl_types in config.php.
            if (!array_key_exists('em', $bl_types)) $this->_error('Electron microscopes are not specified');

            if (!$this->has_arg('visit')) $this->_error('Visit not specified');

            // Lookup visit in ISPyB
            $visit = $this->db->pq("
            SELECT b.beamLineName AS beamLineName,
                YEAR(b.startDate) AS year,
                CONCAT(p.proposalCode, p.proposalNumber, '-', b.visit_number) AS visit,
                b.startDate AS startDate,
                b.endDate AS endDate
            FROM Proposal AS p
                JOIN BLSession AS b ON p.proposalId = b.proposalId
            WHERE CONCAT(p.proposalCode, p.proposalNumber, '-', b.visit_number) LIKE :1", array($this->arg('visit')));

            if (!sizeof($visit)) $this->_error('Visit not found');
            $visit = $visit[0];

            // Substitute values for visit in file paths i.e. BEAMLINENAME, YEAR, and VISIT.
            foreach ($visit as $key => $value) {
                $visit_directory = str_replace("<%={$key}%>", $value, $visit_directory);
                $em_template_path = str_replace("<%={$key}%>", $value, $em_template_path);
                $em_workflow_path = str_replace("<%={$key}%>", $value, $em_workflow_path);
            }

            // Validate form parameters

            // Setup rules to validate each parameter by isRequired, inArray, minValue, maxValue.
            // Specify outputType so json_encode casts value correctly. This determines whether value is quoted.

            // TODO Consider adding default values (JPH)
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

            $valid_parameters = array();
            $valid_parameters['filesPath'] = $visit_directory . '/raw/GridSquare_*/Data';

            $invalid_parameters = array();

            foreach ($validation_rules as $parameter => $validations) {

                // Determine whether request includes parameter
                if ($this->has_arg($parameter)) {

                    if ($this->arg($parameter) === '') {
                        array_push($invalid_parameters, "{$parameter} is not specified");
                        continue;
                    }

                    // Check parameter is more than minimum value
                    if (array_key_exists('minValue', $validations)) {
                        if ($this->arg($parameter) < $validations['minValue']) {
                            array_push($invalid_parameters, "{$parameter} is too small");
                            continue;
                        }
                    }

                    // Check parameter is less than maximum value
                    if (array_key_exists('maxValue', $validations)) {
                        if ($this->arg($parameter) > $validations['maxValue']) {
                            array_push($invalid_parameters, "{$parameter} is too large");
                            continue;
                        }
                    }

                    // Check parameter is in array of expected inputs
                    if (array_key_exists('inArray', $validations)) {
                        if (is_array($validations['inArray'])) {
                            if (!in_array($this->arg($parameter), $validations['inArray'])) {
                                array_push($invalid_parameters, "{$parameter} is not known");
                                continue;
                            }
                        }
                    }

                    // Parameter has passed validation checks so add to list of valid parameters.
                    $valid_parameters[$parameter] = $this->arg($parameter);

                    // Set type if outputType is specified, otherwise default to string. Note json_encode quotes value of type string.

                    $outputType = array_key_exists('outputType', $validations) ? $validations['outputType'] : 'string';

                    settype($valid_parameters[$parameter], $outputType);
                } else {
                    // Check whether a missing parameter is required.
                    if (array_key_exists('isRequired', $validations)) {
                        if ($validations['isRequired']) {
                            array_push($invalid_parameters, "{$parameter} is required");
                        }
                    }
                }
            }

            // TODO Better to return an array of invalid parameters for front end to display. (JPH)
            if (sizeof($invalid_parameters) > 0) {
                $this->_error("Invalid parameters: " . implode('; ', $invalid_parameters) . '.');
            }

            // Load protocol template file
            $template_json_string = @file_get_contents($em_template_path . '/' . $em_template_file);

            if ($template_json_string === false) {
                $this->_error("Failed to read template file:<br>" . $em_template_path . '/' . $em_template_file);
            }

            $template_array = json_decode($template_json_string, true);

            // Iterate over each step in protocol template
            foreach (array_keys($template_array) as $step_no) {

                // Iterate over each parameter in step
                foreach (array_keys($template_array[$step_no]) as $parameter) {

                    // Determine whether user has specified value for parameter
                    if (array_key_exists($parameter, $valid_parameters)) {

                        // Modify parameter if user has specified a different value
                        if ($template_array[$step_no][$parameter] != $valid_parameters[$parameter]) {
                            $template_array[$step_no][$parameter] = $valid_parameters[$parameter];
                        }
                    }
                }
            }

            // json_encode does not preserve zero fractions e.g. “1.0” is encoded as “1”.
            // The json_encode option JSON_PRESERVE_ZERO_FRACTION was not introduced until PHP 5.6.6.
            $workflow_json_string = json_encode($template_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

            // Save workflow file

            $timestamp_epoch = time();

            $em_workflow_file = 'scipion_workflow_' . gmdate('ymd.His', $timestamp_epoch) . '.json';

            $file_put_contents_result = @file_put_contents($em_workflow_path . '/' . $em_workflow_file, $workflow_json_string);

            if ($file_put_contents_result === false) {
                $this->_error("Failed to write workflow file:<br>" . $em_workflow_path . '/' . $em_workflow_file);
            }

            // Send job to processing queue

            if (!empty($em_activemq_server) && !empty($em_activemq_queue)) {
                $message = array(
                    'scipion_workflow' => $em_workflow_path . '/' . $em_workflow_file
                );

                include_once(__DIR__ . '/../shared/class.queue.php');
                $this->queue = new Queue();

                try {
                    $this->queue->send($em_activemq_server, $em_activemq_username, $em_activemq_password, $em_activemq_queue, $message, true);
                } catch (Exception $e) {
                    $this->_error($e->getMessage());
                }
            }

            $output = array(
                'timestamp_iso8601' => gmdate('c', $timestamp_epoch),
                'em_template_path' => $em_template_path,
                'em_template_file' => $em_template_file,
                'em_workflow_path' => $em_workflow_path,
                'em_workflow_file' => $em_workflow_file
            );

            $this->_output($output);
        }

        function _ap_status() {
            if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');

            $where = array();
            $ids = array();
            if ($this->has_arg('ids')) {
                if (is_array($this->arg('ids'))) {
                    foreach ($this->arg('ids') as $i) {
                        array_push($ids,$i);
                        array_push($where,'m.datacollectionid=:'.sizeof($ids));
                    }
                }
            }

            if (!sizeof($ids)) {
                $this->_output(array());
                return;
            }

            $where = '('.implode(' OR ', $where).')';

            if ($this->has_arg('visit')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($ids)+1);
                array_push($ids, $this->arg('visit'));
            } else {
                $where .= " AND s.proposalid = :".(sizeof($ids)+1);
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
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
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
                INNER JOIN blsession s ON dc.sessionid = s.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

            foreach ($ctf as $c) {
                $statuses[$c['DATACOLLECTIONID']]['CTF'][$c['MOVIENUMBER']] = $c['PROCESSINGSTATUS'];
            }

            $this->_output(array_values($statuses));
        }



        function _mc_result() {
            $in = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

            $rows = $this->db->pq("SELECT mc.motioncorrectionid, mc.firstframe, mc.lastframe, mc.doseperframe, mc.doseweight, mc.totalmotion, mc.averagemotionperframe, mc.micrographsnapshotfullpath, mc.patchesusedx, mc.patchesusedy, mc.fftfullpath, mc.fftcorrectedfullpath, mc.comments, mc.autoprocprogramid, m.movienumber as imagenumber, dc.datacollectionid
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2 AND app.processingstatus = 1", array($this->arg('id'), $in));

            if (!sizeof($rows)) $this->_error('No such motion correction');
            $row = $rows[0];

            $row['FFTFULLPATH'] = file_exists($row['FFTFULLPATH']) ? 1 : 0;
            $row['FFTCORRECTEDFULLPATH'] = file_exists($row['FFTCORRECTEDFULLPATH']) ? 1 : 0;
            $row['MICROGRAPHSNAPSHOTFULLPATH'] = file_exists($row['MICROGRAPHSNAPSHOTFULLPATH']) ? 1 : 0;

            foreach (array('TOTALMOTION' => 1, 'AVERAGEMOTIONPERFRAME' => 2) as $k => $r) {
                $row[$k] = number_format($row[$k], $r);
            }

            $this->_output($row);
        }


        function _mc_image() {
            $n = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;
            if ($n < 1) $n = 1;

            $imgs = $this->db->pq("SELECT mc.micrographsnapshotfullpath 
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $n));

            if (!sizeof($imgs)) $this->_error('No such micrograph');
            $img = $imgs[0];

            if (file_exists($img['MICROGRAPHSNAPSHOTFULLPATH'])) {
                $this->_send_image($img['MICROGRAPHSNAPSHOTFULLPATH']);

            } else {
                $this->app->contentType('image/png');
                readfile('assets/images/no_image.png');
            }
        }


        function _mc_fft() {
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
                $this->_send_image($file);

            } else {
                $this->app->contentType('image/png');
                readfile('assets/images/no_image.png');
            }
        }


        function _mc_plot() {
            $im = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

            $rows = $this->db->pq("SELECT mcd.deltax, mcd.deltay, mcd.framenumber 
                FROM motioncorrectiondrift mcd
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = mcd.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2
                ORDER BY mcd.framenumber", array($this->arg('id'), $im));

            $data = array();
            foreach ($rows as $r) {
                array_push($data, array($r['DELTAX'], $r['DELTAY']));
            }

            $this->_output($data);
        }


        function _mc_drift_histogram() {
            $where = '';
            $args = array();

            if ($this->has_arg('bl')) {
                $where .= ' AND s.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('visit')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('visit'));
            }

            if ($this->has_arg('runid')) {
                $where .= ' AND vr.runid=:'.(sizeof($args)+1);
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
                    INNER JOIN blsession s ON s.sessionid = dc.sessionid
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
                    $ha[$i-1] = floatval($h['AVGDIFF']);
                    $min[$i-1] = floatval($h['MINDIFF']);
                    $max[$i-1] = floatval($h['MAXDIFF']);
                    $ticks[$h['FRAMEDIFF']] = 1;
                }

                array_push($data, array('label' => $bl, 'min' => $min, 'max' => $max, 'avg' => $ha));
            }

            $this->_output(array('data' => $data, 'ticks' => array_keys($ticks)));
        }


        function _ctf_result() {
            $in = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;

            $rows = $this->db->pq("SELECT c.ctfid, c.boxsizex, c.boxsizey, c.minresolution, c.maxresolution, c.mindefocus, c.maxdefocus, c.defocusstepsize, c.astigmatism, c.astigmatismangle, c.estimatedresolution, c.estimateddefocus, c.amplitudecontrast, c.ccvalue, c.ffttheoreticalfullpath, c.comments, c.autoprocprogramid, m.movienumber as imagenumber, dc.datacollectionid
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2 AND app.processingstatus = 1", array($this->arg('id'), $in));

            if (!sizeof($rows)) $this->_error('No such ctf correction');
            $row = $rows[0];

            $row['FFTTHEORETICALFULLPATH'] = file_exists($row['FFTTHEORETICALFULLPATH']) ? 1 : 0;

            foreach (array('ASTIGMATISM' => 2, 'ASTIGMATISMANGLE' => 1, 'ESTIMATEDRESOLUTION' => 2, 'ESTIMATEDDEFOCUS' => 0) as $k => $r) {
                $row[$k] = number_format($row[$k], $r, '.', '');
            }

            $this->_output($row);
        }


        function _ctf_image() {
            $n = $this->has_arg('IMAGENUMBER') ? $this->arg('IMAGENUMBER') : 1;
            if ($n < 1) $n = 1;

            $imgs = $this->db->pq("SELECT c.ffttheoreticalfullpath 
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $n));

            if (!sizeof($imgs)) $this->_error('No such ctf correction');
            $img = $imgs[0];

            if (file_exists($img['FFTTHEORETICALFULLPATH'])) {
                $this->_send_image($img['FFTTHEORETICALFULLPATH']);

            } else {
                $this->app->contentType('image/png');
                readfile('assets/images/no_image.png');
            }
        }

        function _ctf_plot() {

        }


        function _ctf_histogram() {
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
                $where .= ' AND s.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('bl'));
            }

            if ($this->has_arg('visit')) {
                $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :".(sizeof($args)+1);
                array_push($args, $this->arg('visit'));
            }

            if ($this->has_arg('runid')) {
                $where .= ' AND vr.runid=:'.(sizeof($args)+1);
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
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
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
                        $zeros = strspn($bs, '0', strpos($bs, '.')+1);
                        $bs = round($bs, $zeros);
                    } else if ($bs < 1) {
                        $bs = round($bs, 3);
                    } else {
                        $zeros = strlen(number_format($bs,0, '.', ''));
                        $mp = pow(1,$zeros);
                        $bs = ceil($bs/$mp) * $mp;
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
                INNER JOIN blsession s ON s.sessionid = dc.sessionid
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
                for($bin = $t['st']; $bin <= $t['en']; $bin += $t['bin_size']) {
                    $bin_s = number_format($bin, strlen(substr(strrchr($t['bin_size'], '.'), 1)), '.', '');
                    $gram[$bin_s] = array_key_exists($bin_s, $ha) ? $ha[$bin_s] : 0;
                }

                $lab = ucfirst($k).' ('.$t['unit'].')';
                if (!$this->has_arg('bl')) $lab = $bl.': '.$lab;

                array_push($data, array('label' => $lab, 'data' => $gram));
            }

            $this->_output(array('histograms' => $data));
        }


        function _browser_cache() {
            $expires = 60*60*24*14;
            $this->app->response->headers->set('Pragma', 'public');
            $this->app->response->headers->set('Cache-Control', 'maxage='.$expires);
            $this->app->response->headers->set('Expires', gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
        }


        function _send_image($file) {
            $this->_browser_cache();
            $size = filesize($file);
            $this->app->response->headers->set("Content-length", $size);
            $this->app->contentType('image/'.pathinfo($file, PATHINFO_EXTENSION));
            readfile($file);
        }


    }
