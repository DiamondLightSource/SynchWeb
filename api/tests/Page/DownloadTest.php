<?php

namespace SynchWeb;

use PHPUnit\Framework\TestCase;
use SynchWeb\Page\Download;
use React\EventLoop\Factory;
use React\ChildProcess\Process;
use ZipArchive;


final class DownloadTest extends TestCase
{

    private function countFilesInZipStream($zipFileStream)
    {
        $zip = new ZipArchive();
        if ($zip->open($zipFileStream) !== true) {
            return 0;
        }

        $numFiles = $zip->numFiles;
        $zip->close();

        return $numFiles;
    }

    private function getZipStreamFileContents($zipFileStream)
    {
        $zip = new ZipArchive();
        if ($zip->open($zipFileStream) !== true) {
            return [];
        }

        $fileContents = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            $fileContents[$filename] = $zip->getFromIndex($i);
        }

        $zip->close();

        return $fileContents;
    }

    /**
     * @runInSeparateProcess
     */
    public function testDownload()
    {

        // Download the zip file to a memory stream
        $loop = Factory::create();

        // Call the class method in a separate process.
        $process = new Process("php tests/Page/DownloadRun.php");

        $process->start($loop);

        $process->stdout->on('data', function ($result) {
            if ($result !== true) {
                switch ($result) {
                    case ZipArchive::ER_NOZIP:
                        $this->fail('The file is not a zip archive.');
                        break;
                    case ZipArchive::ER_INCONS:
                        $this->fail('The zip archive is inconsistent.');
                        break;
                    case ZipArchive::ER_CRC:
                        $this->fail('The file has a CRC error.');
                        break;
                    default:
                        $this->fail("Failed to open the zip file. Zip file contents: " . $result);
                        break;
                }
            }


            $tempFile = tempnam(sys_get_temp_dir(), 'zip');
            file_put_contents($tempFile, $result);
    
            $zip = new ZipArchive();
            $result = $zip->open($tempFile);

            if ($result === true) {
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
    
        // Clean up the temporary file.
        unlink($tempFile);

        });

        $process->on('exit', function ($exitCode) {
            echo "Process exited with code: " . $exitCode . PHP_EOL;
        });
        
        $loop->run();
        
        // Delete mocked files
        $dirPath = 'mocked_files';
        $files = glob($dirPath . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    
        rmdir($dirPath);
    }


}
