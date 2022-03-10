define(['marionette',
    
    'views/pvs',
    'modules/status/views/gdalog',
    'modules/status/views/epicspages',
    'utils',
    'modules/calendar/views/calendar',
    'templates/status/status.html',
    ], function(Marionette, PVView, GDALog, EpicsPagesView, utils, CalendarView, template) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            pvs: '.pvs',
            ep: '.screens',
            gda: '.gda',
            cal: '.calendar',
        },
        
        events: {
            'click h1.status.oavs': 'toggleOAV',
        },
        
        // Changed the toggleOAV so that it wait until toggle animation is complete
        // to determine if the webcam feed should be visitble
        toggleOAV: function() {
            var self = this
            
            this.$el.find('div.status.oavs').slideToggle('fast', 'swing', function() {
                if (self.$el.find('div.status.oavs').is(':visible')) {
                    var url = app.apiurl+'/image/oav/bl/'+self.getOption('bl')
                    utils.sign({
                        url: url,
                        callback: function(resp) {
                            self.$el.find('.oav img').attr('src', url+'?token='+resp.token)
                        }
                    })
                } else {
                    // Disable OAV camera feed
                    self.$el.find('.oav img').attr('src', '')
                }
            })
        },
        
        templateHelpers: function() {
            return {
                BL: this.getOption('bl'),
                APIURL: app.apiurl,
                IS_STAFF: app.staff
            }
        },
        
        initialize: function(options) {},
        
        onRender: function() {
            this.ep.show(new EpicsPagesView({ bl: this.getOption('bl') }))

            if (app.staff) {
                this.gda.show(new GDALog({ bl: this.getOption('bl') }))
            }
            
            this.$el.find('div.status.pv, div.status.webcams').show()
            this.pvs.show(new PVView({ bl: this.getOption('bl') }))

            var self = this
            this.$el.find('.webcam img').each(function(i,w) {
                var url = app.apiurl+'/image/cam/bl/'+self.getOption('bl')+'/n/'+i
                utils.sign({
                    url: url,
                    callback: function(resp) {
                        $(w).attr('src', url+'?token='+resp.token)        
                    }
                })
            })

            this.cal.show(new CalendarView({ all: 1, bl: this.getOption('bl') }))
        },
        // Marionette View lifecycle hook
        onBeforeDestroy: function() {
            // Disable webcam feeds
            this.$el.find('.webcam img').each(function(i,w) {
                $(w).attr('src', '')
            })
            // Disable OAV feeds
            this.$el.find('.oav img').attr('src', '')
        }
    })
        
})