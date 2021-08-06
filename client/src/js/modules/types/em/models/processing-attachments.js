define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        'urlRoot': '/em/attachments/',
        'parse': function(
            response,
            options // eslint-disable-line no-unused-vars
        ) {
            return response.map(function(attachment) {
                const fileName = attachment.FILE
                const json = attachment.JSON
                return {
                    'id': attachment.ID,
                    'timeStamp': attachment.RECORDTIMESTAMP,
                    'fileName': fileName,
                    'extension': fileName.split('.').pop(),
                    'fileType': attachment.FILETYPE,
                    'plotData': json,
                    'hasPlot': json ? true : false,
                }
            })
        },
    })
})