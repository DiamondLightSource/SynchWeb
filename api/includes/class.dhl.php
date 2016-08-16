<?php

use DHL\Entity\GB\KnownTrackingRequest as Tracking;
use DHL\Entity\GB\TrackingResponse as TrackingResponse;

use DHL\Client\Web as WebserviceClient;


class DHL {
	
	function __construct($user, $password) {
		define('DHL_API_DIR', dirname(__FILE__).'/../lib/DHL-API/');
		require_once(DHL_API_DIR . 'vendor/autoloadManager/autoloadManager.php');

		$scanOption = autoloadManager::SCAN_ONCE;
		$autoloadDir = sys_get_temp_dir() . '/dhl-api-autoload.php';

		$autoloadManager = new AutoloadManager($autoloadDir, $scanOption);
		$autoloadManager->addFolder(DHL_API_DIR . 'vendor');
		$autoloadManager->addFolder(DHL_API_DIR . 'DHL');
		$autoloadManager->register();

		$this->_user = $user;
		$this->_password = $password;
	}


	function get_tracking_info($options) {
		if (!array_key_exists('AWB', $options)) return;

        $request = new Tracking();
        $request->SiteID = $this->_user;
        $request->Password = $this->_password;
        $request->MessageReference = '12345678901234567890' . (string)time();
        $request->MessageTime = date('c');
        $request->LanguageCode = 'en';
        $request->AWBNumber = $options['AWB'];
        $request->LevelOfDetails = array_key_exists('LAST_ONLY', $options) ? 'LAST_CHECK_POINT_ONLY' : 'ALL_CHECK_POINTS';
        $request->PiecesEnabled = 'S';

        $client = new WebserviceClient();
        $xml = $client->call($request);

        $xml = simplexml_load_string(str_replace('req:', '', $xml));
        return $xml;
	}

}