define(['backbone.paginator', 'modules/types/em/models/processingjob'], function(PageableCollection, ProcessingJob) {
       
    return PageableCollection.extend(_.extend({}, {
        model: ProcessingJob,
        mode: 'server',
        url: '/em/process/relion/jobs',
                
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


