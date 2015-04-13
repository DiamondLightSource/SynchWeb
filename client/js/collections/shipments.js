define(['backbone.paginator', 'models/shipment'], function(PageableCollection, Shipment) {
       
  return PageableCollection.extend({
    model: Shipment,
    mode: 'client',
    url: '/shipment/shipments',
                                      
    state: {
      pageSize: 15,
    },
      
  })
})