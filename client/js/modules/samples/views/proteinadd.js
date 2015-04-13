define(['marionette', 'views/form', 'models/protein', 'modules/samples/collections/pdbs', 'tpl!templates/samples/proteinadd.html'], function(Marionette, TableView, Protein, PDBs, template) {
    
    
    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Protein()
        },
        
        ui: {
            exist: 'select[name^=existing_pdb]',
            pdbf: 'input[name=new_pdb]',
        },
        
        initialize: function(options) {
            this.pdbs = new PDBs()
            var self = this
            this.pdbs.fetch().done(function() {
                self.ui.exist.html(self.pdbs.opts())
            })
        },

        success: function(model, response, options) {
            console.log('success from protadd', this.model)
            app.trigger('proteins:view', model.get('PROTEINID'))
        },
    })

})