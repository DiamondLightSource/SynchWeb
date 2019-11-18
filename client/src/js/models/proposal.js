define(['backbone', 'backbone-validation'], function(Backbone) {

    var Proposal = Backbone.Model.extend({
        idAttribute: 'PROPOSAL',
        urlRoot: '/proposal',

        validation: {
            PROPOSALCODE: {
                pattern: 'word',
                required: true,
            },
            PROPOSALNUMBER: {
                pattern: 'number',
                required: true,
            },
            TITLE: {
                pattern: 'wwsdash',
                required: true,
            },
            PERSONID: {
                pattern: 'number',
                required: true,
            },
            STATE: {
                pattern: 'word',
                required: false,
            },
            EXTERNALID: {
                pattern: 'wwdash',
                required: false,
            },
        }
    })

    _.extend(Proposal.prototype, Backbone.Validation.mixin)
    return Proposal
       
})
