/**
 *  A collection of sample group and its number of members
 */

define([
    'backbone.paginator',
    'models/samplegroupname',
    'underscore'
    ], function(
        PageableCollection,
        SampleGroupNames,
        _
    ) {

    return PageableCollection.extend({
        model: SampleGroupNames,
        url: '/sample/groups/name',
        mode: 'server',
        state: {
            pageSize: 15,
        },

        parseRecords: function(r, options) {
            return r.data
        },

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        }
    })
})
