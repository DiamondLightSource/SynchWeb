define(['backbone',
    'utils',
    'views/form',
    'utils/sgs',
    'utils/editable',

    'models/protein',
    'utils/anoms',

    'modules/samples/views/componentsview',

    'views/dialog',
    'modules/samples/views/samplegroups',
    
    'templates/shipment/singlesample.html',
    'templates/shipment/singlesamplee.html',
    ], function(Backbone, utils,
        FormView, SG, Editable, Protein, Anom,
        ComponentsView,
        safetyLevel,
        DialogView, SampleGroupView,
        templatenew, template) {

    return FormView.extend({
        getTemplate: function() {
            return this.model ? (this.model.get('new') ? templatenew : template) : templatenew
        },
        
        storeOnValidate: true,
        setupOnConstruct: false,
        className: 'single',
        
        ui: {
            prot: 'select[name=PROTEINID]',
            name: 'input[name=NAME]',
            com: 'input[name=COMMENTS]',
            sg: 'select[name=SPACEGROUP]',
            cp: 'a.clone-plate',
            cc: 'a.clone-col',
            cr: 'a.clone-row',
            comps: '.components',
            comp: 'input[name=COMPONENTID]',
            abun: 'input[name=ABUNDANCE]',
            sym: 'span.SYMBOL',
            cella: 'input[name=CELL_A]',
            cellb: 'input[name=CELL_B]',
            cellc: 'input[name=CELL_C]',
            cellal: 'input[name=CELL_ALPHA]',
            cellbe: 'input[name=CELL_BETA]',
            cellga: 'input[name=CELL_GAMMA]',
            reqr: 'input[name=REQUIREDRESOLUTION]',
            anom: 'input[name=ANOMALOUSSCATTERER]',
        },

        events: {
            'click @ui.cp': 'clonePlate',
            'click @ui.cc': 'cloneCol',
            'click @ui.cr': 'cloneRow',
            'click a.clear-plate': 'clearPlate',
            'click a.clear-col': 'clearCol',
            'click a.clear-row': 'clearRow',
            'click a.clear': 'clearSample',

            'click a.extrainfo': 'toggleExtra',
            'click a.group': 'showSampleGroups',
        },

        showSampleGroups: function(e) {
            e.preventDefault()

            app.dialog.show(new DialogView({ 
                title: 'Sample Groups', 
                view: new SampleGroupView({
                    sample: this.model
                })
            }))
        },

        toggleExtra: function(e) {
            if (e) e.preventDefault()
            this.extra = !this.extra

            if (this.extra) this.$el.find('.extra').addClass('show')
            else this.$el.find('.extra').removeClass('show')
        },
        
        clearPlate: function(e) {
            if (e) e.preventDefault()
            this.clear(['drop'])
        },

        clearCol: function(e) {
            e.preventDefault()
            this.clear(['drop', 'col'])
        },
            
        clearRow: function(e) {
            e.preventDefault()
            this.clear(['drop', 'row'])
        },
            
        clearSample: function(e) {
            e.preventDefault()
        },
        
        clearAll: function(e) {
            this.clear([], true)
        },

        clear: function(test, all) {
            var pt = this.getOption('platetypes').findWhere({ isSelected: true })
            
            var start = all ? this.getOption('samples').at(0) : this.getOption('samples').findWhere({ isSelected: true })
            var sp = pt.getRowColDrop(start.get('LOCATION'))
            if (start.get('PROTEINID') == -1) return
                
            var fields = {
                NAME: '',
                SPACEGROUP: '',
                ABUNDANCE: '',
                SYMBOL: '',
                COMMENTS: '',
                REQUIREDRESOLUTION: '',
                ANOMALOUSSCATTERER: '',
                CELL_A: '',
                CELL_B: '',
                CELL_C: '',
                CELL_ALPHA: '',
                CELL_BETA: '',
                CELL_GAMMA: '',
            }

            this.getOption('samples').each(function(s,i) {
                if (i > start.get('LOCATION')-1) {
                    if (all) {
                        s.set(_.extend({}, fields, {PROTEINID: -2}), { silent: true })
                        s.get('components').reset()

                    } else {
                        var p = pt.getRowColDrop(s.get('LOCATION'))
                        var match = true
                        _.each(test, function(t) {
                            if (p[t] != sp[t]) match = false
                        })
                        
                        if (match) {
                            s.set(_.extend({}, fields, {PROTEINID: -2}), { silent: true })
                            s.get('components').reset()
                        }
                    }
                }
            }, this)
            
            start.set(_.extend({}, fields, {PROTEINID: -1}))
            start.get('components').reset()
            this.render()
        },
        
        clonePlate: function(e) {
            e.preventDefault()
            this.clone(['drop'])
        },
        
        cloneRow: function(e) {
            e.preventDefault()
            this.clone(['drop', 'row'])
        },
        
            
        cloneCol: function(e) {
            e.preventDefault()
            this.clone(['drop', 'col'])
        },
        

        clone: function(test) {            
            var pt = this.getOption('platetypes').findWhere({ isSelected: true })
            
            var start = this.getOption('samples').findWhere({ isSelected: true })
            var sp = pt.getRowColDrop(start.get('LOCATION'))
            if (start.get('PROTEINID') == -1) return
            
            this.getOption('samples').each(function(s,i) {
                if (i > start.get('LOCATION')-1) {
                    var p = pt.getRowColDrop(s.get('LOCATION'))
                    
                    var match = true
                    _.each(test, function(t) {
                        if (p[t] != sp[t]) match = false
                    })
                    
                    if (match) {
                        s.get('components').reset(start.get('components').toJSON())
                        s.set({
                            PROTEINID: start.get('PROTEINID'),
                            NAME: this.sampleName(p.pos, start.get('NAME')),
                            SPACEGROUP: start.get('SPACEGROUP'),
                            ABUNDANCE: start.get('ABUNDANCE'),
                            SYMBOL: start.get('SYMBOL'),
                        }, { silent: true })
                    }
                }
            }, this)
            
            start.set({ NAME: this.sampleName(sp.pos, start.get('NAME')) })
        },

        success: function(e) {
            var p = this.getOption('proteins').findWhere({ PROTEINID: this.model.get('PROTEINID') })
            this.model.set({ new: false, ACRONYM: p.get('ACRONYM') })
            this.render()
        },
        
        
        sampleName: function(p, name) {
            var pt = this.getOption('platetypes').findWhere({ isSelected: true })
            var sp = pt.getRowColDrop(p)
            
            return pt.getName(sp.pos)+'d'+sp.drop+'_'+name
        },
        
        
        templateHelpers: function() {
            return {
                existingContainer: this.getOption('existingContainer')
            }
        },
        
        createModel: function() {
            //this.model = new Well()
        },
        
        initialize: function(options) {
            console.log('init single', options)
            this.ready = []
            this.extra = false
            this.gproteins = options.gproteins

            this.listenTo(options.proteins, 'sync', this.updateProteins, this)
        },
        
        onRender: function() {
            $.when.apply($, this.ready).done(this.doRender.bind(this))
        },

        selectProtein: function() {
            this.validateField.apply(this, arguments)
            var p = this.getOption('proteins').findWhere({ PROTEINID: this.$el.find('select[name=PROTEINID]').combobox('value') })
            console.log('selectProtein', arguments, p)
            if (p) {
                this.model.set('SYMBOL', p.get('CONCENTRATIONTYPE'))
                this.ui.sym.text(this.model.get('SYMBOL') ? this.model.get('SYMBOL') : '')
            }
        },
        
        doRender: function() {
            if (this.model) {
                
                if (this.model.get('new')) {
                    this.ui.prot.combobox({ invalid: this.addProtein.bind(this), change: this.selectProtein.bind(this), select: this.selectProtein.bind(this) })
                    this.updateProteins()
                    
                    this.ui.sg.html(SG.opts()).val(this.model.get('SPACEGROUP'))
                    
                    this.ui.name.val(this.model.get('NAME'))
                    this.ui.com.val(this.model.get('COMMENTS'))
                    this.ui.abun.val(this.model.get('ABUNDANCE'))
                    this.ui.sym.text(this.model.get('SYMBOL') ? this.model.get('SYMBOL') : '')

                    this.ui.cella.val(this.model.get('CELL_A'))
                    this.ui.cellb.val(this.model.get('CELL_B'))
                    this.ui.cellc.val(this.model.get('CELL_C'))
                    this.ui.cellal.val(this.model.get('CELL_ALPHA'))
                    this.ui.cellbe.val(this.model.get('CELL_BETA'))
                    this.ui.cellga.val(this.model.get('CELL_GAMMA'))
                    this.ui.reqr.val(this.model.get('REQUIREDRESOLUTION'))
                    this.ui.anom.val(this.model.get('ANOMALOUSSCATTERER'))
                    
                } else {
                    var edit = new Editable({ model: this.model, el: this.$el })
                    var opts = _.map(this.getOption('proteins').kv(), function(v,k) { return { value: v, id: k } })
                    edit.create('PROTEINID', 'autocomplete', { autocomplete: { source: opts } })
                    
                    edit.create('NAME', 'text')
                    edit.create('COMMENTS', 'textarea')
                    edit.create('SPACEGROUP', 'select', { data: SG.list })

                    edit.create('REQUIREDRESOLUTION', 'text')
                    edit.create('ANOMALOUSSCATTERER', 'select', { data: Anom.list })

                    edit.create('CELL_A', 'text')
                    edit.create('CELL_B', 'text')
                    edit.create('CELL_C', 'text')
                    edit.create('CELL_ALPHA', 'text')
                    edit.create('CELL_BETA', 'text')
                    edit.create('CELL_GAMMA', 'text')
                    edit.create('ABUNDANCE', 'text')
                }


                this.ui.comp.autocomplete({ 
                    source: this.getGlobalProteins.bind(this),
                    select: this.selectGlobalProtein.bind(this)
                })

                console.log('render single', this.model)
                this.compview = new ComponentsView({ showEmpty: true, CRYSTALID: this.model.get('CRYSTALID'), collection: this.model.get('components'), editable: this.model.get('new'), editinline: this.getOption('existingContainer') })
                this.ui.comps.append(this.compview.render().$el)

                if (this.extra) this.$el.find('.extra').addClass('show')
            }
        },

        selectGlobalProtein: function(e, ui) {
            e.preventDefault()
            var prot = this.gproteins.findWhere({ PROTEINID: ui.item.value })
            if (prot) {
                console.log('add comp', prot)
                var clone = prot.clone()
                var comps = this.model.get('components')
                clone.collection = comps
                clone.set('new', true)
                comps.add(clone)
            }
            this.ui.comp.val('')
        },

        getGlobalProteins: function(req, resp) {
            var self = this
            this.gproteins.fetch({
                data: {
                    term: req.term,
                    global: 1,
                },
                success: function(data) {
                    resp(self.gproteins.map(function(m) {
                        return {
                            label: m.get('ACRONYM'),
                            value: m.get('PROTEINID'),
                        }
                    }))
                }
            })
        },

        
        addProtein: function(ui, val) {
            var validOnly = app.options.get('valid_components')
            if (!(((validOnly && app.staff) || !validOnly)
                && (app.proposal && app.proposal.get('ACTIVE') == 1))) {
                ui.combobox('value', -1).trigger('change')
                return
            }
            
            if (this.getOption('isForImager')) {
                var ifi = this.getOption('isForImager')()
                console.log('is for imager', ifi)
                if (ifi) {
                    ui.combobox('value', -1).trigger('change')
                    return
                }
            }

            var safe = val.replace(/\W/g, '')

            var exists = this.getOption('proteins').findWhere({ ACRONYM: safe })
            if (exists) {
                ui.combobox('value', exists.get('PROTEINID')).trigger('change')
                return
            }

            utils.confirm({
                title: 'Add New Protein',
                content: 'Are you sure you want to add a protein called: "'+safe+'"',
                callback: this.doAddProtein.bind(this, safe, ui)
            })
        },

        doAddProtein: function(name, ui) {
            var protein = new Protein({ ACRONYM: name })
            var self = this
            protein.save({}, {
                success: function() {
                    self.getOption('proteins').add(protein)
                    self.updateProteins()
                    ui.combobox('value', protein.get('PROTEINID')).trigger('change')
                },
                error: function(message, xhr, options) {
                
                },
            })
        },

        
        updateProteins: function() {
            this.ui.prot.html(this.getOption('proteins').opts({
                // addClass: 'active',
                // classProperty: 'EXTERNAL',
                // classPropertyValue: '1',
                callback: this.handleSafetyLevel
            }))
            this.ui.prot.combobox('value', this.model.get('PROTEINID'))
        },
        // Callback to style individual proteins within combobox
        // Not sure if this will stay due to conflicts with validation colours.
        // Currently restrict plates to green/low risk only (e.g. VMXi)
        // Will need combination of beamline and container type rules...
        handleSafetyLevel: function(m) {
            var map = {
                GREEN: 'active',
                YELLOW:'hidden',
                RED: 'hidden'
            }
            return safetyLevel(m, map)
        },

        setModel: function(s) {
            Backbone.Validation.unbind(this)
            this.undelegateEvents()
            this.model = s
            this.delegateEvents()
            this.setupValidation()
            
            this.render()
        },
        
    })

})