define(['backbone.paginator', 'models/visit', 'utils/kvcollection'], function(PageableCollection, Visit, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Visit,
        mode: 'server',
        url: '/proposal/visits',
        initialize: function(models, options) {
          this.dateTimeZone = options.timeZone ? options.timeZone : 'Europe/London'
        },
                                          
        state: {
          pageSize: 10,
        },
                                          
        parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
      
        keyAttribute: 'VISITDETAIL',
        valueAttribute: 'SESSIONID',
    }))
})