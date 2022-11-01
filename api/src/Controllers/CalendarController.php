<?php

namespace SynchWeb\Controllers;

use Slim\Slim;

use SynchWeb\Page;
use SynchWeb\Model\Services\CalendarData;

class CalendarController extends Page
{
    private $calendarData;

    public static $arg_list = array('mon' => '\w+', 'year' => '\d\d\d\d', 'bl' => '[\w\-]+', 'h' => '\w+');

    public static $dispatch = array(
        array('/ics/h/:h/calendar.ics', 'get', 'exportCalendar'),
        array('/ext', 'get', 'generateExternalLink'),
    );


    function __construct(Slim $app, $db, $user, CalendarData $calendarData)
    {
        // Call parent constructor to register our routes
        parent::__construct($app, $db, $user);
        $this->app = $app;
        $this->calendarData = $calendarData;
    }

    function generateExternalLink()
    {
        if ($this->has_arg('prop') || $this->has_arg('bl'))
        {
            $ckey = $this->has_arg('bl') ? $this->arg('bl') : $this->arg('prop');

            $hashes = $this->calendarData->getCalendarHashByKey($ckey);

            $h = '';
            if (sizeof($hashes))
            {
                $h = $hashes[0]['HASH'];
            }
            else
            {
                $h = $this->calendarData->addCalendarHash($ckey, $this->has_arg('bl'));
            }
            $this->_output('/cal/ics/h/' . $h . '/calendar.ics');
        }
    }

    function exportCalendar()
    {
        if (!$this->has_arg('h'))
        {
            $this->_error('No proposal specified: You must specify a proposal to view a calendar');
        }

        $hash = $this->calendarData->getCalendarHashByHash($this->arg('h'));
        if (!sizeof($hash))
        {
            $this->_error('Invalid proposal specified: The specified proposal does not appear to exist');
        }

        $hash = $hash[0];
        $visits = $this->calendarData->getCalendarVisitsData($hash['CKEY'], $hash['BEAMLINE']);
        $users = $this->calendarData->getUserData($hash['CKEY'], $hash['BEAMLINE']);

        $output = $this->generateOutput($visits, $users, $hash['BEAMLINE']);
        $this->app->contentType("text/calendar; charset=utf-8");
        $this->app->response()->body("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n$output\r\nEND:VCALENDAR\r\n");
    }

    private function generateOutput($visits, $users, $forBeamline)
    {
        $output = '';
        foreach ($visits as $v)
        {
            $title = $v['VIS'] . ($v['LC'] ? ' LC: ' . $v['LC'] : '');
            if (!$forBeamline)
            {
                $title = $v['BL'] . ': ' . $title;
            }

            $us = '';
            if (array_key_exists($v['SESSIONID'], $users))
            {
                foreach ($users[$v['SESSIONID']] as $u)
                {
                    $us .= 'ATTENDEE;CN="' . $u['FULLNAME'] . "\":MAILTO:" . $u['ROLE'] . "\r\n";
                }
            }

            $st = strtotime($v['D'] . ' ' . $v['ST']);
            $en = strtotime($v['E'] . ' ' . $v['EN']);
            $output .= "BEGIN:VEVENT\r\nDTSTAMP:" . date('Ymd\THi', $st) . "00Z\r\nDTSTART:" . date('Ymd\THi', $st) . "00Z\r\nDTEND:" . date('Ymd\THi', $en) . "00Z\r\nSUMMARY:" . $title . "\r\n" . $us . "\r\nEND:VEVENT\r\n";
        }
        return $output;
    }
}