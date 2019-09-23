<!DOCTYPE html>
<?php

    /*
        Copyright 2015 Diamond Light Source <stuart.fisher@diamond.ac.uk>
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */

    date_default_timezone_set('Europe/London');

    $file = file_get_contents('js/config.json');
    $config = json_decode($file);

?>
<html>
    
    <head>

        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />
        <meta name="viewport" content="initial-scale=1.0"/>
        
        <link rel="icon" type="image/ico" href="<?php echo $config->appurl ?>/favicon.ico" />
        
        <link rel="stylesheet" href="<?php echo $config->appurl ?>/assets/font-awesome/css/font-awesome.min.css">

        <title><%= htmlWebpackPlugin.options.title %></title>
               
        <?php if ($config->ga_ident): ?>
        <script type="text/javascript">
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
         
          ga('create', '<?php echo $config->ga_ident ?>', 'auto');
          ga('send', 'pageview');
        </script>
        <?php endif; ?>

    </head>
    
    <body>
        <div id="dialog"></div>
        
        <div id="login">
            <iframe></iframe>
        </div>

        <div id="wrapper">
        
            <div id="header">
                <!--[if lte IE 11]>
                 <a class="icon"><i class="fa fa-2x fa-home"></i>&nbsp;</a>
                <![endif]-->
                <?php if ($config->maintenance): ?>
                    <a class="icon"><i class="fa fa-2x fa-home"></i>&nbsp;</a>
                <?php endif; ?>
            </div>
            <div id="sidebar"></div>

            <div class="cont_wrap">
                <div id="motd" class="content"></div>
                <div id="container">
                    <div class="content">
                    <!--[if lte IE 11]>
                        <div class="content">
                            <h1>Unsupported Browser</h1>
                            <p>Internet Explorer versions less than 11 are not supported. Please consider using <a href="http://www.mozilla.org/en-GB/firefox/new">Firefox</a> or <a href="http://www.google.co.uk/chrome">Chrome</a></p>
                        </div>
                    <![endif]-->
                        <?php if ($config->maintenance): ?>
                            <h1>Scheduled Maintenance</h1>
                            <p><?php echo $config->maintenance_message ?></p>
                            <br />
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        
            <div id="footer">
                <div class="whatnow">
                    <a href="http://diamondlightsource.github.io/SynchWeb/">SynchWeb? What is This?</a>
                </div>
                <p><a href="http://diamond.ac.uk">Diamond Light Source</a> &copy;2013-<?php echo date('Y') ?></p>
            </div>
        
        </div>
    </body>
</html>
