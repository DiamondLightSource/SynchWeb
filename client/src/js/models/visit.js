define(['backbone', 'backbone-validation'], function(Backbone) {

  var Visit = Backbone.Model.extend({
    idAttribute: 'VISIT',
    urlRoot: '/proposal/visits',
      
    initialize: function(options) {
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
        this.attributes.STISO = new Date(this.get('STISO'))
        this.attributes.ENISO = new Date(this.get('ENISO'))
        this.attributes.LEN = +((this.attributes.ENISO - this.attributes.STISO)/(3600*1000)).toFixed(2);
        this.attributes.VISITDETAIL = this.get('VISIT')+' ('+this.get('BL')+': '+this.get('ST')+')'
    }
      
  })

  _.extend(Visit.prototype, Backbone.Validation.mixin)
  return Visit
    
})
