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
use SynchWeb\Controllers\AuthenticationController;
use SynchWeb\Controllers\UserController;
use SynchWeb\Controllers\AssignController;
use SynchWeb\Model\Services\AuthenticationData;
use SynchWeb\Model\Services\UserData;
use SynchWeb\Model\Services\AssignData;
use SynchWeb\Database\DatabaseFactory;
use SynchWeb\Database\DatabaseConnectionFactory;
use SynchWeb\Database\DatabaseParent;
use SynchWeb\ImagingShared;
use SynchWeb\Dispatch;
use SynchWeb\Options;

require 'vendor/autoload.php';

require 'config.php';

date_default_timezone_set($timezone);

session_cache_limiter(false);

$app = setupApplication($mode);

register_shutdown_function('session_write_close'); // prevents unexpected effects when using objects as save handlers

setupDependencyInjectionContainer($app);

$auth = $app->container['auth'];
$auth->validateAuthentication();
$auth->updateActivityTimestamp();

$app->container['dispatch']->dispatch();

function setupApplication($mode): Slim
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
        global $motd, $authentication_type, $cas_url, $cas_sso, $sso_url, $package_description,
            $facility_courier_countries, $facility_courier_countries_nde, $facility_courier_countries_link,
            $dhl_enable, $scale_grid, $scale_grid_end_date, $preset_proposal, $timezone,
            $valid_components, $enabled_container_types, $ifsummary, $synchweb_version, $redirects,
            $shipping_service_app_url, $use_shipping_service_redirect, $use_shipping_service_redirect_incoming_shipments,
            $dials_rest_url;
        $app->contentType('application/json');
        $options = $app->container['options'];
        $app->response()->body(json_encode(array(
            'motd' => $options->get('motd', $motd),
            'authentication_type' => $authentication_type,
            'cas_url' => $cas_url,
            'cas_sso' => $cas_sso,
            'sso_url' => $sso_url,
            'package_description' => $package_description,
            'facility_courier_countries' => $facility_courier_countries,
            'facility_courier_countries_nde' => $facility_courier_countries_nde,
            'facility_courier_countries_link' => $facility_courier_countries_link,
            'dhl_enable' => $dhl_enable,
            'scale_grid' => $scale_grid,
            'scale_grid_end_date' => $scale_grid_end_date,
            'preset_proposal' => $preset_proposal,
            'timezone' => $timezone,
            'valid_components' => $valid_components,
            'enabled_container_types' => $enabled_container_types,
            'ifsummary' => $ifsummary,
            'synchweb_version' => $synchweb_version,
            'shipping_service_app_url' => $use_shipping_service_redirect || $use_shipping_service_redirect_incoming_shipments ? $shipping_service_app_url : null,
            'shipping_service_app_url_incoming' => $use_shipping_service_redirect_incoming_shipments ? $shipping_service_app_url : null,
            'dials_rest_url' => $dials_rest_url,
            'redirects' => $redirects
        )));
    });
    return $app;
}

function setupDependencyInjectionContainer($app)
{
    $app->container->singleton('db', function () use ($app): DatabaseParent {
        $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
        $db = $dbFactory->get();
        $db->set_app($app);
        return $db;
    });

    $app->container->singleton('dbsummary', function () use ($app): DatabaseParent {
        $dbFactory = new DatabaseFactory(new DatabaseConnectionFactory());
        $db = $dbFactory->get("summary");
        $db->set_app($app);
        return $db;
    });

    $app->container->singleton('authData', function () use ($app) {
        return new AuthenticationData($app->container['db']);
    });

    $app->container->singleton('auth', function () use ($app) {
        return new AuthenticationController($app, $app->container['authData']);
    });

    $app->container->singleton('user', function () use ($app) {
        return $app->container['auth']->getUser();
    });

    $app->container->singleton('userData', function () use ($app) {
        return new UserData($app->container['db']);
    });

    $app->container->singleton('userController', function () use ($app) {
        return new UserController($app, $app->container['db'], $app->container['user'], $app->container['userData']);
    });

    $app->container->singleton('assignData', function () use ($app) {
        return new AssignData($app->container['db']);
    });

    $app->container->singleton('assignController', function () use ($app) {
        return new AssignController($app, $app->container['db'], $app->container['user'], $app->container['assignData']);
    });

    $app->container->singleton('imagingShared', function () use ($app) {
        return new ImagingShared($app->container['db']);
    });

    $app->container->singleton('dispatch', function () use ($app) {
        return new Dispatch($app, $app->container['db'], $app->container['user']);
    });

    $app->container->singleton('options', function () use ($app) {
        return new Options($app->container['db']);
    });
}
