define(['marionette',
    'collections/countries',
    'utils/editable',
    'templates/contact/userview.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Countries, Editable, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        initialize: function(options) {
            Backbone.Validation.bind(this)
            
            this.countries = new Countries()
            this.countries.state.pageSize = 9999
            this.ready = this.countries.fetch()
        },
        
        
        onRender: function() {
            $.when(this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            if (!this.model.get('LOGIN')) {
                edit.create('GIVENNAME', 'text')
                edit.create('FAMILYNAME', 'text')
            }
            edit.create('PHONENUMBER', 'text')
            edit.create('EMAILADDRESS', 'text')
            edit.create('LABNAME', 'text')
            edit.create('ADDRESS', 'textarea')
            edit.create('CITY', 'text')
            edit.create('POSTCODE', 'text')
            edit.create('COUNTRY', 'select', { data: this.countries.kv() });
        },
        
    })
        
})