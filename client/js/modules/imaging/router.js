define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'admin/imaging': 'imaging_dash',

            'admin/imaging/schedule': 'schedules',
            'admin/imaging/schedule/:sid': 'view_schedule',


            'imaging/screen': 'screens',
            'imaging/screen/:sid': 'view_screen',
        },
        
        loadEvents: ['schedule:view', 'screen:view'],
    })
       
    return new Router({
        rjsController: 'modules/imaging/controller',
    })
})
