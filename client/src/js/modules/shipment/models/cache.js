define(['backbone'], function(Backbone) {


    return Backbone.Model.extend({
        idAttribute: 'name',
        urlRoot: '/shipment/cache',
        
        parse: function(r) {
            console.log('load cache modl', r)
            return { data: r }
        },
    })

})