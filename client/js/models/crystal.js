define(['backbone', 'collections/components'], function(Backbone, Components) {
    
    return Backbone.Model.extend({
        idAttribute: 'CRYSTALID',
        urlRoot: '/sample/crystals',
        
        initialize: function(attrs, options) {
            var addPrimary = (options && options.addPrimary) || (this.collection && this.collection.state.addPrimary)
            this.set('components', new Components(null, { pmodel: this, addPrimary: addPrimary }))
        },

        validation: {
            NAME: {
                required: true,
                pattern: 'wwdash',
            },
            PROTEINID: {
                required: true,
                pattern: 'digits',
            },

            SPACEGROUP: {
                required: false,
                pattern: 'word',
            },

            CELL_A: {
                required: false,
                pattern: 'number'
            },
            CELL_B: {
                required: false,
                pattern: 'number'
            },
            CELL_C: {
                required: false,
                pattern: 'number'
            },
            CELL_ALPHA: {
                required: false,
                pattern: 'number'
            },
            CELL_BETA: {
                required: false,
                pattern: 'number'
            },
            CELL_GAMMA: {
                required: false,
                pattern: 'number'
            },

            ABUNDANCE: {
                required: false,
                pattern: 'number',
            },
            THEORETICALDENSITY: {
                required: false,
                pattern: 'number',
            },


        },
    })
    
})
