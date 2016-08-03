define(['marionette',
    
    'utils/editable',
    'tpl!templates/contact/userview.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        initialize: function(options) {
            Backbone.Validation.bind(this);
            console.log(this.model)
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            if (!this.model.get('LOGIN')) {
                edit.create('GIVENNAME', 'text')
                edit.create('FAMILYNAME', 'text')
            }
            edit.create('PHONENUMBER', 'text')
            edit.create('EMAILADDRESS', 'text')
            edit.create('LABNAME', 'text')
            edit.create('ADDRESS', 'textarea')
            
        },
        
    })
        
})