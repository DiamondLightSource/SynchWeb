<?php

use DHL\Entity\GB\ShipmentResponse;
use DHL\Entity\GB\ShipmentRequest;
use DHL\Datatype\GB\Piece;

use DHL\Entity\GB\BookPURequest;
use DHL\Entity\GB\BookPUResponse;

use DHL\Entity\GB\CancelPURequest;
use DHL\Entity\GB\CancelPUResponse;

use DHL\Entity\AM\GetQuote;
use DHL\Datatype\AM\PieceType;

use DHL\Entity\GB\KnownTrackingRequest as Tracking;
use DHL\Entity\GB\TrackingResponse as TrackingResponse;

use DHL\Client\Web as WebserviceClient;


class DHL {
    
    public $log = false;
    public $region = 'EU';

    public $_country_codes = array(
        'United Kingdom' => 'GB',
        'France' => 'FR',
        'Germany' => 'DE',
    );

    public $_tracking_statuses = array(
        'AD' => 'Agreed delivery',
        'AF' => 'Arrived facility',
        'AR' => 'Arrival in delivery facility',
        'BA' => 'Bad address',
        'BL' => 'Bond location',
        'BN' => 'Customer broker notified',
        'BR' => 'Broker release',
        'CA' => 'Closed on arrival',
        'CC' => 'Awaiting cnee collection',
        'CD' => 'Controllable clearance delay',
        'CI' => 'Facility check-in',
        'CM' => 'Customer moved',
        'CR' => 'Clearance release',
        'CS' => 'Closed shipment',
        'CU' => 'Confirm uplift',
        'DD' => 'Delivered damaged',
        'DF' => 'Depart facility',
        'DI' => 'Duty invoice',
        'DM' => 'Damaged',
        'DP' => 'Denied parties',
        'DS' => 'Destroyed / disposal',
        'ES' => 'Entry submitted',
        'FD' => 'Forward destination (DD\'s expected)',
        'HI' => 'Lodged into hic',
        'HN' => 'Handover',
        'HO' => 'Lodged out of held inventory control',
        'HP' => 'Held for payment',
        'IA' => 'Image available',
        'IC' => 'In clearance processing',
        'IR' => 'Incorrect route',
        'LV' => 'Load vehicle',
        'MC' => 'Miscode',
        'MD' => 'Missed delivery cycle',
        'MS' => 'Mis-sort',
        'NA' => 'Not arrived',
        'ND' => 'Not delivered',
        'NH' => 'Not home',
        'OH' => 'On hold',
        'OK' => 'Delivery',
        'PD' => 'Partial delivery',
        'PL' => 'Processed at location',
        'PU' => 'Shipment pick up',
        'PY' => 'Payment',
        'RD' => 'Refused delivery',
        'RR' => 'Response received',
        'RT' => 'Returned to consignor',
        'RW' => 'Weigh & dimension',
        'SA' => 'Shipment acceptance',
        'SC' => 'Service changed',
        'SI' => 'Shipment inspection',
        'SM' => 'Scheduled movement',
        'SS' => 'Shipment stopped',
        'ST' => 'Shipment intercept',
        'TD' => 'Transport delay',
        'TI' => 'Trace initiated',
        'TP' => 'Forwarded to 3rd party - no DD\'s',
        'TR' => 'Record of transfer',
        'TT' => 'Trace terminated',
        'UD' => 'Uncontrollable clearance delay',
        'UV' => 'Unload vehicle',
        'WC' => 'With delivering courier',
    );    


    function __construct($user=null, $password=null, $env='staging') {
        if (!defined('DHL_API_DIR')) define('DHL_API_DIR', dirname(__FILE__).'/../lib/DHL-API/');
        require_once(DHL_API_DIR . 'vendor/autoloadManager/autoloadManager.php');

        $scanOption = autoloadManager::SCAN_ONCE;
        $autoloadDir = sys_get_temp_dir() . '/dhl-api-autoload.php';

        $autoloadManager = new AutoloadManager($autoloadDir, $scanOption);
        $autoloadManager->addFolder(DHL_API_DIR . 'vendor');
        $autoloadManager->addFolder(DHL_API_DIR . 'DHL');
        $autoloadManager->register();

        if (file_exists('tables/countries.json')) {
            $countries = json_decode(file_get_contents('tables/countries.json'), true);
            foreach($countries as $c) {
                $this->_country_codes[$c['country']] = $c['code'];
            }
        }

        $this->_user = $user;
        $this->_password = $password;
        $this->env = $env;
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

        if ($this->log) file_put_contents('logs/trackingrequest_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['AWB'].'.xml'), $request->toXML());

        $client = new WebserviceClient($this->env);
        $xml = $client->call($request);

        if ($this->log) file_put_contents('logs/trackingresponse_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['AWB'].'.xml'), $xml);

        $xml = simplexml_load_string(str_replace('req:', '', $xml));
        return $xml;
    }


    function create_awb($options) {
        $shipment = new ShipmentRequest();
        $shipment->SiteID = $this->_user;
        $shipment->Password = $this->_password;

        $shipment->MessageTime = date('c');
        $shipment->MessageReference = (string)rand(100000000000000000,999999999999999999).'0000000000';
        $shipment->RegionCode = $this->region;
        $shipment->RequestedPickupTime = 'Y';
        $shipment->LanguageCode = 'en';
        $shipment->PiecesEnabled = 'Y';
        $shipment->Billing->ShippingPaymentType = $options['payee'];
        $shipment->Billing->ShipperAccountNumber = $options['accountnumber'];
        if ($options['payee'] != 'S') {
            $shipment->Billing->BillingAccountNumber = $options['accountnumber'];
        }
        $shipment->Billing->DutyPaymentType = 'R';

        $shipment->Dutiable->DeclaredValue = $options['declaredvalue'];
        $shipment->Dutiable->DeclaredCurrency = 'GBP';

        $shipment->Consignee->CompanyName = $options['receiver']['company'];
        foreach (split("\n", $options['receiver']['address']) as $l) {
            if ($l) $shipment->Consignee->addAddressLine($l);
        }
        $shipment->Consignee->City = $options['receiver']['city'];
        $shipment->Consignee->PostalCode = $options['receiver']['postcode'];
        $shipment->Consignee->CountryName = $options['receiver']['country'];
        $shipment->Consignee->CountryCode = $this->_country_codes[$options['receiver']['country']];
        $shipment->Consignee->Contact->PersonName = $options['receiver']['name'];
        $shipment->Consignee->Contact->PhoneNumber = $options['receiver']['phone'];
        $shipment->Consignee->Contact->Email = $options['receiver']['email'];
        
        $shipment->ShipmentDetails->NumberOfPieces = sizeof($options['pieces']);
        $shipment->ShipmentDetails->WeightUnit = 'K';
        $shipment->ShipmentDetails->GlobalProductCode = $options['service'];
        $shipment->ShipmentDetails->Date = array_key_exists('date', $options) ? $options['date'] : date('Y-m-d');
        $shipment->ShipmentDetails->Contents = $options['description'];
        $shipment->ShipmentDetails->DimensionUnit = 'C';
        $shipment->ShipmentDetails->CurrencyCode = 'GBP';
        $shipment->ShipmentDetails->DoorTo = 'DD';
        // $shipment->ShipmentDetails->IsDutiable = 'Y';

        if (array_key_exists('notification', $options)) $shipment->Notification->EmailAddress = $options['notification'];
        if (array_key_exists('message', $options)) $shipment->Notification->Message = $options['message'];

        $weight = 0;
        foreach ($options['pieces'] as $i => $d) {
            $weight += $d['weight'];

            $piece = new Piece();
            $piece->PieceID = ($i + 1);
            $piece->Weight = $d['weight'];
            $piece->Width = $d['width'];
            $piece->Height = $d['height'];
            $piece->Depth = $d['depth'];
            $shipment->ShipmentDetails->addPiece($piece);
        }

        $shipment->ShipmentDetails->Weight = $weight;

        $shipment->Shipper->ShipperID = (string)rand(10000000,9999999);
        $shipment->Shipper->CompanyName = $options['sender']['company'];
        foreach (split("\n", $options['sender']['address']) as $l) {
            if ($l) $shipment->Shipper->addAddressLine($l);
        }
        $shipment->Shipper->City = $options['sender']['city'];
        $shipment->Shipper->PostalCode = $options['sender']['postcode'];
        $shipment->Shipper->CountryCode = $this->_country_codes[$options['sender']['country']];
        $shipment->Shipper->CountryName = $options['sender']['country'];
        $shipment->Shipper->Contact->PersonName = $options['sender']['name'];
        $shipment->Shipper->Contact->PhoneNumber = $options['sender']['phone'];
        $shipment->Shipper->Contact->Email = $options['sender']['email'];

        $shipment->LabelImageFormat = 'PDF';

        if ($this->log) file_put_contents('logs/shipmentrequest_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['sender']['name'].'.xml'), $shipment->toXML());

        $client = new WebserviceClient($this->env);
        $xml = $client->call($shipment);

        if ($this->log) file_put_contents('logs/shipmentresponse_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['sender']['name'].'.xml'), $xml);

        $response = new ShipmentResponse();
        $response->initFromXML($xml);
        // echo $response->toXML();

        $pieces = array();
        foreach ($response->Pieces as $p) {
            array_push($pieces, array(
                'piecenumber' => $p->PieceNumber,
                'licenseplate' => $p->LicensePlate,
            ));
        }

        return array(
            'awb' => $response->AirwayBillNumber,
            'label' => $response->LabelImage->OutputImage,
            'weight' => $response->ChargeableWeight,
            'pieces' => $pieces,
        );
    }


    function request_pickup($options) {
        $pickup = new BookPURequest();
        $pickup->SiteID = $this->_user;
        $pickup->Password = $this->_password;

        $pickup->MessageTime = date('c');
        $pickup->MessageReference = (string)rand(100000000000000000,999999999999999999).'0000000000';
        $pickup->RegionCode = $this->region;

        $pickup->Requestor->AccountType = 'D';
        $pickup->Requestor->AccountNumber = $options['accountnumber'];
        $pickup->Requestor->CompanyName = $options['requestor']['company'];
        $pickup->Requestor->RequestorContact->PersonName = $options['requestor']['name'];
        $pickup->Requestor->RequestorContact->Phone = $options['requestor']['phone'];
        $pickup->Requestor->CompanyName = $options['requestor']['company'];

        $pickup->Place->LocationType = 'B';
        $pickup->Place->CompanyName = $options['requestor']['company'];
        $lines = split("\n", $options['requestor']['address']);
        $pickup->Place->Address1 = $lines[0];
        if (sizeof($lines) > 1) {
            if ($lines[1]) $pickup->Place->Address2 = $lines[1];
        }
        $pickup->Place->City = $options['requestor']['city'];
        $pickup->Place->PostalCode = $options['requestor']['postcode'];
        $pickup->Place->CountryCode = $this->_country_codes[$options['requestor']['country']];
        $pickup->Place->PackageLocation = $options['packagelocation'];

        $pickup->Pickup->PickupDate = $options['pickupdate'];
        $pickup->Pickup->ReadyByTime = $options['readyby'];
        $pickup->Pickup->CloseTime = $options['closetime'];

        $pickup->PickupContact->PersonName = $options['requestor']['name'];
        $pickup->PickupContact->Phone = $options['requestor']['phone'];

        $pickup->ShipmentDetails->AWBNumber = $options['awbnumber'];
        $pickup->ShipmentDetails->NumberOfPieces = $options['pieces'];
        $pickup->ShipmentDetails->WeightUnit = 'K';
        $pickup->ShipmentDetails->Weight = $options['weight'];
        $pickup->ShipmentDetails->DoorTo = 'DD';

        if ($this->log) file_put_contents('logs/pickuprequest_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['requestor']['name'].'.xml'), $pickup->toXML());

        $client = new WebserviceClient($this->env);
        $xml = $client->call($pickup);

        if ($this->log) file_put_contents('logs/pickupresponse_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['requestor']['name'].'.xml'), $xml);

        $response = new BookPUResponse();
        $response->initFromXML($xml);
        // echo $response->toXML();

        return array(
            'confirmationnumber' => $response->ConfirmationNumber,
            'readybytime' => $response->ReadyByTime,
            'callintime' => $response->CallInTime,
        );
    }


    function cancel_pickup($options) {
        $cancelpickup = new CancelPURequest();
        $cancelpickup->SiteID = $this->_user;
        $cancelpickup->Password = $this->_password;

        $cancelpickup->MessageTime = date('c');
        $cancelpickup->MessageReference = (string)rand(100000000000000000,999999999999999999).'0000000000';
        $cancelpickup->RegionCode = $this->region;

        $cancelpickup->RequestorName = $options['name'];
        $cancelpickup->CountryCode = $this->_country_codes[$options['country']];
        $cancelpickup->ConfirmationNumber = $options['confirmationnumber'];
        $cancelpickup->Reason = '007';

        $cancelpickup->PickupDate = $options['pickupdate'];
        $cancelpickup->CancelTime = date('H:m');
        
        if ($this->log) file_put_contents('logs/cancelpickuprequest_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['confirmationnumber'].'.xml'), $cancelpickup->toXML());

        $client = new WebserviceClient($this->env);
        $xml = $client->call($cancelpickup);

        if ($this->log) file_put_contents('logs/cancelpickupresponse_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['confirmationnumber'].'.xml'), $xml);

        $response = new CancelPUResponse();
        $response->initFromXML($xml);
        // echo $response->toXML();

        return array();
    }


    function get_quote($options) {
        $quote = new GetQuote();
        $quote->SiteID = $this->_user;
        $quote->Password = $this->_password;

        $quote->MessageTime = date('c');
        $quote->MessageReference = (string)rand(100000000000000000,999999999999999999).'0000000000';

        $quote->BkgDetails->Date = array_key_exists('date', $options) ? $options['date'] : date('Y-m-d');

        foreach ($options['pieces'] as $i => $d) {
            $piece = new PieceType();
            $piece->PieceID = ($i + 1);
            $piece->Weight = $d['weight'];
            $piece->Width = $d['width'];
            $piece->Height = $d['height'];
            $piece->Depth = $d['depth'];
            $quote->BkgDetails->addPiece($piece);
        }

        $hm = explode(':', $options['readyby']);
        $quote->BkgDetails->ReadyTime = 'PT'.$hm[0].'H'.$hm[1].'M';
        $quote->BkgDetails->DimensionUnit = 'CM';
        $quote->BkgDetails->WeightUnit = 'KG';
        $quote->BkgDetails->PaymentCountryCode = $this->_country_codes[$options['receiver']['country']];
        
        $quote->From->CountryCode = $this->_country_codes[$options['sender']['country']];
        $quote->From->Postalcode = $options['sender']['postcode'];
        $quote->From->City = $options['sender']['city'];

        $quote->To->CountryCode = $this->_country_codes[$options['receiver']['country']];
        $quote->To->Postalcode = $options['receiver']['postcode'];
        $quote->To->City = $options['receiver']['city'];

        $quote->Dutiable->DeclaredValue = $options['declaredvalue'];
        $quote->Dutiable->DeclaredCurrency = 'GBP';

        if ($this->log) file_put_contents('logs/quoterequest_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['sender']['city'].'.xml'), $quote->toXML());

        $client = new WebserviceClient($this->env);
        $xml = $client->call($quote);

        if ($this->log) file_put_contents('logs/quoteresponse_'.date('Ymd-Hi').'_'.str_replace(' ', '_', $options['sender']['city'].'.xml'), $xml);

        $xml = simplexml_load_string(str_replace('req:', '', $xml));
        if (isset($xml->Response->Status->Condition->ConditionCode) && (string) $xml->Response->Status->Condition->ConditionCode != '') {
            $errorMsg = ((string) $xml->Response->Status->Condition->ConditionCode) . ' : ' . ((string) $xml->Response->Status->Condition->ConditionData);
            throw new \Exception('Error returned from DHL webservice : ' . $errorMsg);
        }

        $products = array();
        if ($xml->GetQuoteResponse->BkgDetails->QtdShp) {
            foreach ($xml->GetQuoteResponse->BkgDetails->QtdShp as $q) {
                $pkup = explode('-', (string)$q->PickupDate);
                $del = explode('-', (string)$q->DeliveryDate);

                $code = (string)$q->GlobalProductCode;
                if ($code == 'C') continue;

                array_push($products, array(
                    'productcode' => $code,
                    'productname' => (string)$q->ProductShortName,
                    'shippingdate' => $pkup[2].'-'.$pkup[1].'-'.$pkup[0],
                    'cutofftime' => str_replace('PT', '', $q->PickupCutoffTime),
                    'bookingtime' => str_replace('PT', '', $q->BookingTime),
                    'deliverydate' => $del[2].'-'.$del[1].'-'.$del[0],
                    'deliverytime' => str_replace('PT', '', $q->DeliveryTime),
                    'totalprice' => (float)$q->ShippingCharge,
                    'totaltax' => (float)$q->TotalTaxAmount,
                    'currencycode' => (string)$q->CurrencyCode,
                ));
            }
        }

        return $products;
    }


    function get_countries() {
        return array_keys($this->_country_codes);
    }


    function tracking_status($key) {
        return array_key_exists($key, $this->_tracking_statuses) ? $this->_tracking_statuses[$key] : null;
    }

}
