define(['backbone'], function(Backbone) {
  return Backbone.Model.extend({
    idAttribute: 'BLSAMPLEGROUPID',
    urlRoot: '/sample/groups',

    validation: {
      NAME: {
        required: false,
        pattern: 'wwdash',
      }
    }
  })
})