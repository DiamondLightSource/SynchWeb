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
        $this->downloadStub = $this->createPartialMock(Download::class, ['__get_autoproc_attachments', '_get_union']);

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
        if ($result == true) {
                $this->assertTrue($result, 'Failed to open the zip file.');
        
                $this->assertEquals(2, $zip->numFiles, 'The zip file does not contain the expected number of files.');
        
                $file1Contents = $zip->getFromName('file1.txt');
                $this->assertNotNull($file1Contents, 'file1.txt not found in the zip file.');
                $this->assertEquals('This is file 1.', $file1Contents, 'The contents of file1.txt are not as expected.');
        
                $file2Contents = $zip->getFromName('file2.txt');
                $this->assertNotNull($file2Contents, 'file2.txt not found in the zip file.');
                $this->assertEquals('This is file 2.', $file2Contents, 'The contents of file2.txt are not as expected.');
        
                $zip->close();
        } else {
            $this->fail("Failed to open the zip file. Zip file contents: " . $result);
        };
    }

}
