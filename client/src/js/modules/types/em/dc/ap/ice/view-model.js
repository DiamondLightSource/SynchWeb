import baseViewModel from 'modules/types/em/components/view-model'

const middleware = function(response) {
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
    'fetch': function(store, autoProcProgramId) {
        return baseViewModel(
            store,
            '/em/attachments/' + autoProcProgramId,
            'Ice Breaker attachments',
            middleware
        )
    },
    'defaultData': function() {
        return { 'attachments': [] }
    },
}
