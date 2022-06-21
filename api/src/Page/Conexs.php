<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Conexs extends Page
{
    public static $arg_list = array('login' => '.*',
                                    'data' => '.*',
                                    'charge' => '\d+',
                                    'multiplicity' => '\d+',
                                    'fedid' => '.*',
                                    'element' => '\w+',
                                    'fdmnes_method' => '\w+',
                                    'edge' => '\w+',
                                    'crystal' => '\w+',
                                    'calculation' => '\w+',
                                    'etot_conv_thr' => '.*',
                                    'prefix' => '\w+',
                                    'restart_mode' => '\w+',
                                    'title' => '\w+',
                                    'forces' => '.*',
                                    'verbosity' => '\w+',
                                    'ibrav' => '\d+',
                                    'occupations' => '\w+',
                                    'smearing' => '\w+',
                                    'degauss' => '\w+',
                                    'diagonilization' => '\w+',
                                    'electron_maxstep' => '\d+',
                                    'mixing_beta' => '.*',
                                    'form' => '\w+',
                                    'memory' => '\d+',
                                    'cpu' => '\d+',
                                    'jobId' => '\d+',
                                    'orcaSpectrumType' => '.*',
                                    'orcaStartValue' => '.*',
                                    'orcaStopValue' => '.*',
                                    'orcaBroadening' => '.*',
                                    'mpapiToken' => '.*',
                                    'mpapiMaterial' => '.*',
                                    'mpapiAbsorbingAtom' => '\d+',
                            );

    public static $dispatch = array(array('/', 'post', '_initiate_conexs_cluster'),
                                    array('/status', 'post', '_poll_conexs_cluster_status'),
                                    array('/jobs', 'get', '_get_conexs_jobs'),
                                    array('/submit', 'post', '_submit'),
                                    array('/kill', 'post', '_kill_job'),
                                    array('/mpapi', 'post', '_get_mpapi_structure'),
                        );


    // Get overview data from MPapi sidecar container
    function _get_mpapi_structure() {
        global $conexs_mpapi_url;

        $data = $this->args;

        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_mpapi_url . 'get_mpapi');
        curl_setopt($c, CURLOPT_POST, 1);
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);
        curl_close($c);

        $this->_output(json_decode($result));
    }

    // Check if user has CONEXS cluster available and initiate one if not
    function _initiate_conexs_cluster() {
        global $conexs_url;

        if(!$this->has_arg('login')) $this->_error('No fedid provided');

        $data = array(
            'login' => $this->arg('login')
        );

        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_url);
        curl_setopt($c, CURLOPT_POST, 1);
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);

        curl_close($c);

        $this->_output(json_decode($result));
    }

    // Check active CONEXS cluster status
    function _poll_conexs_cluster_status(){
        global $conexs_url;

        if(!$this->has_arg('login')) $this->_error('No fedid provided');

        $data = array(
            'login' => $this->arg('login')
        );

        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_url . 'check_server');
        curl_setopt($c, CURLOPT_POST, 1);
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);
        curl_close($c);

        $this->_output(json_decode($result));
    }

    // Get list of active CONEXS jobs for a user
    function _get_conexs_jobs(){
        global $conexs_url;

        if(!$this->has_arg('login')) $this->_error('No fedid provided');

        $data = array(
            'login' => $this->arg('login')
        );
        
        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_url . 'list_jobs');
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);
        curl_close($c);

        $this->_output(json_decode($result));
    }

    // Submit parameters to conexs service
    function _submit(){
        global $conexs_url;

        $data = $this->args;
        $form = $this->arg('form');

        foreach($_FILES as $f){
            $label = $form . 'StructureFile';
            $data += array($label => array('filename' => $f['name'],
                                            'contents' => file_get_contents($f['tmp_name'])));
        }

        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_url . 'upload_' . $form);
        curl_setopt($c, CURLOPT_POST, 1);
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);
        curl_close($c);

        $this->_output(json_decode($result));
    }

    // Send signal to kill conexs processing job
    function _kill_job(){
        global $conexs_url;

        if(!$this->has_arg('login') || !$this->has_arg('jobId')) $this->_error('No fedid or job ID provided');

        $data = array(
            'login' => $this->arg('login'),
            'jobId' => $this->arg('jobId')
        );

        $c = curl_init();
        curl_setopt($c, CURLOPT_URL, $conexs_url . 'kill_job');
        curl_setopt($c, CURLOPT_POST, 1);
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($c);
        curl_close($c);

        $this->_output(json_decode($result));
    }
}
?>