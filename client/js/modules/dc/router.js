//define(['marionette', 'modules/dc/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = LazyRouter.extend({
        appRoutes: {
            'dc': 'dc_list',
            'dc(/visit/:visit)(/dcg/:dcg)(/page/:page)(/s/:search)(/ty/:ty)(/id/:id)': 'dc_list',
            'dc/view/id/:id': 'di_viewer',
            'dc/map/id/:id(/ty/:ty)(/dt/:dt)(/ppl/:ppl)': 'mapmodelviewer',
            'dc/summary/visit/:visit': 'summary',
            'dc/sc/visit/:visit': 'sampleChanger',
            'dc/queue/visit/:visit': 'queue',
        },
        
        loadEvents: ['dclist:show', 'dc:show'],
    })
       
       
    return new Router({
        //controller: c,
        rjsController: 'modules/dc/controller',
    })
})