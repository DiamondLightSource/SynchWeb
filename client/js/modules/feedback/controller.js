define(['marionette',
    'modules/feedback/views/feedback',
    // 'modules/feedback/views/vue-feedback',
    ], function(Marionette, FeedbackView) {
    
    var bc = { title: 'Feedback' }
    
    var controller = {
        
        feedback:  function() {
            app.loading()
            app.bc.reset([bc]),
            app.content.show(new FeedbackView())
        },
        
    }

    return controller
})