import Backbone from 'backbone'

const module = {
    'namespaced': true,
    'state': {
        'processingDialog': false,
        'processingDisallowedReason': '',
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
        }
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
    },
    'actions': {
        'fetch': function(context, {url, humanName, middleware}) {
            const handleResult = function (response) {
                const result = typeof middleware == 'function' ?
                    middleware(response) : response;
                console.log(humanName, result)
                context.commit('loading', false, {'root': true })
                return result
            }

            const handleError = function(response) {
                const message = 'Could not retrieve ' + humanName
                context.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': message,
                    'level': 'error'
                }, {'root': true })
                console.log(response || message)
                context.commit('loading', false, {'root': true })
            }

            context.commit('loading', true, {'root': true })
            return new Promise((resolve, reject) => {
                // Backbone.ajax is overridden in src/js/app/marionette-application.js
                // to provide additional SynchWeb specific functionality
                Backbone.ajax({
                    'type': 'GET',
                    'url': context.rootGetters.apiUrl + url,
                    'success': function (
                        response,
                        status, // eslint-disable-line no-unused-vars
                        xhr // eslint-disable-line no-unused-vars
                    ) {
                        resolve(handleResult(response))
                    },
                    'error': function(
                        model,
                        response, // eslint-disable-line no-unused-vars
                        options // eslint-disable-line no-unused-vars
                    ) {
                        handleError(JSON.parse(model.responseText).message)
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
