<?php

namespace SynchWeb\Page\EM;

trait Scipion
{
    public function scipionStart()
    {
        global $visit_directory,
               $zocalo_scipion_template_path,
               $zocalo_scipion_template_file,
               $zocalo_scipion_workflow_path,
               $zocalo_scipion_start_queue;

        $this->configExitIfNoMicroscopes();
        $session = $this->sessionFetch($this->arg('session'));
        $this->sessionExitIfNotActive($session);

        $session_path = $this->sessionSubstituteValuesInPath($session, $visit_directory);
        $template_path = $this->sessionSubstituteValuesInPath($session, $zocalo_scipion_template_path);
        $template_file = $zocalo_scipion_template_file;
        $workflow_path = $this->sessionSubstituteValuesInPath($session, $zocalo_scipion_workflow_path);

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
        } catch (\Exception $e) {
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
        } catch (\Exception $e) {
            error_log("Failed to write workflow file: {$workflow_path}/{$workflow_file}");
            $this->_error('Failed to write workflow file.', 500);
        }

        // Send job to processing queue

        $message = array(
            'scipion_workflow' => "{$workflow_path}/{$workflow_file}"
        );

        // $this->_send_zocalo_message($zocalo_scipion_start_queue, $message);

        $output = array(
            'timestamp_iso8601' => gmdate('c', $timestamp_epoch),
            'template_path' => $template_path,
            'template_file' => $template_file,
            'workflow_path' => $workflow_path,
            'workflow_file' => $workflow_file
        );

        $this->_output($output);
    }
}
