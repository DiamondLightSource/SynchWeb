define(['marionette', 'views/dialog'], function(Marionette, DialogView) {

    return DialogView.extend({
        className: 'fixedwidth',
        template: false,
        
        initialize: function(options) {
            this.url = options.url
            this.load()
            
        },
        
        load: function() {
            var self = this
            //if (this.getOption('iframe')) {
                this.data = '<iframe src="'+this.url+'"></iframe>'
                
            /*} else {
                $.get(this.url, function(d) {
                    if (d.indexOf('h1') == -1) d = '<pre>'+d+'</pre>'
                    self.data = d
                    self.render()
                })
            }*/
        },
        
        onRender: function() {
            this.$el.html(this.data)
            
            //if (this.getOption('iframe')) {
                this.$el.find('iframe').css('width', $(window).width()*(app.mobile() ? 0.8 : 0.5))
                this.$el.find('iframe').css('height', $(window).width()*(app.mobile() ? 0.8 : 0.5))
            //}
        }
        
    })
    
})