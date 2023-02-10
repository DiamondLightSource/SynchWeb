define(['marionette',
    'backbone',
    'backgrid',
    'views/tabs', 
    'collections/autoprocattachments',
    'modules/dc/collections/autointegrations',
    'modules/dc/views/rdplot',
    'modules/dc/views/aiplots',
    'modules/dc/views/autoprocattachments',
    'modules/dc/views/apmessages',

    'views/log',
    'views/table',
    'utils/table',
    'utils',
    'templates/dc/dc_autoproc.html'], function(Marionette, Backbone, Backgrid, TabView,
        AutoProcAttachments, AutoIntegrations, 
        RDPlotView, AIPlotsView, AutoProcAttachmentsView, APMessagesView, 
        LogView, TableView, table,
        utils, template) {
       

    var AutoIntegrationItem = Marionette.LayoutView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        events: {
            'click .logf': 'showLog',
            'click .rd': 'showRD',
            'click .plot': 'showPlots',
            'click a.apattach': 'showAttachments',
            'click .dll': utils.signHandler,
        },

        regions: {
            messages: '.messages'
        },

        onRender: function() {
            this.messages.show(new APMessagesView({ messages: new Backbone.Collection(this.model.get('MESSAGES')), embed: true }))
        },
        
        showAttachments: function(e) {
            e.preventDefault()

            this.attachments = new AutoProcAttachments()
            this.attachments.queryParams.AUTOPROCPROGRAMID = this.model.get('AID')
            this.attachments.fetch()

            app.dialog.show(new DialogView({ 
                title: 'Auto Processing Attachments: '+this.model.escape('TYPE'),
                view: new AutoProcAttachmentsView({ collection: this.attachments }), 
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
            // app.dialog.show(new LogView({ title: this.model.get('TYPE') + ' Log File', url: $(e.target).attr('href') }))
            return false
        },
        
        showRD: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'RD Plot', view: new RDPlotView({ aid: this.model.get('AID'), id: this.getOption('templateHelpers').DCID }), autoSize: true }))
        },

        showPlots: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Integration Statistic Plots', view: new AIPlotsView({ aid: this.model.get('AID'), id: this.getOption('templateHelpers').DCID }), autoSize: true }))
        },
        
    })
    
    
    var DCAPTabView = TabView.extend({
        tabContentItem: function() { return AutoIntegrationItem },
        tabTitle: 'TYPEICON',
        tabID: 'AID',
        
        childViewOptions: function() {
            var dcId = this.getOption('id')
            // These templateHelpers are just used to extract values for AIPlots View (see ShowPlots/ShowRD above)
            // They don't seem to be used as part of the template rendering, hence just an object rather than a function
            return {
                templateHelpers: {
                    DCID: dcId,
                    APIURL: app.apiurl,
                    PROPOSAL_TYPE: app.type,
                }
            }
        },
    })

    var SelectTabRow = Backgrid.Row.extend({
        events: {
            'click': 'selectTab',
        },

        selectTab: function(e) {
            e.preventDefault()

            console.log('click row' ,this.model.get('AID'), this.$el.closest('.sw'))
            this.$el.closest('.summary').siblings('.sw').find('a[href="#tabs-'+this.model.get('AID')+'"]').trigger('click');
        }
    })

        
    return Marionette.LayoutView.extend({
        template: _.template('<div class="ui-tabs summary"></div><div class="sw"></div><div class="res"></div>'),
        regions: {
            wrap: '.sw',
            summary: '.summary',
        },
        
        initialize: function(options) {
            this.collection = new AutoIntegrations(null, { id: options.id })
            this.collection.fetch().done(this.render.bind(this))
        },

        fetch: function() {
            this.collection.fetch()
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
                    { name: 'TYPE', label: 'Type', cell: table.TemplateCell, editable: false, template: '<%-TYPE%> <%if (!AUTOMATIC) {%><i class="fa fa-refresh" title="Reprocessed"></i><%}%>' },
                    { label: 'Resolution', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.RLOW%> - <%-SHELLS.overall.RHIGH%>', test: 'SHELLS' },
                    { name: 'SG', label: 'Spacegroup', cell: 'string', editable: false },
                    { label: 'Mn<I/sig(i)>', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.ISIGI%>', test: 'SHELLS' },
                    { label: 'I/sig(i)==2', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.RESISIGI%>', test: 'SHELLS' },
                    { label: 'Rmeas Inner', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.innerShell.RMEAS%>', test: 'SHELLS' },
                    { label: 'Rmeas Outer', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.outerShell.RMEAS%>', test: 'SHELLS' },
                    { label: 'Completeness', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.COMPLETENESS%>', test: 'SHELLS' },
                    { label: 'Cell', cell: table.TemplateCell, editable: false, template: '<%-CELL.CELL_A%> <%-CELL.CELL_B%> <%-CELL.CELL_C%> <%-CELL.CELL_AL%> <%-CELL.CELL_BE%> <%-CELL.CELL_GA%>', test: 'SHELLS' },
                    { label: 'Status', cell: table.TemplateCell, editable: false, template: '<%-PROCESSINGMESSAGE%>' },
                ],
                pages: false,
                backgrid: {
                    row: SelectTabRow,
                    emptyText: 'No auto processing available for this data collection',
                },
            }))
        },

        update: function() {
            if (this.collection.length) {
                this.$el.removeClass('ui-tabs')
                this.wrap.show(new DCAPTabView({
                    collection: this.collection,
                    id: this.getOption('id'),
                    el: this.$el.find('.res'),
                }))
            }

            this.$el.slideDown()
        }

    })

})
