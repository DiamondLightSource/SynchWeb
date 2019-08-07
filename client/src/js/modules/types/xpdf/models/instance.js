define(['models/sample',
    'modules/types/xpdf/utils/phasecompositor'], 
    function(Sample, phaseCompositor) {
    
    var Instance = Sample.extend({
        initialize: function(attrs, options) {
            Instance.__super__.initialize.call(this, attrs, options)

            this.listenTo(this.get('components'), 'change add remove reset', this.updateComposition)
            this.listenTo(this, 'change:THEORETICALDENSITY change:PACKINGFRACTION', this.updateExpDensity)
            this.updateComposition()
            this.updateExpDensity()
        },

        updateExpDensity: function() {
            var expd = this.get('PACKINGFRACTION') * this.get('THEORETICALDENSITY')
            this.set('EXPERIMENTALDENSITY', expd.toFixed(3))
        },

        updateComposition: function() {
            if (!this.get('components').length) return
            var comp = phaseCompositor.composeComposition(this.get('components'), this.get('components').pluck('ABUNDANCE'), true)
            this.set('COMPOSITION', comp)
            console.log('update comp', comp, this)
        },

    })

    return Instance
})
