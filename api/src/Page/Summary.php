<?php

namespace SynchWeb\Page;

use SynchWeb\Page;

class Summary extends Page
{

    public static $arg_list = array(
        //proposal
        'TITLE' => '(\w|\s|\-|\(|\))+',

        // visit

);

    public static $dispatch = array(
        array('/results', 'get', '_get_results')
    );

    function _get_results() {


    }



}