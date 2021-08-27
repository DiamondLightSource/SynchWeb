import Backbone from 'backbone'

export default function(parameters, store) {

    const transforms = {
        'none': function(parameter) {
            return parameter.trim()
        },
        'fileExtension': function(parameter) {
            return parameter.trim().substr(1)
        },
        'boolean': function(parameter) {
            return parameter === true
        },
        'integer': function(parameter) {
            return parseInt(parameter, 10)
        },
        'float': function(parameter) {
            return parseFloat(parameter)
        },
    }

    var postData = {}

    /* Convert form inputs from string to float, integer, or boolean
     * Ensures values are correctly encoded in JSON, not as strings
     * parseInt() and parseFloat() trim whitespace characters.
     * parseInt() removes fractional-part of numeric input.
     */
    parameters.forEach(function(parameter) {
        if (
            !parameter.conditional ||
            transforms.boolean(parameter.conditional)
        ) {
            postData[parameter.name] = transforms[parameter.transform](
                parameter.value
            )
        }
    })


    store.commit('loading', true)
    Backbone.ajax({
        'url': store.apiUrl +
            '/em/process/relion/session/' +
            store.getters['proposal/currentVisit'],
        'type': 'POST',
        'contentType': 'application/json',
        'data': JSON.stringify(postData),
        'success': function (
            response, // eslint-disable-line no-unused-vars
            status, // eslint-disable-line no-unused-vars
            xhr // eslint-disable-line no-unused-vars
        ) {
            store.commit('loading', false)
            store.commit('em/cancelProcessingDialog', null)
            store.commit('notifications/addNotification', {
                'title': 'Job submitted',
                'message': 'Processing Job submitted OK.',
                'level': 'success'
            })
        },
        'error': function (
            model,
            response, // eslint-disable-line no-unused-vars
            options // eslint-disable-line no-unused-vars
        ) {
            store.commit('loading', false)
            store.commit('notifications/addNotification', {
                'title': 'Failed',
                'message': 'There was a problem processing this request.',
                'level': 'error'
            })
            console.log('Relion start failed', model)
        },
    })
}
