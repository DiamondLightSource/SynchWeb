/**
 * View a Crystal as an XPDF sample
 */

define([
    'marionette',
    'backbone',
    'collections/samples',
    'utils/editable',
    'modules/types/xpdf/samples/views/phasetable',
    'modules/types/xpdf/samples/views/instancelist',
    'modules/types/xpdf/utils/phasecompositor',
    'templates/types/xpdf/samples/sample.html'], function(
        Marionette,
        Backbone,
        Instances,
        Editable,
        PhaseTable,
        InstanceList,
        phaseCompositor,
        template) {


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            rphase: '.phasetable',
            rinstance: '.instancetable',
        },


        ui: {
            THEORETICALDENSITY: '.THEORETICALDENSITY',
            COMPOSITION: '.COMPOSITION',
        },


        calculateDensity: function() {
            var density = phaseCompositor.composeDensity(this.model.get('components'), this.model.get('components').pluck('ABUNDANCE'))
            this.model.set('THEORETICALDENSITY', density)
            this.model.save({ THEORETICALDENSITY: density }, { patch: true, parse: false })
            this.ui.THEORETICALDENSITY.text(density)

            this.updateComposition()
        },

        updateComposition: function() {
            if (!this.model.get('components').length) return
            var comp = phaseCompositor.composeComposition(this.model.get('components'), this.model.get('components').pluck('ABUNDANCE'), true)
            this.ui.COMPOSITION.text(comp)
        },


        saveComponents: function() {
            this.model.save({
                COMPONENTIDS: this.model.get('COMPONENTIDS'),
                COMPONENTAMOUNTS: this.model.get('COMPONENTAMOUNTS'),
                PROTEINID: this.model.get('PROTEINID'),
                ABUNDANCE: this.model.get('ABUNDANCE'),
            }, { patch: true, parse: false })
        },

        
        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.instances = new Instances()
            this.instances.queryParams.crid = this.model.get('CRYSTALID')
            this.instances.fetch()

            this.listenTo(this.model.get('components'), 'change add remove', this.calculateDensity)
            this.listenTo(this.model.get('components'), 'reset', this.updateComposition)

            this.saveComponents = _.debounce(this.saveComponents.bind(this), 100)
            this.listenTo(this.model, 'change:COMPONENTIDS change:COMPONENTAMOUNTS change:PROTEINID change:ABUNDANCE', this.saveComponents)
        },
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('THEORETICALDENSITY', 'text')
            // edit.create('NAME', 'text_underscore')
            
            // Table of phases
            this.rphase.show(new PhaseTable({ collection: this.model.get('components') }))
            
            // Table of instances
            this.rinstance.show(new InstanceList({ collection: this.instances }))

            this.updateComposition()
        },
        
    })
})