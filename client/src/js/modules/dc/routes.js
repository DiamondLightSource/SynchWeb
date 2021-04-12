import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Debug from 'app/views/debug.vue'

// Lazy load Vue wrapper components
// Group these to isolate loading Three.js in dc vendor module
const DCWrapper = () => import(/* webpackChunkName: "group-dc" */ 'modules/dc/components/dc-wrapper.vue')
const MapModelWrapper = () => import(/* webpackChunkName: "group-dc" */ 'modules/dc/components/map-model-wrapper.vue')
const ImageViewWrapper = () => import(/* webpackChunkName: "group-dc" */ 'modules/dc/components/image-view-wrapper.vue')
const ReciprocalViewWrapper = () => import(/* webpackChunkName: "group-dc" */ 'modules/dc/components/reciprocal-view-wrapper.vue')

// Data Collection Marionette Views
const Summary = import(/* webpackChunkName: "group-dc1" */ 'modules/dc/views/summary')
const APStatusSummary = import(/* webpackChunkName: "group-dc1" */ 'modules/dc/views/apstatussummary')
const SampleChangerView = import(/* webpackChunkName: "group-dc1" */ 'modules/dc/views/samplechangerfull')
const QueueBuilder = import(/* webpackChunkName: "group-dc1" */ 'modules/dc/views/queuebuilder')

// import DataCollection from 'models/datacollection'
import DCCol from 'collections/datacollections'
import Visit from 'models/visit'

// import store from 'app/store/store'

// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()

// Use to check if visit model is OK
let visitModel = {}

application.addInitializer(function() {
  application.on('dclist:show', function(visit) {
      if (visit) {
          application.navigate('/dc/visit/'+visit)
          // controller.dc_list(visit)
      } else {
        application.navigate('/dc')
      //   controller.dc_list()
      }
  })

  application.on('dc:show', function(type, id, visit) {
      application.navigate('/dc/'+(visit ? ('visit/'+visit) : '') + '/ty/'+type+'/id/'+id)
  //   controller.dc_list(visit, null, null, null, type, id)
  })
})

// appRoutes: {
//     'dc': 'dc_list',
//     'dc(/visit/:visit)(/dcg/:dcg)(/page/:page)(/s/:search)(/ty/:ty)(/id/:id)(/pjid/:pjid)': 'dc_list',
//     'dc/view/id/:id': 'di_viewer',
//     'dc/map/id/:id(/ty/:ty)(/dt/:dt)(/ppl/:ppl)': 'mapmodelviewer',
//     'dc/rsv/id/:id': 'rsviewer',
//     'dc/summary/visit/:visit': 'summary',
//     'dc/apstatussummary/visit/:visit(/ty/:ty)': 'apstatussummary',
//     'dc/sc/visit/:visit': 'sampleChanger',
//     'dc/queue/visit/:visit': 'queue',
// },

function lookupVisit(visit) {
  // router guard takes care of setting proposal from route path
  //application.cookie(visit.split('-')[0])

  return new Promise((resolve, reject) => {
      visitModel = new Visit({ VISIT: visit })

      visitModel.fetch({
          // If OK trigger next
          success: function() {
            console.log("Visit model lookup OK")
            resolve(visitModel)
          },
          // Original controller had no error condition...
          error: function() {
              reject({msg: "Visit model lookup failed for " + visit})
          }
      })
  })
}

// Dealing with multiple optional parameters is a pain.
// Capturing multiple string type optional parameters is not as useful with vue-router than it was with marionette.
// The path-to-regexp greedily matches text so optional paths can get merged. Using explicit regex conditions is more reliable.
// Looks as though page is a red herring as its not added to the URL on pagination.
// Search probably has no value with an id (i.e. individual data collection ) or probably dcg either.
// The DC component handles the prefetching and proposal lookup in a cleaner method than using marionette wrapper directly
let routes = [
  {
    path: '/dc(/visit/)?:visit([a-zA-Z]{2}[0-9]+-[0-9]+)?(/dcg/)?:dcg([0-9]+)?(/page/)?:page([0-9]+)?(/s/)?:search([a-zA-z0-9_-]+)?(/ty/)?:ty([a-zA-Z0-9_-]+)?(/id/)?:id([0-9]+)?(/pjid/)?:pjid([0-9]+)?',
    name: 'dc-list',
    component: DCWrapper,
    props: route => ({
        id: +route.params.id || null,
        visit: route.params.visit || '',
        dcg: +route.params.dcg || null,
        page: +route.params.page || 1,
        ty: route.params.ty || '',
        search: route.params.search || '',
        pjid: +route.params.pjid || null,
    }),
  },
  {
    path: '/dc/map/id/:id([0-9]+)(/ty/)?:ty([a-zA-Z0-9_-]+)?(/dt/)?:dt([a-zA-Z0-9_-]+)?(/ppl/)?:ppl([a-zA-Z0-9_-]+)?',
    name: 'dc-mapmodelviewer',
    component: MapModelWrapper,
    props: route => ({
      id: +route.params.id || null,
      ty: route.params.ty || 'dimple',
      dt: route.params.dt || '',
      ppl: route.params.ppl || '',
    }),
  },
  {
    path: '/dc/view/id/:id',
    name: 'dc-imageviewer',
    component: ImageViewWrapper,
    props: route => ({
      id: +route.params.id || null,
    }),
  },
  {
    path: '/dc/rsv/id/:id',
    name: 'dc-reciprocal-viewer',
    component: ReciprocalViewWrapper,
    props: route => ({
      id: +route.params.id || null,
    }),
  },
  {
    path: '/dc/summary/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)',
    name: 'dc-summary',
    component: MarionetteView,
    props: route => ({
        mview: Summary,
        visit: route.params.visit || '',
        options: {
          model: visitModel,
          collection: new DCCol(null, {
            queryParams: { visit: route.params.visit, t: 'fc', pp: app.mobile() ? 5 : 15 }, running: false
          })
        }
    }),
    beforeEnter: (to, from, next) => {
      // Call the loading state here because we are finding the proposal based on this visit
      // Prop lookup sets the proposal and type via set app.cookie method which we mapped to the store
      console.log('summary')
      app.loading()

      lookupVisit(to.params.visit).then((response) => {
        console.log("Lookup OK Prop = " + response.get('PROPOSAL'))
        next()
      }, (error) => {
        console.log("Calling next - Error, no proposal found")
        next('/notfound')
      }).finally( () => {
        app.loading(false)
      })
    }
  },
  // Ty does not seem to be used in this route?
  {
    path: '/dc/apstatussummary/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)(/ty/)?:ty?',
    name: 'dc-apstatussummary',
    component: MarionetteView,
    props: route => ({
      mview: APStatusSummary,
      visit: route.params.visit || '',
      ty: route.params.ty || '',
      options: {
        model: visitModel,
        collection: new DCCol(null, {
          queryParams: { visit: route.params.visit, t: 'fc', pp: app.mobile() ? 5 : 15 }, running: false
        })
      }
    }),
    beforeEnter: (to, from, next) => {
      // Call the loading state here because we are finding the proposal based on this contact id
      // Prop lookup sets the proposal and type via set app.cookie method which we mapped to the store
      app.loading()

      lookupVisit(to.params.visit).then((response) => {
        console.log("Lookup OK Prop = " + response.get('PROPOSAL'))
        next()
      }, (error) => {
        console.log("Calling next - Error, no proposal found")
        next('/notfound')
      }).finally( () => {
        app.loading(false)
      })
    }
  },
  {
    path: '/dc/sc/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)',
    name: 'dc-sampleChanger',
    component: MarionetteView,
    props: route => ({
        visit: route.params.visit || '',
        breadcrumbs: [
          { title: 'Data Collections', url: '/dc' },
          { title: 'Sample Changer' },
          { title: route.params.visit, url: '/dc/visit/'+route.params.visit },
        ],
        mview: SampleChangerView,
        options: {
          visit: route.params.visit,
          bl: visitModel.get('BL')
        }
    }),
    beforeEnter: (to, from, next) => {
      // Call the loading state here because we are finding the proposal based on this contact id
      // Prop lookup sets the proposal and type via set app.cookie method which we mapped to the store
      app.loading()

      lookupVisit(to.params.visit).then((response) => {
        console.log("Lookup OK Prop = " + response.get('PROPOSAL'))
        next()
      }, (error) => {
        console.log("Calling next - Error, no proposal found")
        next('/notfound')
      }).finally( () => {
        app.loading(false)
      })
    }
  },
  {
    path: '/dc/queue/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)',
    name: 'dc-queue',
    component: MarionetteView,
    props: route => ({
        visit: route.params.visit || '',
        breadcrumbs: [
          { title: 'Data Collections', url: '/dc' },
          { title: 'Queue Builder' },
          { title: route.params.visit }
        ],
        mview: QueueBuilder,
        options: {
          visit: route.params.visit,
          bl: visitModel.get('BL')
        }
    }),
    beforeEnter: (to, from, next) => {
      // Call the loading state here because we are finding the proposal based on this contact id
      // Prop lookup sets the proposal and type via set app.cookie method which we mapped to the store
      app.loading()

      lookupVisit(to.params.visit).then((response) => {
        console.log("Lookup OK Prop = " + response.get('PROPOSAL'))
        next()
      }), (error) => {
        console.log("Calling next - Error, no proposal found")
        next('/notfound')
      }
    }
  },
]


export default routes