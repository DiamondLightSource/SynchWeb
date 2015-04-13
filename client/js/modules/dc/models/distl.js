define(['backbone'], function(Backbone){
       
  /*
   DISTL Plot Data
   
   pass through 
        nimg: number of images, 
        timestamp: unixtime 
   to get autopolling
   
  */
    
  return Backbone.Model.extend({
    urlRoot: '/dc/imq',
                   
    initialize: function(options) {
      this.nimg = options.nimg
      this.timestamp = options.timestamp
      this.bind('sync', this.poll, this)
      this.refresh_thread = null
      this.running = true
    },
                                           
    parse: function(r, options) {
      return { data: r }
    },
      
    stop: function() {
      clearTimeout(this.refresh_thread)
      this.running = false
    },
                                           
    poll: function() {
      clearTimeout(this.refresh_thread)
      if (this.running) {
        var refresh = true
        var d = this.get('data')
        if (d && d[0].length > 0) {
          if (this.nimg == _.last(d)[0][0]) refresh = false
          if ((new Date() - this.timestamp) > (900*1000)) refresh = false
        }

        if (refresh) this.refresh_thread = setTimeout(this.fetch.bind(this), 10000)
      }
    },
  })
       
})