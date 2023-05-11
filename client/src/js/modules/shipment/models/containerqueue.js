define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
    idAttribute: 'CONTAINERID',
    urlRoot: '/shipment/containers/queue',

    validation: {
      CONTAINERID: {
        required: true,
        pattern: 'number',
      },

      QUEUE: {
        required: false,
        pattern: 'number',
      },
    }
  })
})
