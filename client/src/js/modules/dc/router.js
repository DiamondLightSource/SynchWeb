// define(['marionette', 'modules/dc/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    // var Router = Marionette.AppRouter.extend({
    var Router = LazyRouter.extend({
        appRoutes: {
            'dc': 'dc_list',
            
            'dc/view/id/:id': 'di_viewer',
            'dc/map/id/:id/aid/:aid': 'mapmodelviewer',
            'dc/rsv/id/:id': 'rsviewer',
            'dc/summary/visit/:visit': 'summary',
            'dc/apstatussummary/visit/:visit(/ty/:ty)': 'apstatussummary',
            'dc/sc/visit/:visit': 'sampleChanger',
            'dc/queue/visit/:visit': 'queue',
            'dc(/visit/:visit)(:pathmatch)': 'dc_list',
        },
        
        loadEvents: ['dclist:show', 'dc:show'],


        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "dc" */ 'modules/dc/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
          }
    })

       
    return new Router({
        // controller: c,
        rjsController: 'modules/dc/controller',
    })
})
