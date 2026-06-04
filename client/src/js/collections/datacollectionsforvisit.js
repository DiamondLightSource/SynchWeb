define(['backbone.paginator', 'models/datacollectionsforvisit', 'utils/kvcollection'], function(PageableCollection, DCs, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: DCs,
        mode: 'server',
        visit: null,
        pid: null,
        sgid: null,
        url: function() {
            if (this.pid) {
                return '/processing/summary/protein/'+this.pid
            } else if (this.visit) {
                return '/processing/summary/visit/'+this.visit
            } else {
                return '/processing/summary/group/'+this.sgid
            }
        },

        initialize(collection, options) {
            if (options && options.queryParams && options.queryParams.visit) {
                this.visit = options.queryParams.visit
            }
            if (options && options.queryParams && options.queryParams.pid) {
                this.pid = options.queryParams.pid
            }
            if (options && options.queryParams && options.queryParams.sgid) {
                this.sgid = options.queryParams.sgid
            }
        },

        state: {
            pageSize: 15,
        },

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },

        parseRecords: function(r, options) {
            return r.data
        },

    }))
})
