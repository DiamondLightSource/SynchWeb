# SynchWeb Podman Production Environment

## Introduction

The following instructions allow a containerised Production environment for
running SynchWeb to be set up.  They create and run a Podman image which runs 
the SynchWeb backend code and hosts the frontend web client using httpd. For 
this to work, the `config.php` file included in this repo must be updated to 
include details specific to the Production environment - including valid 
connection string data to an ISPyB database - i.e. via the `$isb` variable. 

## Setup
1. Clone this repository: `git clone https://github.com/DiamondLightSource/SynchWeb.git`
1. Adjust `Dockerfile` to point to the correct release/branch to clone into the container
1. Add `config.php` to same directory as the `Dockerfile` - adjusting details as appropriate 
for the Production environment deployment (at a minimum setting a valid value for `$isb`)
1. Update `php.ini` to include any settings whose default values you
wish to override.
1. Generate SSL certificate and key (e.g. see [here](https://linuxconfig.org/how-to-generate-a-self-signed-ssl-certificate-on-linux)).
Place these in the same directory as the `Dockerfile`.  Note, the names should be `cert.pem` and `key.pem` - 
to match the `httpd.conf` configuration.
1. Ensure you have a valid ssh key set up for github.com access (required to retrieve
some DHL php libraries) - instructions [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).
1. Run `setup_synchweb_prod.bash` - note, this can take one input arg:
``` setup_synchweb.bash <image-name>```.
If no args are specified, an image called `synchweb-prod` is built and run.

This will run a container with the SynchWeb backend running and the frontend built
and hosted on an httpd server.  This will be available at `http://localhost:8082`.
The actual SynchWeb code will be downloaded locally and mounted into the container.

## Troubleshooting

If SynchWeb does not work as expected, review the following:

* Occasionally the podman image fails to build fully - i.e. errors are 
encountered in some of its configuration steps.  This, however, may not 
stop the image from being created.  As a result, the `setup_synchweb_prod.bash` script
forces a full build rebuild each time (using the `--no-cache` option) - so
rerunning may fix the problem.  Keep an eye out for errors in the output, 
anyway.
* One source of error in the above step is a failure to correctly download
some of the required dependencies.  This is usually down to network issues.
For Diamond users, it is recommended that the `sshuttle` vpn set up 
is running.
* Obtaining the DHL php libraries, via the `composer install` step is quite
unreliable if run from the `Dockerfile` (due to rate limiting on anonymous
requests).  If problems are encountered, comment
out this step and uncomment the equivalient in the `entrypoint.bash` file.
Alternatively, connect with a personal access token (generated 
[here](https://github.com/settings/tokens/new))
using `composer config --global http-basic.github.com <USERNAME> <TOKEN>`
* Once running, the podman container can be accessed by using, 
`podman exec -it synchweb-prod /bin/bash`.  From here, check the required
php and httpd processes are running and check the logs under
`/var/log/httpd`.
*  See [here](https://github.com/DiamondLightSource/synchweb-devel-env/blob/master/README.md) for more general advice.
