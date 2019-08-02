define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'DATACOLLECTIONFILEATTACHMENTID',
        urlRoot: '/download/attachments',
    })
       
})

