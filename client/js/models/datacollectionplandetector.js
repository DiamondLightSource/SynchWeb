define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'DATACOLLECTIONPLANHASDETECTORID',
        urlRoot: '/exp/plans/detectors',

        defaults: {
            EXPOSURETIME: null,
            DISTANCE: null,
            ROLL: null
        },

        initialize: function(attrs, options) {
            if (options && options.BEAMLINESETUPS) {
                this.beamlinesetups = options.BEAMLINESETUPS
                this.listenTo(this.beamlinesetups, 'sync reset add remove', this.syncLimits)
                this.syncLimits()
            }
        },
      
        syncLimits: function() {
            var beamlinesetup = this.beamlinesetups.findWhere({ DETECTORID: this.get('DETECTORID') })
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


        validation: {
            DETECTORID: {
                required: true,
                pattern: 'number',
            },
            DATACOLLECTIONPLANID: {
                required: true,
                pattern: 'number',
            },
            EXPOSURETIME: {
                required: false,
                pattern: 'number',
            },
            DISTANCE: {
                required: false,
                pattern: 'number',
            },
            ROLL: {
                required: false,
                pattern: 'number',
            },

        },
    
    })
       
})
