define(['marionette',
        // 'modules/docs/views/tutorials',
        'modules/docs/views/vue-tutorials',
    ], function(Marionette, TutorialView) {
    
    var bc = { title: 'Tutorials' }
    
    var controller = {
        
        docs:  function(id) {
            app.loading()
            app.bc.reset([bc]),
            app.content.show(new TutorialView({ id: id }))
        },
        
    }

    return controller
})