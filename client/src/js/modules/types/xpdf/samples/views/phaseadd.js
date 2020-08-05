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
            name: 'input[name=NAME]',
            acronym: 'input[name=ACRONYM]',
            seq: 'input[name=SEQUENCE]',
            mass: 'input[name=MOLECULARMASS]',
            density: 'input[name=DENSITY]'
        },

        events: {
            'change @ui.seq': 'updateMolecularMass',
        },

        updateMolecularMass: function() {
            this.model.set('MOLECULARMASS', phaseCompositor.molecularMassFromComposition(this.ui.seq.val()))
            this.ui.mass.val(this.model.get('MOLECULARMASS'))
        },

        createModel: function() {
            if (this.model) {
                console.log("Passed protein to clone")
                // Set the passed protein id to null to indicate this will be a new instance
                this.model.set('PROTEINID', null)
            } else {
                // Normal New / Add Protein use case
                this.model = new Phase()
            }
        },
        
        success: function(model, response, options) {
            if (this.getOption('dialog')) {
                this.trigger('phase:added', this.model)
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()

            } else app.trigger('phases:view', this.model.get('PROTEINID'))
        },

        failure: function(model, xhr, options) {
            console.log(arguments)
            json = null
            if (xhr.responseText) {
                try {
                    json = $.parseJSON(xhr.responseText)
                } catch(err) {
                    console.log('Failed to parse error message from failed request')
                    console.log(err)
                }
            }

            if (json.message) app.alert({ message: json.message })
            else app.alert({ message: 'Something went wrong registering that protein' })
        },
        
        initialize: function(options) {
            // If this page has been created as a clone option we will have a valid this.model
            if (this.model) this.clone = true
        },
        
        onRender: function() {
            if (this.clone) {
                this.ui.name.val(this.model.get('NAME'))
                this.ui.acronym.val(this.model.get('ACRONYM'))
                this.ui.seq.val(this.model.get('SEQUENCE'))
                this.ui.mass.val(this.model.get('MOLECULARMASS'))
                this.ui.density.val(this.model.get('DENSITY'))
            } else {
                this.ui.name.attr('disabled', false)
                var millis = (new Date()).getTime()
                this.ui.acronym.val('xpdf'+millis.toString())
            }
        },
    })

})
