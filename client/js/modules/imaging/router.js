// define(['marionette', 'modules/imaging/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
            
    var Router = LazyRouter.extend({
    // var Router = Marionette.AppRouter.extend({
        appRoutes: {
            'admin/imaging': 'imaging_dash',

            'admin/imaging/schedule': 'schedules',
            'admin/imaging/schedule/:sid': 'view_schedule',

            'admin/imaging/preset': 'view_presets',
            'admin/imaging/param': 'view_params',

            'imaging/screen': 'screens',
            'imaging/screen/:sid': 'view_screen',
        },
        
        loadEvents: ['schedule:view', 'screen:view'],

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "imaging" */ 'modules/imaging/controller').then(controller => {
                // Trigger the passed callback
                loadedCallback(controller)
            })
        }
    })
       
    return new Router({
        // controller: c
        rjsController: 'modules/imaging/controller',
    })
})
