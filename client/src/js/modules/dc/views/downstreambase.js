define(['marionette', 
    'collections/autoprocattachments',
    'modules/dc/views/autoprocattachments',
    'views/log', 
    'utils'], function(Marionette, 
        AutoProcAttachments, AutoProcAttachmentsView, 
        LogView, utils) {
    
    return Marionette.ItemView.extend({
        modelEvents: { 'change': 'render' },
        
        events: {
            'click .logf': 'showLog',
            'click a.pattach': 'showAttachments',
            'click .dll': utils.signHandler,
        },

        showAttachments: function(e) {
            e.preventDefault()

            this.attachments = new AutoProcAttachments()
            this.attachments.queryParams.AUTOPROCPROGRAMID = this.model.get('AID')
            this.attachments.fetch()

            app.dialog.show(new DialogView({ 
                title: 'Attachments: '+this.model.escape('TYPE'),
                view: new AutoProcAttachmentsView({ collection: this.attachments, idParam: 'AUTOPROCPROGRAMATTACHMENTID' }), 
                autosize: true 
            }))
        },
            
        showLog: function(e) {
            e.preventDefault()
            var url = $(e.target).attr('href')
            var self = this
            utils.sign({
                url: url,
                callback: function(resp) {
                    app.dialog.show(new LogView({ title: self.model.get('TYPE') + ' Log File', url: url+'?token='+resp.token }))
                }
            })
        },
    })

})
