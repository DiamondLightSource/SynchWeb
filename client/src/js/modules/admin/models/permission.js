define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/users/permissions',
        idAttribute: 'PERMISSIONID',

        defaults: {
            TYPE: '',
            DESCRIPTION: '',
        },

    })
    
})