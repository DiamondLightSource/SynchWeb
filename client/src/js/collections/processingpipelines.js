define(['backbone.paginator', 'models/processingpipeline', 'utils/kvcollection'], function(PageableCollection, ProcessingPipeline ,KVCollection) {

    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: ProcessingPipeline,
        mode: 'client',
        url: '/process/pipelines',
                                          
        state: {
            pageSize: 9999,
        },
                                          
        parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
        
        keyAttribute: 'PIPELINE',
        valueAttribute: 'PROCESSINGPIPELINEID',

    }))
})