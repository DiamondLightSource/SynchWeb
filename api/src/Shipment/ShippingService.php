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


    function get_shipment($external_id)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/external_id/' . $external_id,
            "GET",
            null,
            200
        );
    }


    function update_shipment($external_id, $shipment_data)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/external_id/' . $external_id,
            "PUT",
            $shipment_data,
            204
        );
    }


    function dispatch_shipment($shipment_id)
    {
        return $this->_send_request(
            $this->shipping_api_url . '/shipments/' . $shipment_id . '/dispatch',
            "POST",
            array(),
            201
        );
    }

    function get_awb_pdf_url($shipment_id)
    {
        return $this->shipping_api_url . '/shipments/' . $shipment_id . '/awb/pdf';
    }
}
