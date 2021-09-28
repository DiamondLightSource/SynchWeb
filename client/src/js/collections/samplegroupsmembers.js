define(['backbone', 'backbone.paginator', 'models/samplegroupsmember'], function(
  Backbone,
  PageableCollection,
  SampleGroupsMember
) {

  return PageableCollection.extend({
    blSampleId: null,
    url: function() {
      return `/sample/groups/${this.blSampleId}`
    },
    model: SampleGroupsMember,

    initialize(models, options) {
      this.blSampleId = options.blSampleId
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