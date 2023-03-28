define(['backbone.paginator', 'modules/shipment/models/containertype'], function(PageableCollection, ContainerType) {

  return PageableCollection.extend({
    model: ContainerType,
    mode: 'server',
    url: '/shipment/containers/types',

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
