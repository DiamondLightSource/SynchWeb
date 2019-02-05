define(['marionette',
    
    'views/pvs',
    'modules/status/views/gdalog',
    'modules/status/views/epicspages',
    'utils',
    'modules/calendar/views/calendar',
    'tpl!templates/status/status.html',
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
        
        toggleOAV: function() {
            this.$el.find('div.status.oavs').slideToggle()
            
            if (this.$el.find('div.status.oavs').is(':visible')) {
                var self = this
                var url = app.apiurl+'/image/oav/bl/'+this.getOption('bl')
                utils.sign({
                    url: url,
                    callback: function(resp) {
                        self.$el.find('.oav img').attr('src', url+'?token='+resp.token)        
                    }
                })
            }
        },
        
        templateHelpers: function() {
            return {
                BL: this.getOption('bl'),
                APIURL: app.apiurl
            }
        },
        
        initialize: function(options) {
        },
        
        onRender: function() {
            this.ep.show(new EpicsPagesView({ bl: this.getOption('bl') }))
            this.gda.show(new GDALog({ bl: this.getOption('bl') }))
            
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