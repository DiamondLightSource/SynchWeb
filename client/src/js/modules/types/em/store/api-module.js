import Backbone from 'backbone'

export default {
    'namespaced': true,
    'state': {
        'loadingCount': 0,
    },
    'getters': {
        'apiUrl': function(
            state, // eslint-disable-line no-unused-vars
            getters, // eslint-disable-line no-unused-vars
            rootState
        ) {
            return rootState.apiUrl + '/em/';
        },
    },
    'actions': {
        'loading': function(context, loading) {
            if (loading) {
                context.commit('loading', true, {'root': true })
                context.state.loadingCount++
                return
            }
            context.state.loadingCount--
            if (context.state.loadingCount == 0) {
                context.commit('loading', false, {'root': true })
            }
        },
        'post': function(context, {url, requestData, humanName, errorHandler}) {
            const fullUrl = context.getters.apiUrl + url
            context.dispatch('loading', true)

            return new Promise((resolve, reject) => {
                const extractErrorMessage = (jqXHR) => {
                    var message
                    try {
                        message = JSON.parse(jqXHR.responseText).message
                    } catch (error) {
                        return false
                    }
                    return message ? message : false
                }
                const reportError = (jqXHR) => {
                    const message = extractErrorMessage(jqXHR)
                    if (
                        message !== false &&
                        typeof errorHandler == 'function' &&
                        errorHandler(message) === true
                    ) {
                        return
                    }
                    context.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Error posting ' + humanName + ' ' + (
                            message ? message : ''
                        ),
                        'level': 'error'
                    }, {'root': true })
                }

                // Backbone.ajax is overridden in src/js/app/marionette-application.js
                // to provide additional SynchWeb specific functionality
                Backbone.ajax({
                    'type': 'POST',
                    'url': fullUrl,
                    'contentType': 'application/json',
                    'data': JSON.stringify(requestData),
                    'success': function (
                        responseData,
                        textStatus, // eslint-disable-line no-unused-vars
                        jqXHR       // eslint-disable-line no-unused-vars
                    ) {
                        console.log('post', humanName, requestData, responseData)
                        context.dispatch('loading', false)
                        resolve(responseData)
                    },
                    'error': function(jqXHR, textStatus, errorThrown) {
                        context.dispatch('loading', false)
                        console.log(
                            'error',
                            textStatus,
                            errorThrown,
                            jqXHR,
                            requestData,
                            fullUrl
                        );
                        reportError(jqXHR)
                        reject()
                    },
                })
            })
        },
        'fetch': function(context, {url, humanName}) {
            const fullUrl = context.getters.apiUrl + url
            context.dispatch('loading', true)
            return new Promise((resolve, reject) => {
                // Backbone.ajax is overridden in src/js/app/marionette-application.js
                // to provide additional SynchWeb specific functionality
                Backbone.ajax({
                    'type': 'GET',
                    'url': fullUrl,
                    'success': function (
                        responseData,
                        textStatus, // eslint-disable-line no-unused-vars
                        jqXHR       // eslint-disable-line no-unused-vars
                    ) {
                        console.log('fetch', humanName, responseData)
                        context.dispatch('loading', false)
                        resolve(responseData)
                    },
                    'error': function(jqXHR, textStatus, errorThrown) {
                        console.log(
                            'Error on GET ', humanName, fullUrl,
                            'textStatus: ', textStatus,
                            'errorThrown: ', errorThrown,
                            'jqXHR: ', jqXHR
                        )
                        context.commit('notifications/addNotification', {
                            'title': 'Error',
                            'message': 'Failed to request ' + humanName,
                            'level': 'error'
                        }, {'root': true })
                        context.dispatch('loading', false)
                        reject()
                    }
                })
            })
        },
    },
}
