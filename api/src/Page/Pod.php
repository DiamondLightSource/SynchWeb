<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Pod extends Page 
{
    public static $arg_list = array('id' => '\d+',
                                    'user' => '.*',
                            );

    public static $dispatch = array(array('/h5web/:id', 'get', '_initiate_h5web_pod'),
                                    array('/h5web/running/:id', 'get', '_h5web_pod_running'),
                                    array('/h5web/status/:id', 'get', '_h5web_start_status'),
                        );

    /**
     * Compile necessary parameters and send curl request to launcher application to start up a new pod
     */
    function _initiate_h5web_pod(){
        $person = $this->_get_person();

        // Currently we only allow users to spin up one H5Web pod and we can't map a new file into existing Pod
        $personHasPod = $this->db->pq("SELECT podId FROM Pod WHERE status IS NOT NULL AND status !=:1 AND STATUS !=:2 AND personId =:3", array('Terminated', 'Failed', $person));
        if(sizeof($personHasPod) > 0) $this->_error('You have an existing instance of the H5Web viewer running.');

        $filePath = $this->_get_file_path();
        $path = $filePath['IMAGEDIRECTORY'];
        $file = $filePath['FILETEMPLATE'];

        $uid = exec("id -u ".$this->arg('user'));

        // Insert row acknowledging a valid pod request was sent to SynchWeb
        // Need to update the Pod table app enum field to allow h5web and jnb (jupyter notebook)
        $this->db->pq("INSERT INTO Pod (podid, app, status, personid, filePath) 
                    VALUES (s_pod.nextval, :1, :2, :3, :4)",
                    array('H5Web', 'Requested', $person, $path.$file));
        $podId = $this->db->id();

        $data = array(
            'user' => $this->arg('user'),
            'userid' => $uid,
            'path' => $path,
            'file' => $file,
            'podid' => $podId,
            'app' => 'h5web'
        );

        global $h5web_service_url, $h5web_service_cert;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $h5web_service_url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSLCERT, $h5web_service_cert);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Blocks echo of curl response
        $result = curl_exec($ch);
        curl_close($ch);

        $this->_output(array('podId' => $podId));
    }

    /**
     * SynchWeb polls this method to check Pod status during Pod startup
     * Could be deprecated if we decide to wait for curl requests to complete (since initiate_pod will always succeed or fail)
     */
    function _h5web_start_status() {
        $podId = $this->arg('id');
        $row = $this->db->pq("SELECT status, ip, message FROM Pod where podId=:1", array($podId));
        $this->_output($row);
    }

    /**
     * SynchWeb polls this method to check if a Pod has terminated
     */
    function _h5web_pod_running() {
        $person = $this->_get_person();

        $filePath = $this->_get_file_path();
        $path = $filePath['IMAGEDIRECTORY'];
        $file = $filePath['FILETEMPLATE'];

        $row = $this->db->pq("SELECT ip FROM Pod WHERE filePath LIKE CONCAT(:1, '%') AND personId = :2 AND status = :3 ORDER BY created DESC LIMIT 1",
                            array($path, $person, 'Running'));

        // Imperfect solution as it doesn't account for the visit number (app.vist on client side is broken)
        if(strpos($path, $this->arg('prop')) === false) {
            $this->_output();
        } else {
            $this->_output($row);
        }
    }

    /**
     * Helper method to get person who owns a Pod
     * Used as a query parameter to track Pod status
     */
    function _get_person() {
        if(!$this->has_arg('user')) $this->_error('No User Provided!');

        $row = $this->db->pq("SELECT personId FROM Person WHERE login = :1", array($this->arg('user')));
        if(!sizeof($row)) $this->error('No such user');

        return $row[0]['PERSONID'];
    }

    /**
     * Helper method to get file path associated with a data collection
     * The path & filename is passed into a pod or used as another query parameter to check a Pod status
     */
    function _get_file_path() {
        if(!$this->has_arg('id')) $this->_error('No DCID Provided!');

        $row = $this->db->pq("SELECT imageDirectory, fileTemplate FROM datacollection WHERE datacollectionid =:1", array($this->arg('id')));
        $item = $row[0];
        $path = $item['IMAGEDIRECTORY'];
        $file = $item['FILETEMPLATE'];

        if(!file_exists($path.$file)) $this->_error('File does not exist at the provided location!');

        return $item;
    }
}

?>