define([
    'marionette', 'templates/dc/dc_shelxt.html', 'utils', 'utils/xhrimage', 'jquery.mp'
], function(Marionette, template, utils, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,
        className: 'clearfix',
    
        ui: {
            //plot: '.plot_dimple',
            solutions: '.solutions',
            blob: '.blobs img',
            blobs: '.blobs',
        },
        
        showBlob: function() {
            this.ui.blob.attr('src', this.blob.src).show()
            this.ui.blobs.addClass('loaded').removeClass('pending')
        },

        onDomRefresh: function() {
            this.ui.blobs.magnificPopup({
                delegate: 'a', type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                }
            })

            this.ui.blob.hide()
            console.log("is this thing on?");
            console.log(this.model);
            if (this.model.get('BLOBS') > 0) {
                this.blob = new XHRImage()
                this.blob.onload = this.showBlob.bind(this)
                this.ui.blobs.addClass('pending')
                this.blob.load(app.apiurl+'/processing/downstream/images/'+this.model.get('AID'))
            }

            if (app.mobile()) {
                //this.ui.plot.width(0.93*(this.options.holderWidth-14))
            } else {
              //this.ui.rstats.width(0.20*(this.options.holderWidth-14))
                this.ui.solutions.width(0.47*(this.options.holderWidth-14))
                //this.ui.solutions.height(this.ui.solutions.width()*0.41-80)
             }

            //this.ui.blobs.css('min-height', this.ui.plot.width()*0.41-80)
            
            //var data = [{ data: this.model.get('PLOTS').FVC, label: 'Rfree vs. Cycle' },
            //            { data: this.model.get('PLOTS').RVC, label: 'R vs. Cycle' }]
            //var pl = $.extend({}, utils.default_plot, { series: { lines: { show: true }}})
            //$.plot(this.ui.plot, data, pl)
            
        },
    
    })

})
