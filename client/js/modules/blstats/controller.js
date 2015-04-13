define(['marionette',
    'modules/blstats/views/stats',
    ], function(Marionette, StatsView) {
    
    var bc = { title: 'Usage Stats', url: '/ustats' }
    
    var controller = {
        stats: function(type, subtype) {
            app.bc.reset([bc])
            app.content.show(new StatsView({ type: type, subtype: subtype }))
        }
    }
        
    return controller
})