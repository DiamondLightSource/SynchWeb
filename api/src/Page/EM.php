<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Queue;

/**
 * The "controller" for all EM specific endpoints
 *
 * In trying to control the size of this, parts are split into traits
 * covering specific areas.
 *
 * @SuppressWarnings(PHPMD.ShortClassName)
 * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
 */
class EM extends Page
{
    use \SynchWeb\Page\EM\Attachments;
    use \SynchWeb\Page\EM\Classification;
    use \SynchWeb\Page\EM\Config;
    use \SynchWeb\Page\EM\Ctf;
    use \SynchWeb\Page\EM\DataCollection;
    use \SynchWeb\Page\EM\MotionCorrection;
    use \SynchWeb\Page\EM\Picker;
    use \SynchWeb\Page\EM\ProcessingJobs;
    use \SynchWeb\Page\EM\Relion;
    use \SynchWeb\Page\EM\Scipion;
    use \SynchWeb\Page\EM\Session;
    use \SynchWeb\Page\EM\Stats;

    public static $arg_list = array(
        'id' => '\d+',
        'ids' => '\d+',
        'visit' => '\w+\d+-\d+',
        'session' => '\w+\d+-\d+',
        'n' => '\d+',
        't' => '\d+',
        'IMAGENUMBER' => '\d+',
        'movieNumber' => '\d+',
        'processingJobId' => '\d+',

        // SCIPION
        'numberOfIndividualFrames' => '\d+', // Integer
        'patchX' => '\d+', // Integer
        'patchY' => '\d+', // Integer
        'samplingRate' => '\d*(\.\d+)?', // Decimal
        'particleSize' => '\d+', // Integer
        'minDist' => '\d+', // Integer
        'windowSize' => '\d+', // Integer
        'findPhaseShift' => '1?', // Boolean
        'dosePerFrame' => '\d*(\.\d+)?', // Decimal
    );

    public static $dispatch = array(
        array('/aps', 'post', '_ap_status'),
        array('/mc/fft/image/:id(/n/:IMAGENUMBER)(/t/:t)', 'get', '_mc_fft'),

        // See Synchweb\Page\EM\ProcessingJobs
        array('/jobs/:id', 'get', 'processingJobs'),

        // See Synchweb\Page\EM\Attachments
        array('/attachments/:id', 'get', 'attachmentsGetAll'),
        array('/attachment/:id', 'get', 'attachmentsGetOne'),

        // See Synchweb\Page\EM\MotionCorrection
        array('/mc/:id', 'get', 'motionCorrectionMovies'),
        array('/mc/:id/n/:movieNumber', 'get', 'motionCorrectionResult'),
        array('/mc/drift/:id(/n/:movieNumber)', 'get', 'motionCorrectionDriftPlot'),
        array('/mc/snapshot/:id(/n/:movieNumber)', 'get', 'motionCorrectionSnapshot'),

        // See Synchweb\Page\EM\Ctf
        array('/ctf/:id', 'get', 'ctfMovies'),
        array('/ctf/:id/n/:movieNumber', 'get', 'ctfResult'),
        array('/ctf/image/:id(/n/:movieNumber)', 'get', 'ctfImage'),
        array('/ctf/summary/:id', 'get', 'ctfSummary'),

        // See SynchWeb\Page\EM\Picker:
        array('/picker/:id', 'get', 'pickerMovies'),
        array('/picker/:id/n/:movieNumber', 'get', 'pickerResult'),
        array('/picker/image/:id(/n/:movieNumber)', 'get', 'pickerImage'),

        // See SynchWeb\Page\EM\Classification:
        array('/classification/:id', 'get', 'classificationResult'),
        array('/classification/image/:id', 'get', 'classificationImage'),

        // See Synchweb\Page\EM\DataCollection
        array('/dc/schema/', 'get', 'dataCollectionSchema'),
        array('/dc/new/:session', 'post', 'dataCollectionCreate'),
        array('/dc/:id', 'get', 'dataCollectionGet'),
        array('/dc/comments/:id', 'post', 'dataCollectionComments'),

        // See Synchweb\Page\EM\Stats
        array('/stats/ctf', 'get', 'statsCtf'),
        array('/stats/mc', 'get', 'statsMcDrift'),

        // See Synchweb\Page\EM\Relion
        array('/relion/schema/', 'get', 'relionSchema'),
        array('/relion/start/:session', 'post', 'relionStart'),
        array('/process/relion/session/:session', 'get', 'relionStatus'),
        array('/process/relion/job/:processingJobId', 'patch', 'relionStop'),
        array('/relion/parameters', 'get', 'relionParameters'),

        // See Synchweb\Page\EM\Scipion
        array('/process/scipion/session/:session', 'post', 'scipionStart')
    );

    private function enqueue($zocalo_queue, $zocalo_message)
    {
        global $zocalo_server, $zocalo_username, $zocalo_password;

        if (empty($zocalo_server) || empty($zocalo_queue)) {
            $message = 'Zocalo server not specified.';
            error_log($message);
            $this->_error($message, 500);
        }

        try {
            $queue = new Queue($zocalo_server, $zocalo_username, $zocalo_password);
            $queue->send($zocalo_queue, $zocalo_message, true, $this->user->login);
        } catch (Exception $e) {
            $this->_error($e->getMessage(), 500);
        }
    }

    private function paginationArguments($args)
    {
        $perPage = $this->has_arg('per_page') ?
            $this->arg('per_page') : 15;
        $page = ($this->has_arg('page') && $this->arg('page') > 0) ?
            $this->arg('page') - 1 : 0;

        array_push($args, $page * $perPage); // Offset
        array_push($args, $perPage);         // Row Count

        return $args;
    }

    private function sendImage($file)
    {
        $this->browserCache();
        $this->app->response->headers->set('Content-length', filesize($file));
        $this->app->contentType('image/' . pathinfo($file, PATHINFO_EXTENSION));
        readfile($file);
    }

    private function sendDownload($file)
    {
        $this->browserCache();
        $pathInfo = pathinfo($file);
        $this->app->response->headers->set('Content-length', filesize($file));
        $this->app->response->headers->set(
            'Content-Disposition',
            'attachment; filename="' . $pathInfo['basename']
        );
        $this->app->contentType('application/' . $pathInfo['extension']);
        readfile($file);
    }

    private function browserCache()
    {
        $expires = 60 * 60 * 24 * 14;
        $this->app->response->headers->set(
            'Pragma',
            'public'
        );
        $this->app->response->headers->set(
            'Cache-Control',
            'maxage=' . $expires
        );
        $this->app->response->headers->set(
            'Expires',
            gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT'
        );
    }

    ////////////////////////////////////////////////////////////////////////////

    public function _mc_fft()
    {
        $im = $this->has_arg('n') ? $this->arg('n') : 1;
        $t = $this->has_arg('t') ? 2 : 1;

        $imgs = $this->db->pq("SELECT mc.fftcorrectedfullpath, mc.fftfullpath
                FROM motioncorrection mc
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                WHERE dc.datacollectionid = :1 AND m.movienumber = :2", array($this->arg('id'), $im));

        if (!sizeof($imgs)) $this->_error('No such fft');
        $img = $imgs[0];

        $file = $t == 2 ? $img['FFTCORRECTEDFULLPATH'] : $img['FFTFULLPATH'];

        if (file_exists($file)) {
            $this->sendImage($file);

        } else {
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
        }
    }

    function _ap_status()
    {
        if (!($this->has_arg('visit') || $this->has_arg('prop'))) $this->_error('No visit or proposal specified');

        $where = array();
        $ids = array();
        if ($this->has_arg('ids')) {
            if (is_array($this->arg('ids'))) {
                foreach ($this->arg('ids') as $i) {
                    array_push($ids, $i);
                    array_push($where, 'm.datacollectionid=:' . sizeof($ids));
                }
            }
        }

        if (!sizeof($ids)) {
            $this->_output(array());
            return;
        }

        $where = '(' . implode(' OR ', $where) . ')';

        if ($this->has_arg('visit')) {
            $where .= " AND CONCAT(p.proposalcode,p.proposalnumber,'-',s.visit_number) LIKE :" . (sizeof($ids) + 1);
            array_push($ids, $this->arg('visit'));
        } else {
            $where .= " AND s.proposalid = :" . (sizeof($ids) + 1);
            array_push($ids, $this->proposalid);
        }

        $statuses = array();
        foreach ($this->arg('ids') as $d) {
            $statuses[$d] = array('ID' => $d, 'MC' => array(), 'CTF' => array());
        }

        $mc = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM motioncorrection mc
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = mc.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($mc as $m) {
            $statuses[$m['DATACOLLECTIONID']]['MC'][$m['MOVIENUMBER']] = $m['PROCESSINGSTATUS'];
        }

        $ctf = $this->db->pq("SELECT app.processingstatus, m.movienumber, dc.datacollectionid
                FROM ctf c
                INNER JOIN motioncorrection mc ON mc.motioncorrectionid = c.motioncorrectionid
                INNER JOIN autoprocprogram app ON app.autoprocprogramid = c.autoprocprogramid
                INNER JOIN movie m ON m.movieid = mc.movieid
                INNER JOIN datacollection dc ON dc.datacollectionid = m.datacollectionid
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                INNER JOIN blsession s ON s.sessionid = dcg.sessionid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE $where", $ids);

        foreach ($ctf as $c) {
            $statuses[$c['DATACOLLECTIONID']]['CTF'][$c['MOVIENUMBER']] = $c['PROCESSINGSTATUS'];
        }

        $this->_output(array_values($statuses));
    }
}
