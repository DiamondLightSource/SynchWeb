<?php

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Download;
use ZipArchive;
use \phpmock\phpunit\PHPMock;

final class DownloadTest extends TestCase
{
    private $mocked_files;
    private $tempFile;
    private $downloadStub;
    private $mocked_file_test;

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

    public function setUp(): void
    {
        $this->downloadStub = $this->createPartialMock(Download::class, []);

        $this->mocked_file_test = sys_get_temp_dir() . "/mocked_files";
        $this->mocked_files = [
            [
                "FILEPATH" => $this->mocked_file_test,
                "FILENAME" => "file1.txt",
                "FILECONTENT" => 'This is file 1.'
            ],
            [
                "FILEPATH" => $this->mocked_file_test,
                "FILENAME" => "file2.txt",
                "FILECONTENT" => 'This is file 2.'
            ],
        ];

        foreach ($this->mocked_files as $mocked_file) {
            $this->write_file($mocked_file["FILEPATH"], $mocked_file["FILENAME"], $mocked_file["FILECONTENT"]);
        }

        $this->tempFile = tempnam(sys_get_temp_dir(), 'zip');
    }

    function tearDown(): void
    {
        // Clean up the temporary file.
        unlink($this->tempFile);

        // Delete mocked files
        $files = glob($this->mocked_file_test . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }

        rmdir($this->mocked_file_test);
    }
    
    /**
     * @runInSeparateProcess
     */
    public function testDownload()
    {

        ob_start();
        $this->downloadStub->_streamZipFile($this->mocked_files, "finalZip");
        ob_get_clean();

        file_put_contents($this->tempFile, $this->getActualOutput());

        $zip = new ZipArchive();
        $result = $zip->open($this->tempFile);

        $this->assertTrue($result, 'Failed to open the zip file, return should be true.');

        $this->assertEquals(2, $zip->numFiles, 'The zip file does not contain the expected number of files.');

        foreach ($this->mocked_files as $mocked_file) {
            $filename = $mocked_file['FILENAME'];
            $fileContents = $zip->getFromName($filename);
            $this->assertNotNull($fileContents, $filename . ' not found in the zip file.');
            $this->assertEquals($mocked_file['FILECONTENT'], $fileContents, 'The contents of ' . $filename . ' are not as expected.');
        }

        $zip->close();
        
    }

}
