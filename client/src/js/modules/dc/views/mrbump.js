define(['marionette', 'templates/dc/dc_mrbump.html', 'utils', 'jquery.mp'
], function(Marionette, template, utils) {
    
    return Marionette.ItemView.extend({
        template: template,
        className: 'clearfix',
    
        ui: {
            plot: '.plot_dimple',
        },
        
        onDomRefresh: function() {
            console.log('showing dimple')
            this.$el.find('.blobs').magnificPopup({
                delegate: 'a', type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                }
            })
            
            if (app.mobile()) this.ui.plot.width(0.93*(this.options.holderWidth-14))
            else {
                this.ui.plot.width(0.67*(this.options.holderWidth-14))
                this.ui.plot.height(this.ui.plot.width()*0.41-80)
            }
            
            var data = [{ data: this.model.get('PLOTS').FVC, label: 'Rfree vs. Cycle' },
                        { data: this.model.get('PLOTS').RVC, label: 'R vs. Cycle' }]
            var pl = $.extend({}, utils.default_plot, { series: { lines: { show: true }}})
            $.plot(this.ui.plot, data, pl)
        },
    
    })

})