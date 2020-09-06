define(['marionette', 'backbone',
        'utils/editable',
        'templates/admin/userview.html',
        'backbone-validation'
    ], function(Marionette, Backbone, Editable, template) {

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        initialize: function(options) {
            Backbone.Validation.bind(this);
        },

        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
        }

    })

})
