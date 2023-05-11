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

    initialize(collection, options) {
      if (options && options.sampleGroupId) {
        this.sampleGroupId = options.sampleGroupId
      }
    },

    state: {
      pageSize: 100,
    },

    parseRecords: function(r) {
      return r.data
    },

    parseState: function(r) {
      return { totalRecords: r.total }
    },

    save(options) {
      options = _.extend({}, options)

      var col = this
      var success = options.success;
      options.success = function(resp) {
        col.reset(resp, { silent: true })
        if (success) success(col, resp, options)
      }

      return Backbone.sync('create', this, options)
    },
  })
})