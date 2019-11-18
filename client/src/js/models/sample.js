define(['backbone', 'collections/components', 
    'utils/experimentkinds',
    'utils/radiationsensitivity'], function(Backbone, Components, EXP, RS) {
    
    return Backbone.Model.extend({
        idAttribute: 'BLSAMPLEID',
        urlRoot: '/sample',
        

        initialize: function(attrs, options) {
            var addPrimary = (options && options.addPrimary) || (this.collection && this.collection.state.addPrimary)
            this.set('components', new Components(null, { pmodel: this, addPrimary: addPrimary }))

            this.listenTo(this, 'change:EXPERIMENTKIND', this.updateExpKind)
            this.updateExpKind()

            this.listenTo(this, 'change:RADIATIONSENSITIVITY', this.updateRadSen)
            this.updateRadSen()
        },

        updateExpKind: function() {
            var val = EXP.key(this.get('EXPERIMENTKIND'))
            this.set('EXPERIMENTKINDNAME', val)
        },

        updateRadSen: function() {
            var val = RS.key(this.get('RADIATIONSENSITIVITY'))
            this.set('RADIATIONSENSITIVITYNAME', val)
        },

        defaults: {
            NAME: '',
            CODE: '',
            COMMENTS: '',
            SPACEGROUP: '',
            REQUIREDRESOLUTION: '',
            ANOMALOUSSCATTERER: '',
            CELL_A: '',
            CELL_B: '',
            CELL_C: '',
            CELL_ALPHA: '',
            CELL_BETA: '',
            CELL_GAMMA: '',
            VOLUME: '',
            ABUNDANCE: '',
            SYMBOL: '',
            PACKINGFRACTION: '',
            EXPERIMENTALDENSITY: '',
            COMPOSITION: '',
            LOOPTYPE: '',
            DIMENSION1: '',
            DIMENSION2: '',
            DIMENSION3: '',
            SHAPE: '',
        },
        
        validation: {
            /*CONTAINERID: {
                required: true,
            },*/
            PROTEINID: {
                required: true,
                min: 0,
            },
            NAME: {
                required: function() {
                    return this.get('PROTEINID') > -1 || this.get('CRYSTALID') > -1
                },
                pattern: 'wwdash',
            },
            SPACEGROUP: {
                required: false,
                pattern: 'word',
            },

            ANOMALOUSSCATTERER: {
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

            REQUIREDRESOLUTION: {
                required: false,
                pattern: 'number'
            },

            VOLUME: {
                required: false,
                pattern: 'number'
            },

            ABUNDANCE: {
                required: false,
                pattern: 'number'
            },

            PACKINGFRACTION: {
                required: false,
                pattern: 'number'
            },

            DIMENSION1: {
                required: false,
                pattern: 'number'
            },

            DIMENSION2: {
                required: false,
                pattern: 'number'
            },

            DIMENSION3: {
                required: false,
                pattern: 'number'
            },

            LOOPTYPE: {
                required: false,
                pattern: 'word',
            },


            COMPONENTAMOUNTS: function(from_ui, attr, all_values) {
                var values = all_values.components.pluck('ABUNDANCE')
                var valid = true
                _.each(values, function(v) {
                    if (isNaN(v)) valid = false
                })

                return valid ? null : 'Invalid amount specified'
            },
        },
    })
    
})
