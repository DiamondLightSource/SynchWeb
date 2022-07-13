FROM centos:7
 
WORKDIR /app
 
# Install httpd, PHP, node and required dependencies
RUN yum install wget git tar xz-utils httpd mod_ssl -y http://rpms.famillecollet.com/enterprise/remi-release-7.rpm && \
    sed -i 's/enabled=0/enabled=1/g' /etc/yum.repos.d/remi-php54.repo && \
    yum install -y php5.4 php54-php-mysql php54-php-mbstring php54-php-xml php54-php-gd php54-php-fpm php54-php-cli && \
    wget -qO- https://nodejs.org/dist/v16.13.2/node-v16.13.2-linux-x64.tar.xz | tar -xJ

# Add php & node to path
ENV PATH="${PATH}:/opt/remi/php54/root/usr/bin:/opt/remi/php54/root/usr/sbin:/app/node-v16.13.2-linux-x64/bin"

# Clone SynchWeb - Change branch/repo as needed here
RUN git clone -b master https://github.com/DiamondLightSource/SynchWeb.git

# Copy config files and startup script
COPY httpd.conf /etc/httpd/conf/
COPY entrypoint.bash ./entrypoint.bash
COPY php-fpm.conf php.ini ./SynchWeb/
COPY config.php ./SynchWeb/api/config.php

# Copy SSL certificates
RUN mkdir /etc/pki/tls/certs/synchweb && \
    mkdir /etc/pki/tls/private/synchweb
COPY cert.pem /etc/pki/tls/certs/synchweb/cert.pem
COPY key.pem /etc/pki/tls/private/synchweb/key.pem

# Adjust file access permissions
RUN chmod 744 /etc/httpd/conf/httpd.conf && \
    chmod 744 ./entrypoint.bash && \
    chmod 766 ./SynchWeb/api/config.php

# Build Frontend
RUN cd SynchWeb/client/ && \
    npm install && npm run build:dev && \
    export HASH=$(ls /app/SynchWeb/client/dist) && \ 
    ln -sf dist/${HASH}/index.html index.php && \
    rm -rf /app/node-v16.13.2-linux-x64


# Install Composer & Build Backend
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    rm ./composer-setup.php && \
    cd SynchWeb/api/ && \
    composer install && \
    rm /usr/local/bin/composer

# Set access port and startup script 
EXPOSE 8082
ENTRYPOINT ["/app/entrypoint.bash"]
