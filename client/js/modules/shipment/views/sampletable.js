define(['marionette',
        'models/protein',
        'collections/proteins',
    
        'views/validatedrow',
        'modules/shipment/collections/distinctproteins',
        'modules/samples/views/componentsview',
    
        'tpl!templates/shipment/sampletable.html',
        'tpl!templates/shipment/sampletablerow.html',
        'tpl!templates/shipment/sampletablerowedit.html',
    
        'utils/forms',
        'utils/sgs',
        'utils/anoms',
        'utils/centringmethods',
        'utils/experimentkinds',
        'utils/radiationsensitivity',
        'utils',
    
        'jquery',
        'jquery-ui',
        'jquery-ui.combobox',
    ], function(Marionette, Protein, Proteins, ValidatedRow, DistinctProteins, ComponentsView,
        sampletable, sampletablerow, sampletablerowedit, 
        forms, SG, Anom, CM, EXP, RS, utils, $) {

        
    // A Sample Row
    var GridRow = ValidatedRow.extend(_.extend({}, forms, {
        rowTemplate: sampletablerow,
        editTemplate: sampletablerowedit,

        tagName: 'tr',
        events: {
            'click a.edit': 'editSample',
            'click a.cancel': 'cancelEditSample',
            'click a.clone': 'cloneSample',
            'click a.clear': 'clearSample',
        },

        ui: {
            comp: 'input[name=COMPONENTID]',
            comps: 'td.components',
            symbol: 'span.SYMBOL',
        },

        modelEvents: {
            'change:isSelected': 'setSelected',
            'cloned': 'render',
        },

        setSelected: function(e) {
            console.log('seleted', this.model.get('isSelected'))
            this.$el.parent().find('tr').removeClass('selected')
            this.$el.addClass('selected')

            $('html, body').animate({ scrollTop: this.$el.offset().top }, 500)
        },

        className: function() {
            if (this.model.get('isSelected')) return 'selected' 
        },
        
        editSample: function(e) {
            this.editing = true
            e.preventDefault()
            this.template = this.getOption('editTemplate')
            this.render()
            this.updateProteins()
        },
        
        cancelEditSample: function(e) {
            this.editing = false
            e.preventDefault()
            this.template = this.getOption('rowTemplate')
            this.render()
        },
        
        setData: function() {
            var data = {}
            _.each(['CODE', 'PROTEINID', 'CRYSTALID', 'NAME', 'COMMENTS', 'SPACEGROUP', 'VOLUME', 'ABUNDANCE', 'PACKINGFRACTION', 'LOOPTYPE', 'CENTRINGMETHOD', 'EXPERIMENTKIND', 'ENERGY', 'RADIATIONSENSITIVITY'], function(f) {
                var el = this.$el.find('[name='+f+']')
                if (el.length) data[f] = el.attr('type') == 'checkbox'? (el.is(':checked')?1:null) : el.val()
            }, this)

            data['COMPONENTIDS'] = this.model.get('components').pluck('PROTEINID')
            data['COMPONENTAMOUNTS'] = this.model.get('components').pluck('ABUNDANCE')
            this.model.set(data)

            console.log('set data', data)
        },
            
        success: function(m,r,o) {
            var p = this.proteins.findWhere({ PROTEINID: this.model.get('PROTEINID') })
            if (p) {
                this.model.set('ACRONYM', p.get('ACRONYM'))
                this.model.set('SYMBOL', p.get('CONCENTRATIONTYPE'))
            }

            this.model.set('new', false)
            this.editing = false
            this.template = this.getOption('rowTemplate')
            this.render()
        },
        
        cloneSample: function(e) {
            if (e) e.preventDefault()

            if (!this.model.get('NAME')) {
                this.triggerMethod('clone:stop')
                return
            }

            var cm = this.model
            var empty = this.model.collection.filter(function(m) { return parseInt(m.get('LOCATION')) > parseInt(cm.get('LOCATION')) && !m.get('NAME') })
            if (empty.length) {
                var newm = this.model.clone()
                newm.get('components').reset(this.model.get('components').toJSON())

                var next = empty[0]
                var name_base = this.model.get('NAME').replace(/\d+$/, '')
                var name_regexp = new RegExp(name_base)
                var similar = this.model.collection.filter(function(m) { return m.get('NAME').match(name_regexp) })
                if (similar.length) no = similar[similar.length-1].get('NAME').match(/\d+$/)

                if (no) no = no.length > 0 ? parseInt(no[0]) : 1
                else no = 1

                newm.set('NAME', name_base+(no+1))
                newm.set('LOCATION', empty[0].get('LOCATION'))

                empty[0].attributes = newm.attributes
                empty[0].trigger('change').trigger('cloned')
                this.triggerMethod('cloned')
            }
        },

        
        clearSample: function(e) {
            e.preventDefault()
            this.model.set({ 
                PROTEINID: -1, NAME: '', CODE: '', SPACEGROUP: '', COMMENTS: '', ABUNDANCE: '', SYMBOL: '',
                CELL_A: '', CELL_B: '', CELL_C: '', CELL_ALPHA: '', CELL_BETA: '', CELL_GAMMA: '', REQUIREDRESOLUTION: '', ANOM_NO: '', ANOMALOUSSCATTERER: '',
                CRYSTALID: -1, PACKINGFRACTION: '', LOOPTYPE: '',
                DIMENSION1: '', DIMENSION2: '', DIMENSION3: '', SHAPE: '', CENTRINGMETHOD: '', EXPERIMENTKIND: '', ENERGY: '', RADIATIONSENSITIVITY: '',
            })
            this.model.get('components').reset()
            this.render()
        },
        
        initialize: function(options) {
            GridRow.__super__.initialize.apply(this, options)
            this.template = this.getOption('rowTemplate')
            
            if (options && options.proteins) this.proteins = options.proteins
            else {
                this.proteins = new DistinctProteins()
                this.proteins.fetch()
            }

            if (options && options.gproteins) this.gproteins = options.gproteins
            else this.gproteins = new DistinctProteins()

            this.listenTo(this.proteins, 'reset add change', this.updateProteins, this)
            
            var st = ''
            _.each(['R', 'SC', 'AI', 'DC', 'AP'], function(t) {
                if (this.model.get(t) > 0) st = t
            }, this)
            this.model.set({ STATUS: st })
        },

        selectProtein: function(e) {
            this.validateField.apply(this,arguments)
            var p = this.proteins.findWhere({ PROTEINID: this.$el.find('select[name=PROTEINID]').combobox('value') })
            console.log('selectProtein', arguments, p)
            if (p) {
                this.model.set('SYMBOL', p.get('CONCENTRATIONTYPE'))
                this.ui.symbol.text(this.model.get('SYMBOL') ? this.model.get('SYMBOL') : '')
            }
        },
        
        onRender: function() {
            this.$el.find('[name=SPACEGROUP]').html(SG.opts()).val(this.model.get('SPACEGROUP'))
            this.$el.find('[name=ANOMALOUSSCATTERER]').html(Anom.opts()).val(this.model.get('ANOMALOUSSCATTERER'))
            this.$el.find('select[name=PROTEINID]').combobox({ invalid: this.addProtein.bind(this), change: this.selectProtein.bind(this), select: this.selectProtein.bind(this) })
            this.updateProteins()
            
            // for pasting from spreadsheet
            if (this.model.get('PROTEINID') > -1) this.$el.find('select[name=PROTEINID]').combobox('value', this.model.get('PROTEINID'))
            //if (this.model.get('NAME')) this.$el.find('input[name=NAME]').val(this.model.get('NAME'))
            //if (this.model.get('CODE')) this.$el.find('input[name=CODE]').val(this.model.get('CODE'))
            //if (this.model.get('COMMENTS')) this.$el.find('input[name=COMMENTS]').val(this.model.get('COMMENTS'))
                
            _.each(['NAME', 'CODE', 'COMMENTS', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION', 'ANOM_NO', 'VOLUME', 'PACKINGFRACTION'], function(f, i) {
                if (this.model.get(f)) this.$el.find('input[name='+f+']').val(this.model.get(f))
            }, this)

            this.ui.symbol.text(this.model.get('SYMBOL') ? this.model.get('SYMBOL') : '')

            if (this.getOption('extra').show) this.$el.find('.extra').addClass('show')

            if (this.getOption('type') == 'non-xtal') {
                this.$el.find('.non-xtal').addClass('show')
            } else {
                this.$el.find('.xtal').addClass('show')
            }
            this.ui.comp.autocomplete({ 
                source: this.getGlobalProteins.bind(this),
                select: this.selectGlobalProtein.bind(this)
            })

            if (this.getOption('auto').show) this.$el.find('.auto').addClass('show')
            this.$el.find('[name=CENTRINGMETHOD]').html(CM.opts()).val(this.model.get('CENTRINGMETHOD'))
            this.$el.find('[name=EXPERIMENTKIND]').html(EXP.opts()).val(this.model.get('EXPERIMENTKIND'))
            this.$el.find('[name=ENERGY]').val(this.model.get('ENERGY'))
            this.$el.find('[name=RADIATIONSENSITIVITY]').html(RS.opts()).val(this.model.get('RADIATIONSENSITIVITY'))

            this.compview = new ComponentsView({ collection: this.model.get('components'), editable: this.editing || this.model.get('new') })
            this.ui.comps.append(this.compview.render().$el)
        },

        selectGlobalProtein: function(e, ui) {
            e.preventDefault()
            var prot = this.gproteins.findWhere({ PROTEINID: ui.item.value })
            if (prot) {
                console.log('add comp', prot)
                var clone = prot.clone()
                var comps = this.model.get('components')
                clone.collection = comps
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
            console.log(ui, val)
            var safe = val.replace(/\W/g, '')

            var exists = this.proteins.findWhere({ ACRONYM: safe })
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
                    self.proteins.add(protein)
                    self.updateProteins()
                    ui.combobox('value', protein.get('PROTEINID')).trigger('change')
                },
                error: function(message, xhr, options) {
                
                },
            })
        },
        
        updateProteins: function() {
            this.$el.find('select[name=PROTEINID]').html(this.proteins.opts({
                addClass: 'active',
                classProperty: 'EXTERNAL',
                classPropertyValue: '1',
            }))
            this.$el.find('select[name=PROTEINID]').combobox('value', this.model.get('PROTEINID'))
        },
    
    }))
    
           

    /*
     The grid view for samples in a container
     Works for both viewing and editing containers   
    */
    var GridView = Marionette.CompositeView.extend({
        tagName: 'table',
        className: 'samples reflow',
        template: sampletable,
        childView: GridRow,
        proteins: '',
        events: {
            'hover tr td': 'hoverRow',
        },

        childEvents: {
            'cloned': 'updateCloneStatus',
            'clone:stop': 'stopClone',
        },

        _cloning: false,
        _clone_count: 0,
        
        hoverRow: function(e) {

        },
        
        initialize: function(options) {
            this.proteins = options.proteins
            this.gproteins = options.gproteins

            this.in_use = options.in_use
            
            this.options.childViewOptions = {
                templateHelpers: function () {
                    return {
                        IN_USE: options.in_use
                    }
                },
                proteins: this.proteins,
                gproteins: this.gproteins,
            }
            if (options.childTemplate) this.options.childViewOptions.rowTemplate = options.childTemplate
            if (options.childEditTemplate) this.options.childViewOptions.editTemplate = options.childEditTemplate

            this.extra = { show: false }
            this.auto = { show: options.auto == true ? true : false }
            this.options.childViewOptions.extra = this.extra
            this.options.childViewOptions.auto = this.auto
            this.options.childViewOptions.type = this.getOption('type')
            
        },
        
        onRender: function() { 
            console.log('rendering sample tale')
            if (this.getOption('type') == 'non-xtal') {
                this.$el.find('.non-xtal').addClass('show')
            } else {
                this.$el.find('.xtal').addClass('show')
            }

            if (this.getOption('auto') == true) {
                this.toggleAuto(true)
            }
        },
        
        toggleExtra: function() {
            this.extra.show = !this.extra.show

            if (this.extra.show) this.$el.find('.extra').addClass('show')
            else this.$el.find('.extra').removeClass('show')
        },


        toggleAuto: function(val) {
            this.auto.show = val
            if (val) this.$el.find('.auto').addClass('show')
            else this.$el.find('.auto').removeClass('show')
        },


        cloneAll: function() {
            this._cloning = true
            this._clone_count = 0

            this.continueClone()
        },

        stopClone: function() {
            this._cloning = false
        },

        updateCloneStatus:function() {
            if (!this._cloning) return

            this._clone_count++
            this.continueClone()
        },

        continueClone: function() {
            if (this._clone_count > this.children.length) {
                this._cloning = false
                return
            }
            this.children.findByIndex(this._clone_count).cloneSample()
        },


        // This magically works, which is worrying...
        /*appendHtml: function(collectionView, itemView){
            collectionView.$("tbody").append(itemView.el);
        },*/
        
    })

    GridView.GridRow = GridRow
    return GridView

})