define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
    idAttribute: 'DEWARID',
    urlRoot: '/shipment/dewars',
      
    validation: {
      CODE: {
        required: true,
        pattern: 'wwdash',
      },
      
      FACILITYCODE:{
        pattern: 'fcode',
        required: false
      },
      
      TRACKINGNUMBERTOSYNCHROTRON:{
        pattern: 'word',
        required: false
      },
      
      TRACKINGNUMBERFROMSYNCHROTRON:{
        pattern: 'word',
        required: false
      },
      
      FIRSTEXPERIMENTID:{
        pattern: 'word',
        required: false
      },

      WEIGHT: {
        pattern: 'number',
        required: true
      }
    },
    
  })
       
})
