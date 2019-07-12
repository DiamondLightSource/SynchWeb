define(['marionette',
    
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',
    'collections/samples',
    'modules/samples/views/list',

    'collections/containers',
    'modules/shipment/views/containers',
    
    'modules/samples/collections/pdbs',
    'modules/samples/views/pdbs',
    'modules/samples/views/addpdb',

    'collections/componenttypes',
    'collections/concentrationtypes',

    'modules/dc/views/getdcview',
    
    'templates/samples/protein.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, DCCol, DCView, Samples, SamplesView, Containers, ContainersView, 
        PDBs, PDBView, AddPDBView, 
        ComponentTypes, ConcentrationTypes,
        GetDCView,
        template, Backbone) {

        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        showContainers: true,
        
        regions: {
            pdb: '.pdb',
            smp: '.samples',
            dc: '.datacollections',
            cont: '.conts',
        },
        
        events: {
            'click a.add': 'addPDB',
        },
        
        addPDB: function() {
            var view = new AddPDBView({ pid: this.model.get('PROTEINID') })
            this.listenTo(view, 'pdb:success', this.getPDBs)
            app.dialog.show(view)
        },
        
        getPDBs: function() {
            this.pdbs.fetch()
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this);
            
            this.types = new ComponentTypes()
            this.tr = this.types.fetch()

            this.concs = new ConcentrationTypes()
            this.cr = this.concs.fetch()

            this.samples = new Samples()
            this.samples.state.pageSize = 5
            this.samples.queryParams.pid = this.model.get('PROTEINID')
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { pid: this.model.get('PROTEINID'), pp: 5 } })
            this.dcs.fetch()
            
            this.pdbs = new PDBs(null, { pid: this.model.get('PROTEINID') })
            this.getPDBs()

            if (this.getOption('showContainers')) {
                this.containers = new Containers()
                this.containers.queryParams.pid = this.model.get('PROTEINID')
                this.containers.fetch()
            }
        },
        
        
        onRender: function() {
            var self = this
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('ACRONYM', 'text')
            edit.create('SEQUENCE', 'markdown')
            edit.create('MOLECULARMASS', 'text')
            if (app.staff) edit.create('GLOBAL', 'select', { data: { 1: 'Yes', 0: 'No' } })

            this.tr.done(function() {
                edit.create('COMPONENTTYPEID', 'select', { data: self.types.kv({ empty: true }) })
            })
            this.cr.done(function() {
                edit.create('CONCENTRATIONTYPEID', 'select', { data: self.concs.kv({ empty: true }) })  
            })

            // Prevent cyclic dependency
            var GetSampleView = require('modules/samples/views/getsampleview')
            // var GetDCView = require('modules/dc/views/getdcview')

            this.pdb.show(new PDBView({ collection: this.pdbs }))
            this.smp.show(GetSampleView.SampleList.get(app.type, { collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.dc.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            if (this.getOption('showContainers')) this.cont.show(new ContainersView({ collection: this.containers, params: {} }))
        },
        
    })
        
})
