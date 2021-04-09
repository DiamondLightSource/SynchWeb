define(['marionette',
    'backbone',
    'modules/shipment/collections/distinctproteins',

    'models/sample',
    'collections/samples',
    'modules/shipment/views/puck',
    'modules/shipment/views/sampletable',

    'modules/shipment/collections/containerregistry',
    'modules/shipment/collections/containerhistory',

    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',

    'collections/processingpipelines',
    'collections/users',

    'views/table',

    'utils',
    'formatDate',
    'utils/editable',
    'templates/shipment/container.html'], function(Marionette,
    Backbone,
    DistinctProteins,
    Sample,
    Samples,
    PuckView,
    SampleTableView,

    ContainerRegistry,
    ContainerHistory,

    PlateTypes,
    PlateView,

    ProcessingPipelines,
    Users,

    TableView,

    utils, formatDate,
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
            extrastate: '.extra-state',
        },

        events: {
            'click @ui.ext': 'toggleExtra',
            'click a.queue': 'confirmQueueContainer',
            'click a.unqueue': 'confirmUnqueueContainer',
        },

        templateHelpers: function() {
            return {
                IS_STAFF: app.staff,
            }
        },

        toggleExtra: function (e) {
            e.preventDefault()
            this.table.currentView.toggleExtra()
            this.table.currentView.extraState() ? this.ui.extrastate.addClass('fa-minus').removeClass('fa-plus')
                                                : this.ui.extrastate.addClass('fa-plus').removeClass('fa-minus')
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
            if (app.options.get('valid_components') && !app.staff) {
                this.proteins.queryParams.external = 1
            }
            this.proteins.fetch()

            this.containerregistry = new ContainerRegistry(null, { state: { pageSize: 9999 }})

            this.history = new ContainerHistory()
            this.history.queryParams.cid = this.model.get('CONTAINERID')
            this.history.fetch()

            this.processing_pipelines = new ProcessingPipelines()

            // We need users in case we want to edit the container owner
            this.users = new Users(null, { state: { pageSize: 9999 }})
            this.users.queryParams.all = 1
            this.users.queryParams.pid = app.proposal.get('PROPOSALID')

            Backbone.Validation.bind(this)
        },


        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('COMMENTS', 'text')
            edit.create('EXPERIMENTTYPE', 'select', { data: { '':'-', 'robot':'robot', 'HPLC':'HPLC'} })
            edit.create('STORAGETEMPERATURE', 'select', { data: { '-80':'-80', '4':'4', '25':'25' } })
            edit.create('BARCODE', 'text')
            this.edit = edit

            var self = this
            this.processing_pipelines.queryParams.pipelinestatus = 'optional'
            this.processing_pipelines.queryParams.category = 'processing'
            this.processing_pipelines.fetch().done(function() {
                var opts = self.processing_pipelines.kv()
                opts[''] = '-'
                edit.create('PROCESSINGPIPELINEID', 'select', { data: opts })
            })

            var columns = [
                { name: 'BLTIMESTAMP', label: 'Date', cell: 'string', editable: false },
                { name: 'STATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false },
            ]

            this.histtable = new TableView({ collection: this.history, columns: columns, tableClass: 'history', loading: true, pages: true, backgrid: { emptyText: 'No history found', } })
            this.hist.show(this.histtable)

            // Enable editing of the container owner
            // The template restricts this to staff only
            var self = this
            this.users.fetch().done(function() {
                edit.create('OWNERID', 'select', { data: self.users.kv() })
            })

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
                        QUEUEDTIMESTAMP: formatDate.default(new Date(), 'dd-MM-yyyy HH:mm')
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
            var self = this
            var noData = _.reduce(this.samples.pluck('HASDATA'), function(a, b) { return a + b ? 1 : 0 }, 0) == 0
            if (this.model.get('CONTAINERSTATUS') != 'processing' && (noData || !this.model.get('CONTAINERREGISTRYID'))) {
                this.containerregistry.fetch().done(function() {
                    var opts = self.containerregistry.kv()
                    opts[''] = '-'
                    self.edit.create('CONTAINERREGISTRYID', 'select', { data: opts })
                })
            }

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
