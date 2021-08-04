define(['backbone'], function(Backbone) {
    return Backbone.Collection.extend({
        'initialize': function(models, options) {
            this.url = '/em/attachments/' + options.id
        },
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
                    'plotData': json ? JSON.parse(json) : null,
                    'hasPlot': json ? true : false,
                }
            })
        },
    })
})