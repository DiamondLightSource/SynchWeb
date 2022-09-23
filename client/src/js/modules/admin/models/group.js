define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/users/groups',
        idAttribute: 'USERGROUPID',

        defaults: {
            NAME: '',
            USERS: 0,
        },

        validation: {
            NAME: {
                required: true,
                pattern: 'word',
            }
        }

    })  
})