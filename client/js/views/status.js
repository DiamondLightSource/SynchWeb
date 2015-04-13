define(['marionette',
        'views/pvs',
        'tpl!templates/status.html',
    ], function(Marionette, PVView, template) {


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
        
        toggleView: function() {
            this.ui.status.slideToggle()
            
            if (this.ui.status.is(':visible')) {
                this.pvs.show(new PVView({ bl: this.getOption('bl') }))
                var self = this
                this.$el.find('.webcam img').each(function(i,w) {
                    $(w).attr('src', app.apiurl+'/image/cam/bl/'+self.getOption('bl')+'/n/'+i)
                })
                
            } else {
                this.pvs.empty()
                this.$el.find('.webcam img').each(function(i,w) {
                    $(this).attr('src', '')
                })
            }
        }
        
    })
    
})