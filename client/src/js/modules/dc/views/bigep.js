define(['marionette',
    'templates/dc/dc_bigep.html',
    'utils/xhrimage'], function(Marionette,
        template, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,

        ui: {
            thumb: '.thumb',
            image: '.bigep-images figure'
        },
                
        showThumbnail: function() {
            this.ui.thumb.attr('src', this.thumb.src)
            this.ui.image.removeClass('pending').addClass('loaded')
        },

        onDomRefresh: function() {
            this.thumb = new XHRImage()
            this.thumb.onload = this.showThumbnail.bind(this)
            this.thumb.load(app.apiurl+'/processing/downstream/images/' + this.model.get('AID'))
                
            if (!this.model.get('IMAGE')) this.ui.image.height(170)
        }
    })
})