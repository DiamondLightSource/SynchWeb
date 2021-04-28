define([
    'marionette', 'templates/dc/dc_dimple.html', 'utils', 'utils/xhrimage', 'jquery.mp'
], function(Marionette, template, utils, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,
        className: 'clearfix',
    
        ui: {
            plot: '.plot_dimple',
            rstats: '.rstats',
        },
        
        showBlob: function() {
            this.$el.find('.blobs img').attr('src', this.blob.src)
        },

        onDomRefresh: function() {
            this.$el.find('.blobs').magnificPopup({
                delegate: 'a', type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                }
            })
            
            if (this.model.get('BLOBS') > 0) {
                this.blob = new XHRImage()
                this.blob.onload = this.showBlob.bind(this)
                this.blob.load(app.apiurl+'/processing/downstream/images/'+this.model.get('AID'))
            }

            if (app.mobile()) {
                this.ui.plot.width(0.93*(this.options.holderWidth-14))
            } else {
                this.ui.rstats.width(0.20*(this.options.holderWidth-14))
                this.ui.plot.width(0.47*(this.options.holderWidth-14))
                this.ui.plot.height(this.ui.plot.width()*0.41-80)
            }

            if (this.model.get('BLOBS') == 0) this.$el.find('.blobs').height(this.ui.plot.width()*0.41-80)
            
            var data = [{ data: this.model.get('PLOTS').FVC, label: 'Rfree vs. Cycle' },
                        { data: this.model.get('PLOTS').RVC, label: 'R vs. Cycle' }]
            var pl = $.extend({}, utils.default_plot, { series: { lines: { show: true }}})
            $.plot(this.ui.plot, data, pl)
            
        },
    
    })

})