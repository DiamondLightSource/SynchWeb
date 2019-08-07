define(['backbone', 
    'models/scanmodel',
    'collections/scanmodels',

    'models/datacollectionplandetector',
    'collections/datacollectionplandetectors',

    ], function(Backbone,
        ScanModel,
        ScanModels,

        DataCollectionPlanDetector,
        DataCollectionPlanDetectors
    ) {

    return Backbone.Model.extend({
        idAttribute: 'DIFFRACTIONPLANID',
        urlRoot: '/exp/plans',

        defaults: {
            MONOBANDWIDTH: null,
            ENERGY: null,
            PREFERREDBEAMSIZEX: null,
            PREFERREDBEAMSIZEY: null,
        },

        initialize: function(attrs, options) {
            this.set('SCANPARAMETERSMODELS', new ScanModels())
            this.set('DETECTORS', new DataCollectionPlanDetectors())

            if (options && options.SCANPARAMETERSMODELS) {
                this.models = options.SCANPARAMETERSMODELS
                this.listenTo(this.models, 'sync reset add remove', this.syncModels)
                this.syncModels()
            }

            if (options && options.DETECTORS) {
                this.detectors = options.DETECTORS   
                this.listenTo(this.detectors, 'sync reset add remove', this.syncDetectors)
                this.syncDetectors()
            }

            this.listenTo(this, 'change:ENERGY', this.updateKevEnergy)
            this.updateKevEnergy()

            if (options && options.BEAMLINESETUPS) {
                this.beamlinesetups = options.BEAMLINESETUPS
                this.listenTo(this.beamlinesetups, 'sync reset add remove', this.syncLimits)
                this.syncLimits()
            }
        },

        syncModels: function() {
            if (!this.get('DIFFRACTIONPLANID')) return
            var mods = this.models.where({ DATACOLLECTIONPLANID: this.get('DIFFRACTIONPLANID')})
            // console.log('syncing models', this.get('DIFFRACTIONPLANID'), mods)
            this.get('SCANPARAMETERSMODELS').reset(mods)
        },

        syncDetectors: function() {
            if (!this.get('DIFFRACTIONPLANID')) return
            var dets = this.detectors.where({ DATACOLLECTIONPLANID: this.get('DIFFRACTIONPLANID')})
            // console.log('syncing dets', this.get('DIFFRACTIONPLANID'), dets)
            this.get('DETECTORS').reset(dets)
        },

        syncLimits: function() {
            var beamlinesetup = this.beamlinesetups.findWhere({ DETECTORID: this.get('DETECTORID') })
            if (!beamlinesetup) {
                if (this.beamlinesetups.length) beamlinesetup = this.beamlinesetups.at(0)
            }

            if (beamlinesetup) {
                this.validation = JSON.parse(JSON.stringify(this.__proto__.validation))
                _.each(this.validation, function(v,k) {
                    var range = beamlinesetup.getRange({ field: k })
                    if (range) {
                        v.range = range
                    }
                }, this)
            }
        },

        updateKevEnergy: function() {
            this.set('KEVENERGY', (this.get('ENERGY')*0.001).toPrecision(3))
        },

        validation: {
            BLSAMPLEID: {
                required: true,
                pattern: 'digits',
            },

            EXPERIMENTKIND: {
                required: false,
                pattern: 'word',
            },

            REQUIREDRESOLUTION: {
                required: false,
                pattern: 'number',
            },

            PREFERREDBEAMSIZEX: {
                required: false,
                pattern: 'digits',
            },

            PREFERREDBEAMSIZEY: {
                required: false,
                pattern: 'digits',
            },

            EXPOSURETIME: {
                required: false,
                pattern: 'number',
            },

            BOXSIZEX: {
                required: false,
                pattern: 'digits',
            },

            BOXSIZEY: {
                required: false,
                pattern: 'digits',
            },

            AXISSTART: {
                required: false,
                pattern: 'number',
            },

            AXISRANGE: {
                required: false,
                pattern: 'number',
            },

            NUMBEROFIMAGES: {
                required: false,
                pattern: 'number',
            },

            TRANSMISSION: {
                required: false,
                pattern: 'number',
            },

            ENERGY: {
                required: false,
                pattern: 'digits',
            },

            MONOCHROMATOR: {
                required: false,
                pattern: 'word',
            },

            MONOBANDWIDTH: {
                required: false,
                pattern: 'number',
            },

        },
      
    })
       
})
