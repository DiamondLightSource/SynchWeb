/**
 * A view to define a new XPDF sample (crystal) from a combination of
 * phases
 */

define([
    'views/form',
    'models/crystal',
    'modules/types/xpdf/samples/views/phasetable',
    'modules/types/xpdf/utils/phasecompositor',
    'templates/types/xpdf/samples/sampleadd.html'
    ], function(
            FormView,
            Crystal,
            CrystalPhaseTable,
            phaseCompositor,
            template
    ) {
    return FormView.extend({
        template: template,
        
        regions: {
            rphase: '.phase_table',
        },

        ui: {
            THEORETICALDENSITY: 'input[name=THEORETICALDENSITY]'
        },


        calculateDensity: function() {
            var density = phaseCompositor.composeDensity(this.model.get('components'), this.model.get('components').pluck('ABUNDANCE'))
            this.model.set('THEORETICALDENSITY', density)
            this.ui.THEORETICALDENSITY.val(density)
        },
        
        createModel: function() {
            this.model = new Crystal({}, { addPrimary: true })
        },
        
        success: function(model, response, options) {
            app.trigger('xsamples:view', model.get('CRYSTALID'))
        },
        
        onRender: function(e) {
            this.listenTo(this.model.get('components'), 'change add remove', this.calculateDensity)
            this.rphase.show(new CrystalPhaseTable({collection: this.model.get('components') }))
        }
        
    })
})
