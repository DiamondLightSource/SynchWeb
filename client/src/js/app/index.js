require('font-awesome/css/font-awesome.css')
require('css/main.scss')

import Vue from 'vue'
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'
import PortalVue from 'portal-vue'

import Main from 'app/layouts/main.vue'
import MaintenanceView from 'app/layouts/maintenance.vue'
import store from 'app/store/store'
import router from 'app/router/router'

import MarionetteApp from 'app/marionette-application.js'

import config from 'config.json'
import 'app/mixins/vee-validate-custom-rules'

Vue.use(PortalVue)

Vue.component('ValidationObserver', ValidationObserver)
Vue.component('ValidationProvider', ValidationProvider)

Object.keys(rules).forEach(rule => {
  extend(rule, rules[rule]);
});

Vue.config.productionTip = false
Vue.config.devtools = !config.production

const vm = new Vue({
  store,
  router,
  created: function() {
    console.log("VUE::created")

    // Start the Marionette application
    let application = MarionetteApp.getInstance()

    application.start()
  },
  render: function(h) {
    if (config.maintenance) return h(MaintenanceView, {props: {'message': config.maintenance_message}})
    else return h(Main)
  }
}).$mount('#synchweb-app')


// For testing purposes....
if (window.Cypress) {
  window.vm = vm
}

module.hot.accept()
