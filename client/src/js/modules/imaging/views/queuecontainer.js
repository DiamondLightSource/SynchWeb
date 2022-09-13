define(['marionette',
    'backbone',
    'modules/shipment/collections/platetypes',
    'modules/imaging/collections/inspections',
    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imageviewer',
    'collections/subsamples',
    'views/table',
    'utils/table',
    'views/filter',
    'utils',

    'modules/imaging/models/plan',
    'modules/imaging/collections/plans',

    'collections/beamlinesetups',
    
    'templates/imaging/queuecontainer.html', 'templates/imaging/queuepoint.html', 
    'templates/imaging/queuegrid.html', 'templates/imaging/queuexfe.html',
    'modules/imaging/models/plan_point_vmxi',
    'modules/imaging/models/plan_grid_vmxi',
    'modules/imaging/models/plan_xfe_vmxi',
    'backgrid', 'backgrid-select-all'
    ], function(Marionette,
        Backbone,
        PlateTypes, ContainerInspections, InspectionImages, ImageViewer,
        SubSamples,
        TableView, table, FilterView, utils,
        DiffractionPlan, DiffractionPlans,
        BeamlineSetups,
        template, pointemplate, gridtemplate, xfetemplate,
        VMXiPoint, VMXiGrid, VMXiXFE,
        Backgrid) {
    

    var AddCell = Backgrid.Cell.extend({
        events: {
            'click a.add': 'addToQueue',
        },

        initialize: function(options) {
            AddCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change:READYFORQUEUE', this.render)
        },

        addToQueue: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/sample/sub/queue/'+this.model.get('BLSUBSAMPLEID'),
                success: function() {
                    self.model.set('READYFORQUEUE', '1')
                },
                error: function() {
                    app.alert({ message: 'Something went wrong queuing this sub sample' })
                }
            })
        },

        render: function() {
            this.$el.empty()

            console.log('add cell', this.model.get('CONTAINERQUEUEID'))
            if (!this.column.get('disable')) {
                if (Number(this.model.get('READYFORQUEUE')) === 0 && !this.model.get('QUEUECOMPLETED'))
                    this.$el.html('<a href="#" class="button add"><i class="fa fa-plus"></i></a>')
            }

            if (this.model.get('QUEUECOMPLETED')) {
                this.$el.html('<ul class="status"><li class="COMP"></li></ul>')
            }

            return this
        }
    })


    var ActionsCell = Backgrid.Cell.extend({
        events: {
            'click a.rem': 'removeFromQueue',
            'click a.clone': 'clone',
            'click a.save': 'saveAsPreset',
        },

        clone: function(e) {
            e.preventDefault()
            this.model.trigger('clone', this.model)
        },

        saveAsPreset: function(e) {
            e.preventDefault()

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
                error: function() {
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
                success: function() {
                    self.model.set('READYFORQUEUE', '0')
                    self.render()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong removing this sub sample' })
                }
            })
        },

        render: function() {
            this.$el.empty()

            if (!this.model.get('CONTAINERQUEUEID'))
                this.$el.html('<a href="#" class="button clone" title="Clone these parameters to the selected samples"><i class="fa fa-files-o"></i></a>\
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
            this.$el.text(name+'d'+drop)
            
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
        plans: {
            SAD: VMXiPoint,
            MESH: VMXiGrid,
            XFE: VMXiXFE,
        },

        events: {
            'change input': 'updateModel',
            'blur input': 'updateModel',
            'keyup input': 'updateModel',
            'change select': 'updateModel',
        },

        updateModel: function(e) {
            console.log('up mod', $(e.target).attr('name'))
            this.model.set($(e.target).attr('name'), $(e.target).val())
            this.plan.set(this.model.toJSON())
            this.validate({ attr: $(e.target).attr('name'), val: $(e.target).val() })
            this.preSave()
        },

        preSave: function() {
            if (this.plan.isValid(true)) {
                var ch = this.model.changedAttributes()
                console.log('model valid', this.model, ch)
                if (this.model.get('_valid') === false) this.model.save()
                else if (ch && !(Object.keys(ch).length === 1 && ('isSelected' in ch || '_valid' in ch || this.plan.computed().indexOf(Object.keys(ch)[0]) > -1))) {
                    console.log('attrs changed', this.model.changedAttributes())
                    this.model.save()   
                }
                this.model.set('_valid', true)

            } else {
                console.log('model invalid')
                this.model.set('_valid', false)
            }
        },

        validate: function(options) {
            var error = this.plan.preValidate(options.attr, options.val)
            var attr = this.$el.find('[name='+options.attr+']')
            if (error) this.invalid(attr, error)
            else this.valid(attr)
        },

        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },

        initialize: function(options) {
            ExperimentCell.__super__.initialize.call(this,options)

            this.listenTo(this.model, 'change:EXPERIMENTKIND', this.render, this)
            this.listenTo(this.model, 'refresh', this.render, this)

            this.preSave = _.debounce(this.preSave, 1000)
        },

        setPlan: function() {
            if (this.model.get('EXPERIMENTKIND') in this.plans) {
                var options = {}
                console.log('binding model', this.column.get('beamlinesetups'))
                if (this.column.get('beamlinesetups') && this.column.get('beamlinesetups').length) {
                    options.beamlinesetup = this.column.get('beamlinesetups').at(0)
                }
                this.plan = new this.plans[this.model.get('EXPERIMENTKIND')](null, options)
            } else this.plan = new DiffractionPlan()
        },

        checkIsValid: function() {
            this.setPlan()
            Backbone.Validation.bind(this, { model: this.plan })

            this.plan.set(this.model.toJSON())
            this.updateComputed()

            var valid = this.plan.isValid(true)
            this.model.set('_valid', valid)
            return valid
        },

        bindModel: function() {
            this.setPlan()

            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                model: this.plan,
                selector: 'name',
                valid: function(view, attr) {
                  view.valid(view.$el.find('[name="'+attr+'"]'))
                },
                invalid: function(view, attr, error) {
                  view.invalid(view.$el.find('[name="'+attr+'"]'), error)
                }
            })

            this.plan.set(this.model.toJSON())
            this.listenTo(this.plan, 'computed:changed', this.updateComputed)
        },

        updateComputed: function() {
            _.each(this.plan.computed(), function(k) {
                this.$el.find('[name='+k+']').val(this.plan.get(k)).trigger('change')
            }, this)
        },

        render: function() {
            const types = {
                'SAD': pointemplate,
                'MESH': gridtemplate,
                'XFE': xfetemplate,
            }

            this.$el.empty()
            if (this.model.get('EXPERIMENTKIND') in types) {
                this.$el.html(types[this.model.get('EXPERIMENTKIND')](this.model.toJSON()))
            }

            if (this.model.get('CONTAINERQUEUEID')) this.$el.find('input').attr('disabled', 'disabled')

            this.bindModel()
            // this.preSave()
            this.model.set('_valid', this.plan.isValid(true))
            this.updateComputed()

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
            let opts
            if (this.model.get('X2') && this.model.get('Y2')) {
                opts = this.types['Region']
            } else opts = this.types['Point']
            
            let options = ''
            _.each(opts, function(o) {
                options += '<option value="'+o.type+'">'+o.name+"</option>"
            })

            this.$el.html('<select name="EXPERIMENTKIND">'+options+'</select>')
            this.$el.find('select').val(this.model.get('EXPERIMENTKIND'))

            if (this.model.get('CONTAINERQUEUEID')) this.$el.find('select').attr('disabled', 'disabled')

            return this
        }

    })
    

    var ClientFilterView = FilterView.extend({
        filters: [
            {id: 'point', name: 'Point' },
            {id: 'region', name: 'Region' },
            {id: 'invalid', name: 'Invalid' },
        ],

        initialize: function(options) {
            ClientFilterView.__super__.initialize.call(this, options)

            this.filterablecollection = options.collection.fullCollection// || options.collection
            this.shadowCollection = this.filterablecollection.clone()

            this.listenTo(this.filterablecollection, 'add', function (model, collection, options) {
                this.shadowCollection.add(model, options)
            })
            this.listenTo(this.filterablecollection, 'remove', function (model, collection, options) {
                this.shadowCollection.remove(model, options)
            })
            this.listenTo(this.filterablecollection, 'sort', function (col) {
                if (!this.query()) this.shadowCollection.reset(col.models)
            })
            this.listenTo(this.filterablecollection, 'reset', function (col, options) {
                options = _.extend({reindex: true}, options || {})
                if (options.reindex && options.from == null && options.to == null) {
                    this.shadowCollection.reset(col.models)
                    if (this.selected()) this._filter()
                }
            })
        },

        _filter: function() {
            var id = this.selected()
            this.trigger('selected:change', id, this.selectedName())
            if (id) {
                this.filterablecollection.reset(this.shadowCollection.filter(function(m) {
                    if (id === 'invalid') {
                        return m.get('_valid') === false

                    } else if (id === 'region') {
                        return m.get('X2') && m.get('Y2')

                    } else if (id === 'point') {
                        return m.get('X') && m.get('Y') && !m.get('X2')
                    }
                }), {reindex: false})
            } else {
                console.log('reset', this.shadowCollection)
                this.filterablecollection.reset(this.shadowCollection.models, {reindex: false})
            }
        }
    })


    var SnapshotCell = Backgrid.Cell.extend({
        image: null,
        className: 'cleafix',

        selectImage: function() {
            this.image = this.column.get('inspectionimages').findWhere({ BLSAMPLEID: this.model.get('BLSAMPLEID') })
            console.log('selectimage', this.image)
            if (this.image) this.viewer.setModel(this.image)
        },

        render: function() {
            var clone = this.model.clone()
            clone.set({ isSelected: true })

            this.viewer = new ImageViewer({ 
                subsamples: new SubSamples([clone]), 
                scores: false, showBeam: false, move: false, showHeatmap: false 
            })
            this.$el.html(this.viewer.render().$el)

            this.afterRender()

            return this
        },

        afterRender: function() {
            this.viewer.$el.width(300)
            this.viewer.onDomRefresh()
            this.listenTo(this.column.get('inspectionimages'), 'sync', this.selectImage)
            this.selectImage()
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
            'click a.unqueue': 'unqueueContainer',
            'click a.addall': 'queueAllSamples',
            'change @ui.nodata': 'refreshSubSamples',
            'change @ui.notcompleted': 'refreshSubSamples',
        },

        ui: {
            preset: 'select[name=preset]',
            rpreset: '.rpreset',
            xtal: '.xtalpreview',
            nodata: 'input[name=nodata]',
            notcompleted: 'input[name=notcompleted]',
        },


        queueAllSamples: function(e) {
            e.preventDefault()

            var self = this
            var sids = _.map(this.subsamples.filter(function(ss) { return (!ss.get('QUEUECOMPLETED'))  }), function(ss) {return ss.get('BLSUBSAMPLEID')})

            Backbone.ajax({
                url: app.apiurl+'/sample/sub/queue',
                data: {
                    BLSUBSAMPLEID: sids,
                },
                success: function(resp) {
                    _.each(resp, function (r) {
                        var ss = self.subsamples.findWhere({ BLSUBSAMPLEID: r.BLSUBSAMPLEID })
                        ss.set({ READYFORQUEUE: '1' })
                    })
                },
            })

            setTimeout(function() {
                self.refreshQSubSamples.bind(self)
            }, 200)
        },


        unqueueContainer: function(e) {
            e.preventDefault()
            utils.confirm({
                title: 'Unqueue Container?',
                content: 'Are you sure you want to remove this container from the queue? You will loose your current place',
                callback: this.doUnqueueContainer.bind(this)
            })
        },

        doUnqueueContainer: function() {
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue',
                data: {
                    CONTAINERID: this.model.get('CONTAINERID'),
                    UNQUEUE: 1,
                },
                success: function() {
                    app.alert({ message: 'Container Successfully Unqueued' })
                },
                error: function() {
                    app.alert({ message: 'Something went wrong unqueuing this container' })
                }
            })
        },

        applyPreset:function(e) {
            e.preventDefault()

            var p = this.plans.findWhere({ DIFFRACTIONPLANID: this.ui.preset.val() })
            if (p) this.applyModel(p)
        },

        applyModel: function(p) {
            var models = this.qsubsamples.where({ isGridSelected: true })
            _.each(models, function(m) {
                if (p.get('EXPERIMENTKIND') !== m.get('EXPERIMENTKIND')) return
                    
                _.each(['REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR'], function(k) {
                    if (p.get(k) !== null) m.set(k, p.get(k))
                }, this)
                m.save()
                m.trigger('refresh')
            }, this)
        },

        cloneModel: function(m) {
            console.log('cloning', m)
            this.applyModel(m)
        },

        queueContainer: function(e) {
            e.preventDefault()

            if (!this.qsubsamples.fullCollection.length) {
                app.alert({ message: 'Please add some samples before queuing this container' })
                return
            }

            // need to validate all models here again incase they havnt been rendered
            this.qsubsamples.fullCollection.each(function(qs) {
                if (qs.get('_valid') !== undefined) return

                const expcell = new ExperimentCell({model: qs, column: {beamlinesetups: this.beamlinesetups}});
                const val = expcell.checkIsValid();
                console.log({ experimentCell: val })
            }, this)

            var invalid = this.qsubsamples.fullCollection.where({ '_valid': false })
            console.log('queue', invalid, invalid.length > 0)
            if (invalid.length > 0) {
                app.alert({ message: 'There are '+invalid.length+' sub samples with invalid experimental plans, please either correct or remove these from the queue' })
                var inv = this.typeselector.collection.findWhere({ id: 'invalid' })
                if (inv) inv.set({ isSelected: true })

            } else {
                Backbone.ajax({
                    url: app.apiurl+'/shipment/containers/queue',
                    data: {
                        CONTAINERID: this.model.get('CONTAINERID')
                    },
                    success: function() {
                        app.alert({ message: 'Container Successfully Queued' })
                    },
                    error: function() {
                        app.alert({ message: 'Something went wrong queuing this container' })
                    }
                })

            }
        },
        

        selectModel: function(m, checked) {
            console.log('model seleted in grid')
            m.set({ isGridSelected: checked })
        },

        getNoData: function() {
            return this.ui.nodata.is(':checked') ? 1 : null
        },

        getNotCompleted: function() {
            return this.ui.notcompleted.is(':checked') ? 1 : null
        },

        refreshSubSamples: function() {
            this.subsamples.fetch()
        },
        
        initialize: function() {
            this._lastSample = null

            this.platetypes = new PlateTypes()
            this.type = this.platetypes.findWhere({ name: this.model.get('CONTAINERTYPE') })

            this.subsamples = new SubSamples()
            this.subsamples.queryParams.cid = this.model.get('CONTAINERID')
            this.subsamples.state.pageSize = 10
            this.listenTo(this.subsamples, 'change:isSelected', this.selectSubSample, this)
            this.listenTo(this.subsamples, 'sync add remove change:READYFORQUEUE', this.refreshQSubSamples, this)
            this.subsamples.fetch()

            this.inspections = new ContainerInspections()
            this.inspections.queryParams.cid = this.model.get('CONTAINERID')
            this.inspections.setSorting('BLTIMESTAMP', 1)
            this.inspections.fetch().done(this.getInspectionImages.bind(this))

            this.inspectionimages = new InspectionImages()

            this.imagess = new SubSamples()
            this.image = new ImageViewer({ subsamples: this.imagess, scores: false, showBeam: true, move: !this.model.get('CONTAINERQUEUEID') })

            this.qsubsamples = new SubSamples()
            this.qsubsamples.state.pageSize = 5
            this.listenTo(this.qsubsamples, 'backgrid:selected', this.selectModel, this)
            this.listenTo(this.qsubsamples, 'clone', this.cloneModel, this)

            this.plans = new DiffractionPlans()
            this.plans.fetch()
            this.listenTo(this.plans, 'add remove sync', this.populatePresets, this)

            // this.listenTo(app, 'window:scroll', this.onScroll, this)

            this.beamlinesetups = new BeamlineSetups()
            this.beamlinesetups.queryParams.ACTIVE = 1
            this.beamlinesetups.queryParams.BEAMLINENAME = this.model.get('BEAMLINENAME')
            this._ready = this.beamlinesetups.fetch()
        },


        onScroll: function(e) {
            console.log('scrolling', e)
            if (this.fixedPreview) {
                if (utils.inView(this.$el.find('.qfilt'), -100)) {
                    this.ui.xtal.removeClass('fixed')
                    $('.content').removeClass('fixed')
                    this.subsamples.setPageSize(10)
                    this.fixedPreview = false
                }
            } else {
                var inv = utils.inView(this.ui.xtal, -200)
                if (!inv) {
                    this.ui.xtal.addClass('fixed')
                    this.subsamples.setPageSize(5)
                    $('.content').addClass('fixed')
                    this.fixedPreview = true
                }
            }
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
            if (this.model.get('CONTAINERQUEUEID')) {
                this.qsubsamples.fullCollection.reset(this.subsamples.fullCollection.where({ CONTAINERQUEUEID: this.model.get('CONTAINERQUEUEID') }))
            } else this.qsubsamples.fullCollection.reset(this.subsamples.fullCollection.where({ READYFORQUEUE: '1' }))
        },

        selectSubSample: function() {
            var ss = this.subsamples.findWhere({ isSelected: true })
            var s = ss.get('BLSAMPLEID')
            if (s !== this._lastSample) {
                this.imagess.reset(this.subsamples.fullCollection.where({ BLSAMPLEID: s }))
                var i = this.inspectionimages.findWhere({ BLSAMPLEID: s })
                this.image.setModel(i)
            }
        },
        
        
        onRender: function() {
            this.subsamples.queryParams.nodata = this.getNoData.bind(this)
            this.subsamples.queryParams.notcompleted = this.getNotCompleted.bind(this)
            this._ready.done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            const subSamplesColumns = [
                { label: '#', cell: table.TemplateCell, editable: false, template: '<%-(RID+1)%>' },
                { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                { name: 'PROTEIN', label: 'Protein', cell: 'string', editable: false },
                { label: 'Location', cell: LocationCell, editable: false, type: this.type },
                { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%-(X2 ? "Region" : "Point")%>' },
                { label: 'Source', cell: table.TemplateCell, editable: false, template: '<%- SOURCE %>' },
                { label: '', cell: table.StatusCell, editable: false },
                { label: '', cell: AddCell, editable: false, disable: this.model.get('CONTAINERQUEUEID') },
            ]

            if (app.mobile()) {
                _.each([], function(v) {
                    subSamplesColumns[v].renderable = false
                })
            }

            this.table = new TableView({ 
                collection: this.subsamples, 
                columns: subSamplesColumns,
                tableClass: 'subsamples', 
                loading: true,
                backgrid: { row: ClickableRow, emptyText: 'No sub samples found' },
                noPageUrl: true,
            })

            this.asmps.show(this.table)

            const queuedSubSamples = [
                { label: '#', cell: table.TemplateCell, editable: false, template: '<%-(RID+1)%>' },
                { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%-(X2 ? "Region" : "Point")%>' },
                { label: 'Source', cell: table.TemplateCell, editable: false, template: '<%- SOURCE %>' },
                { label: 'Experiment', cell: ExperimentKindCell, editable: false },
                { label: 'Parameters', cell: ExperimentCell, editable: false, beamlinesetups: this.beamlinesetups },
                { name: '_valid', label: 'Valid', cell: table.TemplateCell, editable: false, test: '_valid', template: '<i class="button fa fa-check active"></i>' },
                { name: '', cell: table.StatusCell, editable: false },
                { label: '', cell: SnapshotCell, editable: false, inspectionimages: this.inspectionimages },
                { label: '', cell: ActionsCell, editable: false, plans: this.plans },
            ]

            if (app.mobile()) {
                _.each([], function(v) {
                    queuedSubSamples[v].renderable = false
                })
            }

            this.typeselector = new ClientFilterView({
                url: false,
                collection: this.qsubsamples,
            })
            this.qfilt.show(this.typeselector)

            if (this.model.get('CONTAINERQUEUEID')) {
                this.ui.rpreset.hide()
                queuedSubSamples.push({ label: '', cell: table.StatusCell, editable: false })
                queuedSubSamples.push({ label: '', cell: table.TemplateCell, editable: false, template: '<a href="/samples/sid/<%-BLSAMPLEID%>" class="button"><i class="fa fa-search"></i></a>' })
            }

            this.table2 = new TableView({ 
                collection: this.qsubsamples,
                columns: queuedSubSamples,
                tableClass: 'subsamples', 
                loading: false,
                backgrid: { 
                    // row: ClickableRow, 
                    emptyText: 'No sub samples found' 
                },
                noPageUrl: true,
            })

            this.qsmps.show(this.table2)
        },

        onShow: function() {
            this.rimg.show(this.image)
        },
        
    })
        
})
