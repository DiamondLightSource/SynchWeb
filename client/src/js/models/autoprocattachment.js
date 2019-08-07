define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'AUTOPROCPROGRAMATTACHMENTID',
        urlRoot: '/download/ap/attachments',
    })
       
})

