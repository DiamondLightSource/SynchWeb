define(['marionette',
    'utils',
    'views/form',
    'utils/sgs',
    'utils/editable',
    
    'tpl!templates/shipment/singlesample.html',
    'tpl!templates/shipment/singlesamplee.html',
    
    'jquery-ui'], function(Marionette, utils,
        FormView, SG, Editable,
        templatenew, template) {

    return FormView.extend({
        //template: template,
        getTemplate: function() {
            return this.model ? (this.model.get('new') ? templatenew : template) : templatenew
        },
        
        storeOnValidate: true,
        setupOnConstruct: false,
        className: 'left',
        
        ui: {
            prot: 'select[name=PROTEINID]',
            name: 'input[name=NAME]',
            com: 'input[name=COMMENTS]',
            sg: 'select[name=SPACEGROUP]',
            cp: 'a.clone-plate',
            cc: 'a.clone-col',
            cr: 'a.clone-row',
        },
        
        events: {
            'click @ui.cp': 'clonePlate',
            'click @ui.cc': 'cloneCol',
            'click @ui.cr': 'cloneRow',
            'click a.clear-plate': 'clearPlate',
            'click a.clear-col': 'clearCol',
            'click a.clear-row': 'clearRow',
            'click a.clear': 'clearSample',
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
        
        
        sampleName: function(p, name) {
            var pt = this.getOption('platetypes').findWhere({ isSelected: true })
            var sp = pt.getRowColDrop(p)
            
            return pt.getName(sp.pos)+'d'+sp.drop+'_'+name
        },
        
        
        templateHelpers: function() {
            return {
            }
        },
        
        createModel: function() {
            //this.model = new Well()
        },
        
        initialize: function(options) {
            this.ready = []
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
                }
            }
        },
        
        addProtein: function(e, val) {
            utils.confirm({
                title: 'Add New Protein',
                message: 'Are you sure you want to add a protein called: '+safe,
                callback: this.doAddProtein.bind(this, safe)
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