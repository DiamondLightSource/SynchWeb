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

use Slim\Slim;
use SynchWeb\Authentication\AuthenticationService;
use SynchWeb\Model\Services\AuthenticationData;
use SynchWeb\ImagingShared;
use SynchWeb\Database\DatabaseFactory;
use SynchWeb\Database\DatabaseConnectionFactory;
use SynchWeb\Dispatch;

require 'vendor/autoload.php';

require 'config.php';

date_default_timezone_set($timezone);

session_cache_limiter(false);

$app = setupApplication($app, $mode);

register_shutdown_function('session_write_close'); // prevents unexpected effects when using objects as save handlers

setupDependencyInjectionContainer($app, $isb, $port);

$auth = $app->container['auth'];
$auth->validateAuthentication();
$auth->updateActivityTimestamp();

$app->container['dispatch']->dispatch();

function setupApplication($app, $mode): Slim
{
    $app = new Slim(array(
        'mode' => $mode == 'production' ? 'production' : 'development'
    ));

    $app->configureMode('production', function () use ($app) {
        $app->config(array(
            'log.enable' => true,
            'debug' => false
        ));
    });

    $app->configureMode('development', function () use ($app) {
        $app->config(array(
            'log.enable' => false,
            'debug' => true
        ));
    });

    $app->get('/options', function () use ($app) {
        global $motd, $authentication_type, $cas_url, $cas_sso, $package_description,
        $facility_courier_countries, $facility_courier_countries_nde,
        $dhl_enable, $dhl_link, $scale_grid, $preset_proposal, $timezone,
        $valid_components, $enabled_container_types;
        $app->contentType('application/json');
        $app->response()->body(json_encode(array(
            'motd' => $motd,
            'authentication_type' => $authentication_type,
            'cas_url' => $cas_url,
            'cas_sso' => $cas_sso,
            'package_description' => $package_description,
            'facility_courier_countries' => $facility_courier_countries,
            'facility_courier_countries_nde' => $facility_courier_countries_nde,
            'dhl_enable' => $dhl_enable,
            'dhl_link' => $dhl_link,
            'scale_grid' => $scale_grid,
            'preset_proposal' => $preset_proposal,
            'timezone' => $timezone,
            'valid_components' => $valid_components,
            'enabled_container_types' => $enabled_container_types
        )));
    });
    return $app;
}

function setupDependencyInjectionContainer($app, $isb, $port)
{
    $app->container->singleton('db', function () {
        $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
        return $dbFactory->get();
    });

    $app->container->singleton('authData', function () use ($app) {
        return new AuthenticationData($app->container['db']);
    });

    $app->container->singleton('auth', function () use ($app) {
        return new AuthenticationService($app, $app->container['authData']);
    });

    $app->container->singleton('user', function () use ($app) {
        return $app->container['auth']->getUser();
    });

    $app->container->singleton('imagingShared', function () use ($app) {
        return new ImagingShared($app->container['db']);
    });

    $app->container->singleton('dispatch', function () use ($app) {
        return new Dispatch($app, $app->container['db'], $app->container['user']);
    });
}