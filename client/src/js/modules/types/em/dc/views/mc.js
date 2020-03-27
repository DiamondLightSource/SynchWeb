define(['marionette', 
    'views/log', 
    'modules/types/em/dc/views/drift',
    'templates/types/em/dc/dc_mc.html', 
    'utils', 
    'utils/xhrimage',
    'jquery.mp'
    ], function(Marionette, LogView,
        DriftPlot,
        template, utils, XHRImage) {
    
    return Marionette.ItemView.extend({
        getTemplate: function() {
            return this.model.get('MOTIONCORRECTIONID') ? template : '<p>No Motion Correction for this movie</p>'
        },
        modelEvents: { 'change': 'render' },
        className: 'clearfix',
    
        ui: {
            plot: '.distl',
        },
        
        
        events: {
            'click .logf': 'showLog',
            'click .dll': utils.signHandler,
        },

        templateHelpers: function() {
            return {
                APIURL: app.apiurl,
            }
        },


        showLog: function(e) {
            e.preventDefault()
            var url = $(e.target).attr('href')
            var self = this
            utils.sign({
                url: url,
                callback: function(resp) {
                    app.dialog.show(new LogView({ title: self.model.get('TYPE') + ' Log File', url: url+'?token='+resp.token }))
                }
            })
        },
        
        onRender: function() {
            var w = 0.175*$(window).width()*0.95
            var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
            $('.distl,.diffraction', this.$el).height(h*0.7)

            if (this.model.get('FFTFULLPATH') > 0) {
                this.fft = new XHRImage()
                this.fft.onload = this.showFFT.bind(this)
                this.fft.load(app.apiurl+'/em/mc/fft/image/'+this.model.get('DATACOLLECTIONID')+'/n/'+this.model.get('IMAGENUMBER'))
            }

            if (this.model.get('FFTCORRECTEDFULLPATH') > 0) {
                this.fft2 = new XHRImage()
                this.fft2.onload = this.showFFT2.bind(this)
                this.fft2.load(app.apiurl+'/em/mc/fft/image/'+this.model.get('DATACOLLECTIONID')+'/n/'+this.model.get('IMAGENUMBER')+'/t/2')
            }

            this.plotview = new DriftPlot({ id: this.model.get('DATACOLLECTIONID'), imagenumber: this.model.get('IMAGENUMBER'), el: this.$el.find('.distl') })
        },

        showFFT: function() {
            this.$el.find('.fft img').attr('src', this.fft.src).addClass('show')
            this.$el.find('.fft').magnificPopup({
                delegate: 'a', type: 'image',
            })
        },

        showFFT2: function() {
            this.$el.find('.fft2 img').attr('src', this.fft2.src).addClass('show')
            this.$el.find('.fft2').magnificPopup({
                delegate: 'a', type: 'image',
            })
        },
    
    })

})