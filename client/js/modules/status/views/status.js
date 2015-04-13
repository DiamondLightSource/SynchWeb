define(['marionette',
    
    'views/pvs',
    'modules/status/views/gdalog',
    'modules/status/views/epicspages',
    
    'tpl!templates/status/status.html',
    ], function(Marionette, PVView, GDALog, EpicsPagesView, template) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            pvs: '.pvs',
            ep: '.screens',
            gda: '.gda',
        },
        
        events: {
            'click h1.status.oavs': 'toggleOAV',
        },
        
        toggleOAV: function() {
            this.$el.find('div.status.oavs').slideToggle()
            
            this.$el.find('.oav img').attr('src', this.$el.find('div.status.oavs').is(':visible') ? (app.apiurl+'/image/oav/bl/'+this.getOption('bl')) : '')
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

            /*var self = this
            this.$el.find('.webcam img').each(function(i,w) {
                $(w).attr('src', '/image/cam/bl/'+self.getOption('bl')+'/n/'+i)
            })*/
        },
        
    })
        
})