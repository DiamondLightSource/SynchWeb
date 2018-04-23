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
        },

        events: {
            'click @ui.ext': 'toggleExtra',
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
            this.table.show(new SampleTableView({ proteins: this.proteins, collection: this.samples, in_use: (this.model.get('CONTAINERSTATUS') === 'processing'), type: type }))
        }
    })

})