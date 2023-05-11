define(['modules/dc/views/autointegration',
        'modules/dc/collections/zocaloautointegrations',
        'collections/autoprocattachments',
        'modules/dc/views/autoprocattachments',
        'views/table',
        'utils/table'
    ], function(AutoIntegration, ZocaloAutoIntegrations, AutoProcAttachments, AutoProcAttachmentsView, TableView, table) {

            return AutoIntegration.extend({

                events:{
                    'click a.apattach': 'showAttachments'
                },

                showAttachments: function(e) {
                    e.preventDefault()
                    
                    this.attachments = new AutoProcAttachments()
                    this.attachments.url = '/download/zocalo/ap/attachments'
                    this.attachments.queryParams.AUTOPROCPROGRAMID = e.target.getAttribute('data-aid')
                    this.attachments.fetch()
                    
                    app.dialog.show(new DialogView({ 
                        title: 'Auto Processing Attachments: '+e.target.getAttribute('data-program'),
                        view: new AutoProcAttachmentsView({ collection: this.attachments }), 
                        autosize: true 
                    }))
                },

                initialize: function(options){
                    this.collection = new ZocaloAutoIntegrations(null, { id: options.id })
                    this.collection.fetch().done(this.render.bind(this))
                },

                onRender: function() {
                    this.update()
                    this.listenTo(this.collection, 'sync', this.update, this)
        
                    this.summary.show(new TableView({
                        className: 'ui-tabs-panel ui-widget-content',
                        tableClass: 'reflow procsummary',
                        noTableHolder: true,
                        collection: this.collection,
                        columns: [
                            { name: 'DISPLAYNAME', label: 'Name', cell: table.TemplateCell, editable: false, template: '<%-DISPLAYNAME%>', test: 'DISPLAYNAME' },
                            { name: 'COMMENT', label: 'Comments', cell: table.TemplateCell, editable: false, template: '<%-COMMENTS%>', test: 'COMMENTS' },
                            { name: 'PROCESSINGPROGRAMS', label: 'Processing Programs', cell: table.TemplateCell, editable: false, template: '<%-AUTOPROCPROGRAM.PROCESSINGPROGRAMS%>', test: 'PROCESSINGPROGRAMS' },
                            { name: 'PROCESSINGMESSAGE', label: 'Processing Message', cell: table.TemplateCell, editable: false, template: '<%-AUTOPROCPROGRAM.PROCESSINGMESSAGE%>', test: 'PROCESSINGMESSAGE' },
                            { name: 'PROCESSINGSTARTTIME', label: 'Processing Start Time', cell: table.TemplateCell, editable: false, template: '<%-AUTOPROCPROGRAM.PROCESSINGSTARTTIME%>', test: 'PROCESSINGSTARTTIME' },
                            { name: 'PROCESSINGENDTIME', label: 'Processing End Time', cell: table.TemplateCell, editable: false, template: '<%-AUTOPROCPROGRAM.PROCESSINGENDTIME%>', test: 'PROCESSINGENDTIME' },
                            { name: 'ATTACHMENTS', label: 'Logs/Files', cell: table.TemplateCell, editable: false, template: "<a href='#' data-aid='<%-AUTOPROCPROGRAM.AID%>' data-program='<%-AUTOPROCPROGRAM.PROCESSINGPROGRAMS%>' class='apattach'>Logs/Files</a>", test: 'ATTACHMENTS' }
                        ],
                        pages: false,
                        backgrid: {
                            emptyText: 'No auto processing available for this data collection',
                        },
                    }))

                    this.$el.slideDown()
                },

                update: function(){
                    if(!this.timer_active){
                        var self = this;
                        setInterval(function(){self.collection.fetch()}, 5000)
                        this.timer_active = true;
                    }
                },
            })
})