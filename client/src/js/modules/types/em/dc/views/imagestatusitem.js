define(['marionette',
        'utils',
        'utils/xhrimage',
        'jquery',
        'jquery.mp',
], function(Marionette, utils, XHRImage, $) {
       
    return Marionette.ItemView.extend({
        modelEvents: { 'change': 'render' },
        template: false,
      
        ui: {
            sn: '.mg img',
            sna: '.mg a',
            mg: '.mg',
            cap: 'figcaption',
        },
      
    
        initialize: function(options) {
            this.pm = options.pm

            this.listenTo(options.statuses, 'sync', this.getModel, this)
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
            this.imagenumber = null
            this.image = null
        },
        
        
        lazyLoad: function() {
            var th = 0
            
            inview = this.$el.find('.lazy').not('.enabled').filter(function() {
                return utils.inView($(this))
            })
            
            var self = this
            inview.each(function(j,i) {
                self.image = new XHRImage()
                self.image.onload = function() {
                    $(i).attr('src', this.src)
                    self.ui.cap.text('Micrograph '+self.imagenumber)
                    // Give small amount of time for the image to be replaced
                    setTimeout(function() {
                        $(i).addClass('show')
                    }, 100)
                }

                self.image.onprogress = self.onProgress.bind(self)
                $(i).addClass('enabled')
                self.image.load($(i).attr('data-src'))
            })
        },

        onProgress: function(pc) {
            this.ui.cap.text('Loading Micrograph '+this.imagenumber+ ' '+pc+'%')
        },
        
        getModel: function() {
            var m = this.getOption('statuses').findWhere({ ID: this.pm.get('ID') })
            if (m != this.model) {
                this.undelegateEvents()
                this.model = m
                this.delegateEvents()
                if (this.model) this.render()
            }
        },
      
        show: function(imagenumber) {
            if (this.image) {
                this.imagenumber = imagenumber
                this.image.load(app.apiurl+'/em/mc/image/'+this.model.get('ID')+'?IMAGENUMBER='+this.imagenumber)
                this.ui.sna.attr('href', app.apiurl+'/em/mc/image/'+this.model.get('ID')+'?IMAGENUMBER='+this.imagenumber)
            }
        },


        onRender: function() {
            console.log('render im status', this.getOption('TYPE'))
            var id = this.model.get('ID')
        
            _.every(this.model.get('MC'), function(v,i) {
                if (!this.imagenumber) {
                    if (v == 1) {
                        this.imagenumber = i
                        this.ui.sn.attr('data-src', app.apiurl+'/em/mc/image/'+this.model.get('ID')+'?IMAGENUMBER='+this.imagenumber).addClass('lazy')
                        this.ui.sna.attr('href', app.apiurl+'/em/mc/image/'+this.model.get('ID')+'?IMAGENUMBER='+this.imagenumber)
                        return
                    }
                }
            }, this)

            this.ui.mg.magnificPopup({
                delegate: 'a', type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                }
            })

            this.lazyLoad($(window))
        },
        
        onDestroy: function() {
            console.log('destroying image status view')
        },
    })
       
})