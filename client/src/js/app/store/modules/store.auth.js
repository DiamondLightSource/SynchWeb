import Backbone from 'backbone'

// Module to deal with authentication
// Should handle any Single sign on requests and deal with login/logout actions
const auth = {
  namespaced: true,
  state: {
    type: 'cas',
    cas_sso: false,
    cas_url: '',
    sso_url: '',
    token: '',
  },
  mutations: {
      //
      // Authorisation status
      //
      authSuccess(state, token){
        state.token = token
        sessionStorage.setItem('token', token)
        // Preserve legacy app
        app.token = state.token
      },
      authError(state){
        console.log("store.auth - error trying to authenticate")
        state.token = ''
        sessionStorage.removeItem('token')
        // Preserve legacy app
        delete app.token
      },
      // Mutation to set state info back to defaults after successful logout action
      logout(state){
        state.token = ''
        sessionStorage.removeItem('token')
        // Preserve legacy app
        delete app.token
      },
  },
  actions: {
    checkAuth({state, rootState, commit, dispatch }) {
      return new Promise( (resolve) => {
        // If we have a token return
        if (state.token) {
          resolve(true)
        } else if (sessionStorage.getItem('token')) {
          commit('authSuccess', sessionStorage.getItem('token'))
          resolve(true)
        } else {
          Backbone.ajax({
              url: rootState.apiUrl+'/authenticate/check',
              type: 'GET',
              success: function(response) {
                console.log("Store checkAuth success: " + JSON.stringify(response))
                const token = response.jwt
                commit('authSuccess', token)
                dispatch("user/getUser", {}, {root: true}).then(() => resolve(true))
              },
              error: function() {
                console.log("Store check auth warning - no previous session")
                resolve(false)
              }
          })
        }
      })
    },

    validate({state, rootState, commit }, ticket) {
      console.log("Store validate Ticket: " + ticket)
      return new Promise( (resolve) => {
        // If we have a token return
        if (state.token) resolve(true)

        Backbone.ajax({
            url: rootState.apiUrl+'/authenticate/check',
            type: 'GET',
            success: function(response) {
              console.log("Store validate success: " + JSON.stringify(response))
              const token = response.jwt
              commit('authSuccess', token)
              resolve(true)
            },
            error: function() {
              console.log("Store validate warning - no previous session")
              resolve(false)
            }
        })
      })
    },

    login({ commit, rootState }, credentials) {
      return new Promise((resolve, reject) => {
        commit('loading', true, { root: true })

        Backbone.ajax({
          url: rootState.apiUrl+'/authenticate',
          data: credentials,
          type: 'POST',
          success: function(resp) {
            const token = resp.jwt
            console.log("Authentication success for " + credentials.login) // Using passed fed id at the moment
            commit('authSuccess', token)
            commit('loading', false, { root: true })
            resolve(resp)
          },
          error: function(req, status, error) {
            commit('authError')
            commit('loading', false, { root: true })
            reject(error)
          }})
        })
    },

    getToken({ commit, rootState, dispatch }, code) {
      return new Promise((resolve, reject) => {
        commit('loading', true, { root: true })

        Backbone.ajax({
          url: rootState.apiUrl+'/authenticate/token',
          data: {code},
          type: 'POST',
          success: function(resp) {
            const token = resp.jwt
            commit('authSuccess', token)
            dispatch("user/getUser", {}, {root: true}).then(() => resolve(true))
          },
          error: function(req, status, error) {
            commit('authError')
            reject(error)
          }, 
          complete: function() {
            commit('loading', false, { root: true })
          }})
        })
    },

    logout({commit}){
      return new Promise((resolve) => {
        console.log("Logout successful")
        commit('logout')
        commit('proposal/setProposal', null, {root: true})
        commit('user/updateUser', {}, {root: true})
        resolve()
      })
    },
  },
  getters: {
    isLoggedIn: function(state) {
      return state.token !== ''
    },
    token: function(state) {
      if (!state.token) {
        // Any in storage?
        state.token = sessionStorage.getItem('token')
      }
      return state.token
    },
  }
}

export default auth
