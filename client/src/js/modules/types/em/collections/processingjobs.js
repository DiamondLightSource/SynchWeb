define([
    'backbone.paginator',
    'modules/types/em/models/processingjob'
], function(
    PageableCollection,
    ProcessingJob
) {
    return PageableCollection.extend(_.extend({}, {
        'model': ProcessingJob,
        'mode': 'server',
        'url': function() {
            const session = this.state.session
            return session === null ?
                '/em/jobs/' + this.state.dataCollection :
                '/em/process/relion/jobs/' + session
        },
        'state': {
            'pageSize': 15,
            'session': null,
            'dataCollection': null,
        },
        // eslint-disable-next-line no-unused-vars
        'parseState': function(r, q, state, options) {
            return { totalRecords: r.total }
        },
        // eslint-disable-next-line no-unused-vars
        parseRecords: function(r, options) {
            return r.data
        },
    }))
})


