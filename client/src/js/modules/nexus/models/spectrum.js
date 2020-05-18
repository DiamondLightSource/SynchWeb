define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'TITLE',
        urlRoot: '/nexus/spectrum',
    })
       
})
