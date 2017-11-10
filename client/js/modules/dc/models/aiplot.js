define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'AUTOPROCPROGRAMID',
        urlRoot: '/download/plots',
    })
    
})