<?php


namespace SynchWeb\Shipment;

/**
 * This class contacts an external shipping service to book shipments with the courier.
 */
class ShippingService
{
    private $shipping_api_url;
    private $headers;

    function __construct()
    {
        global $shipping_service_url;
        $this->shipping_api_url = $shipping_service_url;
        $this->headers = array(
            'Accept: application/json',
            'Content-Type: application/json',
        );
    }


    function _send_request($url, $type, $data, $expected_status_code)
    {
        $ch = curl_init($url);
        curl_setopt_array(
            $ch,
            array(
                CURLOPT_RETURNTRANSFER => TRUE,
                CURLOPT_HTTPHEADER => $this->headers,
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
                        CURLOPT_HTTPHEADER => array_merge($this->headers, array('Content-Length: ' . strlen(json_encode($data)))),
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
        return $this->shipping_api_url . '/shipments/' . $shipment_id . '/awb/pdf';
    }
}
