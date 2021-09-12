import Backbone from 'backbone'

const module = {
    'namespaced': true,
    'state': {
        'processingDialog': false,
        'processingDisallowedReason': '',
        'selectedMovie': 0,
    },
    'getters': {
        'processingDialogVisible': function(state) {
            return state.processingDialog
        },
        'processingAllowed': function(state) {
            return state.processingDisallowedReason == ''
        },
        'processingDisallowedReason': function(state) {
            return state.processingDisallowedReason == '' ?
                '' :
                "Relion processing can't be run because " +
                    state.processingDisallowedReason
        },
        'selectedMovie': function(state) {
            return state.selectedMovie
        },
    },
    'mutations': {
        'processingAllowedCheck': function(state, payload) {
            if (payload.dataCollection.ARCHIVED == '1') {
                state.processingDisallowedReason =
                    'this data collection is archived'
                return
            }

            const blockingStatus = payload.processingJobs.reduce(
                function(result, job) {
                    const status = job.PROCESSINGSTATUSDESCRIPTION
                    return ['submitted', 'queued', 'running'].includes(status) ?
                        status : result
                },
                ''
            )
            if (blockingStatus) {
                state.processingDisallowedReason = 'there is already a job ' +
                    blockingStatus + ' on this data collection'
                return
            }

            state.processingDisallowedReason = ''
        },
        'cancelProcessingDialog': function(state) {
            state.processingDialog = false
        },
        'showProcessingDialog': function(state) {
            state.processingDialog = true
        },
        'selectMovies': function(state, selectedMovie) {
            state.selectedMovie = selectedMovie
        },
    },
    'actions': {
        'fetch': function(context, {url, humanName}) {
            const fullUrl = context.rootGetters.apiUrl + url
            context.commit('loading', true, {'root': true })
            return new Promise((resolve, reject) => {
                // Backbone.ajax is overridden in src/js/app/marionette-application.js
                // to provide additional SynchWeb specific functionality
                Backbone.ajax({
                    'type': 'GET',
                    'url': fullUrl,
                    'success': function (
                        data,
                        textStatus, // eslint-disable-line no-unused-vars
                        jqXHR       // eslint-disable-line no-unused-vars
                    ) {
                        console.log(humanName, data)
                        context.commit('loading', false, {'root': true })
                        resolve(data)
                    },
                    'error': function(jqXHR, textStatus, errorThrown) {
                        console.log(
                            'Error fetching ', humanName, fullUrl,
                            'textStatus: ', textStatus,
                            'errorThrown: ', errorThrown,
                            'jqXHR: ', jqXHR
                        )
                        context.commit('notifications/addNotification', {
                            'title': 'Error',
                            'message': 'Could not retrieve ' + humanName,
                            'level': 'error'
                        }, {'root': true })
                        context.commit('loading', false, {'root': true })
                        reject()
                    }
                })
            })
        },
    },
}

export default {
    'register': function(store) {
        if (!store.hasModule('em')) {
            store.registerModule('em', module)
            console.log('registered storage module em')
        }
    },
    'unregister': function(store) {
        if (store.hasModule('em')) {
            store.unregisterModule('em')
            console.log('unregistered storage module em')
        }
    },
}
