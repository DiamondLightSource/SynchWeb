define(['backbone', 'views/form',
    'models/user',

    'templates/admin/useradd.html',
    ], function(Backbone, FormView, User, template) {

    return FormView.extend({
        template: template,

        createModel: function() {
            this.model = new User()
        },
        
        success: function(model, response, options) {
            app.trigger('useradm:show', model.get('PERSONID'))
        },

        failure: function(model, response, options) {
            app.alert({ message: 'Something went wrong creating this user, please try again'})
        },
    })

})