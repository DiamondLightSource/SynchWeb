define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'BLSAMPLEIMAGEAUTOSCORESCHEMAID',
        urlRoot: '/imaging/inspection/images/scores/auto/schemas',
    })
       
})
