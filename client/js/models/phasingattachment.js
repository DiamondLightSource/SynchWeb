define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PHASINGPROGRAMATTACHMENTID',
        urlRoot: '/download/ph/attachments',
    })
       
})

