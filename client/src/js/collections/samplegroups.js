/**
 *  A collection of sample group members
 */

define(['backbone',
  'backbone.paginator',
  'models/samplegroup',
], function(Backbone, PageableCollection, SampleGroup) {
  return PageableCollection.extend({
    blSampleId: null,
    model: SampleGroup,
    url: function() {
      if (this.blSampleId) {
        return `/sample/groups/${this.blSampleId}`
      } else {
        return '/sample/groups'
      }
    },

    mode: 'server',

    state: {
      pageSize: 100,
    },

    parseRecords: function(r) {
      return r.data
    },

    parseState: function(r) {
      return { totalRecords: r.total }
    },
  })
})
