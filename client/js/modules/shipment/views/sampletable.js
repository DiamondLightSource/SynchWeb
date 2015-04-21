define(['marionette',
        'models/protein',
    
        'views/validatedrow',
        'modules/shipment/collections/distinctproteins',
    
        'tpl!templates/shipment/sampletable.html',
        'tpl!templates/shipment/sampletablerow.html',
        'tpl!templates/shipment/sampletablerowedit.html',
    
        'utils/forms',
        'utils/sgs',
        'utils/anoms',
        'utils',
    
        'jquery',
        'jquery-ui.combobox',
    ], function(Marionette, Protein, ValidatedRow, DistinctProteins, sampletable, sampletablerow, sampletablerowedit, forms, SG, Anom, utils, $) {


        
    // A Sample Row
    var GridRow = ValidatedRow.extend(_.extend({}, forms, {
        template: sampletablerow,
        tagName: 'tr',
        events: {
            'click a.edit': 'editSample',
            'click a.cancel': 'cancelEditSample',
            'click a.clone': 'cloneSample',
            'click a.clear': 'clearSample',
        },

        modelEvents: {
            'change:isSelected': 'setSelected',
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
            e.preventDefault()
            this.template = sampletablerowedit
            this.render()
            this.updateProteins()
        },
        
        cancelEditSample: function(e) {
            e.preventDefault()
            this.template = sampletablerow
            this.render()
        },
        
        setData: function() {
            var data = {}
            _.each(['CODE', 'PROTEINID','NAME','COMMENTS','SPACEGROUP'], function(f) {
                data[f] = $('[name='+f+']').val()
            })
            this.model.set(data)
        },
            
        success: function(m,r,o) {
            this.model.set('new', false)
            this.template = sampletablerow
            this.render()
            /*var self = this
            this.model.fetch().done(function() {
                self.render()
            })*/
        },
        
        cloneSample: function(e) {
            e.preventDefault()
            
            var target = $(e.target).is('i') ? $(e.target).parent() : $(e.target)
            var sidx = $('a.clone').index(target)
            var sn = $('input.sname').eq(sidx)
            
            if (sn.val()) {
                var snt = sn.val().replace(/\d+$/, '')
                var nx = $('input.sname').filter(function(i) { return i > sidx && !$(this).val() }).first()
                var rx = new RegExp(snt)
                var nxn = $('input.sname').filter(function() { return snt == ""  ? $(this).val() : $(this).val().match(rx) }).last().val()
              
                var no = nxn.match(/\d+$/)
          
                if (no) no = no.length > 0 ? parseInt(no[0]) : 1
                else no = 1
              
                var nidx = $('input.sname').index(nx)
                $('select[name=PROTEINID]').eq(nidx).combobox('value', $('select[name=PROTEINID]').eq(sidx).combobox('value'))
                $('select[name=PROTEINID]').eq(nidx).trigger('change')
                nx.val(snt+(no+1)).trigger('change')
                $('select[name=SPACEGROUP]').eq(nidx).val($('select[name=SPACEGROUP]').eq(sidx).val()).trigger('change')
                $('select[name=ANOMALOUSSCATTERER]').eq(nidx).val($('select[name=ANOMALOUSSCATTERER]').eq(sidx).val()).trigger('change')
                _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION', 'ANOM_NO'], function(f, i) {
                    $('input[name='+f+']').eq(nidx).val($('input[name='+f+']').eq(sidx).val())
                })
            }
        },
        
        clearSample: function(e) {
            e.preventDefault()
            this.model.set({ 
                PROTEINID: -1, NAME: '', CODE: '', SPACEGROUP: '', COMMENTS: '',
                CELL_A: '', CELL_B: '', CELL_C: '', CELL_ALPHA: '', CELL_BETA: '', CELL_GAMMA: '', REQUIREDRESOLUTION: '', ANOM_NO: '', ANOMALOUSSCATTERER: ''
            })
            this.render()
            //this.$el.find('select[name=PROTEINID]').combobox('value', '-1').trigger('change')
            //this.$el.find('input').val('').trigger('keyup')
            //this.$el.find('select[name=SPACEGROUP]').val('').trigger('keyup')
        },
        
        initialize: function(options) {
            GridRow.__super__.initialize.apply(this, options)
            
            if (options && options.proteins) {
                this.proteins = options.proteins
            } else {
                this.proteins = new DistinctProteins()
                this.proteins.fetch()
            }
            this.listenTo(this.proteins, 'reset add change', this.updateProteins, this)
            
            var st = ''
            _.each(['R', 'SC', 'AI', 'DC', 'AP'], function(t) {
                if (this.model.get(t) > 0) st = t
            }, this)
            this.model.set({ STATUS: st })
        },
        
        onRender: function() {
            this.$el.find('[name=SPACEGROUP]').html(SG.opts()).val(this.model.get('SPACEGROUP'))
            this.$el.find('[name=ANOMALOUSSCATTERER]').html(Anom.opts()).val(this.model.get('ANOMALOUSSCATTERER'))
            this.$el.find('select[name=PROTEINID]').combobox({ invalid: this.addProtein.bind(this), change: this.validateField.bind(this), select: this.validateField.bind(this) })
            this.updateProteins()
            
            // for pasting from spreadsheet
            if (this.model.get('PROTEINID') > -1) this.$el.find('select[name=PROTEINID]').combobox('value', this.model.get('PROTEINID'))
            //if (this.model.get('NAME')) this.$el.find('input[name=NAME]').val(this.model.get('NAME'))
            //if (this.model.get('CODE')) this.$el.find('input[name=CODE]').val(this.model.get('CODE'))
            //if (this.model.get('COMMENTS')) this.$el.find('input[name=COMMENTS]').val(this.model.get('COMMENTS'))
                
            _.each(['NAME', 'CODE', 'COMMENTS', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION', 'ANOM_NO'], function(f, i) {
                if (this.model.get(f)) this.$el.find('input[name='+f+']').val(this.model.get(f))
            }, this)

            if (this.getOption('extra').show) this.$el.find('.extra').addClass('show')
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
            this.$el.find('select[name=PROTEINID]').html(this.proteins.opts())
            this.$el.find('select[name=PROTEINID]').combobox('value', this.model.get('PROTEINID'))
        },
    
    }))
    
           

    /*
     The grid view for samples in a container
     Works for both viewing and editing containers   
    */
    return GridView = Marionette.CompositeView.extend({
        tagName: "table",
        className: 'samples reflow',
        template: sampletable,
        childView: GridRow,
        proteins: '',
        events: {
            'hover tr td': 'hoverRow',
        },
        
        hoverRow: function(e) {

        },
        
        initialize: function(options) {
            this.proteins = options.proteins

            //var self = this
            this.in_use = options.in_use
            
            this.options.childViewOptions = {
                templateHelpers: function () {
                    return {
                        IN_USE: options.in_use
                    }
                },
                proteins: this.proteins
            }
            if (options.childTemplate) this.options.childViewOptions.template = options.childTemplate

            this.extra = { show: false }
            this.options.childViewOptions.extra = this.extra
            
        },
        
        onRender: function() { console.log('rendering sample tale')},
        
        toggleExtra: function() {
            this.extra.show = !this.extra.show

            if (this.extra.show) this.$el.find('.extra').addClass('show')
            else this.$el.find('.extra').removeClass('show')
        },

        // This magically works, which is worrying...
        /*appendHtml: function(collectionView, itemView){
            collectionView.$("tbody").append(itemView.el);
        },*/
        
    })


})