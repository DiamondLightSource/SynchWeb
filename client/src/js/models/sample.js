define(['backbone', 'collections/components', 'collections/ligands',
    'utils/experimentkinds',
    'utils/radiationsensitivity'], function(Backbone, Components, Ligands, EXP, RS) {
    
    return Backbone.Model.extend({
        idAttribute: 'BLSAMPLEID',
        urlRoot: '/sample',
        

        initialize: function(attrs, options) {
            var addPrimary = (options && options.addPrimary) || (this.collection && this.collection.state.addPrimary)
            this.set('components', new Components(null, { pmodel: this, addPrimary: addPrimary }))
            this.set('ligands', new Ligands(null, { pmodel: this }))
            this.updateScreeningOptions()

            this.listenTo(this, 'change:EXPERIMENTKIND', this.updateExpKind)
            this.updateExpKind()

            this.listenTo(this, 'change:RADIATIONSENSITIVITY', this.updateRadSen)
            this.updateRadSen()

            this.listenTo(this, 'change:X', this.updatePosition)

            this.listenTo(this, 'change', this.updateHasData)
            this.updateHasData()

        },

        updatePosition: function() {
            this.save(this.changedAttributes(), { patch: true })
        },

        updateHasData: function() {
            var hasData = this.get('DC') > 0 || this.get('GR') > 0 || this.get('SC') > 0
            if (hasData !== this.get('HASDATA')) this.set('HASDATA', hasData)
        },

        updateExpKind: function() {
            var val = EXP.key(this.get('EXPERIMENTKIND'))
            this.set('EXPERIMENTKINDNAME', val)
        },

        updateScreeningOptions: function() {
            const strategyOption = this.get('STRATEGYOPTION')
            if (strategyOption) {
                const option = JSON.parse(strategyOption)
                if (option) {
                    this.set('SCREENINGMETHOD', option.screen == null ? 'none' : option.screen)
                    this.set('SCREENINGCOLLECTVALUE', option.collect_samples)
                    this.set('SAMPLEGROUP', option.sample_group)
                    this.set('STRATEGYOPTION', null)
                }
            } else if (this.get('BLSAMPLEID') && !this.get('SCREENINGMETHOD') && this.get('REQUIREDRESOLUTION')) {
                this.set('SCREENINGMETHOD', 'none')
            }
        },

        updateRadSen: function() {
            var val = RS.key(this.get('RADIATIONSENSITIVITY'))
            this.set('RADIATIONSENSITIVITYNAME', val)
        },

        defaults: {
            ABUNDANCE: '',
            ANOMALOUSSCATTERER: '',
            BLSUBSAMPLEID: '',
            CODE: '',
            CELL_A: '',
            CELL_B: '',
            CELL_C: '',
            CELL_ALPHA: '',
            CELL_BETA: '',
            CELL_GAMMA: '',
            CENTRINGMETHOD: '',
            COLOR: '',
            COMMENTS: '',
            COMPOSITION: '',
            CONTAINERID: '',
            CRYSTALID: -1,
            DIMENSION1: '',
            DIMENSION2: '',
            DIMENSION3: '',
            ENERGY: '',
            EXPERIMENTALDENSITY: '',
            EXPERIMENTKIND: '',
            LOCATION: '',
            LOOPTYPE: '',
            MINIMUMRESOLUTION: '',
            NAME: '',
            PACKINGFRACTION: '',
            PROTEINID: -1,
            REQUIREDRESOLUTION: '',
            RADIATIONSENSITIVITY: '',
            SAMPLEGROUP: '',
            SCREENCOMPONENTGROUPID: null,
            SCREENINGMETHOD: '',
            SCREENINGCOLLECTVALUE: '',
            STRATEGYOPTION: '',
            SHAPE: '',
            SMILES: '',
            SPACEGROUP: '',
            SYMBOL: '',
            THEORETICALDENSITY: '',
            USERPATH: '',
            VOLUME: '',
            INITIALSAMPLEGROUP: '',
            COMPONENTIDS: [],
            COMPONENTAMOUNTS: [],
            LIGANDIDS: [],
            LIGANDNAMES: [],
            X: null,
            Y: null,
            Z: null,
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
                pattern: 'wwsldash',
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
            SMILES: {
                required: false,
                pattern: 'smiles'
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

            SHAPE: {
                required: false,
                pattern: 'word',
            },

            COLOR: {
                required: false,
                pattern: 'word',
            },

            LOOPTYPE: {
                required: false,
                pattern: 'word',
            },

            USERPATH: {
                required: false,
                pattern: 'twopath',
                maxLength: 40,
            },
            SCREENINGMETHOD: {
                required: false,
                pattern: 'word'
            },
            SCREENINGCOLLECTVALUE: {
                required: false,
                pattern: 'number'
            },
            SAMPLEGROUP: {
                required: false,
                pattern: 'numberorword'
            },
            EXPERIMENTKIND: {
                required: false,
                pattern: 'word'
            },
            X: {
                required: false
            },
            Y: {
                required: false
            },
            Z: {
                required: false
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
