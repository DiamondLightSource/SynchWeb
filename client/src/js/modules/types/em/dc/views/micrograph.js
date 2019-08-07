define(['marionette',
        'views/imageviewer',
        'templates/types/em/dc/overview.html'
    ], function(Marionette, ImageViewer, template) {
    
    var Micrograph = ImageViewer.extend({
        template: template,
        
        initialize: function(options) {
            this.pm = options.pm
            this.apstatuses = options.apstatuses
            this.imagenumber = null
            this.listenTo(this.apstatuses, 'sync', this.findFirst)
        },

        findFirst: function() {
            var m = this.apstatuses.findWhere({ ID: this.pm.get('ID') })
            if (m) {
                _.every(m.get('MC'), function(v,i) {
                    if (!this.imagenumber) {
                        if (v == 1) {
                            this.imagenumber = i
                            this.loadMicrograph()
                            return
                        }
                    }
                }, this)
            }
        },

        setMicrograph: function(im) {
            if (!im) return
            this.imagenumber = im
            this.loadMicrograph()
        },

        loadMicrograph: function() {
            this.img.load(app.apiurl+'/em/mc/image/'+this.pm.get('ID')+'?IMAGENUMBER='+this.imagenumber)
            this.showProgressBar()
        }

    })

    return Micrograph

})