define([
    'modules/types/em/dc/views/imagestatusitem',
    'modules/types/gen/dc/dc',
    'modules/types/em/dc/views/apstatusitem',
    'modules/types/em/dc/views/overview2',
    'modules/types/em/dc/views/micrograph',
    'modules/types/em/dc/views/autoprocessing',
    'templates/types/em/dc/dc.html'], function(ImageStatusItem, DCItemView, 
        APStatusItem, Overview, Micrograph, 
        EMAutoProcessingView, 
        template) {

    var EMDCView = DCItemView.extend({
        template: template,
        plotView: null,
        apStatusItem: APStatusItem,

        ui: {
            temp: 'span.temp',
            exp: 'i.expand',
            cc: '.dcc',
            rp: 'a.reprocess',
        },

        regions: {
            mg: '.mg',
        },


        events: {
            'click .holder h1.ap': 'loadAP',
            'click .holder h1.dp': 'loadDP',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click li.sample a': 'setProposal',
            'click @ui.exp': 'expandPath',
            'click a.attach': 'attachments',
        },

        initialize: function(options) {
            EMDCView.__super__.initialize.apply(this,options)

            this.m = 9.10938356e-31
            this.h = 6.62607004e-34
            this.c = 2.99792458e8
            this.e = 1.60217662e-19

            this.model.set('KV', this.l2kV(this.model.get('WAVELENGTH')))
            this.overview = new Overview({ pm: this.model, imagestatuses: this.getOption('imagestatuses'), apstatus: this.getOption('apstatuses') })
            this.listenTo(this.overview, 'current', this.loadPoint, this)
        },


        onShow: function() {
            EMDCView.__super__.onShow.apply(this)
            this.imagestatus = new ImageStatusItem({ pm: this.model, statuses: this.getOption('apstatuses'), el: this.$el })
        },


        onDomRefresh: function() {
            this.overview.triggerMethod('dom:refresh')
        },  

        loadPoint: function(point) {
            if (point) this.imagestatus.show(point)
            if (this.ap) {
                this.ap.fetch(point)
            }
        },


        loadAP: function(e) {
            if (!this.ap) {
                this.ap = new EMAutoProcessingView({ id: this.model.get('ID'), el: this.$el.find('div.autoproc') })
                this.listenTo(this.ap, 'load:movie', this.imagestatus.show.bind(this.imagestatus))
            } else this.ap.$el.slideToggle()
        },

        // kV to lambda (in A)
        kV2l: function(kV) {
            var U = kV*1e3
            return (this.h/Math.sqrt(2*this.m*this.e*U+(Math.pow(this.e*U/this.c,2))))*1e10
        },


        // lambda (in A) to kV
        l2kV: function(l) {
            return (( (-2*this.m*this.e) + Math.sqrt(Math.pow(2*this.m*this.e,2)+4*Math.pow(this.e*this.h/(this.c*l*1e-10),2)) ) / ( 2 * Math.pow(this.e/this.c,2) )/1000).toFixed(0)
        },

    })

    return EMDCView

})
