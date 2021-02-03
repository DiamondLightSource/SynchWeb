define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
      idAttribute: 'CONTAINERTYPEID',
      urlRoot: '/shipment/containers/types',

      validation: {
          NAME: {
              required: true,
              pattern: 'wwdash',
          },

          CAPACITY: {
            required: true,
            pattern: 'number',
          },
      }
  })
})
