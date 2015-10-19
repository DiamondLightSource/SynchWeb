define(['backbone.paginator', 'models/shipment', 'utils/kvcollection'], function(PageableCollection, Shipment, KVCollection) {
       
  return PageableCollection.extend(_.extend({}, KVCollection, {
    model: Shipment,
    mode: 'client',
    url: '/shipment/shipments',
                                  
    keyAttribute: 'SHIPPINGNAME',
    valueAttribute: 'SHIPPINGID',

    state: {
      pageSize: 15,
    },
      
  }))
})