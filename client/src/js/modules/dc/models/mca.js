define(['backbone'], function(Backbone){
       
  /*
   MCA Plot Data
  */
    
  return Backbone.Model.extend({
    urlRoot: '/dc/mca',
                   
    initialize: function(options) {
      this.bind('sync', this.poll, this)
      this.refresh_thread = null
      this.running = true
    },
      
      
    parse: function(r, options) {
      return { XRF: r[0], COMPTON: r[1], ELEMENTS: r[2], ELNOMATCH: r[3], MP: r[4], MAX: r[5] }
    },      
      
    stop: function() {
      clearTimeout(this.refresh_thread)
      this.running = false
    },
                                           
    poll: function() {
      clearTimeout(this.refresh_thread)
      if (this.running) {
        if (!this.get('ELEMENTS').length) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
      }
    },
  })
       
})