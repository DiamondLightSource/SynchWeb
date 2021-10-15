import Backbone from 'backbone'

const emModule = {
    'namespaced': true,
    'state': {
        // processingDialog is either false, true or a ProcessingJob object
        'processingDialog': false,
        'selectedMovie': 0,
    },
    'getters': {
        'apiUrl': function(
            state, // eslint-disable-line no-unused-vars
            getters, // eslint-disable-line no-unused-vars
            rootState
        ) {
            return rootState.apiUrl + '/em/';
        },
        'processingDialogVisible': function(
            state,
            getters, // eslint-disable-line no-unused-vars
            rootState // eslint-disable-line no-unused-vars
        ) {
            return state.processingDialog !== false
        },
        'processingDialogPreviousParameters': function(
            state,
            getters, // eslint-disable-line no-unused-vars
            rootState // eslint-disable-line no-unused-vars
        ) {
            return typeof state.processingDialog == 'object' ?
                state.processingDialog : null
        },
        'selectedMovie': function(
            state,
            getters, // eslint-disable-line no-unused-vars
            rootState // eslint-disable-line no-unused-vars
        ) {
            return state.selectedMovie
        },
    },
    'mutations': {
        'cancelProcessingDialog': function(state) {
            state.processingDialog = false
        },
        // newState can be true or a ProcessingJob
        'showProcessingDialog': function(state, newState) {
            state.processingDialog = typeof newState == 'undefined' ?
                true : newState
        },
        'selectMovies': function(state, selectedMovie) {
            state.selectedMovie = selectedMovie
        },
    },
    'actions': {
        'post': function(context, {url, requestData, humanName, errorHandler}) {
            const fullUrl = context.getters.apiUrl + url
            context.commit('loading', true, {'root': true })

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
                        context.commit('loading', false, {'root': true })
                        resolve(responseData)
                    },
                    'error': function(jqXHR, textStatus, errorThrown) {
                        context.commit('loading', false, {'root': true })
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
            context.commit('loading', true, {'root': true })
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
                        context.commit('loading', false, {'root': true })
                        resolve(responseData)
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
            store.registerModule('em', emModule)
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
