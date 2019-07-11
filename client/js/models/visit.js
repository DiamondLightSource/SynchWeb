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
        }
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