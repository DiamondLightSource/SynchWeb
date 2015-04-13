define(['marionette',
    'views/tabs', 'modules/dc/collections/autointegrations',
    'modules/dc/views/rdplot',
    'views/log',
    'tpl!templates/dc/dc_autoproc.html'], function(Marionette, TabView, AutoIntegrations, RDPlotView, LogView, template) {
       
    var EmptyAP = Marionette.ItemView.extend({ template: '<p>No auto procesing available for this data collection</p>', tagName: 'p' })
    
    var AutoIntegrationItem = Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        events: {
            'click .logf': 'showLog',
            'click .rd': 'showRD',
        },
        
        showLog: function(e) {
            e.preventDefault()
            app.dialog.show(new LogView({ title: this.model.get('TYPE') + ' Log File', url: $(e.target).attr('href') }))
            return false
        },
        
        showRD: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'RD Plot', view: new RDPlotView({ aid: this.model.get('AID'), id: this.getOption('templateHelpers').DCID }), autoSize: true }))
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
            this.collection.fetch().done(this.render)
        },
        
        onRender: function() {
            if (this.collection.length) {
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
        },
    })

})