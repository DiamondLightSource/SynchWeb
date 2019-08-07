define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'type',
        urlRoot: '/stats/logon',
        
        parse: function(resp) {
            return { data: resp }
        }
    })

})