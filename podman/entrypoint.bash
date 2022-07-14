#!/bin/bash
# if this doesn't work as part of the Dockerfile, uncomment and run here
#cd /app/SynchWeb/api && /usr/local/bin/composer install
httpd -f /etc/httpd/conf/httpd.conf -k start
PHP_INI_SCAN_DIR=/opt/remi/php54/root/etc/php.d php-fpm -F -y /app/SynchWeb/php-fpm.conf -c /app/SynchWeb/php.ini
wait