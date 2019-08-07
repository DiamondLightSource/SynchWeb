define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/users',
        idAttribute: 'PERSONID',
    })
    
})