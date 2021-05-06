define(['backbone.paginator', 'modules/shipment/models/purificationcolumn'], function(PageableCollection, PurificationColumn) {

  return PageableCollection.extend({
      model: PurificationColumn,
      mode: 'server',
      url: '/exp/purification/columns',

      state: {
          pageSize: 10,
      },

      parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
      },

      parseRecords: function(r, options) {
          return r.data
      },

  })
})