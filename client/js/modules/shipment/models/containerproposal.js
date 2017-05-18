define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'CONTAINERREGISTRYHASPROPOSALID',
        urlRoot: '/shipment/containers/registry/proposals',
            
        validation: {
            PROPOSALID: {
                required: true,
                pattern: 'number',
            },

            CONTAINERREGISTRYID: {
                required: true,
                pattern: 'number',
            },
        }
    })
})
