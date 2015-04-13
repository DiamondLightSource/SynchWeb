define(['backbone.paginator'], function(PageableCollection) {
    
    var LogLine = Backbone.Model.extend({
        idAttribute: 'LINE',
    })
    
    return PageableCollection.extend({
        model: LogLine,
        url: function() { return '/status/log/'+this.bl },
        mode: 'infinite',
        
        initialize: function(attrs, options){
            this.bl = options.bl 
            this.running = true
            if (options && options.running == false) this.running = false
            this.refresh_thread = null
        },
                                          
        stop: function() {
            clearTimeout(this.refresh_thread)
            this.running = false
        },
      
        parseRecords: function(r, options) {
            clearTimeout(this.refresh_thread)
            if (this.running) this.refresh_thread = setTimeout(this.fetch.bind(this), 5000)
                
            var lines = []
            _.each(r.reverse(), function(l) {
                lines.push({ LINE: l })
            })
                
            return lines
        },
        
        
    })


})