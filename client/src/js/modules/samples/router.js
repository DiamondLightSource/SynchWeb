define(['marionette', 'modules/samples/controller'], function(Marionette, c) {
// define(['utils/lazyrouter'], function(LazyRouter) {
  var Router = Marionette.AppRouter.extend({
// var Router = LazyRouter.extend({
    appRoutes: {
      'samples(/s/:s)(/page/:page)': 'list',
      'samples/sid/:sid(/visit/:visit)': 'view',

      'instances(/s/:s)(/page/:page)': 'list',
      'instances/sid/:sid(/visit/:visit)': 'view',

      'crystals(/s/:s)(/page/:page)': 'crystallist',
      'crystals/cid/:cid': 'crystalview',
      'crystals/add': 'crystaladd',

      'xsamples(/s/:s)(/page/:page)': 'crystallist',
      'xsamples/cid/:cid': 'crystalview',
      'xsamples/add': 'crystaladd',
      'xsamples/simple/add/:pid': 'simplesampleadd',

      'proteins(/s/:s)(/page/:page)': 'proteinlist',
      'proteins/pid/:pid': 'proteinview',
      'proteins/add': 'proteinadd',
      'proteins/pid/:pid/clone': 'proteinclone',

      'phases(/s/:s)(/page/:page)': 'proteinlist',
      'phases/pid/:pid': 'proteinview',
      'phases/add': 'proteinadd',
      'phases/pid/:pid/clone': 'proteinclone',
    },
      
    loadEvents: ['samples:show', 'proteins:show', 'samples:view', 'proteins:view', 
      'phases:view', 'xsamples:view', 'instances:view'],
      
  })
       
  return new Router({
    controller: c
    // rjsController: 'modules/samples/controller',
  })
})