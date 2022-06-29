import Vue from 'vue'
import Vuex from 'vuex'
import Backbone from 'backbone'

// VueX modules
// TODO - adopt vue-enterprise-boiler plate design
import AuthStore from './modules/store.auth.js'
import MenuStore from './modules/store.menus.js'
import ProposalStore from './modules/store.proposal.js'
import UserStore from './modules/store.user.js'
import NotificationStore from './modules/store.notifications.js'
import SamplesStore from './modules/store.samples.js'
import ShipmentStore from './modules/store.shipment.js'

// Configuration
import Options from 'models/options.js'
import config from 'config.json'

import MarionetteApplication from 'app/marionette-application.js'
import { resolve } from 'promise'
import { reject } from 'promise'

Vue.use(Vuex)
Vue.config.devtools = !config.production

const store = new Vuex.Store({
  modules: {
    auth: AuthStore,
    menu: MenuStore,
    proposal: ProposalStore,
    user: UserStore,
    notifications: NotificationStore,
    samples: SamplesStore,
    shipment: ShipmentStore
  },
  state: {
    // Flag we use to check if we have already setup options
    initialised: false,
    // Global api prefix
    apiUrl: config.apiurl,
    appUrl: config.appurl,

    isLoading: false,
    motd: '',
    help: false, // Global help flag used to denote if we should display inline help on pages
    skipHomePage: config.skipHome || false,
    models: {}
  },
  mutations: {
    // For future use - save a model to a specified name
    saveBackboneModel(state, payload) {
      console.log("Saving model " + payload.name + " = " + JSON.stringify(payload.model))
      if (payload.model) {
        Vue.set(state.models, payload.name, payload.model)
      }
    },

    setOptions(state, options) {
      state.auth.type = options.get('authentication_type')
      state.auth.cas_sso = options.get('cas_sso')
      state.auth.cas_url = options.get('cas_url')

      state.motd = options.get('motd') || state.motd

      app.options = options
    },
    setHelp(state, helpFlag) {
      state.help = !!helpFlag
      sessionStorage.setItem('ispyb_help', state.help)
    },
    //
    // Loading screen
    //
    loading(state, status) {
      state.isLoading = !!status
    },
  },
  actions: {
    // Initialise the Store
    // This will set the app object with values from prop and token on start
    // Also initialise marionette methods that require access to the store
    initialise({dispatch, commit}) {
      // Return immediately if we are already initialised
      if (this.state.initialised) return Promise.resolve(true)

      // May want to set initialised true early to avoid clash with router initialisation
      // this.state.initialised = true

      let application = MarionetteApplication.getInstance()

      application.initStateMapping(store)

      // Get any stored value from sessionStorage and set the app object
      var prop = sessionStorage.getItem('prop')
      var token = sessionStorage.getItem('token')

      if (token) commit('auth/authSuccess', token)

      const proposalPromise = dispatch('proposal/setProposal', prop)
      const optionsPromise = dispatch('getOptions')
      const userPromise = dispatch('user/getUser')

      return Promise.all([proposalPromise, optionsPromise, userPromise]).then( () => {
        console.log("Store is initialised OK")
        this.state.initialised = true
        resolve(true)
      }, () => {
        console.log("Error initailising store")
        reject()
      })
    },

    getOptions({commit}) {
        let options = new Options()

        return new Promise((resolve, reject) => {
          options.fetch({
            data: { t: new Date().getTime() },
            success: function() {
              commit('setOptions', options)
              resolve(true)
            },

            error: function() {
              console.log("Error getting options - no authentication information available")
              reject(false)
            },
          })
        })
    },
    log({commit}, url) {
      console.log("Store tracking url: " + url)
    },

    // Method that returns a collection promise
    // We may need to add further parameters for data queries
    // If so add destructuring to the payload {collection, params,...}
    getCollection(context, collection) {

      return new Promise((resolve, reject) => {
        if (!collection) reject(false)

        collection.fetch({
          success: function(result) {
            resolve(result)
          },

          error: function() {
            reject(false)
          },
        })
      })
    },
    // Method that creates a new collection
    // Note this will result in a POST to the server
    // Most backend endpoints do not seem to support PATCH to update collection in one hit
    // In future might need to provide more general sync method for collections
    // Params: collection is the Backbone collection being saved - same signature as saveModel
    // Example: store.dispatch('saveCollection', {collection: myCollection})
    saveCollection(context, {collection}) {

      return new Promise((resolve, reject) => {
        collection.save({
          success: function(result) {
            resolve(result)
          },

          error: function(err) {
            let response = err.responseJSON || {status: 400, message: 'Error saving collection'}
            reject(response)
          },
        })
      })
    },

    // Method that updates a collection
    // Note this will result in a PUT to the server
    // Most backend endpoints do not seem to support PATCH to update collection in one hit
    // In future might need to provide more general sync method for collections
    // Params: collection is the Backbone collection being saved - same signature as saveModel
    // Example: store.dispatch('updateCollection', { collection: myCollection })
    updateCollection(context, {collection}) {
      return new Promise((resolve, reject) => {
        collection.update({
          success: function(result) {
            resolve(result)
          },

          error: function(err) {
            let response = err.responseJSON || {status: 400, message: 'Error updating collection'}
            reject(response)
          },
        })
      })
    },

    // Method that returns a collection promise
    getModel(context, model) {

      return new Promise((resolve, reject) => {
        model.fetch({
          success: function(model) {
            // Could extend to return the response/options
            resolve(model)
          },

          error: function(model, response) {
            let err = response.responseJSON || {status: 400, message: 'Error getting model'}
            reject(err)
          },
        })
      })
    },
    // Method that saves a model to the server
    // Passing {} as first argument means save all...
    // Passing an attributes object with parameters will patch the model, rather than post
    // If the backbone model has an "ID" (as defined in it's Model class) and there are no attributes provided,
    // then save will be a PUT request rather than POST request
    // Example: store.dispatch('saveModel', {model: myModel, attributes: myAttributes})
    saveModel(context, { model, attributes }) {
      // If we have attributes, assume a patch request
      let patch = !!attributes
      let attrs = attributes || {}

      return new Promise((resolve, reject) => {
        model.save(attrs, {
          patch: patch,
          success: function(result) {
            resolve(result)
          },

          error: function(err) {
            let response = err.responseJSON || {status: 400, message: 'Error saving model'}
            reject(response)
          },
        })
      })
    },

    // fetch data from the backend that is not attached to any model
    async fetchDataFromApi({ state, commit, rootState }, { url, data, requestType }) {
      return await Backbone.ajax({
        url: app.apiurl + url,
        data,

        success: function(response) {
          return response
        },
        error: function() {
          commit('notifications/addNotification', {
            title: 'Error performing request',
            message: `There was an error ${requestType}`,
            level: 'error'
          }, {
            root: true
          })
        },
      })
    },
    // post data to the backend that is not attached to any model
    async saveDataToApi({ state, commit, rootState }, { url, data, requestType }) {
      return await Backbone.ajax({
        url: app.apiurl + url,
        type: 'POST',
        data,

        success: function(response) {
          return response
        },
        error: function() {
          commit('notifications/addNotification', {
            title: 'Error performing request',
            message: `There was an error ${requestType}`,
            level: 'error'
          }, {
            root: true
          })
        },
      })
    },
    // update data to the backend that is not attached to any model
    async updateDataToApi({ state, commit, rootState }, { url, data, requestType, updateType }) {
      return await Backbone.ajax({
        url: app.apiurl + url,
        type: updateType,
        data,

        success: function(response) {
          return response
        },
        error: function() {
          commit('notifications/addNotification', {
            title: 'Error performing request',
            message: `There was an error ${requestType}`,
            level: 'error'
          }, {
            root: true
          })
        },
      })
    },
    // delete data from the backend that is not attached to any model
    async deleteDataFromApi({ state, commit, rootState }, { url, requestType }) {
      return await Backbone.ajax({
        url: app.apiurl + url,
        type: 'DELETE',
        dataType: 'json',

        success: function(response) {
          return response
        },
        error: function() {
          commit('notifications/addNotification', {
            title: 'Error performing request',
            message: `There was an error ${requestType}`,
            level: 'error'
          }, {
            root: true
          })
        },
      })
    },
  },
  getters: {
    sso: state => state.auth.cas_sso,
    sso_url: state => state.auth.cas_url,
    apiUrl: state => state.apiUrl,
    appUrl: state => state.appUrl,
    getHelpStatus: state => state.help
  }
})

export default store

store.dispatch('initialise')
