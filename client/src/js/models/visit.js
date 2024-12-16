define(['backbone', 'backbone-validation', 'luxon'], function(Backbone, BackBoneValidation, luxon) {
  var Visit = Backbone.Model.extend({
    idAttribute: 'VISIT',
    urlRoot: '/proposal/visits',
      
    initialize: function(attributes, options) {
      this.on('change', this.addDate, this)
      this.dateTimeZone = window.app.options.get('timezone')
      this.addDate()
    },

    validation: {
        PROPOSALID: {
            required: true,
            pattern: 'number',
        },
        STARTDATE: {
            required: true,
            pattern: 'datetime'
        },
        ENDDATE: {
            required: true,
            pattern: 'datetime'
        },
        BEAMLINENAME: {
            required: true,
            pattern: 'wwdash',
        },
        BEAMLINEOPERATOR: {
            required: false,
            pattern: 'wwsdash',
        },
        SCHEDULED: {
            required: false,
            pattern: 'number',
        },
        BEAMLINESETUPID: {
          required: false,
          pattern: 'number',
        },
        COMMENTS: {
            required: false,
            pattern: 'wwsdash',
        },
        VISITNUMBER: {
            required: false,
            pattern: 'number',
        },
    },
      
    addDate: function() {
        var { DateTime } = luxon
        
        this.set('ENISO', DateTime.fromISO(this.get('ENISO'), { zone: this.dateTimeZone }))
        this.set('STISO', DateTime.fromISO(this.get('STISO'), { zone: this.dateTimeZone }))
        this.set('LEN', Number(this.get('ENISO').diff(this.get('STISO'))/(3600*1000)).toFixed(2))
        this.set('VISITDETAIL', this.get('VISIT')+' ('+this.get('BL')+': '+this.get('ST')+')')
    },

    dateTimeZone: 'Europe/London'
      
  })

  _.extend(Visit.prototype, Backbone.Validation.mixin)
  return Visit
    
})
