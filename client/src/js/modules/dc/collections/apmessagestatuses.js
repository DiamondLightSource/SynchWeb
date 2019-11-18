define(['backbone', 'modules/dc/models/apmessagestatus'], function(Backbone, DCAPMessageStatusModel) {

    return Backbone.Collection.extend({
        model: DCAPMessageStatusModel,
        url: '/dc/apms',
    })
       
})
