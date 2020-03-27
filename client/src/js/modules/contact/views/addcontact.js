define(['views/form',
    'models/labcontact',
    'collections/countries',
    'templates/contact/contactadd.html',
    'jquery',
    'backbone',
    
    'backbone-validation',
    
    ], function(FormView,
        Contact, Countries,
        template, $_, Backbone) {


    return FormView.extend({
        template: template,
        
        ui: {
            country: 'select[name=COUNTRY]',
        },

        initialize: function() {
            this.countries = new Countries()
            this.countries.state.pageSize = 9999
            this.ready = this.countries.fetch()
        },

        createModel: function() {
            this.model = new Contact()
        },
        
        onRender: function() {
            $.when(this.ready).done(this.populateCountries.bind(this))
        },

        populateCountries: function() {
            this.ui.country.html(this.countries.opts())
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