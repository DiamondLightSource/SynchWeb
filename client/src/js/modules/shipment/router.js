// define(['marionette', 'modules/shipment/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
  // var Router = Marionette.AppRouter.extend({
  var Router = LazyRouter.extend({
    appRoutes: {
      'shipments(/page/:page)': 'list',
      'shipments/add': 'add',
      'shipments(/sid/:sid)': 'view',
      'shipments/awb/sid/:sid': 'create_awb',
      'shipments/pickup/sid/:sid': 'rebook_pickup',

      'shipments/csv/:sid': 'import_csv',

      'containers/cid/:cid(/iid/:iid)(/sid/:sid)': 'view_container',
      'containers/queue/:cid': 'queue_container',
      'containers/add/did/:did': 'add_container',
      'containers/add/visit/:visit': 'add_container_visit',
      'containers(/s/:s)(/ty/:ty)(/page/:page)': 'container_list',
      'containers/registry(/ty/:ty)(/s/:s)(/page/:page)': 'container_registry',
      'containers/registry/:crid': 'view_rcontainer',

      'containers/queued(/s/:s)(/ty/:ty)(/pt/:pt)(/bl/:bl)(/sid/:sid)(/page/:page)': 'queued_containers',
      'containers/review/:cid': 'container_review',

      'dewars(/s/:s)(/page/:page)': 'dewar_list',
      'dewars/dispatch/:did': 'dispatch_dewar',
      'dewars/transfer/:did': 'transfer_dewar',
      'dewars/registry(/ty/:ty)(/s/:s)(/page/:page)': 'dewar_registry',
      'dewars/registry/:fc': 'view_dewar',

      'dewars/overview(/s/:s)(/page/:page)': 'dewar_overview',
      'shipments/manifest': 'manifest',
      'shipments/stats': 'dewarstats',

      'containers/plan/:cid': 'plan_container',

      'migrate': 'migrate',
    },
    
    loadEvents: ['shipments:show', 'shipment:show', 'rcontainer:show', 'rdewar:show', 'container:review'],

    loadModule: function(loadedCallback) {
        import(/* webpackChunkName: "shipping" */ 'modules/shipment/controller').then(controller => {
            // Trigger the passed callback
            loadedCallback(controller)
        })
      }
  })
       
  return new Router({
    // controller: c
    rjsController: 'modules/shipment/controller',
  })
})