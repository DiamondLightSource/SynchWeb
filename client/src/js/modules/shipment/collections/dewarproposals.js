define(['backbone.paginator', 'modules/shipment/models/dewarproposal'], function(PageableCollection, DewarProposal) {
    
    return PageableCollection.extend({
        model: DewarProposal,
        mode: 'client',
        url: '/shipment/dewars/registry/proposals',

        state: {
            pageSize: 15,
        },
    })
})