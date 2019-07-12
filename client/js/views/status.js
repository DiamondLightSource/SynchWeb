define(['marionette',
        'views/pvs',
        'utils',
        'templates/status.html',
    ], function(Marionette, PVView, utils, template) {


    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        templateHelpers: function() {
            return {
                BL: this.getOption('bl'),
                APIURL: app.apiurl
            }
        },
        
        events: {
            'click h1': 'toggleView',
        },
        
        regions: {
            pvs: '.pvs',
        },
        
        ui: {
            status: 'div.status',
        },

        // Handler for the camera feed timeout function
        timeoutHandler: undefined,
        // Duration to leave camera feeds visible (in milliseconds)
        timeoutDuration: 10*60*1000,

        toggleView: function() {
            var self = this
            
            this.ui.status.slideToggle('fast', 'swing', function() {
                if (self.ui.status.is(':visible')) {
                    self.pvs.show(new PVView({ bl: self.getOption('bl') }))
                    self.$el.find('.webcam img').each(function(i,w) {
                        var url = app.apiurl+'/image/cam/bl/'+self.getOption('bl')+'/n/'+i
                        utils.sign({
                            url: url,
                            callback: function(resp) {
                                $(w).attr('src', url+'?token='+resp.token)
                            }
                        })
                    })
                    // Set Timeout for x mins to close it 
                    self.timeoutHandler = setTimeout(function() {
                        self.toggleView()
                    }, self.timeoutDuration)
                } else {
                    // If this is called before the timeout then cancel the timer
                    if (self.timeoutHandler) {
                        clearTimeout(self.timeoutHandler)
                    }
                    self.pvs.empty()
                    self.$el.find('.webcam img').each(function(i,w) {
                        $(w).attr('src', '')
                    })
                }
            })
        },
        // Marionette View lifecycle hook
        onBeforeDestroy: function() {
            // If someone navigates away from the page reset the src attribute to disable the feeds.
            this.$el.find('.webcam img').each(function(i,w) {
                $(w).attr('src', '')
            })
        },
        
    })
    
})