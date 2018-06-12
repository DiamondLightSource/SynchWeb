define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'type',
        urlRoot: '/stats/pc',
    })

})