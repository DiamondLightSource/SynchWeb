define([
    'backbone'
], function (
    Backbone
) {
    return Backbone.Model.extend({
        urlRoot: '/em/process/relion/session'
    })
});
