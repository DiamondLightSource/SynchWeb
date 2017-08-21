define(['backbone', 'markdown'], function(Backbone, markdown) {
    
    return Backbone.Model.extend({
        idAttribute: 'CRYSTALID',
        urlRoot: '/sample/crystals',
        
        validation: {
            NAME: {
                required: true,
                pattern: 'wwsdash',
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


        },
    })
    
})
