define(['backbone.paginator', 'models/dewar'], function(PagableCollection, Dewar) {
       
  return PagableCollection.extend({
  	mode: 'client',
    model: Dewar,
    url: function() { return '/shipment/dewars'+(this.id ? '/sid/'+this.id : '')+(this.fc ? '/fc/'+this.fc : '') },
      
    initialize: function(models, options) {
        if (options) {
        	this.id = options.id
        	this.fc = options.FACILITYCODE
     	}
    },      
  })
})