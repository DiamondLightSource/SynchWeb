define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({
    idAttribute: 'VISIT',
    urlRoot: '/proposal/visits',
      
    initialize: function(options) {
      this.on('change', this.addDate, this)
      this.addDate()
    },
      
    addDate: function() {
        this.attributes.STISO = new Date(this.get('STISO'))
        this.attributes.ENISO = new Date(this.get('ENISO'))
        this.attributes.LEN = (this.attributes.ENISO - this.attributes.STISO)/(3600*1000)
        this.attributes.VISITDETAIL = this.get('VISIT')+' ('+this.get('BL')+': '+this.get('ST')+')'
    }
      
  })
    
})