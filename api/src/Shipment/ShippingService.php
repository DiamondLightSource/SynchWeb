<?php


namespace SynchWeb\Shipment;

/**
 * This class contacts an external shipping service to book shipments with the courier.
 */
class ShippingService
{
    private $shipping_api_url;
    private $shipping_app_url;
    public const JOURNEY_TO_FACILITY = "TO_FACILITY";
    public const JOURNEY_FROM_FACILITY = "FROM_FACILITY";

    function _build_headers()
    {
        global $cookie_key;
        global $shipping_service_api_user;
        global $shipping_service_api_password;

        $headers = array(
            'Accept: application/json',
            'Content-Type: application/json',
        );

        if (isset($_COOKIE[$cookie_key])) {
            array_push($headers, "Authorization: Bearer {$_COOKIE[$cookie_key]}");
            return $headers;
        }

        if (isset($shipping_service_api_user) && isset($shipping_service_api_password)) {
            $basic_auth = base64_encode($shipping_service_api_user . ":" . $shipping_service_api_password);
            array_push($headers, "Authorization: Basic {$basic_auth}");
            return $headers;
        }

        throw new \Exception("Shipping service auth error: no cookie found and basic auth credentials unset");
    }

    function __construct()
    {
        global $shipping_service_api_url;
        global $shipping_service_app_url;
        $this->shipping_api_url = $shipping_service_api_url;
        $this->shipping_app_url = $shipping_service_app_url;
    }


    function _send_request($url, $type, $data, $expected_status_code)
    {
        $ch = curl_init($url);
        $base_headers = $this->_build_headers();
        curl_setopt_array(
            $ch,
            array(
                CURLOPT_RETURNTRANSFER => TRUE,
                CURLOPT_HTTPHEADER => $base_headers,
                CURLOPT_TIMEOUT => 5
            )
        );
        switch ($type) {
            case "POST":
                curl_setopt_array(
                    $ch,
                    array(
                        CURLOPT_POST => TRUE,
                        CURLOPT_POSTFIELDS => json_encode($data)
                    )
                );
                break;
            case "GET":
                break;
            case "PUT":
                curl_setopt_array(
                    $ch,
                    array(
                        CURLOPT_CUSTOMREQUEST => "PUT",
                        CURLOPT_HTTPHEADER => array_merge($base_headers, array('Content-Length: ' . strlen(json_encode($data)))),
                        CURLOPT_POSTFIELDS => json_encode($data),
                    )
                );
                break;
        }
        $response = json_decode(curl_exec($ch), TRUE);
        $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status_code != $expected_status_code) {
            throw new \Exception(json_encode(array('status' => $status_code, 'content' => $response)));
        }
        return $response;
    }


    function create_shipment($shipment_data)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/',
            "POST",
            $shipment_data,
            201
        );
    }


    function create_shipment_by_journey_type($shipment_data, $journey_type)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/' . $journey_type,
            "POST",
            $shipment_data,
            201
        );
    }


    function get_shipment($external_id, $journey_type)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/external_id/' . $external_id . '?journey_type=' . $journey_type,
            "GET",
            null,
            200
        );
    }


    function update_shipment($external_id, $shipment_data, $journey_type)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/external_id/' . $external_id . '?journey_type=' . $journey_type,
            "PUT",
            $shipment_data,
            204
        );
    }


    function dispatch_shipment($shipment_id, $pickup_requested)
    {
        $pickup_requested_str = ($pickup_requested) ? "true" : "false";
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/' . $shipment_id . '/dispatch?pickup_requested=' . $pickup_requested_str,
            "POST",
            null,
            201
        );
    }

    function get_awb_pdf_url($shipment_id)
    {
        return $this->shipping_app_url . '/shipments/' . $shipment_id . '/awb';
    }

    function create_shipment_request($shipment_request_data)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipment_requests/',
            "POST",
            $shipment_request_data,
            201
        );
    }
}
