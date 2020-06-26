define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'BLSAMPLEIMAGEID',
        urlRoot: '/imaging/inspection/images/scores/auto',
    })
       
})
