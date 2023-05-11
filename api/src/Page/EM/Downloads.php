<?php

namespace SynchWeb\Page\EM;

trait Downloads
{
    private function sendImage($file)
    {
        if (!$file || !file_exists($file)) {
            error_log("File: $file not found");
            $this->app->contentType('image/png');
            readfile('assets/images/no_image.png');
            return;
        }

        $this->browserCache();
        $this->app->response->headers->set('Content-length', filesize($file));
        $this->app->contentType('image/' . pathinfo($file, PATHINFO_EXTENSION));
        readfile($file);
    }

    private function sendDownload($file)
    {
        if (!file_exists($file)) {
            error_log("File: $file not found");
            $this->_error('No such document');
        }

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
}
