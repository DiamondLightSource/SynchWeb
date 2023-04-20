<?php declare(strict_types=1);

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Download;
use SynchWeb\Database\Type\MySQL;

final class DownloadTest extends TestCase
{
    use \phpmock\phpunit\PHPMock;

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

    private function captureOutput(callable $callback)
    {
        ob_start();
        $callback();
        $output = ob_get_clean();

        return $output;
    }

    /**
     * @runInSeparateProcess
     */
    public function testDownload()
    {
        $dbMock = $this->getMockBuilder(MySQL::class)
                        ->disableOriginalConstructor()
                       ->setMethods(['union'])
                       ->getMock();

        $mockedValue = [
            [
                "PROCESSINGPROGRAMS" => "789"
            ]
        ];

        $dbMock->method('union')->willReturn($mockedValue);

        $downloadStub = $this->getMockBuilder(Download::class)
                              ->disableOriginalConstructor()
                              ->setMethods(['__get_autoproc_attachments', '_get_union'])
                              ->getMock();

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

        $output = $this->captureOutput([$downloadStub, '_get_autoproc_archive']);

        $this->assertContains('Content-Type: application/octet-stream', $capturedHeaders);

        $tmpZipFile = tempnam(sys_get_temp_dir(), 'test_zip_');
        file_put_contents($tmpZipFile, $output);

        $zip = new ZipArchive();
        $opened = $zip->open($tmpZipFile);

        $this->assertTrue($opened);

        $this->assertEquals(count($mocked_files), $zip->numFiles);

        foreach($mocked_files as $mocked_file){
            $fileContents = $zip->getFromName($mocked_file["FILENAME"]);
            $this->assertEquals($mocked_file["FILECONTENT"], trim($fileContents));
        }

        $zip->close();
        unlink($tmpZipFile);
        
        # Delete mocked files
        rmdir('mocked');
    }


}
