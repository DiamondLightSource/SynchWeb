import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

import store from 'app/store/store.js'

import Backbone from 'backbone'

// Models and collections are imported here as normal
// We need to be able to create new instances of them for lookups etc.
import Shipments from 'collections/shipments.js'
import Shipment from 'models/shipment.js'

import Containers from 'collections/containers.js'
import ContainerRegistry from 'modules/shipment/models/containerregistry'
import ContainersRegistry  from 'modules/shipment/collections/containerregistry'

import RegisteredDewar from 'modules/shipment/models/dewarregistry'
import DewarRegistry from 'modules/shipment/collections/dewarregistry'
import Dewar from 'models/dewar.js'

// Marionette View can deal with being passed a promise or a function
const DewarRegView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/dewarreg')
const RegDewarView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/regdewar')
// RegDewarAddView was referenced in controller but not in old router?!
// const RegDewarAddView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/regdewaradd')
const DewarRegistryView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/dewarregistry')

const ShipmentsView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/shipments')
const ShipmentView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/shipment')
const ShipmentAddView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/shipmentadd')
const CreateAWBView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/createawb')
const RebookPickupView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/rebookpickup')
const ManifestView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/manifest')
const DewarStats = import(/* webpackChunkName: "shipment-stats" */ 'modules/shipment/views/dewarstats')
const DispatchView = import(/*webpackChunkName: "shipment" */ 'modules/shipment/views/dispatch')
const TransferView = import(/*webpackChunkName: "shipment" */ 'modules/shipment/views/transfer')

// In future may want to move these into wrapper components
// Similar approach was used for samples with a samples-map to determine the correct view
// For now there are only two types 'normal' and 'xpdf'
const ContainersView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/containers')
const XpdfContainersView = import(/* webpackChunkName: "shipment" */ 'modules/types/xpdf/shipment/views/containers')

const ContainerRegistryView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/containerregistry')
const RegisteredContainer = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/registeredcontainer')

const MigrateView = import(/* webpackChunkName: "shipment" */ 'modules/shipment/views/migrate')

const ContainerViewWrapper = () => import(/* webpackChunkName: "shipment" */ 'modules/shipment/components/container-view-wrapper.vue')
const ContainerAddWrapper = () => import(/* webpackChunkName: "shipment" */ 'modules/shipment/components/container-add-wrapper.vue')
const ContainerPlanWrapper = () => import(/* webpackChunkName: "shipment" */ 'modules/shipment/components/container-plan-wrapper.vue')
const ContainerQueueWrapper = () => import(/* webpackChunkName: "shipment" */ 'modules/shipment/components/container-queue-wrapper.vue')

const DewarsOverviewWrapper = () => import(/* webpackChunkName: "shipment" */ 'modules/shipment/components/dewars-overview-wrapper.vue')

// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()

app.addInitializer(function() {
  application.on('shipments:show', function() {
      application.navigate('/shipments')
  })

  application.on('shipment:show', function(sid) {
      application.navigate('/shipments/sid/'+sid)
  })

  application.on('container:show', function(cid, iid, sid) {
      application.navigate('/containers/cid/'+cid+(iid?'/iid/'+iid:'')+(sid?'/sid/'+sid:''))
  })

  application.on('rdewar:show', function(fc) {
      application.navigate('/dewars/registry/'+fc)
  })

  application.on('rcontainer:show', function(crid) {
      application.navigate('/containers/registry/'+crid)
  })
})

let bc = { title: 'Shipments', url: '/shipments' }

let shipmentComments = {}
// Shipment model used for AWB
let shipmentModel = {}
// Dewar model used for dispatch
let dewarModel = {}

function lookupShipment(shippingId) {
  return new Promise((resolve, reject) => {
      shipmentModel = new Shipment({ SHIPPINGID: shippingId })

      shipmentModel.fetch({
          // If OK trigger next
          success: function(model) {
            resolve(model)
          },
          // Original controller had no error condition...
          error: function() {
            reject({msg: "Shipment model lookup failed "})
          }
      })
  })
}
// Shipment default returns a dewar id
function lookupDefaultShipment(visit) {
  return new Promise((resolve, reject) => {

    Backbone.ajax({
      url: app.apiurl+'/shipment/dewars/default',
      data: { visit: visit },

      success: function(dewarId) {
        resolve(dewarId)
      },
      error: function() {
        reject({msg: "Default Shipment lookup failed "})
      },
    })
  })
}

// Dewar dispatch uses "dewar" as its model, which we want to retrieve before rendering view
function lookupDewar(dewarId) {
  return new Promise((resolve, reject) => {
    dewarModel = new Dewar({ DEWARID: dewarId })

    dewarModel.fetch({
        // If OK trigger next
        success: function(model) {
          resolve(model)
        },
        // Original controller had no error condition...
        error: function() {
          reject({msg: 'The specified dewar could not be found'})
        }
    })
  })
}


const routes = [
  // Root path has optional parameters so we need to deal with it first
  // It doesn't play nicely with multiple child routes...
  {
    path: '/shipments(/page/)?:page([0-9]+)?',
    component: MarionetteView,
    props: route => ({
      mview: ShipmentsView,
      breadcrumbs: [bc],
      options: {
        collection: new Shipments(null, {
          state: { currentPage: route.params.page ? parseInt(route.params.page) : 1},
          queryParams: { s: route.params.s }
        }),
        params: {s: route.params.s},
      }
    }),
  },
  // Deal with the rest of the shipment routes here
  {
    path: '/shipments',
    component: Page,
    children: [
      // Note that we need props to be a function so we pass in shippingComments correctly
      {
        path: 'add',
        component: MarionetteView,
        props: route => ({
          mview: ShipmentAddView,
          breadcrumbs: [bc, { title: 'Add New Shipment' }],
          options: {
            comments: shipmentComments
          }
        }),
        beforeEnter: (to, from, next) => {
          // Is this proposal still open?
          if (app.proposal && app.proposal.get('ACTIVE') != 1) {
            app.message({ title: 'Proposal Not Active', message: 'This proposal is not active so new shipments cannot be added'} )
            next('/403?url='+to.fullPath)
          } else {
            app.log('ship add view')

            // Get any comments to prefill from the server
            Backbone.ajax({
                url: app.appurl+'/assets/js/shipment_comments.json',
                dataType: 'json',
                success: function(comments) {
                  shipmentComments = comments
                  next()
                },
                error: function() {
                  console.log("Warning no comments found")
                  next()
                }
            })
          }
        }
      },
      {
        path: 'sid/:sid',
        component: MarionetteView,
        props: route => ({
          mview: ShipmentView,
          breadcrumbs: [bc],
          breadcrumb_tags: ['SHIPPINGNAME'], // If we find a model append to the bc
          options: {
            model: new Shipment({ SHIPPINGID: route.params.sid })
          }
        }),
        beforeEnter: (to, from, next) => {
          // Call the loading state here because we are finding the proposal based on this contact id
          // Prop lookup sets the proposal and type via set application.cookie method which we mapped to the store
          // TODO - change this for a store method
          // application.loading()

          store.dispatch('proposal/proposalLookup', { field: 'SHIPPINGID', value: to.params.sid } )
            .then( () => {
              console.log("Calling next - Success. model will be prefetched in marionette view")
              next()
            }, () => {
              console.log("Calling next - Error, no proposal found")
              next('/notfound')
            })
        }
      },
      // Create Airway Bill
      // Even though we are not using route params directly we should use the callback style
      // This ensures that the shipment model has been fetched before the props are defined
      {
        path: 'awb/sid/:sid',
        component: MarionetteView,
        props: route => ({
          mview: CreateAWBView,
          breadcrumbs: [bc, { title: 'Create Airway Bill' }], // Actually swapped round with shippingname
          breadcrumb_tags: ['SHIPPINGNAME'], // If we find a model append to the bc
          options: {
            shipment: shipmentModel
          }
        }),
        beforeEnter: (to, from, next) => {
            // Start the loading animation
            app.loading()

            lookupShipment(to.params.sid).then((response) => {
                console.log("Lookup Model OK - " + JSON.stringify(response))
                next()
            }, (error) => {
                console.log("Lookup Shipment Error: " + error.msg)
                app.alert({ title: 'No such shipment', message: 'Create AWB error' })
                next(from.fullPath)
            }).finally( () => {
                // In either case we can stop the loading animation
                app.loading(false)
            })
        }
      },

      {
        path: 'pickup/sid/:sid',
        component: MarionetteView,
        props: route => ({
          mview: RebookPickupView,
          breadcrumbs: [bc, { title: 'Rebook Pickup' }], // Actually swapped round with shippingname
          breadcrumb_tags: ['SHIPPINGNAME'], // If we find a model append to the bc
          options: {
            shipment: shipmentModel
          }
        }),
        beforeEnter: (to, from, next) => {
            // Start the loading animation
            app.loading()

            lookupShipment(to.params.sid).then((response) => {
                // Response is the backbone model. Could use shipmentModel instead
                // Only continue the navigation if we have a valid flight code
                if (response.get('DELIVERYAGENT_FLIGHTCODE')) {
                  next()
                } else {
                  app.alert({ title: 'Shipment not booked', message: 'The specified shipment does not have a valid courier booking'})
                  // Navigate back to previous page
                  next(from.fullPath)
                }
              }, (error) => {
                  app.alert({ title: 'No such shipment', message: error.msg })
                  next(from.fullPath)
              }).finally( () => {
                  // In either case we can stop the loading animation
                  app.loading(false)
              })
        }
      },
      // Couple of simple shipment routes
      {
        path: 'manifest',
        name: 'shipment-manifest',
        component: MarionetteView,
        props: {
          mview: ManifestView,
          breadcrumbs: [bc, { title: 'Manifest' }]
        }
      },
      {
        path: 'stats',
        name: 'shipment-stats',
        component: MarionetteView,
        props: {
          mview: DewarStats,
          breadcrumbs: [bc, { title: 'Dewar Stats' }]
        }
      },
    ],
  },
  //
  // Containers section
  //
  {
    path: '/containers(/s/)?:s([a-zA-Z0-9_-]+)?(/ty/)?:ty?(/page/)?:page([0-9]+)?',
    name: 'container-list',
    component: MarionetteView,
    props: route => ({
      mview: app.type == 'xpdf' ? XpdfContainersView : ContainersView,
      breadcrumbs: [bc, { title: 'Containers' }],
      options: {
        collection: new Containers(null, {
          state: { currentPage: route.params.page ? parseInt(route.params.page) : 1},
          queryParams: { s: route.params.s, ty: route.params.ty }
        }),
        params: {s: route.params.s, ty: route.params.ty},
      }
    }),
  },
  {
    path: '/containers/cid/:cid([0-9]+)(/iid/)?:iid([0-9]+)?(/sid/)?:sid([0-9]+)?',
    name: 'container-view',
    component: ContainerViewWrapper,
    props: route => ({
      cid: +route.params.cid,
      iid: +route.params.iid,
      sid: +route.params.sid,
    }),
  },
  {
    path: '/containers/add/did/:did([0-9]+)',
    name: 'container-add',
    component: ContainerAddWrapper,
    props: route => ({
      did: +route.params.did,
    }),
  },
  // Placeholder for redirect to containers/add
  // Creates a default dewar added to the visit
  // Then redirects to add container page for the default dewar
  {
    path: '/containers/add/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)',
    name: 'container-add-visit',
    component: Page,
    beforeEnter: (to, from, next) => {
      lookupDefaultShipment(to.params.visit).then( (did) => {
        next('/containers/add/did/' + did)
      }, () => {
        app.message({ title: 'Error', message: 'The default dewar for this visit could not be created' })
        next('/404')
      })
    }
  },
  {
    path: '/containers/queue/:cid([0-9]+)',
    name: 'container-queue',
    component: ContainerQueueWrapper,
    props: route => ({
      cid: +route.params.cid,
    }),
  },
  {
    path: '/containers/plan/:cid([0-9]+)',
    component: ContainerPlanWrapper,
    props: route => ({
      cid: +route.params.cid
    })
  },
  {
    path: '/containers/registry(/ty/)?:ty([a-zA-Z0-9_-]+)?(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    component: MarionetteView,
    props: route => ({
      mview: ContainerRegistryView,
      // Think there is an error in the original controller url was /dewars?
      breadcrumbs: [bc, { title: 'Registered Containers', url: '/containers/registry' }],
      options: {
        collection: new ContainersRegistry(null, {
          state: { currentPage: +route.params.page || 1 },
          queryParams: { s: route.params.s, ty: route.params.ty, all: 1 }
        }),
        params: { s: route.params.s, ty: route.params.ty}
      },
    })
  },
  {
    path: '/containers/registry/:crid([0-9]+)',
    component: MarionetteView,
    props: route => ({
      mview: RegisteredContainer,
      // Could make the breadcrumbs more descriptive, add a container registry path?
      breadcrumbs: [bc],
      breadcrumb_tags: ['BARCODE'],
      options: {
        model: new ContainerRegistry({ CONTAINERREGISTRYID: +route.params.crid }),
        queryParams: { all: 1 } // These will be passed to the model fetch as data: { all: 1}
      },
    })
  },
  //
  // Dewars Section
  //
  {
    path: '/dewars(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    component: MarionetteView,
    props: route => ({
      mview: DewarRegView,
      breadcrumbs: [bc, { title: 'Registered Dewars', url: '/dewars' }],
      options: {
        collection: new DewarRegistry(null, {
          state: { currentPage: +route.params.page || 1}
        }),
        params: { s: route.params.s },
      }
    })
  },
  // To dispatch, lookup the proposal by dewarId and prefetch the dewar Model
  // The dewarModel is passed as an option to the view but is not the main model for the Marionette view itself
  {
    path: '/dewars/dispatch/:did([0-9]+)',
    component: MarionetteView,
    props: route => ({
      mview: DispatchView,
      breadcrumbs: [bc, { title: 'Dispatch Dewar' }],
      breadcrumb_tags: ['CODE'],
      options: {
        dewar: dewarModel,
        shipping: shipmentModel
      }
    }),
    beforeEnter: (to, from, next) => {
      // Start the loading animation
      app.loading()

      const lookupProposal = store.dispatch('proposal/proposalLookup', { field: 'DEWARID', value: +to.params.did } )

      lookupProposal.then( () => {
        lookupDewar(to.params.did).then( (model) => {
          lookupShipment(model.get('SHIPPINGID')).then( () => { 
            next()
          }, () => { 
            store.commit('notifications/addNotification', {title: 'Error', message: 'Shipment not found from dewar id', level: 'error'}) 
            next('/404')
          })
        }, (err) => {
          store.commit('notifications/addNotification', {title: 'Error', message: 'Dewar not found', level: 'error'})
          next('/404')
        })
      }, (err) => {
        store.commit('notifications/addNotification', {title: 'Error', message: 'Proposal not found', level: 'error'})
        next('/404')
      }).finally( () => {
        // In either case we can stop the loading animation
        app.loading(false)
      })
    }
  },
  {
    path: '/dewars/transfer/:did([0-9]+)',
    component: MarionetteView,
    props: route => ({
      mview: TransferView,
      breadcrumbs: [bc, { title: 'Transfer Dewar' }],
      breadcrumb_tags: ['CODE'],
      options: {
        dewar: dewarModel
      }
    }),
    beforeEnter: (to, from, next) => {
      // Start the loading animation
      app.loading()

      const lookupProposal = store.dispatch('proposal/proposalLookup', { field: 'DEWARID', value: +to.params.did } )

      lookupProposal.then( () => {
        lookupDewar(to.params.did).then( (model) => {
          next()
        }, (err) => {
          store.commit('notifications/addNotification', {title: 'Error', message: 'Dewar not found', level: 'error'})
          next('/404')
        })
      }, (err) => {
        store.commit('notifications/addNotification', {title: 'Error', message: 'Proposal not found', level: 'error'})
        next('/404')
      }).finally( () => {
        // In either case we can stop the loading animation
        app.loading(false)
      })
    }
  },
  // This route is remarkably similar to /dewars - think the titles should be different?
  // This one has all: 1 in its queryParams and a different Marionette View
  {
    path: '/dewars/registry(/ty/)?:ty([a-zA-Z0-9_-]+)?(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    component: MarionetteView,
    props: route => ({
      mview: DewarRegistryView,
      breadcrumbs: [bc, { title: 'Registered Dewars', url: '/dewars' }],
      options: {
        collection: new DewarRegistry(null, {
          state: { currentPage: +route.params.page || 1},
          queryParams: { s: route.params.s, ty: route.params.ty, all: 1 }
        }),
        params: { s: route.params.s, ty: route.params.ty },
      }
    })
  },
  // This route was the only place where dewar.fetched = true was set after the model was fetched.
  // No other controller does this so we have not tried to handle this edge case in MarionetteView
  {
    path: '/dewars/registry/:fc',
    component: MarionetteView,
    props: route => ({
      mview: RegDewarView,
      breadcrumbs: [bc, { title: 'Registered Dewars', url: '/dewars' }],
      breadcrumb_tags: ['FACILITYCODE'],
      options: {
        model: new RegisteredDewar({ FACILITYCODE: route.params.fc })
      }
    })
  },
  {
    path: '/dewars/overview(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    component: DewarsOverviewWrapper,
    props: route => ({
      search: route.params.s || '',
      page: +route.params.page || 1
    })
  },
  {
    path: '/migrate',
    component: MarionetteView,
    props: {
      mview: MigrateView,
      breadcrumbs: [bc,  { title: 'Migrate' }]
    }
  },
]

export default routes