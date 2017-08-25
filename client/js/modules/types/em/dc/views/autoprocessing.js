define(['marionette',
    'views/tabs',
    'modules/types/em/models/motioncorrection',
    'modules/types/em/models/ctf',
    'modules/types/em/dc/views/mc',
    'modules/types/em/dc/views/ctf',
    'utils'], function(Marionette, TabView, 
        MotionCorrection, CTFCorrection, 
        MotionCorrectionView, CTFCorrectionView,
        utils) {
       
    var EmptyCorrectionView = Marionette.ItemView.extend({
        template: _.template('<p>No Motion Correction for this movie')
    })

    var EmptyCTFView = Marionette.ItemView.extend({
        template: _.template('<p>No CTF Correction for this movie')
    })


    return Marionette.LayoutView.extend({
        template: _.template('<div class="mc dcap"></div><div class="ctf dcap"></div>'),
        regions: {
            rmc: '.mc',
            rctf: '.ctf',
        },
        
        initialize: function(options) {
            this.imagenumber = 1
            this.mc = new MotionCorrection({ id: options.id, TYPE: 'Motion Correction' })
            this.ctf = new CTFCorrection({ id: options.id, TYPE: 'CTF' })

            this.listenTo(this.mc, 'sync error', this.mcRender)
            this.listenTo(this.ctf, 'sync error', this.ctfRender)
            this.render()
        },

        fetch: function(n) {
            if (n) this.imagenumber = n
            this.mc.fetch({ data: { IMAGENUMBER: this.imagenumber } })
            this.ctf.fetch({ data: { IMAGENUMBER: this.imagenumber } })
        },
        
        onRender: function() {
            console.log('render ap em')
            this.fetch()
            this.$el.slideDown()
        },

        mcRender: function() {
            this.rmc.show(this.mc.get('MOTIONCORRECTIONID') ? new MotionCorrectionView({ model: this.mc }) : new EmptyCorrectionView())
        },

        ctfRender: function() {
            this.rctf.show(this.ctf.get('CTFID') ? new CTFCorrectionView({ model: this.ctf }) : new EmptyCTFView())
        }

    })

})
