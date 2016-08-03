define(['marionette',
    'views/tabs',
    'modules/dc/collections/downstreams',
    'modules/dc/views/fastep',
    'modules/dc/views/dimple',
    'modules/dc/views/mrbump',
    'modules/dc/views/bigep',

    ], function(Marionette, TabView, DownStreams, FastEP, DIMPLE, MrBUMP, BigEP) {

        
    var EmptyAP = Marionette.ItemView.extend({ template: '<p>No downstream procesing available for this data collection</p>', tagName: 'p' })
        
   
    var DCDSTabView = TabView.extend({
        tabTitle: 'TYPE',
        tabID: 'TYPE',

        tabContentItem: function() {
            var types = {
                'Fast EP': FastEP,
                'Dimple': DIMPLE,
                'MrBUMP': MrBUMP,
                'Big EP': BigEP,
            }
            
            tabType = this.model.get('TYPE')
            for (var key in types) {
                if (tabType.indexOf(key) > -1) {
                    return types[key]
                }
            }
        },
        
        childViewOptions: function() {
            return {
                holderWidth: this.getOption('holderWidth'),
                templateHelpers: { DCID: this.getOption('id'), APIURL: app.apiurl },
                DCID: this.getOption('id'),
            }
        },
    })
        

    return Marionette.LayoutView.extend({
        template: _.template('<div class="sw"></div><div class="res"></div>'),
        regions: {
            wrap: '.sw',
        },
        
        initialize: function(options) {
            this.collection = new DownStreams(null, { id: options.id })
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
                this.wrap.show(new DCDSTabView({
                    collection: this.collection,
                    id: this.getOption('id'),
                    el: this.$el.find('.res'),
                    holderWidth: this.$el.parent().width()
                }))
            } else {
                this.$el.addClass('ui-tabs')
                this.wrap.show(new EmptyAP())
            }
            
            this.$el.slideDown()
        },
    })
        
})