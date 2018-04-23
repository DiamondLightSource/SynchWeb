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

    return Marionette.LayoutView.extend({
        template: _.template('<div class="dcap">Movie: <a href="#" class="button prev"><i class="fa fa-angle-left"></i></a><input type="text" name="movie" value="<%-IMAGENUMBER%>" /><a href="#" class="button next"><i class="fa fa-angle-right"></i></a></div><div class="mc dcap"></div><div class="ctf dcap"></div>'),
        regions: {
            rmc: '.mc',
            rctf: '.ctf',
        },

        ui: {
            mov: 'input[name=movie]',
        },

        events: {
            'click a.next': 'nextMovie',
            'click a.prev': 'prevMovie',
            'change @ui.mov': 'loadMovie',
        },

        templateHelpers: function() {
            return {
                IMAGENUMBER: this.imagenumber
            }
        },
        
        loadMovie: function(e) {
            this.fetch(parseInt(this.ui.mov.val()))
        },

        nextMovie: function(e) {
            e.preventDefault()
            var next = this.imagenumber + 1
            this.fetch(next)
            this.ui.mov.val(next)
        },

        prevMovie: function(e) {
            e.preventDefault()
            var prev = this.imagenumber - 1
            if (prev > 0) {
                this.fetch(prev)
                this.ui.mov.val(prev)
            }
        },

        initialize: function(options) {
            this.id = options.id
            this.imagenumber = 1
            this.mc = new MotionCorrection({ id: options.id, TYPE: 'Motion Correction' })
            this.ctf = new CTFCorrection({ id: options.id, TYPE: 'CTF' })

            this.listenTo(this.mc, 'error', this.mcReset)
            this.listenTo(this.ctf, 'error', this.ctfReset)
            this.fetch()
            this.render()
        },

        mcReset: function() {
            this.mc.clear().set({ id: this.id, TYPE: 'Motion Correction' }, { silent: true })
        },

        ctfReset: function() {
            this.ctf.clear().set({ id: this.id, TYPE: 'CTF' }, { silent: true })
        },

        fetch: function(n) {
            if (n) this.imagenumber = n
            this.mc.fetch({ data: { IMAGENUMBER: this.imagenumber } })
            this.ctf.fetch({ data: { IMAGENUMBER: this.imagenumber } })
            this.trigger('load:movie', n)
        },
        
        onRender: function() {
            this.rmc.show(new MotionCorrectionView({ model: this.mc }))
            this.rctf.show(new CTFCorrectionView({ model: this.ctf }))
            this.$el.slideDown()
        },

    })

})
