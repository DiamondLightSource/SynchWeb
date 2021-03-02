import Backbone from 'backbone'

// Module to store information about a logged in user
// Manages their authentication and permissions information
const user = {
  namespaced: true,
  state: {
    userName: '',
    isStaff: false,
    personId: 0,
    defaultType: 'mx',
    permissions: []
  },
  mutations: {
      updateUser(state, user) {
        console.log("STORE UPDATING USER INFO...")
        console.log("STORE PERMISSIONS: " + JSON.stringify(user.permissions))
        // user should be an object with { userName, personid, is_staff, givenname, defaultType}
        // Explicit mapping here to catch any errors and avoid unnecessary values
        state.userName = user.user || ''
        state.personId = user.personid || null
        state.isStaff = user.is_staff || false
        state.defaultType = user.ty || '' // default type of layout to show for this user mx, em etc.
        state.givenName = user.givenname || ''
        state.permissions = user.permissions || []

        // Now map this to our legacy marionette application
        app.user = state.userName
        app.personid = state.personId
        app.givenname = state.givenName
        app.staff = state.isStaff

        if (!app.type) {
          app.type = user.ty
        }
      },
  },
  actions: {
    getUser({state, commit, rootState}, options) {
      return new Promise((resolve, reject) => {
        // If not already logged in - return false
        // Not an error, we just don't need to request user info
        if (!rootState.auth.token) {
          resolve(false)
        } else {

          Backbone.ajax({
            url: rootState.apiUrl+'/users/current',
            success: function(resp) {
              console.log("store.auth: GET_USER - User logged in: " + JSON.stringify(resp))
              var payload = {
                user: resp.user,
                personid: resp.personid,
                givenname: resp.givenname,
                is_staff: resp.is_staff,
                ty: resp.ty,
                permissions: resp.permissions,
              }

              commit('updateUser', payload)

              if (options && options.callback && options.callback instanceof Function) {
                options.callback()
              }
              // Don't wait for the callback
              resolve(true)
            },

            error: function() {
              console.log("Error getting user information")

              if (options && options.callback && options.callback instanceof Function) {
                options.callback()
              }
              reject()
            }
          })
        }
      })
    },
  },
  getters: {
    isStaff: state => state.isStaff,
    permissions: state => state.permissions || [],
    hasPermission: (state) => (permission) => state.permissions.indexOf(permission) < 0 ? false : true
  }
}

export default user
