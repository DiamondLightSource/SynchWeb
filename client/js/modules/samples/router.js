//define(['marionette', 'modules/samples/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
  var Router = LazyRouter.extend({
    appRoutes: {
      'samples(/s/:s)(/page/:page)': 'list',
      'samples/sid/:sid(/visit/:visit)': 'view',

      'proteins(/s/:s)(/page/:page)': 'proteinlist',
      'proteins/pid/:pid': 'proteinview',
      'proteins/add': 'proteinadd',

      'ligands(/s/:s)(/page/:page)': 'ligandlist',
      'ligands/lid/:lid': 'ligandview',
      'ligands/add': 'ligandadd',
    },
      
    loadEvents: ['samples:show', 'proteins:show', 'samples:view', 'proteins:view', 'ligands:show', 'ligands:view'],
      
  })
       
  return new Router({
    //controller: c
    rjsController: 'modules/samples/controller',
  })
})