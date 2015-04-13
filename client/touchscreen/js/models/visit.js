define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'VISIT',
        urlRoot: '/assign/visits',
    })

})