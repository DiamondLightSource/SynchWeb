define(['marionette',
    'views/tabs', 'modules/dc/collections/autointegrations',
    'modules/dc/views/rdplot',
    'modules/dc/views/aiplots',
    'views/log',
    'utils',
    'tpl!templates/dc/dc_autoproc.html'], function(Marionette, TabView, AutoIntegrations, 
        RDPlotView, AIPlotsView, LogView, 
        utils, template) {
       
    var EmptyAP = Marionette.ItemView.extend({ template: '<p>No auto processing available for this data collection</p>', tagName: 'p' })
    
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
        
        
    return Marionette.LayoutView.extend({
        template: _.template('<div class="sw"></div><div class="res"></div>'),
        regions: {
            wrap: '.sw',
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
        },

        update: function() {
            if (this.collection.length) {
                this.$el.removeClass('ui-tabs')
                this.wrap.show(new DCAPTabView({
                    collection: this.collection,
                    id: this.getOption('id'),
                    el: this.$el.find('.res'),
                }))
            } else {
                this.$el.addClass('ui-tabs')
                this.wrap.show(new EmptyAP())
            }

            this.$el.slideDown()
        }

    })

})
