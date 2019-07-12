define(['marionette',
    'models/beamlinesetup',
    'collections/beamlinesetups',
    'models/detector',
    'collections/detectors',
    'modules/fault/collections/bls',
    'views/table',
    'utils/table',

    'templates/imaging/paramadmin.html',
    'templates/imaging/blparamlimits.html',
    'templates/imaging/blparamlimitsstatic.html',

    'templates/imaging/detectorlimits.html',
    'templates/imaging/detectorlimitsstatic.html',
    ], function(Marionette, 
        BeamlineSetup, BeamlineSetups, Detector, Detectors,
        Beamlines,
        TableView, table,
        template, params, paramsstatic, detlims, detlimsstatic) {
    


    var ButtonCell = Backgrid.Cell.extend({
        events: {
            'click a.save': 'save',
            'click a.cancel': 'cancel',
            'click a.act': 'toggleActive',
        },

        toggleActive: function(e) {
            e.preventDefault()
            this.model.set({ ACTIVE: this.model.get('ACTIVE') ? 0 : 1 })

            var self = this
            this.model.save(this.model.changedAttributes(), {
                patch: true,
                success: function() {
                    self.displayActive()
                }
            })
        },

        save: function(e) {
            e.preventDefault()

            if (this.model.isValid(true)) {
                var self = this
                this.model.save({}, {
                    success: function() {
                        self.render()
                    }
                })
            }
        },

        cancel: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },

        displayActive: function() {
            if (parseInt(this.model.get('ACTIVE'))) this.$el.find('a.act').addClass('active')
            else this.$el.find('a.act').removeClass('active')
        },

        render: function() {
            if (this.model.isNew()) {
                this.$el.html('<a href="#" class="button  button-notext save"><i class="fa fa-check"></i> <span>Save</span></a> '+
                    '<a href="#" class="button  button-notext cancel"><i class="fa fa-times"></i> <span>Remove</span></a>')
            } else {
                this.$el.html('<a href="#" class="button button-notext act"><i class="fa fa-power-off"></i> <span>Active</span></a>')
            }

            this.displayActive()
            return this
        }
    })

    var ButtonCell2 = Backgrid.Cell.extend({
        events: {
            'click a.save': 'save',
            'click a.cancel': 'cancel',
        },

        save: function(e) {
            e.preventDefault()

            if (this.model.isValid(true)) {
                var self = this
                this.model.save({}, {
                    success: function() {
                        self.render()
                    }
                })
            }
        },

        cancel: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },

        render: function() {
            this.$el.empty()
            if (this.model.isNew()) {
                this.$el.html('<a href="#" class="button  button-notext save"><i class="fa fa-check"></i> <span>Save</span></a> '+
                    '<a href="#" class="button  button-notext cancel"><i class="fa fa-times"></i> <span>Remove</span></a>')
            }
            return this
        }
    })


    var ParametersCell = table.ValidatedTemplateCell.extend({

        events: _.extend({}, table.ValidatedTemplateCell.prototype.events, {
            'click a.locked': 'doUnlock',
            'click a.unlocked': 'doLock',
        }),
        
        initialize: function(options) {
            ParametersCell.__super__.initialize.call(this, options)
        },
        
        render: function() {
            this.$el.empty()
            this.bindModel()
            if (this.model.isNew()) this.doUnlock()
            else this.doLock()
            
            return this
        },
        
        doUnlock: function(e) {
            if (e) e.preventDefault()
            this.$el.html(params(this.model.toJSON()))
        },

        doLock: function(e) {
            if (e) e.preventDefault()
            this.$el.html(paramsstatic(this.model.toJSON()))
        },
        
    })


    var DetectorsLimitsCell = table.ValidatedTemplateCell.extend({
        events: _.extend({}, table.ValidatedTemplateCell.prototype.events, {
            'click a.locked': 'doUnlock',
            'click a.unlocked': 'doLock',
        }),
        
        initialize: function(options) {
            ParametersCell.__super__.initialize.call(this, options)
        },
        
        render: function() {
            this.$el.empty()
            this.bindModel()
            if (this.model.isNew()) this.doUnlock()
            else this.doLock()
            
            return this
        },
        
        doUnlock: function(e) {
            if (e) e.preventDefault()
            this.$el.html(detlims(this.model.toJSON()))
        },

        doLock: function(e) {
            if (e) e.preventDefault()
            this.$el.html(detlimsstatic(this.model.toJSON()))
        },
    })


    var DetectorsLimitsCellStatic = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            if (!this.model.isNew()) {
                this.$el.html(detlimsstatic(this.model.toJSON()))
                this.$el.find('a.locked').hide()
            }

            return this
        }
    })


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rprms: '.params',
            rdets: '.detectors',
        },

        events: {
            'click a.add': 'addBeamlineSetup',
            'click a.addd': 'addDetector',
        },


        addBeamlineSetup: function(e) {
            e.preventDefault()
            this.params.add(new BeamlineSetup())
        },

        addDetector: function(e) {
            e.preventDefault()
            this.detectors.add(new Detector())
        },


        initialize: function(options) {
            this._ready = []

            this.beamlines = new Beamlines()
            this._ready.push(this.beamlines.fetch())

            this.params = new BeamlineSetups()
            this._ready.push(this.params.fetch())

            this.detectors = new Detectors()
            this._ready.push(this.detectors.fetch())

            this.listenTo(this.params, 'backgrid:edited', this.saveModel)
            this.listenTo(this.detectors, 'backgrid:edited', this.saveModel)
        },

        saveModel: function(m, v) {
            console.log('model changed', arguments)
            if (!m.isNew()) m.save(m.changedAttributes(), { patch: true })
        },



        onRender: function() {
            $.when.apply($, this._ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            this.rprms.show(new TableView({
                tableClass: 'subsamples', 
                collection: this.params,
                columns: [
                    { name: 'BEAMLINENAME', label: 'Beamline', cell: table.SelectInputCell, editable: true, options: this.beamlines },
                    { name: 'SETUPDATE', label: 'Created', cell: 'string', editable: false },
                    { label: 'Beamline Limits', cell: ParametersCell, editable: false },
                    { name: 'DETECTORID', label: 'Detector', cell: table.SelectInputCell, editable: true, options: this.detectors },
                    { label: 'Limits', cell: DetectorsLimitsCellStatic, editable: false },
                    { name: 'SESSIONS', label: 'Sessions', cell: 'string', editable: false },
                    { label: '', cell: ButtonCell, editable: false },
                ],
                backgrid: {
                    emptyText: 'No Beamline Parameters Available'
                },
            }))

// DETECTORDISTANCEMAX
// DETECTORDISTANCEMIN
// DETECTORPIXELSIZEHORIZONTAL
// DETECTORPIXELSIZEVERTICAL
// RESOLUTIONMAX
// RESOLUTIONMIN

            this.rdets.show(new TableView({
                tableClass: 'subsamples', 
                collection: this.detectors,
                columns: [
                    { name: 'DETECTORMANUFACTURER', label: 'Manufacturer', cell: table.ValidatedCell, editable: true },
                    { name: 'DETECTORMODEL', label: 'Model', cell: table.ValidatedCell, editable: true },
                    { name: 'DETECTORTYPE', label: 'Type', cell: table.ValidatedCell, editable: true },
                    { name: 'DETECTORSERIALNUMBER', label: 'Serial', cell: table.ValidatedCell, editable: true },
                    { name: 'SENSORTHICKNESS', label: 'Sensor Thickness (um)', cell: table.ValidatedCell, editable: true },
                    { label: 'Detector Limits', cell: DetectorsLimitsCell, editable: false },
                    { name: 'BLSETUPS', label: 'Setups', cell: 'string', editable: false },
                    { name: 'BEAMLINES', label: 'Beamlines', cell: 'string', editable: false },
                    { name: 'DPS', label: 'Plans', cell: 'string', editable: false },
                    { name: 'DCS', label: 'DCs', cell: 'string', editable: false },
                    { label: '', cell: ButtonCell2, editable: false },
                ],
                backgrid: {
                    emptyText: 'No Detectors Available'
                },
            }))
        }

    })


})