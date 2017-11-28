define(['collections/proteins'], function(Proteins){


    var Components = Proteins.extend({
        initialize: function(models, options) {
            this.pmodel = options.pmodel
            this.addPrimary = options && options.addPrimary

            this.listenTo(this, 'change add remove', this._update_component_ids)
            this.listenTo(this.pmodel, 'sync', this._add_components)
            this._add_components()
        },


        totalAbundance: function() {
            return _.reduce(this.pluck('ABUNDANCE'), function(m,n) { return m + parseFloat(n) }, 0.0)
        },


        _update_component_ids: function() {
            var comps = this.slice(this.addPrimary ? 1 : 0)
            // console.log('updating comps', this.addPrimary, comps)
            var flds = { 
                COMPONENTIDS: _.map(comps, function(m) { return m.get('PROTEINID') }),
                COMPONENTAMOUNTS: _.map(comps, function(m) { return m.get('ABUNDANCE') }),
                COMPONENTNAMES: _.map(comps, function(m) { return m.get('NAME') }),
                COMPONENTSEQUENCES: _.map(comps, function(m) { return m.get('SEQUENCE') }),
                COMPONENTDENSITIES: _.map(comps, function(m) { return m.get('DENSITY') }),
            }

            if (this.addPrimary) {
                var primary = this.at(0)
                _.each(['PROTEINID', 'ACRONYM', 'ABUNDANCE', 'SEQUENCE', 'DENSITY'], function(k) {
                    if (primary.get(k) != this.pmodel.get(k)) flds[k] = primary.get(k)
                }, this)
            }

            this.pmodel.set(flds)
            console.log('update components', this.pmodel)
        },

        _add_components: function() {
            var ids = this.pmodel.get('COMPONENTIDS') || []
            var acs = this.pmodel.get('COMPONENTACRONYMS') || []
            var nas = this.pmodel.get('COMPONENTNAMES') || []
            var ses = this.pmodel.get('COMPONENTSEQUENCES') || []
            var des = this.pmodel.get('COMPONENTDENSITIES') || []
            var concs = this.pmodel.get('COMPONENTTYPESYMBOLS') || []
            var abs = this.pmodel.get('COMPONENTAMOUNTS') || []
            var gls = this.pmodel.get('COMPONENTGLOBALS') || []

            var comps = _.map(ids, function(id, i) { 
                return { 
                    PROTEINID: id, 
                    NAME: nas[i],
                    ACRONYM: acs[i], 
                    SEQUENCE: i < ses.length ? ses[i] : '',
                    DENSITY: i < des.length ? des[i] : '',
                    ABUNDANCE: i < abs.length ? abs[i] : 0,  
                    CONCENTRATIONTYPE: i < concs.length ? concs[i] : '',
                    GLOBAL: i < gls.length ? parseInt(gls[i]) : 0,
                }
            })

            if (this.addPrimary) {
                if (this.pmodel.get('PROTEINID') > -1) {
                    comps.unshift({
                        PROTEINID: this.pmodel.get('PROTEINID'),
                        NAME: this.pmodel.get('PROTEIN'),
                        SEQUENCE: this.pmodel.get('SEQUENCE'),
                        DENSITY: this.pmodel.get('DENSITY'),
                        ACRONYM: this.pmodel.get('ACRONYM'),
                        ABUNDANCE: this.pmodel.get('ABUNDANCE'),
                        CONCENTRATIONTYPE: this.pmodel.get('SYMBOL'),
                    })
                }
            }

            // console.log('components', comps, this.addPrimary)

            this.reset(comps)
        },

    })

    return Components

})