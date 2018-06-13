define(['marionette',
    'views/tabs', 'modules/dc/collections/autointegrations',
    'modules/dc/views/rdplot',
    'modules/dc/views/aiplots',
    'views/log',
    'views/table',
    'utils/table',
    'utils',
    'tpl!templates/dc/dc_autoproc.html'], function(Marionette, TabView, AutoIntegrations, 
        RDPlotView, AIPlotsView, LogView, TableView, table,
        utils, template) {
       

    var AutoIntegrationItem = Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        events: {
            'click .logf': 'showLog',
            'click .rd': 'showRD',
            'click .plot': 'showPlots',
            'click .dll': utils.signHandler,
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
        tabTitle: 'TYPE',
        tabID: 'AID',
        
        childViewOptions: function() {
            return {
                templateHelpers: { DCID: this.getOption('id'), APIURL: app.apiurl }
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
                    { name: 'TYPE', label: 'Type', cell: 'string', editable: false },
                    { label: 'Resolution', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.RLOW%> - <%-SHELLS.overall.RHIGH%>' },
                    { name: 'SG', label: 'Spacegroup', cell: 'string', editable: false },
                    { label: 'Mn<I/sig(i)>', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.ISIGI%>' },
                    { label: 'Rmerge Inner', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.innerShell.RMERGE%>' },
                    { label: 'Rmerge Outer', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.outerShell.RMERGE%>' },
                    { label: 'Completeness', cell: table.TemplateCell, editable: false, template: '<%-SHELLS.overall.COMPLETENESS%>' },
                    { label: 'Cell', cell: table.TemplateCell, editable: false, template: '<%-CELL.CELL_A%> <%-CELL.CELL_B%> <%-CELL.CELL_C%> <%-CELL.CELL_AL%> <%-CELL.CELL_BE%> <%-CELL.CELL_GA%>' },
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
