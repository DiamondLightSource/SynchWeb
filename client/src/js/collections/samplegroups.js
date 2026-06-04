/**
 *  A collection of sample group members
 */

define(['backbone',
  'backbone.paginator',
  'models/samplegroup',
  'utils/kvcollection',
], function(Backbone, PageableCollection, SampleGroup, KVCollection) {
  return PageableCollection.extend(_.extend({}, KVCollection, {
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

    keyAttribute: 'NAME',             // What the user sees in the dropdown list
    valueAttribute: 'BLSAMPLEGROUPID', // The hidden ID submitted when selected
  }))
})
