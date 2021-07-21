define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        'urlRoot': '/em/mc/drift',
        // eslint-disable-next-line no-unused-vars
        'parse': function(r, options) {
            return { 'data': r }
        },
    })
})
