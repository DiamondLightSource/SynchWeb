define(['marionette',
    
    'utils/editable',
    'tpl!templates/contact/contactview.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        initialize: function(options) {
            Backbone.Validation.bind(this);

        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('CARDNAME', 'text');
            edit.create('FAMILYNAME', 'text');
            edit.create('GIVENNAME', 'text');
            edit.create('PHONENUMBER', 'text');
            edit.create('EMAILADDRESS', 'text');
            edit.create('LABNAME', 'text');
            edit.create('ADDRESS', 'textarea');
            edit.create('COURIERACCOUNT', 'text');
            edit.create('DEFAULTCOURRIERCOMPANY', 'text');
            edit.create('BILLINGREFERENCE', 'text');
            edit.create('DEWARAVGCUSTOMSVALUE', 'text');
            edit.create('DEWARAVGTRANSPORTVALUE', 'text');
            
        },
        
    })
        
})