define(['backbone', 'backbone-validation'], function(Backbone, BackBoneValidation) {
  var Visit = Backbone.Model.extend({
    idAttribute: 'VISIT',
    urlRoot: '/proposal/visits',
      
    initialize: function(attributes, options) {
      this.on('change', this.addDate, this)
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
        const enDate = new Date(this.get('ENISO'))
        const stDate = new Date(this.get('STISO'))
        const diffInHours = (enDate - stDate) / (3600 * 1000)
        this.set('LEN', Number(diffInHours).toFixed(2))
        this.set('VISITDETAIL', this.get('VISIT') + ' (' + this.get('BL') + ': ' + this.get('ST') + ')')
    }
      
  })

  _.extend(Visit.prototype, Backbone.Validation.mixin)
  return Visit
    
})
