define(['backbone'], function(Backbone){
    
  return Backbone.Model.extend({
    idAttribute: 'visit',
    urlRoot: '/vstat/pies',
                   
    initialize: function(options) {
      this.active = options && options.active
      this.bind('sync', this.poll, this)
      this.refresh_thread = null
      this.running = true
    },
                                           
    parse: function(r, options) {
      return { data: r }
    },
      
    stop: function() {
      clearTimeout(this.refresh_thread)
      this.active = false
    },
                                           
    poll: function() {
      clearTimeout(this.refresh_thread)
      if (this.active) this.refresh_thread = setTimeout(this.fetch.bind(this), 5*3600*1000)
    },
  })
       
})