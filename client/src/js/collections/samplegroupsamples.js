define(['backbone', 'backbone.paginator', 'models/samplegroupsample'], function(
  Backbone,
  PageableCollection,
  SampleGroupSample
) {
  return PageableCollection.extend({
    sampleGroupId: null,
    url: function() {
      return `/sample/groups/${this.sampleGroupId}/samples`
    },
    model: SampleGroupSample,
    mode: 'server',

    comparator: function(m) {
      return parseInt(m.get('GROUPORDER'))
    },

    state: {
      pageSize: 100,
    },

    parseRecords: function(r) {
      return r.data
    },

    parseState: function(r) {
      return { totalRecords: r.total }
    }
  })
})