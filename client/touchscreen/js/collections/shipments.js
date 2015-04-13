define(['backbone.paginator'], function(PageableCollection) {
    
  var Shipment = Backbone.Model.extend({
      idAttribute: 'SHIPPINGID',
  })
    
  return PageableCollection.extend({
    model: Shipment,
    mode: 'client',
                                      
    state: {
      pageSize: 15,
    },
      
  })
})