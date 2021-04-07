/**
 *  A collection of sample group members
 */

define(['backbone',
  'backbone.paginator',
  'models/samplegroup',
  'underscore'
  ], function(Backbone,
    PageableCollection,
    SampleGroupMember,
      _
  ) {
  return PageableCollection.extend({
    model: SampleGroupMember,
    url: '/sample/groups',

    mode: 'server',

    state: {
      pageSize: 100,
    },

    addNew: true,

    initialize: function(models, options) {
      if (options) {
        this.groupId = options.id
      }
    },

    parseRecords: function(r, options) {
      return r.data
    },

    parseState: function(r, q, state, options) {
      return { totalRecords: r.total }
    },

    save: function(options) {
      var collection = this
      var success = options.success;

      options.success = function(resp) {
        collection.reset(resp, { silent: true })
        if (success) success(collection, resp, options)
      }

      if (this.groupId) {
        const updateCollection = _.extend(this, { url: `/sample/groups/${this.groupId}` })
        return Backbone.sync('update', updateCollection, options)
      }
      
      return Backbone.sync('create', this, options)
    },

    each: function(callback, ctx){
      _.pluck(this.models, 'cid').forEach(function (cid, index) {
        var model = this.get(cid, index);
        callback.call(ctx, model, index, this.models);
      }.bind(this));
    }
  })
})
