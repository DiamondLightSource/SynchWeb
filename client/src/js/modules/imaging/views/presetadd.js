define(['marionette', 
    'views/form', 'models/protein', 
    'templates/imaging/savepreset.html'], function(Marionette, 
        TableView, Plan, 
        template) {
    
    
    return FormView.extend({
        template: template,
        
        ui: {
            ty: 'select[name=EXPERIMENTKIND]',
        },

        events: {
            'change @ui.ty': 'toggleType',
        },

        toggleType: function(e) {
            if (this.ui.ty.val() == 'OSC') {
                this.$el.find('.grid').hide()
                this.$el.find('.data').show()

            } else {
                this.$el.find('.grid').show()
                this.$el.find('.data').hide()
            }
        },

        createModel: function() {
            if (!this.model) this.model = new Plan()
        },
        

        success: function(model, response, options) {
            if (app.dialog.currentView) app.dialog.currentView.closeDialog()
        },

        onRender: function() {
            _.each(['EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'EXPOSURETIME', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY'], function(k) {
                this.$el.find('[name='+k+']').val(this.model.get(k))
            }, this)

            this.toggleType()
        }
    })

})