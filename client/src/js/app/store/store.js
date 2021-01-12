import Vue from 'vue'
import Vuex from 'vuex'

// VueX modules
// TODO - adopt vue-enterprise-boiler plate design
import AuthStore from './modules/store.auth.js'
import MenuStore from './modules/store.menus.js'
import ProposalStore from './modules/store.proposal.js'
import UserStore from './modules/store.user.js'
import NotificationStore from './modules/store.notifications.js'

// Configuration
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
    notifications: NotificationStore,
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
    set_help(state, helpFlag) {
      state.help = helpFlag ? true : false
      sessionStorage.setItem('ispyb_help', state.help)
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

      // May want to set initialised true early to avoid clash with router initialisation
      // this.state.initialised = true

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
  }
})

export default store

store.dispatch('initialise')