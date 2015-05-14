//define(['marionette', 'modules/shipment/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {

  var Router = LazyRouter.extend({
    appRoutes: {
      'shipments(/page/:page)': 'list',
      'shipments/add': 'add',
      'shipments(/sid/:sid)': 'view',
      'containers/cid/:cid': 'view_container',
      'containers/add/did/:did': 'add_container',
      'containers/add/visit/:visit': 'add_container_visit',
      'containers(/s/:s)(/ty/:ty)(/page/:page)': 'container_list',
    },
    
    loadEvents: ['shipments:show', 'shipment:show', 'container:show']
  })
       
  return new Router({
    //controller: c
    rjsController: 'modules/shipment/controller',
  })
})