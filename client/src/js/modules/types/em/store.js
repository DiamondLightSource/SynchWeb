import relion from 'modules/types/em/relion/parameters-store'

const module = {
    'namespaced': true,
    'state': {
        'processingDialog': false,
    },
    'getters': {
        'processingDialogVisible': function(state) {
            return state.processingDialog
        },
    },
    'mutations': {
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
