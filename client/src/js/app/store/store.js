import Vue from 'vue'
import Vuex from 'vuex'

// VueX modules
import AuthStore from './modules/store.auth.js'
import MenuStore from './modules/store.menus.js'
import ProposalStore from './modules/store.proposal.js'
import UserStore from './modules/store.user.js'

import Options from 'models/options.js'
import config from 'config.json'

import MarionetteApplication from 'app/marionette-application.js'
import { resolve } from 'promise'
import { reject } from 'promise'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    auth: AuthStore,
    menu: MenuStore,
    proposal: ProposalStore,
    user: UserStore,
  },
  state: {
    // Flag we use to check if we have already setup options
    initialised: false,
    // Global api prefix
    apiUrl: config.apiurl,
    appUrl: config.appurl,
    // Proposal / visit info
    // proposal: '',        // The proposal string (e.g. mx12345)
    // proposalType: 'mx',  // Type of the proposal or default type for the user
    // proposalModel: null, // A backbone model for the current proposal
    // visit: '',
    // Notifications and events
    notifications: [],
    isLoading: false,
    motd: 'Message of the day',
    models: {}
  },
  mutations: {
    // For future use - save a model to a specified name
    save_model(state, payload) {
      console.log("Saving model " + payload.name + " = " + JSON.stringify(payload.model))
      if (payload.model) {
        Vue.set(state.models, payload.name, payload.model)
      }
    },
    add_notification(state, payload) {
      console.log("Adding notification " + payload.message)
      let notification = payload
      notification.id = Date.now() // Using number of miliseconds since 1970 as uid

      state.notifications.push(notification)
    },
    clear_notifications(state) {
      console.log("Clearing notifications")
      state.notifications = []
    },
    clear_notification(state, id) {
      console.log("Store Clearing notification for id " + id)
      state.notifications = state.notifications.filter(notification => notification.id !== id)
    },
    set_options(state, options) {
      console.log("STORE UPDATING OPTIONS SSO: " + JSON.stringify(options))

      state.auth.type = options.get('authentication_type')
      state.auth.cas_sso = options.get('cas_sso')
      state.auth.cas_url = options.get('cas_url')

      console.log("Auth sso = " + state.auth.cas_sso)
      console.log("Auth sso url = " + state.auth.cas_url)

      state.motd = options.get('motd') || state.motd

      app.options = options
    },
    //
    // Loading screen
    //
    loading(state, status) {
      console.log("STORE set loading to: " + status)
      state.isLoading = status ? true : false
    },
  },
  actions: {
    // Initialise the Store
    // This will set the app object with values from prop and token on start
    // Also initialise marionette methods that require access to the store
    initialise({dispatch, commit}) {
      // Return immediately if we are already initialised
      if (this.state.initialised) return Promise.resolve(true)

      console.log("Store.initialise")

      let application = MarionetteApplication.getInstance()

      application.initStateMapping(store)
      
      // Get any stored value from sessionStorage and set the app object
      var prop = sessionStorage.getItem('prop')
      var token = sessionStorage.getItem('token')
      
      if (token) commit('auth_success', token)

      const proposalPromise = dispatch('set_proposal', prop)
      const optionsPromise = dispatch('get_options')
      const userPromise = dispatch('get_user')

      return Promise.all([proposalPromise, optionsPromise, userPromise]).then( () => {
        console.log("Store is initialised OK")
        this.state.initialised = true
        resolve(true)
      }, () => {
        console.log("Error initailising store")
        reject()
      })
    },
    
    get_options({commit}) {
        let options = new Options()

        return new Promise((resolve, reject) => {
          options.fetch({
            data: { t: new Date().getTime() },
            success: function() {
              commit('set_options', options)
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
  },
  getters: {
    sso: state => state.auth.cas_sso,
    sso_url: state => state.auth.cas_url,
    notifications: state => state.notifications,
    
  }
})

export default store
