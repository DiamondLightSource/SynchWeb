define(['marionette',
    'utils',
    'views/form',
    'utils/sgs',
    'utils/editable',

    'models/protein',
    'utils/anoms',

    'modules/samples/views/componentsview',
    
    'tpl!templates/shipment/singlesample.html',
    'tpl!templates/shipment/singlesamplee.html',
    
    'jquery-ui'], function(Marionette, utils,
        FormView, SG, Editable, Protein, Anom,
        ComponentsView,
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
        },

        toggleExtra: function(e) {
            if (e) e.preventDefault()
            this.extra = !this.extra

            if (this.extra) this.$el.find('.extra').addClass('show')
            else this.$el.find('.extra').removeClass('show')
        },
        
        clearPlate: function(e) {
            e.preventDefault()
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
        
        clear: function(test) {
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
                        s.set({
                            PROTEINID: -2,
                            NAME: '',
                            SPACEGROUP: '',
                        }, { silent: true })
                    }
                }
            }, this)
            
            start.set({ NAME: '', PROTEINID: -1 })
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
        },
        
        onRender: function() {
            $.when.apply($, this.ready).done(this.doRender.bind(this))
        },
        
        doRender: function() {
            if (this.model) {
                
                if (this.model.get('new')) {
                    this.ui.prot.combobox({ invalid: this.addProtein.bind(this), change: this.validateField.bind(this), select: this.validateField.bind(this) })
                    this.updateProteins()
                    
                    this.ui.sg.html(SG.opts()).val(this.model.get('SPACEGROUP'))
                    
                    this.ui.name.val(this.model.get('NAME'))
                    this.ui.com.val(this.model.get('COMMENTS'))
                    
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
                }


                this.ui.comp.autocomplete({ 
                    source: this.getGlobalProteins.bind(this),
                    select: this.selectGlobalProtein.bind(this)
                })

                console.log('render single', this.model)
                this.compview = new ComponentsView({ showEmpty: true, CRYSTALID: this.model.get('CRYSTALID'), collection: this.model.get('components'), editable: this.model.get('new'), editinline: this.getOption('existingContainer') })
                this.ui.comps.append(this.compview.render().$el)
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
            this.ui.prot.html(this.getOption('proteins').opts())
            this.ui.prot.combobox('value', this.model.get('PROTEINID'))
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