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
        required: false,
        pattern: 'wwdash'
      },
      
      DELIVERYAGENT_AGENTNAME: {
        required: false,
        pattern: 'wwsdash'
      },


      DELIVERYAGENT_SHIPPINGDATE: {
        required: false,
        pattern: 'edate'
      },

      READYBYTIME: {
        required: false,
        pattern: 'time'
      },

      CLOSETIME: {
        required: false,
        pattern: 'time'
      },

      PHYSICALLOCATION: {
        required: false,
        pattern: 'wwsdash',
        maxLength: 35,
      },


    },
      
  })
       
})
