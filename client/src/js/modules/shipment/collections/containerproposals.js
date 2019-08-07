define(['backbone.paginator', 'modules/shipment/models/containerproposal'], function(PageableCollection, ContainerProposal) {
    
    return PageableCollection.extend({
        model: ContainerProposal,
        mode: 'client',
        url: '/shipment/containers/registry/proposals',

        state: {
            pageSize: 15,
        },
    })
})