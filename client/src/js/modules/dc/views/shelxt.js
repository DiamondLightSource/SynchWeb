define([
    'marionette', 'templates/dc/dc_shelxt.html', 'utils', 'utils/xhrimage', 'jquery.mp'
], function(Marionette, template, utils, XHRImage) {
    
    return Marionette.View.extend({
        template: template,
        className: 'clearfix',
    
        ui: {
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
            if (this.model.get('BLOBS') > 0) {
                this.blob = new XHRImage()
                this.blob.onload = this.showBlob.bind(this)
                this.ui.blobs.addClass('pending')
                this.blob.load(app.apiurl+'/processing/downstream/images/'+this.model.get('AID'))
            }

            if (!app.mobile()) {
                this.ui.solutions.width(0.47*(this.options.holderWidth-14))
             }
        },
    
    })

})
