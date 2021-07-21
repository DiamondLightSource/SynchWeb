define([
    'backbone.paginator',
    'modules/types/em/models/processingjobparameter'
], function(
    PageableCollection,
    ProcessingJobParameter
) {
    return PageableCollection.extend(_.extend({}, {
        'model': ProcessingJobParameter,
        'mode': 'server',
        'url': '/em/process/relion/job/parameters',
        'state': {
            pageSize: 15,
            session: null
        },
        // eslint-disable-next-line no-unused-vars
        'parseState': function(r, q, state, options) {
            return { totalRecords: r.total }
        },
        // eslint-disable-next-line no-unused-vars
        'parseRecords': function(r, options) {
            return r.data
        },
    }))
})


