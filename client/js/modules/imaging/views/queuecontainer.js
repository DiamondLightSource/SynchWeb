define(['marionette',
    'modules/shipment/collections/platetypes',
    'modules/imaging/collections/inspections',
    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imageviewer',
    'collections/subsamples',
    'views/table',
    'utils/table',
    'views/filter',

    'modules/imaging/models/plan',
    'modules/imaging/collections/plans',
    
    'tpl!templates/imaging/queuecontainer.html', 'tpl!templates/imaging/queuepoint.html', 
    'tpl!templates/imaging/queuegrid.html', 'tpl!templates/imaging/queuexfe.html',
    'backgrid', 'backgrid-select-all'
    ], function(Marionette,
        PlateTypes, ContainerInspections, InspectionImages, ImageViewer,
        SubSamples,
        TableView, table, FilterView,
        DiffractionPlan, DiffractionPlans,
        template, pointemplate, gridtemplate, xfetemplate,
        Backgrid) {
    

    var AddCell = Backgrid.Cell.extend({
        events: {
            'click a.add': 'addToQueue',
        },

        addToQueue: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/sample/sub/queue/'+this.model.get('BLSUBSAMPLEID'),
                success: function(resp) {
                    self.model.set('READYFORQUEUE', '1')
                    self.render()
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong queuing this sub sample' })
                }
            })
        },

        render: function() {
            this.$el.empty()
            if (this.model.get('READYFORQUEUE') == '0')
                this.$el.html('<a href="#" class="button add"><i class="fa fa-plus"></i></a>')

            return this
        }
    })


    var ActionsCell = Backgrid.Cell.extend({
        events: {
            'click a.rem': 'remFromQueue',
            'click a.clone': 'clone',
            'click a.save': 'saveAsPreset',
        },

        clone: function(e) {
            e.preventDefault()
            this.model.trigger('clone', this.model)
        },

        saveAsPreset: function(e) {
            var p = new DiffractionPlan(this.model.toJSON())
            p.set({ 
                COMMENTS: (this.model.get('X2') ? 'Region' : 'Point')+(this.column.get('plans').length+1),
                DIFFRACTIONPLANID: null,
            })
            var self = this
            p.save({}, {
                success: function() {
                    app.alert({ message: 'Preset successfully saved' })
                    self.column.get('plans').add(p)
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong saving this preset' })
                }
            })
        },

        removeFromQueue: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/sample/sub/queue/'+this.model.get('BLSUBSAMPLEID'),
                data: { 'UNQUEUE': 1 },
                success: function(resp) {
                    self.model.set('READYFORQUEUE', '0')
                    self.render()
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong removing this sub sample' })
                }
            })
        },

        render: function() {
            this.$el.empty()
            this.$el.html('<a href="#" class="button clone" title="CLone these parameters to the selected samples"><i class="fa fa-clone"></i></a>\
                <a href="#" class="button save" title="Save these parameters as a preset"><i class="fa fa-save"></i></a>\
                <a href="#" class="button rem" title="Remove from Queue"><i class="fa fa-minus"></i></a>')

            return this
        }
    })


    var LocationCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            var name = this.column.get('type').getName(this.model.get('LOCATION'))
            var drop = this.column.get('type').getDrop(this.model.get('LOCATION'))
            this.$el.html(name+'d'+drop)
            
            this.delegateEvents()
            return this
        }
    })



    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        
        onClick: function(e) {
            if ($(e.target).is('a') || $(e.target).is('i') || $(e.target).is('input') || $(e.target).is('select')) return
            this.model.set({ isSelected: true })
        },

        initialize: function(options) {
            ClickableRow.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change:isSelected', this.setActive, this)
        },

        setActive: function() {
            this.model.get('isSelected') ? this.$el.addClass('selected') : this.$el.removeClass('selected')
        },

        render: function() {
            this.setActive()
            return ClickableRow.__super__.render.call(this)
        },
    })



    var ExperimentCell = Backgrid.Cell.extend({
        events: {
            'change input': 'updateModel',
            'blur input': 'updateModel',
            'keyup input': 'updateModel',
            'change select': 'updateModel',
        },

        updateModel: function(e) {
            console.log('up mod', $(e.target).attr('name'))
            this.model.set($(e.target).attr('name'), $(e.target).val())
        },

        initialize: function(options) {
            ExperimentCell.__super__.initialize.call(this,options)

            this.listenTo(this.model, 'change:EXPERIMENTKIND', this.render, this)
            this.listenTo(this.model, 'refresh', this.render, this)
        },

        render: function(e) {
            console.log('render cell exp')
            if (this.model.changedAttributes()) {
                if ('BOXSIZEX' in  this.model.changedAttributes()) throw 'moo'
            }
            var types = {
                'SAD': pointemplate,
                'MESH': gridtemplate,
                'XFE': xfetemplate,
            }

            this.$el.empty()
            if (this.model.get('EXPERIMENTKIND') in types) {
                this.$el.html(types[this.model.get('EXPERIMENTKIND')](this.model.toJSON()))
            }
            return this
        },
    })

    var ExperimentKindCell = Backgrid.Cell.extend({

        events: {
            'change select': 'updateModel'
        },

        updateModel: function() {
            this.model.set('EXPERIMENTKIND', this.$el.find('select').val())
        },

        types: {
            'Point': [{ name: 'Point Collection', type: 'SAD' }, { name: 'Fluorescence', type: 'XFE' }],
            'Region': [{ name: 'Grid Scan', type: 'MESH' }],
            'Line': [{ name: 'Line Scan', type: 'SAD' }],
        },

        render: function() {
            this.$el.empty()
            if (this.model.get('X2') && this.model.get('Y2')) {
                var opts = this.types['Region']
            } else var opts = this.types['Point']
            
            var options = ''
            _.each(opts, function(o) {
                options += '<option value="'+o.type+'">'+o.name+"</option>"
            })

            this.$el.html('<select name="EXPERIMENTKIND">'+options+'</select>')
            this.$el.find('select').val(this.model.get('EXPERIMENTKIND'))

            return this
        }

    })
    

    var ClientFilterView = FilterView.extend({
        filters: [
            {id: 'point', name: 'Point' },
            {id: 'region', name: 'Region' },
        ],

        _filter: function() {

        }
    })
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            asmps: '.asamples',
            qsmps: '.qsamples',
            qfilt: '.qfilt',
            rimg: '.image',
        },
        
        events: {
            'click button.submit': 'queueContainer',
            'click a.apply': 'applyPreset',
        },

        ui: {
            preset: 'select[name=preset]',
        },

        applyPreset:function(e) {
            e.preventDefault()

            var p = this.plans.findWhere({ DIFFRACTIONPLANID: this.ui.preset.val() })
            if (p) this.applyModel(p)
        },

        applyModel: function(p) {
            var models = this.qsubsamples.where({ isGridSelected: true })
            _.each(models, function(m) {
                _.each(['REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'WAVELENGTH', 'MONOCHROMATOR', 'EXPERIMENTKIND'], function(k) {
                    if (p.get(k) !== null) m.set(k, p.get(k))
                }, this)
                m.trigger('refresh')
            }, this)
        },

        cloneModel: function(m) {
            console.log('cloning', m)
            this.applyModel(m)
        },

        queueContainer: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue',
                data: {
                    cid: this.model.get('CONTAINERID')
                },
                success: function(resp) {
                    self.model.set('QUEUED', 1)

                    if (self.getOption('dialog')) {
                        app.alert({ message: 'Container Successfully Queued' })
                        if (app.dialog.currentView) app.dialog.currentView.closeDialog()
                    }
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong queuing this container' })
                }
            })
        },
        

        selectModel: function(m, checked) {
            console.log('model seleted in grid')
            m.set({ isGridSelected: checked })
        },
        
        initialize: function(options) {
            this._lastSample = null

            this.type = PlateTypes.findWhere({ name: this.model.get('CONTAINERTYPE') })

            this.subsamples = new SubSamples()
            this.subsamples.queryParams.cid = this.model.get('CONTAINERID')
            this.listenTo(this.subsamples, 'change:isSelected', this.selectSubSample, this)
            this.listenTo(this.subsamples, 'sync add remove', this.refreshQSubSamples, this)
            this.subsamples.fetch()

            this.inspections = new ContainerInspections()
            this.inspections.queryParams.cid = this.model.get('CONTAINERID')
            this.inspections.setSorting('BLTIMESTAMP', 1)
            this.inspections.fetch().done(this.getInspectionImages.bind(this))

            this.inspectionimages = new InspectionImages()

            this.imagess = new SubSamples()
            this.image = new ImageViewer({ subsamples: this.imagess, scores: false, showBeam: true })

            this.qsubsamples = new SubSamples()
            this.listenTo(this.qsubsamples, 'backgrid:selected', this.selectModel, this)
            this.listenTo(this.qsubsamples, 'clone', this.cloneModel, this)

            this.plans = new DiffractionPlans()
            this.plans.fetch()
            this.listenTo(this.plans, 'add remove sync', this.populatePresets, this)
        },

        populatePresets: function() {
            this.ui.preset.html(this.plans.opts())
        },

        getInspectionImages: function() {
            this.inspectionimages.queryParams.iid = this.inspections.at(0).get('CONTAINERINSPECTIONID')
            this.inspectionimages.fetch().done(this.selectSample.bind(this))
        },

        selectSample: function() {
            this.subsamples.at(0).set({ isSelected: true })
        },

        refreshQSubSamples: function() {
            console.log('ss', this.subsamples)
            console.log('ref q subs', this.subsamples.where({ READYFORQUEUE: '1' }))
            this.qsubsamples.reset(this.subsamples.where({ READYFORQUEUE: '1' }))
        },

        selectSubSample: function() {
            var ss = this.subsamples.findWhere({ isSelected: true })
            var s = ss.get('BLSAMPLEID')
            if (s != this._lastSample) {
                this.imagess.reset(this.subsamples.where({ BLSAMPLEID: s }))
                var i = this.inspectionimages.findWhere({ BLSAMPLEID: s })
                this.image.setModel(i)

            }
        },
        
        
        onRender: function() {
            var columns = [{ label: '#', cell: table.TemplateCell, editable: false, template: '<%=(RID+1)%>' },
                           { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                           { name: 'PROTEIN', label: 'Protein', cell: 'string', editable: false },
                           { label: 'Location', cell: LocationCell, editable: false, type: this.type },
                           { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%=(X2 ? "Region" : "Point")%>' },
                           { label: '', cell: AddCell, editable: false },
            ]

            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }

            this.table = new TableView({ 
                collection: this.subsamples, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: true,
                backgrid: { row: ClickableRow, emptyText: 'No sub samples found' },
            })

            this.asmps.show(this.table)

            var columns = [{ label: '#', cell: table.TemplateCell, editable: false, template: '<%=(RID+1)%>' },
                           { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                           { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                           { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%=(X2 ? "Region" : "Point")%>' },
                           { label: 'Experiment', cell: ExperimentKindCell, editable: false },
                           { label: 'Parameters', cell: ExperimentCell, editable: false },
                           { name: 'VALID', label: 'Valid', cell: 'string', editable: false },
                           { label: '', cell: ActionsCell, editable: false, plans: this.plans },
            ]

            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }

            this.table2 = new TableView({ 
                collection: this.qsubsamples, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: true,
                backgrid: { row: ClickableRow, emptyText: 'No sub samples found' },
            })

            this.qsmps.show(this.table2)

            this.typeselector = new ClientFilterView({
                url: false,
            })
            this.qfilt.show(this.typeselector)
        },

        onShow: function() {
            this.rimg.show(this.image)
        },
        
    })
        
})
