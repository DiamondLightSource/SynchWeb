define(['backbone', 'modules/mc/models/intstatus'], function(Backbone, DCIntStatusModel) {

    return Backbone.Collection.extend({
        model: DCIntStatusModel,                                 
        url: function() { return '/mc/ints'+ (this.user ? '/user/'+_.result(this, 'user') : '') },
    })
       
})