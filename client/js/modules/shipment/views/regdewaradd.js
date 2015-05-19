define(['marionette', 'views/form',
    'modules/shipment/models/dewarregistry',
    'collections/labcontacts',
    
    'views/dialog',
    'modules/contact/views/addcontact',
    
    'tpl!templates/shipment/regdewaradd.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(Marionette, FormView,
        RegisteredDewar, LabContacts,
        DialogView, AddContactView,
        template, $, Backbone) {

            
    return FormView.extend({
        template: template,
        
        ui: {
            lc: 'select[name=LABCONTACTID]',
        },

        events: {
            'click a.add_lc': 'addLC',
        },
        
        addLC: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Add Home Lab Contact', className: 'content', view: new AddContactView({ dialog: true }), autoSize: true }))
            this.listenTo(app.dialog.currentView, 'close', this.refreshContacts, this)
            
            return false
        },
        
        createModel: function() {
            this.model = new RegisteredDewar({ new: true })
        },

        prepareModel: function() {
            this.model.set({ new: false })
        },
        
        success: function(model, response, options) {
            console.log('success from dewadd')
            app.trigger('rdewar:show', model.get('FACILITYCODE'))
        },

        failure: function(model, response, options) {
            console.log('failure from dewsadd')
            app.alert({ message: 'Something went wrong registering this dewar, please try again'})
        },
        
        onRender: function() {
            var self = this
            
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()
            
            this.date('input[name=PURCHASEDATE]')
        },
        
        refreshContacts: function() {
            this.contacts.fetch()
        },
        
        updateContacts: function() {
            this.ui.lc.html(this.contacts.opts())
        },

    })

})