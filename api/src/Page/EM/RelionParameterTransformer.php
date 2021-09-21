<?php

namespace SynchWeb\Page\EM;

class RelionParameterTransformer
{
    private $imageDirectory;
    private $fileTemplate;

    private $epuTemplate;
    private $serialEmTemplate;

    private $sessionPath;
    private $schema;

    private $parameters;

    public function __construct($sessionPath, $schema)
    {
        $this->sessionPath = $sessionPath;
        $this->epuTemplate = 'GridSquare_*/Data/*.';
        $this->serialEmTemplate = 'Frames/*.';
        $this->schema = $schema;
    }

    public function postParameters($input)
    {
        $this->setCommonData($input);
        $this->setImageDirectoryAndFileTemplate();
        $this->parameters['import_images'] = $this->imageDirectory . $this->fileTemplate;
        unset($this->parameters['import_images_dir']);
        unset($this->parameters['import_images_ext']);

        $gainReference = $this->gainReference();
        if ($gainReference) {
            $this->parameters['motioncor_gainreference'] = $this->session_path .
                '/processing/' . $gainReference;
        }

        if ($this->isFalse($this->parameters['stop_after_ctf_estimation'])) {
            $this->parameters['extract_downscale'] = true;
        }
        return $this->parameters;
    }

    public function fetchParameters($input)
    {
        $this->setCommonData($input);

        $halves = explode($this->fileTemplate, $this->parameters['import_images']);
        $pieces = explode('/', trim($halves[0], '/'));
        $this->parameters['import_images_ext'] = $halves[1];
        $this->parameters['import_images_dir'] = end($pieces);

        $gainReference = $this->gainReference();
        if ($gainReference) {
            $this->parameters['motioncor_gainreference'] = basename($gainReference);
        }

        return $this->parameters;
    }

    ////////////////////////////////////////////////////////////////////////////

    private function setCommonData($input)
    {
        $this->parameters = $input;

        $this->fileTemplate = $input['acquisition_software'] == 'EPU' ?
            $this->epuTemplate : $this->serialEmTemplate;
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Determine if a supposedly boolean variable is false
     *
     * When we fetch from the database, we get the string "false" for FALSE
     * which PHP evaluates to TRUE. This function avoids any ambiguity with
     * PHP's type system and checks for any of the possible FALSE values.
     *
     * @param mixed $value
     *
     * @return boolean
     */
    private function isFalse($value)
    {
        return in_array($value, array('false', '0', false, 0));
    }

    ////////////////////////////////////////////////////////////////////////////

    private function gainReference()
    {
        if (!array_key_exists('motioncor_gainreference', $this->parameters)) {
            return $this->schema['motioncor_gainreference']['default'];
        }

        $gainReference = $this->parameters['motioncor_gainreference'];

        return $gainReference ? $gainReference : false;
    }

    ////////////////////////////////////////////////////////////////////////////

    private function setImageDirectoryAndFileTemplate()
    {
        $this->imageDirectory = $this->sessionPath . '/' .
            $this->parameters['import_images_dir'] . '/';
        $this->fileTemplate .= $this->parameters['import_images_ext'];
    }

    public function getImageDirectory()
    {
        return $this->imageDirectory;
    }

    public function getFileTemplate()
    {
        return $this->fileTemplate;
    }
}
