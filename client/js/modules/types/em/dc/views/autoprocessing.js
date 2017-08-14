define(['marionette',
    'views/tabs',
    'modules/types/em/models/motioncorrection',
    'modules/types/em/models/ctf',
    'modules/types/em/dc/views/mc',
    'modules/types/em/dc/views/ctf',
    'utils',
    'tpl!templates/types/em/dc/dc_autoproc.html'], function(Marionette, TabView, 
        MotionCorrection, CTFCorrection, 
        MotionCorrectionView, CTFCorrectionView,
        utils, template) {
       

    return Marionette.LayoutView.extend({
        template: _.template('<div class="mc"></div><div class="ctf"></div>'),
        regions: {
            rmc: '.mc',
            rctf: '.ctf',
        },
        
        initialize: function(options) {
            this.imagenumber = 1
            this.mc = new MotionCorrection({ id: options.id, TYPE: 'Motion Correction' })
            this.ctf = new CTFCorrection({ id: options.id, TYPE: 'CTF' })
            this.collection = new Backbone.Collection([this.mc, this.ctf])

            this.ready = []
            this.ready.push(this.mc.fetch({ data: { IMAGENUMBER: this.imagenumber } }))
            this.ready.push(this.ctf.fetch({ data: { IMAGENUMBER: this.imagenumber } }))

            $.when.apply($, this.ready).done(this.render.bind(this))
        },

        fetch: function(n) {
            if (n) this.imagenumber = n
            this.mc.fetch({ data: { IMAGENUMBER: this.imagenumber } })
            this.ctf.fetch({ data: { IMAGENUMBER: this.imagenumber } })
        },
        
        onRender: function() {
            this.rmc.show(new MotionCorrectionView({ model: this.mc }))
            this.rctf.show(new CTFCorrectionView({ model: this.ctf }))
            this.$el.slideDown()
        },
    })

})
