<!DOCTYPE html>

<html>
    
    <head>

        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />
        <meta name="viewport" content="initial-scale=1.0"/>
        
        <link rel="icon" type="image/ico" href="<%= htmlWebpackPlugin.options.jsonConfig.appurl %>/favicon.ico" />
        
        <title><%= htmlWebpackPlugin.options.title %></title>
               
        <% if (htmlWebpackPlugin.options.jsonConfig.ga_ident) { %>
        <script type="text/javascript">
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
         
          ga('create', '<%= htmlWebpackPlugin.options.jsonConfig.ga_ident %>', 'auto');
          ga('send', 'pageview');
        </script>
        <% } %>

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
                <% if ( htmlWebpackPlugin.options.jsonConfig.maintenance ) { %>
                    <a class="icon"><i class="fa fa-2x fa-home"></i>&nbsp;</a>
                <% } %>
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
                        <% if ( htmlWebpackPlugin.options.jsonConfig.maintenance ) { %>
                            <h1>Scheduled Maintenance</h1>
                            <p><%= htmlWebpackPlugin.options.jsonConfig.maintenance_message %></p>
                            <br />
                        <% } %>
                    </div>
                </div>
            </div>
        
            <div id="footer">
                <div class="whatnow">
                    <a href="http://diamondlightsource.github.io/SynchWeb/">SynchWeb? What is This?</a>
                </div>
                <p><a href="<%= htmlWebpackPlugin.options.jsonConfig.site_link || 'https://www.diamond.ac.uk' %>"><%- htmlWebpackPlugin.options.jsonConfig.site_name || 'Diamond Light Source' %></a> &copy;2013-<script>document.write(new Date().getFullYear())</script></p>
            </div>
        
        </div>
    </body>
</html>
