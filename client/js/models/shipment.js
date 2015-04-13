define(['backbone'], function(Backbone) {
    
  return Backbone.Model.extend({
    idAttribute: 'SHIPPINGID',
    urlRoot: '/shipment/shipments',
      
    /*
     Validators for shipment, used for both editables and new shipments
    */
    validation: {
      SHIPPINGNAME: {
        required: true,
        pattern: 'wwsdash',
      },
      
      'FCODES[]': {
        required: false,
        pattern: 'fcode',
      },
      
      SENDINGLABCONTACTID: {
        required: true,
      },
      
      RETURNLABCONTACTID: {
        required: true,
      },
      
      DELIVERYAGENT_AGENTCODE: {
        required: true,
      },
      
      DELIVERYAGENT_AGENTNAME: {
        required: true,
      },
    },
      
  })
       
})
