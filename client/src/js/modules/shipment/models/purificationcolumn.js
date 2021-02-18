define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
      idAttribute: 'PURIFICATIONCOLUMNID',
      urlRoot: '/exp/purification/columns',

      validation: {
          NAME: {
              required: true,
              pattern: 'wwdash',
          },
      }
  })
})
