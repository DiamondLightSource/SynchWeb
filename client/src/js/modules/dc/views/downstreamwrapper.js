define(['backbone', 'marionette', 
    'collections/autoprocattachments',
    'modules/dc/views/autoprocattachments',
    'modules/dc/views/apmessages',
    'views/log', 
    'utils'], function(Backbone, Marionette, 
        AutoProcAttachments, AutoProcAttachmentsView, 
        APMessagesView,
        LogView, utils) {
    
    return Marionette.LayoutView.extend({
        className: 'downstream-item',
        links: true,
        mapLink: true,
        template: _.template('<div class="dpmessages"></div><% if(PARENT) { %><div class="r dplinks"></div><h2><%-PARENT%></h2><% } else { %><div class="ra dplinks"></div><% } %><div class="dpwrapper"></div>'),
        regions: {
            messages: '.dpmessages',
            wrapper: '.dpwrapper',
        },

        ui: {
            links: '.dplinks'
        },

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

        onRender: function() {
            this.messages.show(new APMessagesView({
                messages: new Backbone.Collection(this.model.get('MESSAGES')), embed: true 
            }))
            this.wrappedView = new (this.getOption('childView'))({ 
                model: this.model,
                templateHelpers: this.getOption('templateHelpers'),
                holderWidth: this.getOption('holderWidth'),
            })
            this.wrapper.show(this.wrappedView)

            if (!this.model.get('AUTOMATIC')) {
                this.ui.links.html('<i class="fa fa-refresh" title="Reprocessed"></i> ')
            }

            if (this.getOption('links')) {
                var links = [
                    '<a class="view button" href="/dc/map/id/'+this.getOption('DCID')+'/aid/'+this.model.get('AID')+'"><i class="fa fa-search"></i> Map / Model Viewer</a>',
                    '<a class="dll button" href="'+app.apiurl+'/download/ap/archive/'+this.model.get('AID')+'"><i class="fa fa-archive"></i> Archive</a>',
                    '<a class="pattach button" href="#"><i class="fa fa-files-o"></i> Logs &amp; Files</a>'
                ]

                if (!this.getOption('mapLink')) {
                    links = links.slice(1)
                }

                this.ui.links.append(links.join(' '))
            }
        },

        onDomRefresh: function() {
            this.wrappedView.triggerMethod('dom:refresh')
        },
    })

})
