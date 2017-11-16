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
                this.listenTo(this.models, 'sync reset change add remove', this.syncModels)
                this.syncModels()
            }

            if (options && options.DETECTORS) {
                this.detectors = options.DETECTORS   
                this.listenTo(this.detectors, 'sync reset change add remove', this.syncDetectors)
                this.syncDetectors()
            }

            this.listenTo(this, 'change:ENERGY', this.updateKevEnergy)
            this.updateKevEnergy()
        },

        syncModels: function() {
            var mods = this.models.where({ DATACOLLECTIONPLANID: this.get('DIFFRACTIONPLANID')})
            // console.log('syncing models', this.get('DIFFRACTIONPLANID'), mods)
            this.get('SCANPARAMETERSMODELS').reset(mods)
        },

        syncDetectors: function() {
            var dets = this.detectors.where({ DATACOLLECTIONPLANID: this.get('DIFFRACTIONPLANID')})
            // console.log('syncing dets', this.get('DIFFRACTIONPLANID'), dets)
            this.get('DETECTORS').reset(dets)
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
