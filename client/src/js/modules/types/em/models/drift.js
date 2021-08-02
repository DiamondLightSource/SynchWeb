define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        'urlRoot': '/em/mc/drift',
        'parse': function(
            response,
            options // eslint-disable-line no-unused-vars
        ) {
            const drift = {
                'data': response,
                'label': 'Drift',
                'color': '#F0F',
            }
            console.log('drift', drift)
            return {
                'drift': JSON.stringify(drift)
            }
        },
    })
})
