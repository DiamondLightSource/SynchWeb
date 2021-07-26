<?php

namespace SynchWeb;

use SynchWeb\Authentication\Type\CAS;

class UAS
{

	function __construct($user=null, $pass=null) {
		global $uas_url, $vmxi_user, $vmxi_pass;

		$this->url = $uas_url;

        $cas = new CAS();

        if ($user && $pass) $cas->authenticate($user, $pass);
        else $cas->authenticate($vmxi_user, $vmxi_pass);

        $st = $cas->service($this->url.'/uas/login/cas');

        $uas = $this->_curl(array(
            'URL' => $this->url.'/uas/login/cas?ticket='.$st,
            'HEADER' => 1,
            'GET' => 1,
        ));

        $this->session = null;
        foreach (explode("\n", $uas) as $line) {
            if (preg_match('/^Set-Cookie: JSESSIONID=(\w+);/', $line, $mat)) {
                $this->session = $mat[1];
            }
        }

        // print_r(array('sess', $this->session));
	}



	function create_session($data=array()) {
		$resp = $this->_curl(array(
            'URL' => $this->url.'/uas/rest/v1/session',
            'FIELDS' => $data,
            'HEADERS' => array(
                'Content-type: application/json',
                'Accept: application/json',
                'Cookie: JSESSIONID='.$this->session,
            ),
        ));

		// print_r(array($resp));

        if ($this->code == 200) {
			$resp = json_decode($resp);
		} else {
            error_log("UAS::create_session error from UAS, code: " . $this->code);
            error_log(print_r($resp), true);
        }

		return array('code' => $this->code, 'resp' => $resp);
	}


	function update_session($sessionid, $data=array()) {
		$resp = $this->_curl(array(
            'URL' => $this->url.'/uas/rest/v1/session/'.$sessionid,
            'FIELDS' => $data,
            'PATCH' => 1,
            'HEADERS' => array(
                'Content-type: application/json',
                'Accept: application/json',
                'Cookie: JSESSIONID='.$this->session,
            ),
        ));

        if ($this->code == 200) {
            error_log("UAS::update_session error from UAS, code: " . $this->code);
            error_log(print_r($resp), true);
        }

		// print_r(array($resp));

		return $this->code;
	}

	function close_session($sessionid, $deliveredTime=0) {
		$resp = $this->_curl(array(
            'URL' => $this->url.'/uas/rest/v1/session/'.$sessionid,
            'FIELDS' => array('endAt' => date('Y-m-d\TH:i:s.000\Z'), $deliveredTime),
            'PATCH' => 1,
            'HEADERS' => array(
                'Content-type: application/json',
                'Accept: application/json',
                'Cookie: JSESSIONID='.$this->session,
            ),
        ));

		// print_r(array($resp));

		return $this->code;
	}

	function get_sessions() {
		 $resp = $this->_curl(array(
            'URL' => $this->url.'/uas/rest/v1/proposal?state=OPEN&fetch=samples&fetch=investigators',
            'GET' => 1,
            'HEADERS' => array(
                'Content-type: application/json',
                'Accept: application/json',
                'Cookie: JSESSIONID='.$this->session,
            ),
        ));

		if ($this->code == 200) {
			$resp = json_decode($resp);
		}

		return array('code' => $this->code, 'resp' => $resp);
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
