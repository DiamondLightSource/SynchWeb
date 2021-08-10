import Backbone from 'backbone'

/**
 * fetch data from an API endpoint and format it into "a fit state" for the
 * Vue components that will display it.
 *
 * You can provide a function that takes the response object as a parameter
 * and should return the data as a single object.
 *
 * @param {object} store an instance of the VueX store
 * @param {string} url the base URL of the endpoint to fetch from
 * @param {string} humanName name of data being fetched in human readable format
 * @param {Function} middleware a callback to reformat the data
 * @returns {Promise} (resolve, reject)
 */
export default function (store, url, humanName, middleware) {
    const handleResult = function (response) {
        const result = typeof middleware == 'function' ?
            middleware(response) : response;
        console.log(humanName, result)
        store.commit('loading', false)
        return result
    }

    const handleError = function(response) {
        const message = 'Could not retrieve ' + humanName
        store.commit('notifications/addNotification', {
            'title': 'Error',
            'message': message,
            'level': 'error'
        })
        console.log(response || message)
        store.commit('loading', false)
    }

    store.commit('loading', true)
    return new Promise((resolve, reject) => {
        Backbone.ajax({
            'type': 'GET',
            'url': store.state.apiUrl + url,
            'success': function (
                response,
                status, // eslint-disable-line no-unused-vars
                xhr // eslint-disable-line no-unused-vars
            ) {
                resolve(handleResult(response))
            },
            'error': function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                handleError(response)
                reject()
            }
        })
    })
}
