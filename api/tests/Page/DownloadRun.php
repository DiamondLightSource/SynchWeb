<?php declare(strict_types=1);

namespace SynchWeb;

require 'vendor/autoload.php';

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Download;
use \phpmock\phpunit\PHPMock;

final class DownloadRun extends TestCase
{
    

    private $downloadStub;

    public function write_file($filePath, $fileName, $content)
    {
        $fullPath = $filePath . '/' . $fileName;

        if (!file_exists($filePath)) {
            mkdir($filePath, 0755, true);
        }
        $file = fopen($fullPath, 'w');
        fwrite($file, $content);
        fclose($file);

    }

    /**
     * @runInSeparateProcess
     */
    public function runDownload()
    {

        $downloadStub = $this->createPartialMock(Download::class, ['__get_autoproc_attachments', '_get_union']);

        $mocked_files = [
            [
                "FILEPATH" => "mocked_files",
                "FILENAME" => "file1.txt",
                "FILECONTENT" => 'This is file 1.'
            ],
            [
                "FILEPATH" => "mocked_files",
                "FILENAME" => "file2.txt",
                "FILECONTENT" => 'This is file 2.'
            ],           
        ];

        foreach($mocked_files as $mocked_file){
            $this->write_file($mocked_file["FILEPATH"], $mocked_file["FILENAME"], $mocked_file["FILECONTENT"]);
        }

        
        $downloadStub->method('__get_autoproc_attachments')->willReturn($mocked_files);

        $downloadStub->method('_get_union')->willReturn([
            [
                "PROCESSINGPROGRAMS" => "789"
            ]
        ]);


        $downloadStub->args = array(
            'prop' => '123',
            'AUTOPROCPROGRAMID' => '123'
        );

        ob_start();
        $downloadStub->_get_autoproc_archive();
        $bufferContents = ob_get_contents();
        ob_end_clean();
        return $bufferContents;
    }
}

$download_run = new DownloadRun();
return $download_run->runDownload();