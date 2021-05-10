define([
    'backbone'
], function (
    Backbone
) {
    return Backbone.Model.extend({
        urlRoot: '/em/process/relion/jobs/parameter',
        idAttribute: 'PROCESSINGJOBPARAMETERID',
    })
});
