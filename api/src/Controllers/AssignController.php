<?php

namespace SynchWeb\Controllers;

use Slim\Slim;

use SynchWeb\Page;
use SynchWeb\Model\Services\AssignData;

class AssignController extends Page
{
    private $assignData;

    public static $arg_list = array('visit' => '\w+\d+-\d+', 'cid' => '\d+', 'did' => '\d+', 'pos' => '\d+', 'bl' => '[\w\-]+');

    public static $dispatch = array(
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
        global $only_staff_can_assign;
        $cs = $this->assignData->getContainer($this->arg('visit'), $this->arg('cid'));
        if (sizeof($cs) > 0)
        {
            $bl = $cs[0]['BEAMLINENAME'];
            if (is_array($only_staff_can_assign) && array_key_exists($bl, $only_staff_can_assign) && $only_staff_can_assign[$bl] == true && !$this->staff) {
                $this->_error("Only staff can assign containers on this beamline");
            } else {
                $this->assignData->assignContainer($cs[0], $this->arg('pos'));
                $this->_output(1);
            }
        }
        else
        {
            $this->_output(0);
        }
    }

    function unassignContainer()
    {
        global $only_staff_can_assign;
        $cs = $this->assignData->getContainer($this->arg('visit'), $this->arg('cid'));

        if (sizeof($cs) > 0)
        {
            $bl = $cs[0]['BEAMLINENAME'];
            if (is_array($only_staff_can_assign) && array_key_exists($bl, $only_staff_can_assign) && $only_staff_can_assign[$bl] == true && !$this->staff) {
                $this->_error("Only staff can unassign containers on this beamline");
            } else {
                $this->assignData->unassignContainer($cs[0]);
                $this->_output(1);
            }
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
    # Puck names from puck scanner
    # BL03I-MO-ROBOT-01:PUCK_01_NAME
    function getPuckNames()
    {
        global $bl_puck_names;
        session_write_close();
        if (!$this->has_arg('prop'))
            $this->_error('No proposal specified');

        if (!$this->has_arg('bl'))
            $this->_error('No beamline specified');
        if (!array_key_exists($this->arg('bl'), $bl_puck_names))
            $this->_error('No such beamline');
        $pv_names = $bl_puck_names[$this->arg('bl')];

        $pvs = array();
        for ($i = 1; $i < 38; $i++)
        {
            array_push($pvs, sprintf($pv_names, $i));
        }

        $rows = $this->assignData->getContainerBarcodesForProposal($this->proposalid);
        $codes = array();
        foreach ($rows as $r)
        {
            array_push($codes, rtrim($r['BARCODE']));
        }

        $return = array();
        $vals = $this->pv(array_values($pvs), true, true);
        foreach ($vals as $k => $v)
        {
            $zero_id = array_search($k, $pvs);
            if ($zero_id !== false)
            {
                if (is_array($v) && sizeof($v))
                {
                    $val = (!in_array($v[0], $codes) && !$this->staff) ? '[Loaded]' : $v[0];
                }
                else
                    $val = '';
                array_push($return, array('id' => $zero_id+1, 'name' => $val));
            }
        }

        $this->_output($return);
    }
}
