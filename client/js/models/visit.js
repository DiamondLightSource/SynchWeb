define(['backbone', 'backbone-validation'], function(Backbone) {

    var Visit = Backbone.Model.extend({
        idAttribute: 'VISIT',
        urlRoot: '/proposal/visits',
      
        initialize: function(options) {
            this.on('change', this.addDate, this)
            this.addDate()
        },

        validation: {
            COMMENTS: {
                required: false,
                pattern: 'wwsdash',
            },
            PROPOSALID: {
                required: true,
                pattern: 'number',
            },
            STARTDATE: {
                required: true,
                pattern: 'datetime',
            },
            ENDDATE: {
                required: true,
                pattern: 'datetime',
            },
            BEAMLINENAME: {
                required: true,
                pattern: 'wwdash',
            },
            BEAMLINEOPERATOR: {
                required: true,
                pattern: 'wwsdash',
            },
            SCHEDULED: {
                required: false,
                pattern: 'number',
            },
            ARCHIVED: {
                required: false,
                pattern: 'number',
            },
            EXTERNALID: {
                required: false,
                pattern: 'wwdash',
            },
            BEAMLINESETUPID: {
                required: false,
                pattern: 'number',
            },
            BEAMCALENDARID: {
                required: false,
                pattern: 'number',
            },
        },
          
        addDate: function() {
            this.attributes.STISO = new Date(this.get('STISO'))
            this.attributes.ENISO = new Date(this.get('ENISO'))
            this.attributes.LEN = +((this.attributes.ENISO - this.attributes.STISO)/(3600*1000)).toFixed(2)
            this.attributes.VISITDETAIL = this.get('VISIT')+' ('+this.get('BL')+': '+this.get('ST')+')'
        }
          
    })

    _.extend(Visit.prototype, Backbone.Validation.mixin)
    return Visit
    
})