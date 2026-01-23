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
        msg: 'The Shipment Name is required',
      },

      'FCODES[]': {
        required: false,
        pattern: 'fcode',
      },

      SAFETYLEVEL: {
        required: true,
        msg: 'The Safety Level field is required',
      },

      DYNAMIC: {
        required: true,
        msg: 'The Scheduling field is required',
      },

      FIRSTEXPERIMENTID: {
        required: false,
        pattern: 'number',
      },

      REMOTEORMAILIN: {
        required: false,
      },

      COMMENTS: {
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
        msg: 'The Outgoing Lab Contact field is required',
      },

      RETURNLABCONTACTID: {
        required: false,
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

      EXTRASUPPORTREQUIREMENT: {
        required: false
      }

    },

  })

})
