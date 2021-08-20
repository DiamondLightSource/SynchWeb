define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
    idAttribute: 'EXPERIMENTTYPEID',
    urlRoot: '/exp/experiment/types',

    validation: {
      NAME: {
        required: true,
        pattern: 'wwdash',
      },
    }
  })
})
