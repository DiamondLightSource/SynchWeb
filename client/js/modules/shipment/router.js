//define(['marionette', 'modules/shipment/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {

  var Router = LazyRouter.extend({
    appRoutes: {
      'shipments(/page/:page)': 'list',
      'shipments/add': 'add',
      'shipments(/sid/:sid)': 'view',
      'shipments/awb/sid/:sid': 'create_awb',
      'shipments/pickup/sid/:sid': 'rebook_pickup',

      'containers/cid/:cid(/iid/:iid)(/sid/:sid)': 'view_container',
      'containers/queue/:cid': 'queue_container',
      'containers/add/did/:did': 'add_container',
      'containers/add/visit/:visit': 'add_container_visit',
      'containers(/s/:s)(/ty/:ty)(/page/:page)': 'container_list',
      'containers/registry(/ty/:ty)(/s/:s)(/page/:page)': 'container_registry',
      'containers/registry/:crid': 'view_rcontainer',

      'dewars(/s/:s)(/page/:page)': 'dewar_list',
      'dewars/fc/:fc': 'view_dewar',
      'dewars/add': 'add_dewar',
      'dewars/dispatch/:did': 'dispatch_dewar',
      'dewars/transfer/:did': 'transfer_dewar',

      'dewars/overview(/s/:s)(/page/:page)': 'dewar_overview',
      'shipments/manifest': 'manifest',

      'containers/plan/:cid': 'plan_container',
    },
    
    loadEvents: ['shipments:show', 'shipment:show', 'container:show', 'dewar:show']
  })
       
  return new Router({
    //controller: c
    rjsController: 'modules/shipment/controller',
  })
})