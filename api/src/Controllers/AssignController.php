<?php

namespace SynchWeb\Controllers;

use Slim\Slim;

use SynchWeb\Page;
use SynchWeb\Model\Services\AssignData;

class AssignController extends Page
{
    private $assignData;

    public static $arg_list = array('visit' => '\w+\d+-\d+', 'cid' => '\d+', 'did' => '\d+', 'pos' => '\d+', 'bl' => '[\w\-]+');

    public static $dispatch = array(array('/visits(/:visit)', 'get', 'getBeamlineVisits'),
            array('/assign', 'get', 'assignContainer'),
            array('/unassign', 'get', 'unassignContainer'),
            array('/deact', 'get', 'deactivateDewar'),
            array('/names', 'get', 'getPuckNames'),

    );

    function __construct(Slim $app, $db, $user, AssignData $assignData)
    {
        // Call parent constructor to register our routes
        parent::__construct($app, $db, $user);
        $this->app = $app;
        $this->assignData = $assignData;
    }

    function assignContainer()
    {
        $cs = $this->assignData->getContainer($this->arg('visit'), $this->arg('cid'), $this->arg('pos'));

        if (sizeof($cs) > 0)
        {
            $this->assignData->assignContainer($cs[0], $this->arg('pos'));
            $this->_output(1);
        }
        else
        {
            $this->_output(0);
        }
    }

    function unassignContainer()
    {
        $cs = $this->assignData->getContainer($this->arg('visit'), $this->arg('cid'), $this->arg('pos'));

        if (sizeof($cs) > 0)
        {
            $this->assignData->unassignContainer($cs[0]);
            $this->_output(1);
        }
        else
        {
            $this->_output(0);
        }
    }

    function deactivateDewar()
    {
        $ds = $this->assignData->getDewar($this->arg('did'), $this->proposalid, $this->def_arg('visit', null));

        if (sizeof($ds) > 0)
        {
            $this->assignData->deactivateDewar($this->arg('did'));
            $this->_output(1);
        }
        else
        {
            $this->_output(0);
        }
    }


    # ------------------------------------------------------------------------
    # Return visits for beamline
    function getBeamlineVisits($visit = null)
    {
        $visits = $this->blsr_visits();

        if ($visit)
        {
            foreach ($visits as $i => $v)
            {
                if ($v['VISIT'] == $visit)
                {
                    $this->_output($v);
                    return;
                }
            }
            $this->_error('No such visit');
        }
        else
            $this->_output($visits);
    }


    # ------------------------------------------------------------------------
    # Puck names from puck scanner
    # BL03I-MO-ROBOT-01:PUCK_01_NAME
    function getPuckNames()
    {
        global $bl_pv_map;
        session_write_close();
        if (!$this->has_arg('prop'))
            $this->_error('No proposal specified');

        if (!$this->has_arg('bl'))
            $this->_error('No beamline specified');
        if (!array_key_exists($this->arg('bl'), $bl_pv_map))
            $this->_error('No such beamline');
        $pv_prefix = $bl_pv_map[$this->arg('bl')];

        $pvs = array();
        for ($i = 1; $i < 38; $i++)
        {
            $id = $i < 10 ? '0' . $i : $i;
            array_push($pvs, $pv_prefix . '-MO-ROBOT-01:PUCK_' . $id . '_NAME');
        }

        $vals = $this->pv(array_values($pvs), true, true);

        $rows = $this->assignData->getContainerBarcodes($this->proposalid);
        $codes = array();
        foreach ($rows as $r)
        {
            array_push($codes, rtrim($r['BARCODE']));
        }

        $return = array();
        foreach ($vals as $k => $v)
        {
            if (preg_match('/PUCK_(\d+)_NAME/', $k, $mat))
            {
                if (is_array($v) && sizeof($v))
                {
                    $val = (!in_array($v[0], $codes) && !$this->staff) ? '[Loaded]' : $v[0];
                }
                else
                    $val = '';
                array_push($return, array('id' => intval($mat[1]), 'name' => $val));
            }
        }

        $this->_output($return);
    }
}