<?php

namespace SynchWeb;

// Handles serialising and deserialising config options from the database.

class Options
{

        protected $options;
        protected $public;

        public function __construct($db) {
            $this->db = $db;
            $this->_retrieve();
            // $this->serialise();
        }

        private function _retrieve() {
            $options = $this->db->pq("SELECT name, value, 1 as ui FROM AdminVar");

            $this->options = array();
            foreach ($options as $o) {
                $this->options[$o['NAME']] = unserialize($o['VALUE']);
                if ($o['UI'] == 1) $this->public[$o['NAME']] = $this->options[$o['NAME']];

            }
        }



        public function get($property, $default=null) {
            return array_key_exists($property, $this->options) ? $this->options[$property] : $default;
        }


        public function set($property, $value, $ui=0) {
            if (array_key_exists($property, $this->options)) $this->db->pq("UPDATE AdminVar SET value=:1 WHERE name=:2", array(serialize($value), $property));
            else $this->db->pq("INSERT INTO AdminVar (name, value) VALUES (:1, :2)", array($property, serialize($value)));
            // if (array_key_exists($property, $this->options)) $this->db->pq("UPDATE AdminVar SET value=:1, ui=:2 WHERE name=:3", array(serialize($value), $ui ? 1 : 0, $property));
            // else $this->db->pq("INSERT INTO AdminVar (name, value, ui) VALUES (:1, :2, :3)", array($property, serialize($value), $ui ? 1 : 0));

            $this->options[$property] = $value;

            return true;
        }

        public function ui() {
            return $this->public;
        }



        public function serialise() {
            $config = file_get_contents('config.php');
            $opts = array_filter(
                token_get_all($config),
                function($t) { return $t[0] == T_VARIABLE; }
            );

            foreach ($opts as $o) {
                $name = str_replace('$', '', $o[1]);
                $this->set($name, $GLOBALS[$name]);
            }
        }
}
