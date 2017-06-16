define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: '/dc/xfm',

        parse: function(r, options) {
            return { data: r }
        },
    })

})