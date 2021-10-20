export default {
    'namespaced': true,
    'state': {
        'dialogVisible': false,
        'dialogOptions': {
            'defaults' : null,
            'wantCalculate': false,
        },
    },
    'getters': {
        'dialogVisible': function(
            state,
            getters, // eslint-disable-line no-unused-vars
            rootState // eslint-disable-line no-unused-vars
        ) {
            return state.dialogVisible
        },
        'dialogOptions': function(
            state,
            getters, // eslint-disable-line no-unused-vars
            rootState // eslint-disable-line no-unused-vars
        ) {
            return state.dialogOptions
        },
    },
    'mutations': {
        'cancelDialog': function(state) {
            state.dialogVisible = false
        },
        // newState can be true or a ProcessingJob
        'showDialog': function(state, newState) {
            state.dialogOptions = newState
            state.dialogVisible = true
        },
    },
}
