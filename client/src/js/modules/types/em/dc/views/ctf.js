define(['marionette', 
    'views/log', 
    'templates/types/em/dc/dc_ctf.html', 
    'utils', 
    'utils/xhrimage',
    'jquery.mp'
    ], function(Marionette, LogView, template, utils, XHRImage) {
    
    return Marionette.ItemView.extend({
        getTemplate: function() {
            return this.model.get('CTFID') ? template : '<p>No CTF Correction for this movie</p>'
        },
        modelEvents: { 'change': 'render' },
        className: 'clearfix', 
        
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
            $('.diffraction', this.$el).height(h*0.8)
            console.log('showing ctf')

            if (this.model.get('FFTTHEORETICALFULLPATH') > 0) {
                this.fft = new XHRImage()
                this.fft.onload = this.showFFT.bind(this)
                this.fft.load(app.apiurl+'/em/ctf/image/'+this.model.get('DATACOLLECTIONID')+'/n/'+this.model.get('IMAGENUMBER'))
            }
        },


        showFFT: function() {
            this.$el.find('.fft img').attr('src', this.fft.src).addClass('show')
            this.$el.find('.fft').magnificPopup({
                delegate: 'a', type: 'image',
            })
        },
    
    })

})