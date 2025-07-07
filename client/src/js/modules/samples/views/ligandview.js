define(['marionette',
    
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',
    'collections/samples',

    'collections/containers',
    'modules/shipment/views/containers',
    
    'modules/samples/collections/pdbs',
    'modules/samples/views/pdbs',
    'modules/samples/views/addpdb',

    'modules/dc/views/getdcview',
    
    'templates/samples/ligand.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, DCCol, DCView, Samples, Containers, ContainersView, 
        PDBs, PDBView, AddPDBView, 
        GetDCView,
        template, Backbone) {

        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
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
            var view = new AddPDBView({ lid: this.model.get('LIGANDID') })
            this.listenTo(view, 'pdb:success', this.getPDBs)
            app.dialog.show(view)
        },
        
        getPDBs: function() {
            this.pdbs.fetch()
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this);

            this.samples = new Samples()
            this.samples.state.pageSize = 5
            this.samples.queryParams.lid = this.model.get('LIGANDID')
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { lid: this.model.get('LIGANDID'), pp: 5 } })
            this.dcs.fetch()
            
            this.pdbs = new PDBs(null, { lid: this.model.get('LIGANDID') })
            this.getPDBs()

            this.containers = new Containers()
            this.containers.queryParams.lid = this.model.get('LIGANDID')
            this.containers.fetch()
        },
        
        
        onRender: function() {
            var self = this
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('SMILES', 'text')
            edit.create('LIBRARYNAME', 'text')
            edit.create('LIBRARYBATCHNUMBER', 'text')
            edit.create('PLATEBARCODE', 'text')
            edit.create('SOURCEWELL', 'text')


            // Prevent cyclic dependency
            var GetSampleView = require('modules/samples/views/getsampleview')
            // var GetDCView = require('modules/dc/views/getdcview')

            this.pdb.show(new PDBView({ collection: this.pdbs, isLigand: true }))
            this.smp.show(GetSampleView.SampleList.get(app.type, { collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.dc.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.cont.show(new ContainersView({ collection: this.containers, params: {} }))
        },
        
    })
        
})
