define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'DEWARREGISTRYHASPROPOSALID',
        urlRoot: '/shipment/dewars/registry/proposals',
            
        validation: {
            PROPOSALID: {
                required: true,
                pattern: 'number',
            },

            DEWARREGISTRYID: {
                required: true,
                pattern: 'number',
            },

            LABCONTACTID: {
                required: false,
                pattern: 'number',
            },
        }
    })
})
