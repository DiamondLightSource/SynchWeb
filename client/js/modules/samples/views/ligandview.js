define(['marionette',
    
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',
    'collections/samples',
    'modules/samples/views/list',
    
    'tpl!templates/samples/ligand.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, DCCol, DCView, Samples, SamplesView, template, Backbone) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            smp: '.samples',
            dc: '.datacollections',
        },

        initialize: function(options) {
            Backbone.Validation.bind(this);
            
            this.samples = new Samples()
            this.samples.state.pageSize = 5
            this.samples.queryParams.lid = this.model.get('LIGANDID')
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { lid: this.model.get('LIGANDID'), pp: 5 } })
            this.dcs.fetch()
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('ACRONYM', 'text')
            edit.create('IUPAC', 'text')
            edit.create('SMILES', 'text')

            this.smp.show(new SamplesView({ collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.dc.show(new DCView({ model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            
        },
        
    })
        
})
