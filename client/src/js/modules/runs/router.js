define(['utils/lazyrouter'], function(LazyRouter) {
    var Router = LazyRouter.extend({
        appRoutes: {
            'runs/overview(/bl/:bl)(/:bl)(/run/:run)(/:id)': 'fetchBeamlineTypes'
        },

        loadEvents: ['runs:show'],

        loadModule: function(loadedCallback) {
            import(/* webpackChunkName: "runs" */ 'modules/runs/controller').then(controller => {
                loadedCallback(controller)
            })
        }
    })

    return new Router({
        rjsController: 'modules/runs/controller'
    })
})
