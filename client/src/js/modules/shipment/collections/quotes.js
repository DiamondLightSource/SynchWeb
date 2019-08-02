define(['backbone.paginator'], function(PagableCollection) {

    return PagableCollection.extend({
        mode: 'client',
        url: '/shipment/awb/quote',
          
        state: {
            pageSize: 9999,
        },  
    })

})
