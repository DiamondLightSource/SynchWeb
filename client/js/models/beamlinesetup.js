define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'BEAMLINESETUPID',
        urlRoot: '/exp/setup',

        defaults: [],

        initialize: function(attrs, options) {
            _.each(this.validation, function(v,k) {
                this.defaults[k] = v.pattern == 'word' || v.pattern == 'wwsdash' || v.pattern == 'wwdash' ? '' : null
            }, this)
        },

        map: {
            REQUIREDRESOLUTION: ['DETECTORMAXRESOLUTION', 'DETECTORMINRESOLUTION'],
            EXPOSURETIME: ['MINEXPOSURETIMEPERIMAGE', 'MAXEXPOSURETIMEPERIMAGE'],
            PREFERREDBEAMSIZEX: ['BEAMSIZEXMIN', 'BEAMSIZEXMAX'],
            PREFERREDBEAMSIZEY: ['BEAMSIZEYMIN', 'BEAMSIZEYMAX'],
            BOXSIZEX: ['BOXSIZEXMIN', 'BOXSIZEXMAX'],
            BOXSIZEY: ['BOXSIZEYMIN', 'BOXSIZEYMAX'],
            AXISRANGE: ['GONIOSTATMINOSCILLATIONWIDTH', 'GONIOSTATMAXOSCILLATIONWIDTH'],
            AXISSTART: ['OMEGAMIN', 'OMEGAMAX'],
            AXISEND: ['OMEGAMIN', 'OMEGAMAX'],
            NUMBEROFIMAGES: ['NUMBEROFIMAGESMIN', 'NUMBEROFIMAGESMAX'],
            TRANSMISSION: ['MINTRANSMISSION', 'MAXTRANSMISSION'],
            ENERGY: ['ENERGYMIN', 'ENERGYMAX'],
            DISTANCE: ['DETECTORDISTANCEMIN', 'DETECTORDISTANCEMAX'],
            MONOBANDWIDTH: ['MONOBANDWIDTHMIN', 'MONOBANDWIDTHMAX'],
            ROLL: ['DETECTORROLLMIN', 'DETECTORROLLMAX'],
        },

        getRange: function(options) {
            if (options && options.field) {
                if (options.field in this.map) {
                    var mm = this.map[options.field]
                    if (this.get(mm[0]) !== null && this.get(mm[1]) !== null) {
                        return [parseFloat(this.get(mm[0])), parseFloat(this.get(mm[1]))]
                    }
                }
            }
        },


        validation: {

            BEAMLINENAME: {
                required: true,
                pattern: 'wwdash',
            },

            DETECTORID: {
                required: true,
                pattern: 'digits',
            },

            BEAMSIZEXMAX: {
                required: false,
                pattern: 'number',
            },
            BEAMSIZEXMIN: {
                required: false,
                pattern: 'number',
            },
            BEAMSIZEYMAX: {
                required: false,
                pattern: 'number',
            },
            BEAMSIZEYMIN: {
                required: false,
                pattern: 'number',
            },
            BOXSIZEXMAX: {
                required: false,
                pattern: 'number',
            },
            BOXSIZEXMIN: {
                required: false,
                pattern: 'number',
            },
            BOXSIZEYMAX: {
                required: false,
                pattern: 'number',
            },
            BOXSIZEYMIN: {
                required: false,
                pattern: 'number',
            },
            CS: {
                required: false,
                pattern: 'number',
            },
            ENERGYMAX: {
                required: false,
                pattern: 'digits',
            },
            ENERGYMIN: {
                required: false,
                pattern: 'digits',
            },
            GONIOSTATMAXOSCILLATIONWIDTH: {
                required: false,
                pattern: 'number',
            },
            GONIOSTATMINOSCILLATIONWIDTH: {
                required: false,
                pattern: 'number',
            },
            KAPPAMAX: {
                required: false,
                pattern: 'number',
            },
            KAPPAMIN: {
                required: false,
                pattern: 'number',
            },
            MAXEXPOSURETIMEPERIMAGE: {
                required: false,
                pattern: 'number',
            },
            MINEXPOSURETIMEPERIMAGE: {
                required: false,
                pattern: 'number',
            },
            MAXTRANSMISSION: {
                required: false,
                pattern: 'digits',
            },
            MINTRANSMISSION: {
                required: false,
                pattern: 'digits',
            },
            NUMBEROFIMAGESMAX: {
                required: false,
                pattern: 'digits',
            },
            NUMBEROFIMAGESMIN: {
                required: false,
                pattern: 'digits',
            },
            OMEGAMAX: {
                required: false,
                pattern: 'number',
            },
            OMEGAMIN: {
                required: false,
                pattern: 'number',
            },
            PHIMAX: {
                required: false,
                pattern: 'number',
            },
            PHIMIN: {
                required: false,
                pattern: 'number',
            },
            MONOBANDWIDTHMIN: {
                required: false,
                pattern: 'number',
            },
            MONOBANDWIDTHMAX: {
                required: false,
                pattern: 'number',
            },
        }
    })
       
})
