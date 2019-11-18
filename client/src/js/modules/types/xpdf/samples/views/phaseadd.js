define([
    'marionette',
    'views/form',
    'models/protein',
    'modules/types/xpdf/utils/phasecompositor',
    'templates/types/xpdf/samples/phaseadd.html'
    ], function(
        Marionette,
        FormView,
        Phase,
        phaseCompositor,
        template
    ) {

    return  FormView.extend({
        template:template,
        
        ui: {
            acronym: 'input[name=ACRONYM]',
            seq: 'input[name=SEQUENCE]',
            mass: 'input[name=MOLECULARMASS]',
        },

        events: {
            'change @ui.seq': 'updateMolecularMass',
        },

        updateMolecularMass: function() {
            this.model.set('MOLECULARMASS', phaseCompositor.molecularMassFromComposition(this.ui.seq.val()))
            this.ui.mass.val(this.model.get('MOLECULARMASS'))
        },

        createModel: function() {
            this.model = new Phase()
        },
        
        success: function(model, response, options) {
            if (this.getOption('dialog')) {
                this.trigger('phase:added', this.model)
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()

            } else app.trigger('phases:view', this.model.get('PROTEINID'))
        },
        
        initialize: function(options) {
        },
        
        onRender: function(options) {
            var millis = (new Date()).getTime()
            this.ui.acronym.val('xpdf'+millis.toString())
        },
    })

})
