define(['backbone', 'collections/proteins'], function(Backbone, Proteins) {
    
    return Backbone.Model.extend({
        idAttribute: 'BLSAMPLEID',
        urlRoot: '/sample',
        

        initialize: function(attrs) {
            var comps = new Proteins()
            // if (attrs) {
            //     comps.reset(attrs.components)
            //     delete attrs.components
            // }
            this.set('components', comps)
            this.listenTo(comps, 'change add remove reset', this.updateComponentIds)
            this.on('sync', this._add_components, this)
            this._add_components()
        },

        updateComponentIds: function() {
            this.set({ 
                COMPONENTIDS: this.get('components').pluck('PROTEINID'),
                COMPONENTAMOUNTS: this.get('components').pluck('ABUNDANCE')
            })
            // console.log('updated sample', this, this.get('COMPONENTAMOUNTS'))
        },

        _add_components: function() {
            var ids = this.get('COMPONENTIDS') || []
            var acs = this.get('COMPONENTACRONYMS') || []
            var concs = this.get('COMPONENTTYPESYMBOLS') || []
            var abs = this.get('COMPONENTAMOUNTS') || []
            var gls = this.get('COMPONENTGLOBALS') || []

            // console.log('add comps', ids, acs)

            var comps = _.map(ids, function(id, i) { 
                return { 
                    PROTEINID: id, 
                    ACRONYM: acs[i], 
                    ABUNDANCE: i < abs.length ? abs[i] : 0,  
                    CONCENTRATIONTYPE: i < concs.length ? concs[i] : '',
                    GLOBAL: i < gls.length ? parseInt(gls[i]) : 0,
                } 
            })
            this.get('components').reset(comps, { silent: true })
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
                    return this.get('PROTEINID') > -1
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
