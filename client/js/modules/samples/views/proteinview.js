define(['marionette',
    
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',
    'collections/samples',
    'modules/samples/views/list',
    
    'modules/samples/collections/pdbs',
    'modules/samples/views/pdbs',
    'modules/samples/views/addpdb',
    
    'tpl!templates/samples/protein.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, DCCol, DCView, Samples, SamplesView, PDBs, PDBView, AddPDBView, template, Backbone) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            pdb: '.pdb',
            smp: '.samples',
            dc: '.datacollections',
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
            
            this.samples = new Samples()
            this.samples.state.pageSize = 5
            this.samples.queryParams.pid = this.model.get('PROTEINID')
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { pid: this.model.get('PROTEINID'), pp: 5 } })
            this.dcs.fetch()
            
            this.pdbs = new PDBs(null, { pid: this.model.get('PROTEINID') })
            this.getPDBs()
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('ACRONYM', 'text')
            edit.create('SEQUENCE', 'markdown')
            edit.create('MOLECULARMASS', 'text')

            this.pdb.show(new PDBView({ collection: this.pdbs }))
            this.smp.show(new SamplesView({ collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.dc.show(new DCView({ model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            
        },
        
    })
        
})
