define(['views/dialog',
    'utils/xhrimage',
    'modules/imaging/collections/inspectionimages',
    ], function(DialogView,
        XHRImage,
        InspectionImages) {

    return DialogView.extend({
        template: '<div><ul class="images"></ul></div>',

        ui: {
            images: '.images',
        },

        initialize: function(options) {
            // disable scrolling on the main page
            $('body').addClass('dialog-open')
            this.inspectionimages = new InspectionImages()
            this.inspectionimages.queryParams.iid = options.CONTAINERINSPECTIONID
            this.inspectionimages.queryParams.sort_by = 'LOCATION'
        },

        inspectionLoaded: function() {
            var self = this
            
            this.observer = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = $(entry.target)
                        let im = new XHRImage()
                        im.load(img.data('src'), function(loadedImage) {
                            img.attr('src', loadedImage.src)
                        })
                        observer.unobserve(entry.target)
                    }
                })
            })

            this.inspectionimages.each(function(inspectionimage) {
                let locationEl = $('<li></li>').text(inspectionimage.get('LOCATION'))

                let imageEl = $('<img>').css('min-height', '400px')
                    .data('src', app.apiurl + '/imaging/inspection/image/' + inspectionimage.get('BLSAMPLEIMAGEID') + '?f=1')

                locationEl.append(imageEl)
                self.ui.images.append(locationEl)
                self.observer.observe(imageEl[0])
            })
        },

        onRender: function() {
            this.inspectionimages.fetch().done(this.inspectionLoaded.bind(this))
        },

        closeDialog: function(e) {
            DialogView.prototype.closeDialog.apply(this, arguments)
            this.destroy()
        },
        
        onDestroy: function() {
            // re-enable scrolling on the main page
            $('body').removeClass('dialog-open')
            if (this.observer) {
                this.observer.disconnect()
            }
        },
    })

})
