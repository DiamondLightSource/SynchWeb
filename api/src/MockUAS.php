<?php

namespace SynchWeb;

use SynchWeb\Authentication\Type\CAS;

class UAS
{

	function __construct($user=null, $pass=null) {
		global $uas_url, $vmxi_user, $vmxi_pass;
	}


        // Fake the return of a create session call.
        // Return fixed session info and print data parameter to logs
	function create_session($data=array()) {
		$code = 200;
		$json = '{"sessionNumber": 10, "id": "987654321"}';
		$resp = json_decode($json);

		error_log("MockUAS::create_session");
		error_log(print_r($data, true));
		return array('code' => $code, 'resp' => $resp);
	}


        // Fake the return of an update session call.
        // Return fixed return code
	function update_session($sessionid, $data=array()) {
		error_log("MockUAS::update_session");
		error_log(print_r($data, true));
		$code = 200;
		return $code;
	}

        // Fake the return of an close session call.
        // Return fixed return code
	function close_session($sessionid) {
		return 200;
	}

        // Fake the return of an get session call.
        // Return fixed values - not used in SynchWeb currently
	function get_sessions() {
		$resp = array();
		return array('code' => 404, 'resp' => $resp);
	}



    function _curl($options) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $options['URL']);
        curl_setopt($ch, CURLOPT_HEADER, array_key_exists('HEADER', $options) ? 1 : 0);
        if (array_key_exists('HEADERS', $options)) curl_setopt($ch, CURLOPT_HTTPHEADER, $options['HEADERS']);
        if (array_key_exists('PATCH', $options)) curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        else if (!array_key_exists('GET', $options)) curl_setopt($ch, CURLOPT_POST, 1);

        if (array_key_exists('FIELDS', $options)) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($options['FIELDS']));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);

        // if (array_key_exists('FIELDS', $options)) print_r(array('body', json_encode($options['FIELDS'])));

        $resp = curl_exec($ch);
        $this->code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        // print_r(curl_getinfo($ch));
        curl_close($ch);

        return $resp;
    }
}
