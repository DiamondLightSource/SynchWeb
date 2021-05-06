define(['backbone', 'utils/validation_rules', 'vee-validate'], function(Backbone, ValidationRules) {

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
    }
  }, {
    validationRules: function() {

      return {
        SHIPPINGNAME: {
          required: true,
          regex: ValidationRules.wwsdash.regex
        },
        FCODES: {
          required: true,
          regex: ValidationRules.fcode.regex
        },

        SENDINGLABCONTACTID: {
          required: true,
        },

        RETURNLABCONTACTID: {
          required: true,
        },

        DELIVERYAGENT_AGENTCODE: {
          required: false,
          alphadash: true
        },

        DELIVERYAGENT_AGENTNAME: {
          required: false,
          regex: ValidationRules.wwsdash.regex
        },
        // VeeValidate 2 has no out of the box date format. Version 3 does.
        DELIVERYAGENT_SHIPPINGDATE: {
          required: false,
          regex: ValidationRules.edate.regex
        },

        READYBYTIME: {
          required: false,
          regex: ValidationRules.time.regex
        },

        CLOSETIME: {
          required: false,
          regex: ValidationRules.time.regex
        },

        PHYSICALLOCATION: {
          required: false,
          regex: ValidationRules.wwsdash.regex,
          max: 35,
        },
      }
    }
  })

})
