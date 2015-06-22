<?php

    namespace gen;

    class Image extends \Page {
        
        public static $arg_list = array('id' => '\d+', 'n' => '\d+', 'f' => '\d');

        public static $dispatch = array(array('/id/:id(/f/:f)(/n/:n)', 'get', '_image'),
        );
        
        # Snapshot viewer
        function _image() {
            if (!$this->has_arg('id')) return;
            
            $rows = $this->db->pq('SELECT dc.xtalsnapshotfullpath1 as x1, dc.xtalsnapshotfullpath2 as x2, dc.xtalsnapshotfullpath3 as x3, dc.xtalsnapshotfullpath4 as x4 FROM datacollection dc WHERE dc.datacollectionid=:1', array($this->arg('id')));
            
            if (sizeof($rows) > 0) {
                $r = $rows[0];
                $ims = array($r['X1'], $r['X2'], $r['X3'], $r['X4']);
                
                $n = $this->has_arg('n') ? $this->arg('n')-1 : 0;
                
                if (!($n < sizeof($ims))) return;
                
                if (file_exists($ims[$n])) {
                    $this->_browser_cache();
                    $this->app->contentType('image/png');
                    readfile($this->has_arg('f') ? $ims[$n] : preg_replace('/.png$/', 't.png', $ims[$n]));
                    
                } else {
                    $this->app->contentType('image/png');
                    readfile('assets/images/no_image.png');
                }
            } else {
                $this->app->contentType('image/png');
                readfile('assets/images/no_image2.png');
            }
        }
        
        # ------------------------------------------------------------------------
        # Enable browser cache for static images
        function _browser_cache() {
            $expires = 60*60*24*14;
            header('Pragma: public');
            header('Cache-Control: maxage='.$expires);
            header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
        }
        
    }

?>