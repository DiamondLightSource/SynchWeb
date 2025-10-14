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
            const loadDelay = 200 // milliseconds
            this.imageTimers = new Map() // Track timers per image

            this.observer = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    const img = $(entry.target)

                    if (entry.isIntersecting) {
                        // Start a delayed load
                        const timerId = setTimeout(() => {
                            let im = new XHRImage()
                            im.load(img.data('src'), function(loadedImage) {
                                img.attr('src', loadedImage.src)
                            })
                            observer.unobserve(entry.target) // Unobserve after loading
                            self.imageTimers.delete(entry.target)
                        }, loadDelay)

                        // Store timer so we can cancel if needed
                        self.imageTimers.set(entry.target, timerId)
                    } else {
                        // No longer visible: cancel pending load if exists
                        const timerId = self.imageTimers.get(entry.target)
                        if (timerId) {
                            clearTimeout(timerId)
                            self.imageTimers.delete(entry.target)
                        }
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

            // Cancel all pending image timers
            if (this.imageTimers) {
                for (const timer of this.imageTimers.values()) {
                    clearTimeout(timer)
                }
                this.imageTimers.clear()
            }
        },
    })

})
