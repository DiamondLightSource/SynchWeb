define(['marionette',
    'modules/status/views/status',
    ], function(Marionette, StatusView) {
    
    var bc = { title: 'Beamline Status' }
    
    var controller = {
        
        status:  function(bl) {
            app.loading()
            app.bc.reset([bc, { title: bl }]),
            app.content.show(new StatusView({ bl: bl }))
        },
        
    }

    return controller
})