define(['backbone.paginator', 'modules/shipment/models/experimenttype'], function(PageableCollection, ExperimentType) {

  return PageableCollection.extend({
    model: ExperimentType,
    mode: 'server',
    url: '/exp/experiment/types',

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
