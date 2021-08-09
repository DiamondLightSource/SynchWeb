import Backbone from 'backbone'

const parse = function(response) {
    const parseSingleChart = function(json) {
        if (!json) {
            return ''
        }
        const chartData = JSON.parse(json)
        const layout = chartData.layout
        return {
            'layout': {
                'barmode': layout.barmode,
                'xaxis': layout.xaxis,
                'yaxis': layout.yaxis,
                'margin': { 'l': 50, 'r': 10, 'b': 50, 't': 10 },
            },
            'data': chartData.data,
            'titleText': layout.title.text.split('<br>')[1]
        }
    }

    return response.map(function(attachment) {
        const fileName = attachment.FILE
        const json = attachment.JSON
        return {
            'id': attachment.ID,
            'timeStamp': attachment.RECORDTIMESTAMP,
            'fileName': fileName,
            'extension': fileName.split('.').pop(),
            'fileType': attachment.FILETYPE,
            'chartData': json ? parseSingleChart(json) : null,
        }
    })
}

export default {
    'namespaced': true,
    'mutations': {
        fetched(state, response) {

        },
    },
    'actions': {
        fetch(context, autoProcProgramId) {
            const store = this
            store.commit('loading', true)
            return new Promise((resolve, reject) => {
                Backbone.ajax({
                    'type': 'GET',
                    'url': store.state.apiUrl +
                        '/em/attachments/' + autoProcProgramId,
                    'success': function (
                        response,
                        status, // eslint-disable-line no-unused-vars
                        xhr // eslint-disable-line no-unused-vars
                    ) {
                        // we can't have this stored in a state in VueX
                        // because there may be multiple processing jobs
                        // open at any one time.
                        const parsed = parse(response)
                        store.commit('loading', false)
                        console.log('Ice Breaker processing attachments', parsed)
                        resolve(parsed)
                    },
                    'error': function(
                        model, // eslint-disable-line no-unused-vars
                        response,
                        options // eslint-disable-line no-unused-vars
                    ) {
                        store.commit('loading', false)
                        reject(response.responseJSON || {
                            'status': 400,
                            'message': 'Error fetching Ice Breaker attachments',
                        })
                    },
                })
            })
        },
    },
}
