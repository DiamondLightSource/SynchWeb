define([
    'marionette', 'templates/dc/dc_ligandfit.html', 'utils', 'utils/xhrimage'
], function(Marionette, template, utils, XHRImage) {

    return Marionette.ItemView.extend({
        template: template,
        className: 'clearfix',

        ui: {
            rstats: '.rstats',
            blob: '.map img',
        },

        events: {
            'click a.mapdl': utils.signHandler,
        },

        setMapButton: function(mapButtonElement) {
            if (mapButtonElement) {
                this.ui.mapbtn = mapButtonElement
                this.ui.mapbtn.attr('href', app.apiurl+'/download/ap/attachments/'+this.model.get('MODEL_APPAID')+'/dl/2')
                this.ui.mapbtn.on('click', utils.signHandler)
            }
        },

        hideMapButton: function(mapButtonElement) {
            if (mapButtonElement) {
                this.ui.mapbtn = mapButtonElement
                this.ui.mapbtn.hide()
            }
        },

        showBlob: function() {
            this.ui.blob.attr('src', this.blob.src).show()
        },

        onDomRefresh: function() {
            this.ui.blob.hide()
            if (this.model.get('BLOBS') > 0) {
                this.blob = new XHRImage()
                this.blob.onload = this.showBlob.bind(this)
                this.blob.load(app.apiurl+'/processing/downstream/images/'+this.model.get('AID'))
            }

            if (this.model.get('MODEL_APPAID')) {
                this.setMapButton(this.options.mapButton)
            } else {
                this.hideMapButton(this.options.mapButton)
            }

            if (!app.mobile()) {
                this.ui.rstats.width('68%')
            }
        },
    })
})
