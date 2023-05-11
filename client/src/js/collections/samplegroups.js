/**
 *  A collection of sample group members
 */

define(['backbone',
  'backbone.paginator',
  'models/samplegroup',
], function(Backbone, PageableCollection, SampleGroup) {
  return PageableCollection.extend({
    model: SampleGroup,
    url: '/sample/groups',

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
