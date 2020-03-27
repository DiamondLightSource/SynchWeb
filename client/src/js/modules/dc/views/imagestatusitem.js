define(['marionette',
        'utils',
        'utils/xhrimage',
        'jquery',
        'jquery.mp'
], function(Marionette, utils, XHRImage, $) {
       
    return Marionette.ItemView.extend({
        modelEvents: { 'change': 'render' },
        template: false,
      
        ui: {
            di: '.diffraction img',
            sn: '.snapshots img',
            sns: '.snapshots',
        },
      
    
        initialize: function(options) {
            this.listenTo(options.statuses, 'sync', this.getModel, this)
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },
        
        
        lazyLoad: function() {
            var th = 0
            
            inview = this.$el.find('.lazy').not('.enabled').filter(function() {
                return utils.inView($(this))
            })
            
            inview.each(function(j,i) {
                var image = new XHRImage()
                image.onload = function() {
                    $(i).attr('src', this.src)
                    // Give small amount of time for the image to be replaced
                    setTimeout(function() {
                        $(i).addClass('show')
                    }, 100)
                }
                $(i).addClass('enabled')
                image.load($(i).attr('data-src'))

                // $(i).attr('src', $(i).attr('data-src')).addClass('enabled').load(function() {
                //     $(this).addClass('show')
                // })
            })
        },
        
        getModel: function() {
            var m = this.getOption('statuses').findWhere({ ID: this.getOption('ID') })
            if (m != this.model) {
                this.undelegateEvents()
                this.model = m
                this.delegateEvents()
                if (this.model) this.render()
            }
        },
      
        onRender: function() {
            console.log('render im status', this.getOption('TYPE'))
            var id = this.model.get('ID')
        
            if (this.model.get('DI')) this.ui.di.attr('data-src', app.apiurl+'/image/diff/id/'+id).addClass('lazy')
                                                         
            if (this.model.get('SNS').length) {
                if (this.model.get('SN')) this.ui.sn.attr('data-src', app.apiurl+'/image/id/'+id).addClass('lazy')
        
                var sns = ''
                for (var i = 1; i < this.model.get('SNS').length; i++) {
                    if (this.model.get('SNS')[i]) {
                        sns += ('<a href="'+app.apiurl+'/image/id/'+id+'/f/1/n/'+(i+1)+'" title="Crystal Snapshot '+(i+1)+'"></a>')
                    }
                }
           
                if (this.ui.sns.find('a').length == 1) this.ui.sns.append(sns)
                this.ui.sns.magnificPopup({
                    delegate: 'a', type: 'image',
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                    }
                })
            }
            
            this.lazyLoad($(window))
        },
        
        onDestroy: function() {
            console.log('destroying image status vuew')
        },
    })
       
})