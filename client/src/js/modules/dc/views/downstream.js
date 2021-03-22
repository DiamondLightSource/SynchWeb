define(['backbone', 'marionette',
    'views/tabs',
    'modules/dc/collections/downstreams',
    'modules/dc/views/downstreamwrapper',
    'views/table',
    'modules/dc/views/fastep',
    'modules/dc/views/dimple',
    'modules/dc/views/mrbump',
    'modules/dc/views/bigep',
    'templates/dc/downstreamerror.html'

    ], function(Backbone, Marionette, TabView, DownStreams, DownstreamWrapper, 
        TableView, 
        FastEP, DIMPLE, MrBUMP, BigEP, downstreamerror) {

    var DownStreamError = Marionette.ItemView.extend({
        template: downstreamerror
    })
        
    var EmptyAP = Marionette.ItemView.extend({ template: '<p>No downstream processing available for this data collection</p>', tagName: 'p' })
        
    var DefaultDP = Marionette.LayoutView.extend({
        template: _.template('<div class="summary"></div>'),

        regions: {
            summary: '.summary'
        },

        onRender: function() {
            var collection = new Backbone.Collection([
                this.model.get('PROCESS')
            ])
            this.summary.show(new TableView({
                tableClass: 'reflow autoprocess',
                noTableHolder: true,
                collection: collection,
                columns: [
                    { name: 'PROCESSINGPROGRAMS', label: 'Processing Programs', cell: 'string', editable: false },
                    { name: 'PROCESSINGCOMMENTS', label: 'Comments', cell: 'string', editable: false },
                    { name: 'PROCESSINGMESSAGE', label: 'Message', cell: 'string', editable: false },
                    { name: 'PROCESSINGSTARTTIME', label: 'Start Time', cell: 'string', editable: false },
                    { name: 'PROCESSINGENDTIME', label: 'End Time', cell: 'string', editable: false }
                ],
                pages: false,
            }))
        }
    })


    
    var DCDSTabView = TabView.extend({
        tabTitle: 'TITLE',
        tabID: 'AID',

        tabContentItem: function() {
            var types = {
                'Fast EP': FastEP,
                'Dimple': DIMPLE,
                'MrBUMP': MrBUMP,
                'Autobuild': BigEP,
                'Crank2': BigEP,
                'AutoSHARP': BigEP,
            }
            
            if (this.model.get('PROCESS').PROCESSINGSTATUS != 1) {
                return DownstreamWrapper.extend({
                    links: false,
                    childView: DownStreamError
                })
            }

            tabType = this.model.get('TYPE')
            for (var key in types) {
                if (tabType.indexOf(key) > -1) {
                    return DownstreamWrapper.extend({
                        childView: types[key],
                    })
                }
            }

            return DownstreamWrapper.extend({
                childView: DefaultDP,
                mapLink: false
            })
        },
        
        childViewOptions: function() {
            var dcId = this.getOption('id')
            return {
                holderWidth: this.getOption('holderWidth'),
                templateHelpers: function() {
                    return {
                        DCID: dcId,
                        APIURL: app.apiurl
                    }
                },
                DCID: dcId,
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
