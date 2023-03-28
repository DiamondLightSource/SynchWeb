/*
* This is the main router using vue-router
*
* Core routes are added first, then we load other modules getting their routes array.
* Routes should be specified in a modules/<name>/routes.js file.
* In principle we could automatically add these routes for each modules, however we may want to configure them manually.
* Dynamic loading modules can be done using syntax like:
* const Feedback = () => import(/* webpackChunkName: "group-feedback" *\/ 'app/views/feedback/feedback.vue')
*/
import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/store.js'

import MarionetteApplication from 'app/marionette-application.js'

import Home from 'app/views/home.vue'
import Login from 'app/views/login.vue'
import NotFound from 'app/views/notfound.vue'
import NotAuthorised from 'app/views/notauthorised.vue'

import CalendarRoutes from 'modules/calendar/routes.js'
import ContactRoutes from 'modules/contact/routes.js'
import ProposalRoutes from 'modules/proposal/routes.js'
import TutorialRoutes from 'modules/docs/routes.js'
import FeedbackRoutes from 'modules/feedback/routes.js'
import ShipmentRoutes from 'modules/shipment/routes.js'
import AdminRoutes from 'modules/admin/routes.js'
import DCRoutes from 'modules/dc/routes.js'
import BLStatsRoutes from 'modules/blstats/routes.js'
import ProjectRoutes from 'modules/projects/routes.js'
import SampleRoutes from 'modules/samples/routes.js'
import ImagingRoutes from 'modules/imaging/routes.js'
import MCRoutes from 'modules/mc/routes.js'
import AssignRoutes from 'modules/assign/routes.js'
import CellRoutes from 'modules/cell/routes.js'
import StatusRoutes from 'modules/status/routes.js'
import FaultRoutes from 'modules/fault/routes.js'
import StatsRoutes from 'modules/stats/routes.js'
import EMRoutes from 'modules/types/em/routes.js'
import SubmissionRoutes from 'modules/submission/routes.js'
import VisitsRoutes from 'modules/visits/routes.js'
import { resolve } from 'promise'


Vue.use(Router)

let routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/ispyb/ispyb',
    name: 'ispybHome',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    props: true, // this will mean redirect query also passed to login as prop
    component: Login,
  },
  {
    path: '/notfound',
    alias: '/404',
    name: 'notfound',
    component: NotFound,
    props: route => ({url: route.query.url, prev: route.query.prev || ''})
  },
  {
    path: '/notauthorised',
    alias: '/403',
    name: 'notauthorised',
    component: NotAuthorised,
    props: route => ({url: route.query.url, prev: route.query.prev || ''})
  },
]

let router = new Router({
  mode: 'history',
  base: store.state.appUrl,
  routes: routes,
})

router.addRoutes(AdminRoutes)
router.addRoutes(ContactRoutes)
router.addRoutes(CalendarRoutes)
router.addRoutes(ContactRoutes)
router.addRoutes(ProposalRoutes)
router.addRoutes(TutorialRoutes)
router.addRoutes(FeedbackRoutes)
router.addRoutes(ShipmentRoutes)
router.addRoutes(DCRoutes)
router.addRoutes(BLStatsRoutes)
router.addRoutes(ProjectRoutes)
router.addRoutes(SampleRoutes)
router.addRoutes(ImagingRoutes)
router.addRoutes(MCRoutes)
router.addRoutes(AssignRoutes)
router.addRoutes(CellRoutes)
router.addRoutes(StatusRoutes)
router.addRoutes(FaultRoutes)
router.addRoutes(StatsRoutes)
router.addRoutes(EMRoutes)
router.addRoutes(SubmissionRoutes)
router.addRoutes(VisitsRoutes)


// Hook the marionette navigation methods into vue-router methods
let application = MarionetteApplication.getInstance()

application.initRouteMapping(router)

console.log("ROUTER METHOD CALLED " + JSON.stringify(window.location))
/*
* Main Router guard
*/
router.beforeEach((to, from, next) => {
  console.log("Router beforeEach to: " + to.path + ",  from: " + from.path)
  if (to.path === '/notfound') { next(); return }
  if (to.path === '/') { next(); return }
  if (to.path === '/login') { next(); return }

  // Make sure the store is initialised before proceeding further
  const init = store.dispatch('initialise')

  init.then( () => {
    // Moved this here so we don't get effectively logged out from a bad link
    if (to.matched.length === 0) { next('/notfound?url='+to.fullPath); return }

    store.dispatch('auth/checkAuth').then( (authenticated) => {
      if (!authenticated) {
        // Move this to separate unauthenticated function handler
        if (to.query['ticket']) {
          console.log('Router::beforeEach Detected CAS redirect')
          // Handle CAS redirect
          // Validate ticket
          store.dispatch('auth/validate', to.query['ticket']).then( () => {
            console.log("Validated ticket...")
          }).finally(() => {
            next(to.path)
          })
        } else {
            console.log('Router::beforeEach redirecting to login to: ' + to.path + ', from: ' + from.path)
            // This helps us redirect to a url if we are not logged in
            next({
              path: '/login',
              query: { redirect: to.fullPath }
            })
          }
      } else {
        // Move this to separate authenticated function handler
        // Current prop
        let prop = store.getters['proposal/currentProposal']
        if (from.path === '/') {
          // Then we are arriving at a new page
          let pathProp = application.parseQuery(to.path)
          // If path has a prop in it - pass to setProposal
          // If not use the current proposal to keep the logic consistent
          console.log('Parsed new query = ' + pathProp)
          if (pathProp) prop = pathProp
        }
        // This will only set a new proposal if its different from what we have
        const setProposal = store.dispatch('proposal/setProposal', prop)
        const logPath = store.dispatch('log', to.path)

        Promise.all([setProposal, logPath]).finally( () => {
          console.log("Router handled set proposal")
          let permissionOk = handleRoutePermissions(to)

          if (permissionOk) next()
          else {
            application.message({ title: 'Access Denied', message: 'You do not have access to that page', level: 'error' })
            next({path: '/403', query: { url: to.fullPath, prev: from.path}})
          }
        })
      }
    })
    resolve(true)
  })
})

function handleRoutePermissions(routes) {
  // Intercept routes that require permissions for users
  // Assume its ok unless permissions are set and the user does not have those permissions
  let permission = true

  if (routes.matched.some( (record) => {
    return record.meta.permission && !application.user_can(record.meta.permission)
  })) {
    // The user does not have the required permission
    permission = false
  }
  return permission
}

export default router