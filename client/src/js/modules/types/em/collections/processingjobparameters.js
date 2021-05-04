define(['backbone.paginator', 'modules/types/em/models/processingjobparameter'], function(PageableCollection, ProcessingJobParameter) {
       
    return PageableCollection.extend(_.extend({}, {
        model: ProcessingJobParameter,
        mode: 'server',
        url: '/em/process/relion/job/parameters',
                
        state: {
            pageSize: 15,
            session: null
        },      

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
    }))

})


