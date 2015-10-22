define(['marionette',
    
    'utils/editable',
    'tpl!templates/imaging/ssdiffractionplan.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        modelEvents: {
            'change:EXPERIMENTKIND': 'toggleType',
        },


        toggleType: function(e) {
            if (this.model.get('EXPERIMENTKIND') == 'OSC') {
                this.$el.find('.grid').hide()
                this.$el.find('.data').show()

            } else {
                this.$el.find('.grid').show()
                this.$el.find('.data').hide()
            }
        },


        initialize: function(options) {
            Backbone.Validation.bind(this);
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('EXPERIMENTKIND', 'select', { data: { 'MESH': 'Grid Scan', 'OSC': 'Data Collection' }});
            edit.create('X', 'text');
            edit.create('Y', 'text');
            edit.create('COMMENTS', 'text');
            edit.create('WAVELENGTH', 'text');
            edit.create('TRANSMISSION', 'text');
            edit.create('PREFERREDBEAMSIZEX', 'text');
            edit.create('PREFERREDBEAMSIZEY', 'text');
            edit.create('BOXSIZEX', 'text');
            edit.create('BOXSIZEY', 'text');
            edit.create('EXPOSURETIME', 'text');
            edit.create('REQUIREDRESOLUTION', 'text');
            edit.create('AXISSTART', 'text');
            edit.create('AXISRANGE', 'text');
            edit.create('NUMBEROFIMAGES', 'text');
            edit.create('KAPPASTART', 'text');
            
            this.toggleType()
        },
        
    })
        
})