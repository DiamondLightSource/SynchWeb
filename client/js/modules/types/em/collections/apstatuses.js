define(['backbone', 'modules/dc/models/apstatus'], function(Backbone, DCAPStatusModel) {

    return Backbone.Collection.extend({
        model: DCAPStatusModel,
        url: '/em/aps',
    })
       
})