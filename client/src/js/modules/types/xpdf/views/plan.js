define(['marionette',
    'backgrid',
    'collections/detectors',
    'collections/scanservices',

    'collections/samples',

    'models/datacollectionplan',
    'collections/datacollectionplans',

    'models/scanmodel',
    'collections/scanmodels',

    'models/datacollectionplandetector',
    'collections/datacollectionplandetectors',

    'collections/beamlinesetups',

    'views/table',
    'views/sortabletable',
    'utils/table',

    'templates/types/xpdf/plan.html',
    'templates/types/xpdf/planparams.html',
    'templates/types/xpdf/planparamsstatic.html',
    'templates/types/xpdf/planaxis.html',
    'templates/types/xpdf/planaxisstatic.html',
    'templates/types/xpdf/plandetector.html',
    'templates/types/xpdf/plandetectorstatic.html'

    ], function(Marionette,
        Backgrid,
        Detectors,
        ScanServices,

        Samples,

        DataCollectionPlan,
        DataCollectionPlans,

        ScanModel,
        ScanModels,

        DataCollectionPlanDetector,
        DataCollectionPlanDetectors,

        BeamlineSetups,

        TableView,
        SortableTableView,
        table,

        template,
        planparams,
        planparamsstatic,
        planaxis,
        planaxisstatic,
        plandetector,
        plandetectorstatic
    ) {


    var AddCell = Backgrid.Cell.extend({
        events: {
            'click a.add': 'addPlan',
        },

        addPlan: function(e) {
            e.preventDefault()
            var plans = this.column.get('datacollectionplans')
            var p = new DataCollectionPlan({
                BLSAMPLEID: this.model.get('BLSAMPLEID'),
                SAMPLE: this.model.get('NAME'),
                PROTEINID: this.model.get('PROTEINID'),
                PROTEIN: this.model.get('ACRONYM'),
                PLANORDER: plans.length,

                // TODO: this is not the right place to store this info
                // long term this info will come from beamlinesetup
                ENERGY: 76600,
                MONOBANDWIDTH: 0.1,
                PREFERREDBEAMSIZEX: 70,
                PREFERREDBEAMSIZEY: 70
            }, {
                SCANPARAMETERSMODELS: this.column.get('scanmodels'),
                DETECTORS: this.column.get('dpdetectors')
            })

            p.save({}, {
                success: function() {
                    plans.add(p)
                },

                error: function() {
                    app.alert({ message: 'Something went wrong creating a data collection plan for that sample' })
                }
            })

        },

        render: function() {
            this.$el.empty()
            this.$el.html('<a href="#" class="button add"><i class="fa fa-plus"></i></a>')

            return this
        }
    })


    var DeleteCell = Backgrid.Cell.extend({
        events: {
            'click a.delete': 'delete',
        },

        delete: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render: function() {
            this.$el.empty()
            this.$el.html('<a href="#" class="button delete"><i class="fa fa-times"></i></a>')

            return this
        }
    })        


    var DCPlanCell = table.ValidatedTemplateCell.extend({

        events: _.extend({}, table.ValidatedTemplateCell.prototype.events, {
            'click a.locked': 'doUnlock',
            'click a.unlocked': 'doLock',
        }),
        
        initialize: function(options) {
            DCPlanCell.__super__.initialize.call(this, options)

            this.listenTo(this.model, 'row:collapse', this.doCollapse)
            this.listenTo(this.model, 'row:expand', this.doExpand)
        },
        
        render: function() {
            this.$el.empty()
            this.bindModel()
            
            this.doCollapse()
            
            return this
        },

        doCollapse: function() {
            this.$el.html(planparamsstatic(this.model.toJSON()))
            this.$el.find('a.locked').hide()
            this.$el.find('p.warnusers').hide()
        },
        
        doExpand: function() {
            this.$el.find('a.locked').show()
            this.$el.find('p.warnusers').show()
        },
        
        doUnlock: function(e) {
            e.preventDefault()
            this.$el.html(planparams(this.model.toJSON()))
        },

        doLock: function(e) {
            e.preventDefault()
            this.$el.html(planparamsstatic(this.model.toJSON()))
        },
        
    })



    var AxisCell = table.ValidatedTemplateCell.extend({
        render: function() {
            this.$el.empty()
            this.$el.html(planaxis(this.model.toJSON()))
            this.bindModel()
            return this
        },
    })


    var SequenceOrderCell = Backgrid.Cell.extend({
        events: {
            'click a.moveup': 'decrementSequence',
            'click a.movedown': 'incrementSequence',
        },
        
        incrementSequence: function(e) {
            e.preventDefault()
            if (this.model.get('SEQUENCENUMBER') < (this.column.get('parameterscollection').length-1)) {
                
                var sn = parseInt(this.model.get('SEQUENCENUMBER'))
                var next = this.column.get('parameterscollection').findWhere({ SEQUENCENUMBER: (sn+1).toString() })

                this.model.set({ SEQUENCENUMBER: (sn + 1).toString() })
                next.set({ SEQUENCENUMBER: sn.toString() })
            }
        },
        decrementSequence: function(e) {
            e.preventDefault()
            if (this.model.get('SEQUENCENUMBER') > 0) {
                var sn = parseInt(this.model.get('SEQUENCENUMBER'))
                var prev = this.column.get('parameterscollection').findWhere({ SEQUENCENUMBER: (sn-1).toString() })

                this.model.set({ SEQUENCENUMBER: (sn - 1).toString() })
                prev.set({ SEQUENCENUMBER: sn.toString() })
            }
        },
        render: function() {
            this.$el.html('<span>'+(parseInt(this.model.get('SEQUENCENUMBER'))+1)+'</span><a href="#" class="button movedown" title="Move later in the sequence"><i class="fa fa-chevron-down"></i></a><a href="#" class="button moveup" title="Move earlier in the sequence"><i class="fa fa-chevron-up"></i></a>')
            return this
        }
    })

    var StaticAxisCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            this.$el.html(planaxisstatic(this.model.toJSON()))
            return this
        },
    })

    var AxesCell = Backgrid.Cell.extend({
        template: _.template('<select name="services"></select><a href="#" class="button add"><i class="fa fa-plus"></i></a><div class="axes"></div><div class="axesstatic"></div>'),

        events: {
            'click a.add': 'addAxis',
        },

        initialize: function(options) {
            AxesCell.__super__.initialize.apply(this, [options])

            this.listenTo(this.model, 'row:collapse', this.doCollapse)
            this.listenTo(this.model, 'row:expand', this.doExpand)
            this.listenTo(this.model.get('SCANPARAMETERSMODELS'), 'change:SEQUENCENUMBER', this.saveOrder)
        },
        
        saveOrder: function() {
            console.log('seq saving order')
            this.model.get('SCANPARAMETERSMODELS').each(function(m) {
                var ca = m.changedAttributes()
                if (Object.keys(ca).length) m.save(ca, { patch: true })
            })
        },

        addAxis: function(e) {
            e.preventDefault()

            var serviceid = this.$el.find('select[name=services]').val()
            var service = this.column.get('scanservices').findWhere({ SCANPARAMETERSSERVICEID: serviceid })

            var axis = new ScanModel({
                DATACOLLECTIONPLANID: this.model.get('DIFFRACTIONPLANID'),
                SCANPARAMETERSSERVICEID: serviceid,
                SCANPARAMETERSSERVICE: service.get('NAME'),
                SEQUENCENUMBER: this.model.get('SCANPARAMETERSMODELS').length
            })

            var self = this
            axis.save({}, {
                success: function() {
                    // add our new model to the 'full' collection, datacollectionplan sub collections will autoupdate
                    console.log('saved axes', axis, self.column.get('scanmodels'))
                    self.column.get('scanmodels').add(axis)
                }, 

                error: function() {
                    app.alert({ message: 'Something went wrong adding an axis to that data collection plan' })
                }
            })
        },

        render: function() {
            var columns = [
               { label: 'Order', cell: SequenceOrderCell, editable: false, parameterscollection: this.model.get('SCANPARAMETERSMODELS') },
               { label: 'Axis', cell: table.TemplateCell, editable: false, template: '<%-SCANPARAMETERSSERVICE%>' },
               { label: 'Parameters', cell: AxisCell, editable: false },
               { label: '', cell: DeleteCell, editable: false },
            ]
            
            this.atable = new TableView({ 
                collection: this.model.get('SCANPARAMETERSMODELS'), 
                columns: columns, 
                tableClass: 'axes', 
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No axes found' },
            })

            var staticColumns = [
                { label: 'Order', cell: table.TemplateCell, editable: false, template: '<%-parseInt(SEQUENCENUMBER)+1%>' },
                { label: 'Axis', cell: table.TemplateCell, editable: false, template: '<%-SCANPARAMETERSSERVICE%>' },
                { label: 'Parameters', cell: StaticAxisCell, editable: false },
            ]

            this.stable = new TableView({ 
                collection: this.model.get('SCANPARAMETERSMODELS'), 
                columns: staticColumns, 
                tableClass: 'axesstatic', 
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No axes found' },
            })
           
            this.$el.empty()
            this.$el.html(this.template)
            this.$el.find('.axes').html(this.atable.render().$el)
            this.$el.find('.axesstatic').html(this.stable.render().$el)
            this.$el.find('select[name=services]').html(this.column.get('scanservices').opts())

            this.doCollapse()
            
            return this
        },

        doCollapse: function() {
            this.$el.find('a.add').hide()
            this.$el.find('select[name=services]').hide()
            this.$el.find('.axes').hide()
            this.$el.find('.axesstatic').show()

        },
        
        doExpand: function() {
            this.$el.find('a.add').show()
            this.$el.find('select[name=services]').show()
            this.$el.find('.axes').show()
            this.$el.find('.axesstatic').hide()
        },
    })



    var DetectorCell = table.ValidatedTemplateCell.extend({
        render: function() {
            this.$el.empty()
            this.$el.html(plandetector(this.model.toJSON()))
            this.bindModel()
            return this
        }
    })
    
    var StaticDetectorCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            this.$el.html(plandetectorstatic(this.model.toJSON()))
            return this
        },
    })

    var DetectorsCell = Backgrid.Cell.extend({
        template: _.template('<select name="detectors"></select><a href="#" class="button add"><i class="fa fa-plus"></i></a><div class="detectors"></div><div class="detectorsstatic"></div>'),

        events: {
            'click a.add': 'addDetector',
        },

        initialize: function(options) {
            DetectorsCell.__super__.initialize.apply(this, [options])
            
            this.listenTo(this.model, 'row:collapse', this.doCollapse)
            this.listenTo(this.model, 'row:expand', this.doExpand)
        },
        
        addDetector: function(e) {
            e.preventDefault()

            var detid = this.$el.find('select[name=detectors]').val()
            var det = this.column.get('detectors').findWhere({ DETECTORID: detid })

            var pdet = new DataCollectionPlanDetector({
                DATACOLLECTIONPLANID: this.model.get('DIFFRACTIONPLANID'),
                DETECTORID: detid,
                DETECTORTYPE: det.get('DETECTORTYPE'),
                DETECTORMANUFACTURER: det.get('DETECTORMANUFACTURER'),
                DETECTORMODEL: det.get('DETECTORMODEL'),
            }, { BEAMLINESETUPS: this.column.get('beamlinesetups') })

            var self = this
            pdet.save({}, {
                success: function() {
                    // add our new model to the 'full' collection, datacollectionplan sub collections will autoupdate
                    self.column.get('dpdetectors').add(pdet)
                }, 

                error: function() {
                    app.alert({ message: 'Something went wrong adding a detector to that data collection plan' })
                }
            })
        },

        render: function() {
            var columns = [
               { label: 'Detector', cell: table.TemplateCell, editable: false, template: '<%-DETECTORTYPE%><br /><%-DETECTORMANUFACTURER%><br /><%-DETECTORMODEL%><br />' },
               { label: 'Parameters', cell: DetectorCell, editable: false },
               { label: '', cell: DeleteCell, editable: false },
            ]

            this.dtable = new TableView({ 
                collection: this.model.get('DETECTORS'), 
                columns: columns, 
                tableClass: 'detectors', 
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No detectors found' },
            })

            var staticColumns = [
                { label: 'Detector', cell: table.TemplateCell, editable: false, template: '<%-DETECTORTYPE%><br /><%-DETECTORMANUFACTURER%><br /><%-DETECTORMODEL%><br />' },
                { label: 'Parameters', cell: StaticDetectorCell, editable: false },
            ]
            
            this.stable = new TableView({
                collection: this.model.get('DETECTORS'),
                columns: staticColumns,
                tableClass: 'detectorsstatic',
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No detectors found' },
            })
            
            this.$el.empty()
            this.$el.html(this.template)
            this.$el.find('.detectors').html(this.dtable.render().$el)
            this.$el.find('.detectorsstatic').html(this.stable.render().$el)
            this.$el.find('select[name=detectors]').html(this.column.get('detectors').opts())
            
            this.doCollapse()
            
            return this
        },

        doCollapse: function() {
            this.$el.find('a.add').hide()
            this.$el.find('select[name=detectors]').hide()
            this.$el.find('.detectorsstatic').show()
            this.$el.find('.detectors').hide()
            
        },
        
        doExpand: function() {
            this.$el.find('a.add').show()
            this.$el.find('select[name=detectors]').show()
            this.$el.find('.detectorsstatic').hide()
            this.$el.find('.detectors').show()
        },
    })

    var CollapseExpandCell = table.TemplateCell.extend({
        events: {
            'click a.collapsar': 'toggleExpansion',
        },
        
        initialize: function(options) {
            CollapseExpandCell.__super__.initialize.apply(this, [options])
            this.collapsed = true
        },
        
        toggleExpansion: function(e) {
            e.preventDefault()
            
            if (this.collapsed) {
                this.collapsed = false
                this.model.trigger('row:expand')
                this.doExpand()
            } else {
                this.collapsed = true
                this.model.trigger('row:collapse')
                this.doCollapse()
            }
        },
        
        doCollapse: function() {
            this.$el.find('i.expcol').removeClass('fa-chevron-down').addClass('fa-chevron-right')
        },
        
        doExpand: function() {
            this.$el.find('i.expcol').removeClass('fa-chevron-right').addClass('fa-chevron-down')
        },

    })


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            asmps: '.asamples',
            psmps: '.psamples',
        },


        initialize: function(options) {
            this.samples = new Samples()
            this.samples.queryParams.cid = this.model.get('CONTAINERID')
            this.samples.fetch()

            this.ready = []

            this.detectors = new Detectors()
            this.detectors.queryParams.BEAMLINENAME = this.model.get('FIRSTEXPERIMENTBEAMLINE')
            this.ready.push(this.detectors.fetch())
            this.scanservices = new ScanServices()
            this.ready.push(this.scanservices.fetch())

            this.scanmodels = new ScanModels(null, { state: { pageSize: 9999 }})
            this.scanmodels.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            this.scanmodels.fetch()

            this.beamlinesetups = new BeamlineSetups()
            this.beamlinesetups.queryParams.BEAMLINENAME = this.model.get('FIRSTEXPERIMENTBEAMLINE')
            this.beamlinesetups.queryParams.ACTIVE = 1
            this.ready.push(this.beamlinesetups.fetch())

            this.datacollectionplandetectors = new DataCollectionPlanDetectors(null, { state: { pageSize: 9999 }})
            this.datacollectionplandetectors.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            this.datacollectionplandetectors.fetch({
                BEAMLINESETUPS: this.beamlinesetups
            })

            this.datacollectionplans = new DataCollectionPlans()
            this.datacollectionplans.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            // hmm this is not what you'd expect
            this.datacollectionplans.fetch({
                SCANPARAMETERSMODELS: this.scanmodels,
                DETECTORS: this.datacollectionplandetectors,
                BEAMLINESETUPS: this.beamlinesetups
            })
        },

        onRender: function() {
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            var columns = [
                { label: '#', cell: table.TemplateCell, editable: false, template: '<%-LOCATION%>' },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'CRYSTAL', label: 'Instance of', cell: 'string', editable: false },
                { label: '', cell: AddCell, editable: false, datacollectionplans: this.datacollectionplans, scanmodels: this.scanmodels, dpdetectors: this.datacollectionplandetectors },
            ]

            this.table = new TableView({ 
                collection: this.samples, 
                columns: columns, 
                tableClass: 'asamples', 
                loading: true,
                backgrid: { emptyText: 'No instances found' },
            })

            this.asmps.show(this.table)


            var columns = [
                { label: '', cell: CollapseExpandCell, editable: false, template: '<a class="button collapsar" href="#"><i class="expcol fa fa-chevron-right"></i></a>' },
                { label: '#', cell: table.TemplateCell, editable: false, template: '<%-parseInt(PLANORDER)+1%>' },
                { label: 'Instance', cell: table.TemplateCell, editable: false, template: '<%-SAMPLE%>' },
                { label: 'Axes', cell: AxesCell, editable: false, scanservices: this.scanservices, scanmodels: this.scanmodels },
                { label: 'Detectors', cell: DetectorsCell, editable: false, detectors: this.detectors, dpdetectors: this.datacollectionplandetectors, beamlinesetups: this.beamlinesetups },
                { label: 'Parameters', cell: DCPlanCell, editable: false },
            ]

            this.table2 = new SortableTableView({ 
                collection: this.datacollectionplans, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: true,
                backgrid: {
                    emptyText: 'No data collection plans found'
                }
            })

            this.listenTo(this.datacollectionplans, 'order:updated', this.saveOrder)
            
            this.psmps.show(this.table2)
        },
        
        saveOrder: function() {
            console.log('saving order')
            this.datacollectionplans.each(function(m) {
                var ca = m.changedAttributes()
                if (Object.keys(ca).length) m.save(ca, { patch: true })
            })
        },
        

    })

})
