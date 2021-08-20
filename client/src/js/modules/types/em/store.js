import relion from 'modules/types/em/relion/parameters-store'

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
}

export default {
    'register': function(store) {
        if (!store.hasModule('em')) {
            store.registerModule('em', module)
            console.log('registered storage module em')
        }
        if (!store.hasModule(['em', 'relion'])) {
            store.registerModule(['em', 'relion'], relion)
            console.log('registered storage module em/relion')
        }
    },
    'unregister': function(store) {
        if (store.hasModule(['em', 'relion'])) {
            store.unregisterModule(['em', 'relion'])
            console.log('unregistered storage module em/relion')
        }
        if (store.hasModule('em')) {
            store.unregisterModule('em')
            console.log('unregistered storage module em')
        }
    },
}
