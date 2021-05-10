define(['backbone.paginator', 'modules/types/em/models/processingjob'], function(PageableCollection, ProcessingJob) {
       
    return PageableCollection.extend(_.extend({}, {
        model: ProcessingJob,
        mode: 'server',
        url: function() { return '/em/process/relion/jobs'+(this.state.session ? '/'+this.state.session : '') },

                
        state: {
            pageSize: 15,
            session: null,
        },      

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },                      
    }))

})


