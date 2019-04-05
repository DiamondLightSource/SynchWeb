define(['marionette',
    'modules/shipment/collections/distinctproteins',
    
    'models/sample',
    'collections/samples',
    'modules/shipment/views/puck',
    'modules/shipment/views/sampletable',

    'modules/shipment/collections/containerregistry',
    'modules/shipment/collections/containerhistory',

    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',

    'views/table',

    'utils',
    'moment',
    'utils/editable',
    'tpl!templates/shipment/container.html'], function(Marionette,
        
    DistinctProteins,
    Sample,
    Samples,
    PuckView,
    SampleTableView,

    ContainerRegistry,
    ContainerHistory,

    PlateTypes,
    PlateView,
    
    TableView,    

    utils, moment,
    Editable, template){
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        samplesCollection: Samples,

        regions: {
            table: '.sample',
            puck: '.puck',
            hist: '.history'
        },
        
        ui: {
            ext: '.extrainfo',
            auto: '.auto',
        },

        events: {
            'click @ui.ext': 'toggleExtra',
            'click a.queue': 'confirmQueueContainer',
            'click a.unqueue': 'confirmUnqueueContainer',
        },


        toggleExtra: function (e) {
            e.preventDefault()
            this.table.currentView.toggleExtra()
        },

        createSamples: function() {
            this.samples = new Samples(null, { state: { pageSize: 9999 } })
        },

        initialize: function(options) {
            var self = this
            this.createSamples()
            this.samples.queryParams.cid = options.model.get('CONTAINERID')
            this._ready = this.samples.fetch({ data: {'sort_by': 'POSITION' } }).done(function() {
                console.log('samples')
                var total = _.map(_.range(1, parseInt(self.model.get('CAPACITY'))+1), function(e) { return e.toString() })
                var diff = _.difference(total, self.samples.pluck('LOCATION'))
                _.each(diff, function(l) {
                    self.samples.add(new Sample({ LOCATION: l.toString(), CRYSTALID: -1, PROTEINID: -1, CONTAINERID: options.model.get('CONTAINERID'), new: true }))
                })
            })
            
            this.proteins = new DistinctProteins()
            this.proteins.fetch()

            this.containerregistry = new ContainerRegistry()
            
            this.history = new ContainerHistory()
            this.history.queryParams.cid = this.model.get('CONTAINERID')
            this.history.fetch()

            Backbone.Validation.bind(this)
        },

        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('COMMENTS', 'text')
            edit.create('EXPERIMENTTYPE', 'select', { data: { '':'-', 'robot':'robot', 'HPLC':'HPLC'} })
            edit.create('STORAGETEMPERATURE', 'select', { data: { '-80':'-80', '4':'4', '25':'25' } })
            edit.create('BARCODE', 'text')

            var self = this
            this.containerregistry.fetch().done(function() {
                var opts = self.containerregistry.kv()
                opts[''] = '-'
                edit.create('CONTAINERREGISTRYID', 'select', { data: opts })
            })

            var columns = [
                { name: 'BLTIMESTAMP', label: 'Date', cell: 'string', editable: false },
                { name: 'STATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false },
            ]
                        
            this.histtable = new TableView({ collection: this.history, columns: columns, tableClass: 'history', loading: true, pages: true, backgrid: { emptyText: 'No history found', } })
            this.hist.show(this.histtable)

            this.updateAutoCollection()
        },


        updateAutoCollection: function() {
            if (this.model.get('CONTAINERQUEUEID')) {
                this.ui.auto.html('This container was queued for auto collection on '+this.model.escape('QUEUEDTIMESTAMP'))
                this.ui.auto.append(' <a href="#" class="button unqueue"><i class="fa fa-times"></i> Unqueue</a>')
            } else {
                this.ui.auto.html('<a href="#" class="button queue"><i class="fa fa-plus"></i> Queue</a> this container for Auto Collect')
            }
        },

        confirmQueueContainer: function(e) {
            e.preventDefault()
            utils.confirm({
                title: 'Queue Container?',
                content: 'Are you sure you want to queue this container for auto collection?',
                callback: this.doQueueContainer.bind(this)
            })
        },


        doQueueContainer: function(e) {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue',
                data: {
                    CONTAINERID: this.model.get('CONTAINERID')
                },
                success: function(resp) {
                    app.alert({ message: 'Container Successfully Queued' })
                    self.model.set({
                        CONTAINERQUEUEID: resp.CONTAINERQUEUEID,
                        QUEUEDTIMESTAMP: moment().format('DD-MM-YYYY HH:mm')
                    })
                    self.updateAutoCollection()
                    self.sampletable.toggleAuto(true)
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong queuing this container' })
                }
            })
        },

        confirmUnqueueContainer: function(e) {
            e.preventDefault()
            utils.confirm({
                title: 'Unqueue Container?',
                content: 'Are you sure you want to remove this container from the queue? You will loose your current place',
                callback: this.doUnqueueContainer.bind(this)
            })
        },

        doUnqueueContainer: function(e) {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue',
                data: {
                    CONTAINERID: this.model.get('CONTAINERID'),
                    UNQUEUE: 1,
                },
                success: function(resp) {
                    app.alert({ message: 'Container Successfully Unqueued' })
                    self.model.set('CONTAINERQUEUEID', null)
                    self.updateAutoCollection()
                    self.sampletable.toggleAuto(false)
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong unqueuing this container' })
                }
            })
        },

        
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            console.log(self.samples)

            var type = this.model.get('CONTAINERTYPE') == 'PCRStrip' ? 'non-xtal' : ''
            
            if (this.model.get('CONTAINERTYPE') == 'PCRStrip') {
                this.$el.find('.puck').css('width', '50%')
                // this.puck.$el.width(this.puck.$el.parent().width()/2)
                this.platetypes = new PlateTypes()
                this.type = this.platetypes.findWhere({ name: this.model.get('CONTAINERTYPE') })
                this.puck.show(new PlateView({ collection: this.samples, type: this.type }))
            } else this.puck.show(new PuckView({ collection: this.samples }))

            this.sampletable = new SampleTableView({ proteins: this.proteins, collection: this.samples, in_use: (this.model.get('CONTAINERSTATUS') === 'processing'), type: type, auto: this.model.get('CONTAINERQUEUEID') ? true : false })
            this.table.show(this.sampletable)
        }
    })

})