define(['marionette',
    'modules/feedback/models/feedback',
    'views/form',
    'tpl!templates/feedback/feedback.html',
    ], function(Marionette, Feedback, FormView, template) {
    
    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Feedback()
        },
        
        success: function() {
            app.alert({ message: 'Feedback successfully submitted' })
            
            _.each(['name', 'email', 'feedback'], function(f) {
                this.$el.find('[name='+f+']').val('')
            }, this)
            
        },

        failure: function() {
            app.alert({ message: 'Something went wrong submitting this feedback, please try again' })
        },
    })
        
})