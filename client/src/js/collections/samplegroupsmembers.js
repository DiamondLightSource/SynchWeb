define(['backbone', 'backbone.paginator', 'models/samplegroupsmember'], function(
  Backbone,
  PageableCollection,
  SampleGroupsMember
) {

  return PageableCollection.extend({
    blSampleId: null,
    url: function() {
      if (this.blSampleId) {
        return `/sample/groups/${this.blSampleId}`
      }

      return '/sample/groups'
    },
    model: SampleGroupsMember,

    initialize(models, options) {
      if (options.blSampleId) {
        this.blSampleId = options.blSampleId
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
    }
  })
})