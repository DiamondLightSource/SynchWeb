require('dotenv').config()
const { startDevServer } = require('@cypress/webpack-dev-server')
const webpackConfig = require('../../webpack.config.js')
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.env.apiUrl = process.env.VUE_APP_API_URL
  config.env.appUrl = process.env.VUE_APP_URL
  config.env.baseUrl = process.env.VUE_APP_URL
  config.env.username = process.env.VUE_APP_USERNAME
  config.env.password = process.env.VUE_APP_PASSWORD

  on('dev-server:start', async(options) => {
    return startDevServer({
      options,
      webpackConfig
    })
  })

  return config
}
