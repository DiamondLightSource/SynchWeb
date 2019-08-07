/**
 *  class defining the view for an XPDF phase (component, protein)
 */
define(['marionette',
        'backbone',
        'utils/editable',

        'collections/crystals',

        'modules/samples/collections/pdbs',
        'modules/types/xpdf/samples/views/cifs',
        'modules/types/xpdf/samples/views/addcif',

        'modules/types/xpdf/utils/phasecompositor',

        'modules/types/xpdf/samples/views/samplelist',

        'templates/types/xpdf/samples/phase.html',
        ], function(Marionette,
            Backbone,
            Editable,
            Crystals,
            CIFs, PDBView,
            AddCIFView,
            phaseCompositor,
            SampleList,
            template) {
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        showContainers: false,

        ui: {
            mass: '.MOLECULARMASS'
        },

        regions: {
            cif: '.cif',
            rsamples: '.samples',
        },
        
        events: {
            'click a.add': 'addCIF',
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.listenTo(this.model, 'change:SEQUENCE', this.updateMolecularMass)

            this.crystals = new Crystals()
            this.crystals.queryParams.pid = this.model.get('PROTEINID')
            this.crystals.queryParams.seq = 1
            this.crystals.state.addPrimary = true
            this.crystals.fetch()

            this.cifs = new CIFs(null, { pid: this.model.get('PROTEINID') })
            this.getCIFs()
        },
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('SEQUENCE', 'text')
            edit.create('DENSITY', 'text')
        
            this.rsamples.show(new SampleList({collection: this.crystals, noPageUrl: true, noFilterUrl: true, noSearchUrl: true, hideButton: true }))
            this.cif.show(new PDBView({ collection: this.cifs }))
        },

        updateMolecularMass: function() {
            this.model.set('MOLECULARMASS', phaseCompositor.molecularMassFromComposition(this.model.get('SEQUENCE')))
            var self = this
            this.model.save(this.model.changedAttributes(), { 
                patch: true,
                success: function() {
                    self.ui.mass.text(self.model.get('MOLECULARMASS'))
                }
            })
        },

        
        addCIF: function() {
            var view = new AddCIFView({ pid: this.model.get('PROTEINID') })
            this.listenTo(view, 'pdb:success', this.getCIFs)
            app.dialog.show(view)
        },
        
        getCIFs: function() {
            this.cifs.fetch()
        },
        
    })
})
