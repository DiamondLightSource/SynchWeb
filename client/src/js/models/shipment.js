define(['backbone'], function (Backbone) {

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

      REMOTEORMAILIN: {
        required: false,
      },

      SESSIONLENGTH: {
        required: false,
        pattern: 'number',
        fn: function (value){
          if (value != parseInt(value, 10)) {
            return 'Session length must be a whole number of hours'
          }
          if (parseInt(value, 10) < 1) {
            return 'Session length must be at least one hour'
          }
        }
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
