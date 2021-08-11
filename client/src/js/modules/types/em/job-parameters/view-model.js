import baseViewModel from 'modules/types/em/components/view-model'

const middleware = function(response) {
    return response.data.map(function(parameter) {
        return {
            'key': parameter.PARAMETERKEY,
            'value': parameter.PARAMETERVALUE,
        }
    })
}

export default {
    'fetch': function(store, processingJobId) {
        return baseViewModel(
            store,
            '/em/process/relion/job/parameters?processingJobId=' + processingJobId,
            'Processing Job Parameters',
            middleware
        )
    },
}
