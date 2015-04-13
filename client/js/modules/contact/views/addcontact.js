define(['views/form',
    'models/labcontact',
    'tpl!templates/contact/contactadd.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(FormView,
        Contact,
        template, $_, Backbone) {


    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Contact()
        },
        
        success: function(model, response, options) {
            console.log('success from contact add')
            if (this.getOption('dialog')) {
                app.alert({ message: 'New Lab Contact Registered' })
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()
            } else app.trigger('contact:show', model.get('LABCONTACTID'))
        },

        failure: function(model, response, options) {
            console.log('failure from shipadd')
            app.alert({ message: 'Something went wrong registering this lab contact, please try again'})
        },
    })

})