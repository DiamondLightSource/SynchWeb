<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Nexus extends Page 
{
        
        public static $arg_list = array(
          'id' => '\d+',
          'point' => '\d+',
          'entry' => '\d+',
        );
        

        public static $dispatch = array(
            array('/scalars', 'get', '_scalars'),
            array('/spectra', 'get', '_spectra'),
        );


        function _scalars() {
            if (!($this->has_arg('id'))) $this->_error('No datacollection specified');
            $info = $this->_get_dc($this->arg('id'));

            $resp = $this->_make_request(array(
                'type' => 'scalars',
                'data' => array(
                    'dcid' => $this->arg('id'),
                    'entry' => $this->has_arg('entry') ? $this->arg('entry') : null,
                ),
            ));

            foreach($resp as &$r) {
                $r = array_change_key_case($r, CASE_UPPER);
            }

            $this->_output($resp);
        }

        function _spectra() {
            if (!($this->has_arg('id'))) $this->_error('No datacollection specified');
            $info = $this->_get_dc($this->arg('id'));

            $resp = $this->_make_request(array(
                'type' => 'spectra',
                'data' => array(
                    'dcid' => $this->arg('id'),
                    'point' => $this->arg('point'),
                ),
            ));

            foreach($resp as &$r) {
                $r = array_change_key_case($r, CASE_UPPER);
            }

            $this->_output($resp);
        }


        function _get_dc($id) {
            list($info) = $this->db->pq('SELECT imagedirectory as loc, filetemplate as ft, numberofimages as num, imagesuffix as type 
                FROM datacollection 
                WHERE datacollectionid=:1', array($this->arg('id')));

            return $info;
        }


        function _make_request($options) {
            $resp = $this->_curl(array(
                'url' => 'http://localhost:5000/nexus/'.$options['type'],
                'jwt' => true,
                'data' => $options['data'],
            ));

            if ($resp['code'] == 200) {
                return json_decode($resp['content'], True);

            } else {
                $this->_error('Could not read data');
            }
        }
}
