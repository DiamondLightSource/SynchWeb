export default {
    'namespaced': true,
    'state': {
        'dialogVisible': false,
        'defaultParameters' : null,
    },
    'getters': {
        'dialogVisible': function(state) {
            return state.dialogVisible
        },
        'defaultParameters': function(state) {
            return state.defaultParameters
        },
    },
    'mutations': {
        'cancelDialog': function(state) {
            state.dialogVisible = false
        },
        /*  newState is null or a defaultParameters object
            If null:
               1. Dialog will get defaults from dataCollection
               2. With wantCalculate set to true
            If defaultParameters:
               1. Dialog will get defaults from defaultParameters
               2. With wantCalculate set to false
        */
        'showDialog': function(state, newState) {
            state.defaultParameters = newState
            state.dialogVisible = true
        },
    },
}
