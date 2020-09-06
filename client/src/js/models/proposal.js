define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PROPOSAL',
        urlRoot: '/proposal',

        validation: {
            PROPOSALCODE: {
                required: true,
                pattern: 'word',
            },
            PROPOSALNUMBER: {
                required: true,
                pattern: 'number',
            },
            TITLE: {
                required: true,
                pattern: 'wwsbdash',
            },
        }
    })
       
})
