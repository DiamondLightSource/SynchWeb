//define(['marionette', 'modules/projects/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
  var Router = LazyRouter.extend({
    appRoutes: {
      'projects': 'list',
      'projects/pid/:pid': 'view',
    },
      
    loadEvents: ['projects:view'],
  })
       
  return new Router({
    //controller: c
    rjsController: 'modules/projects/controller',
  })
})