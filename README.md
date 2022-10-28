# SynchWeb
SynchWeb is an ISPyB web application which consists of a PHP REST API and a Backbone/Marionette javascript client.
The client includes some newer components written in Vue.js

Read More: https://diamondlightsource.github.io/SynchWeb/

## Installation
Running SynchWeb requires setting up a Linux, Apache, MariaDB and PHP (LAMP) software stack. If running in production you should configure your Apache and PHP to serve secure pages only. The steps below describe how to build the software so it is ready to deploy onto your target server.

For development, a simple environment can be setup by using scripts provided 
[here](https://github.com/DiamondLightSource/synchweb-devel-env). Support is provided for both 
containerisation and the use of VMs. VS Code provides a good development environment for working
with the SynchWeb codebase.  PHP Tools extension provides intellisense, debugging, formatting, 
linting and support for unit tests. Vetur and Volar extensions provide support for working with 
the Vue.js code.

### Requirements
To build SynchWeb on a machine you will need [npm](https://docs.npmjs.com/) and [composer](https://getcomposer.org/)

You will also need an appropriate version of PHP on the build machine.

If not using the development VMs you will also need an instance of the ISPyB database - see [here](https://github.com/DiamondLightSource/ispyb-database).

### Check out the code
```sh
$ git clone https://github.com/DiamondLightSource/SynchWeb
```

### Customise front end - config.json
An example configuration is provided in `client/src/js/config_sample.json`
This file should be copied to create a `client/src/js/config.json` file and edited to customise the application for your site.

| Parameter | Description |
| ------ | ------ |
| apiurl | Base API root path of back end services e.g. /api |
| appurl | Base API root path of client app, normally not required ""|
| production | deprecated with webpack build |
| build | git hash of current build, used if dynamic reload of pages required post deployment|
| pucks | Array that lists default number of puck positions in sample changers for beamlines |
| gsMajorAxisOrientation | Determines whether the major grid scan axis determines the orientation of the view |
| maintenance_message | Can be used so app serves static page under maintenance periods |
| maintenance | Flag to indicate if client is in maintenance mode|
| ga_ident | Google Analytics id|
| site_name | Site Name to display in footer |
| site_link | URL to site home page |
| data_catalogue | Object that includes name and url property for a link to a data catalogue - displayed on the landing page |

Site Image can be customised via the tailwind.config.js header-site-logo and footer-site-logo values.

### Build front end
See package.json for the full list of commands that can be run.

```sh
$ cd SynchWeb/client
$ npm install
$ npm run build
```

### Customise back end - config.php
An example configuration is provided in `api/config_sample.php`.  This should be copied to
`api/config.php` and updated to include appropriate configuration details.

Main items to change include:
- database connection parameters (user, password, host, port)
- authentication type (cas, ldap, dummy/no authentication)

### Build back end
```sh
$ cd SynchWeb/api
$ composer install
```

### Run back end tests
Tests are available for the PHP code under `api/tests`.  To run these, go to the `api` directory and use:

```sh
$ cd SynchWeb/api
$ ./vendor/bin/phpunit --verbose -c /tests/phpunit.xml
```
Note, a single test can be run by specifying that instead of the `tests` directory.  Tests
will also produce a coverage report - this can be disabled by specifying `--no-coverage` when
running the tests.

### Debugging back end tests
It is possible to debug the php tests.  Install xdebug and using an IDE such as VS Code.  You
can then start the debugger in the IDE and put break points in the code.  Running the tests
(from the command line or within VS Code) will trigger the debugger and execution will be
halted on break points or specified error types.

### Run front end tests for Vue.js
Testing on the front end is restricted to the newer Vue.js code as it is 
anticipated that the older code will eventually be migrated to this form.
To run these tests, 

```sh
$ cd SynchWeb/client
$ npm run test
```

## Developing the client application
It is possible to run the client code on a local machine and connect to an existing SynchWeb installation on a server.
The steps required are to build the front end code and then run a webpack dev server to host the client code.
```sh
$ cd SynchWeb/client
$ npm run build:dev
$ npm run serve -- --env.port=8080 --env.proxy.target=http://192.168.33.10
```
In this example a browser pointed at localhost:8080 will connect to a SynchWeb back end on 192.168.33.10. Don't ignore the middle '--' otherwise the dev server will not receive the arguments!

The command line options available are described in this table. These override the defaults set in webpack.config.js.

| Parameter | Description |
| ------ | ------ |
| env.port | Webpack dev server port |
| env.proxy.target | Full address of the SynchWeb PHP backend server (can include port if required) |
| env.proxy.secure | Flag to set if connecting to an https address for the SynchWeb backend |

## Continuous Integration
Basic CI is included via the GitHub workflows functionality, defined by
`.github/workflows/ci.yml`.  Currently this will run whenever a branch change or
pull request is pushed to `master`.  The workflow will run two parallel jobs:

* Checkout the SynchWeb code - for the PHP build
  1. Install the correct version of PHP
  1. Validate the `composer.json` file
  1. Set up a cache for the composer dependencies
  1. Install the required composer dependencies
  1. Run the PHP unit tests - using PHPUnit
  1. Run linting against the PHP code, using PSalm
* Checkout the SynchWeb code - for the JavaScript build
  1. Install npm dependencies (using `ci` mode)
  1. Build the JavaScript bundle
  1. Run Vue unit tests
  1. Run basic JavaScript linting
  1. Run Vue linting

Note, currently the workflows will not fail if linting errors or warnings are 
encountered - this is to enable an initial period of tidying to be enacted.  Once 
the code is in a suitable state, the rules should be tightened to prevent changes 
that introduce new issues.

## Work in Progress
The codebase is currently subject to some degree of refactoring.  The front end is being gradually 
migrated away from its Backbone/Marionette origins to use Vue.js instead.  Additionally, the
PHP back end is being updated to have a more structured form - breaking down the Page monolith 
classes into a more layered architecture - with data layer services under the `Model` folder, and
controller/service classes under the `Controllers` folder.  The intention here is to isolate data
access code in a separate layer to allow a more formal API to be identified and to decouple the code
to simplify testing and maintenance.  The `Controllers` code currently combines what could be 
further split into separate controller and service classes if this was deemed worthwhile (e.g. to 
facilitate code reuse).  Dependency injection is being introduced (see `index.php`) using the Slim
framework.  This could potentially be simplified if common conventions are introduced (e.g. similar 
to those used in `Dispatch.php` for setting up the original routes).  Once more formal APIs are 
identified, it may make sense to introduce proper interfaces to codify these.  Swagger-like tools 
can then be used to improve documentation and testing of exposed web APIs.

### Acknowledgements
----------------
If you make use of code from this repository, please reference:
Fisher et al., J. Appl. Cryst. (2015). 48, 927-932, doi:10.1107/S1600576715004847
https://journals.iucr.org/j/issues/2015/03/00/fs5101/index.html
