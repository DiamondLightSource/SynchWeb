define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'AUTOPROCPROGRAMMESSAGEID',
        urlRoot: '/processing/messages',
    })
       
})

