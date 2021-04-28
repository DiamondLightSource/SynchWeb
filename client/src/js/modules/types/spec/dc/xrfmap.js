define([
    'utils/editable',
    'modules/types/spec/dc/dc',
    'modules/nexus/views/spectra',
    'modules/dc/views/gridplot',
    'templates/types/spec/dc/xrfmap.html'], function(
        Editable, DCItemView, NexusSpectraPlot, GridPlot, template) {

    return DCItemView.extend({
        template: template,
        plotView: null,

        ui: {
            im: 'div.image',
            stepx: 'span.stepx',
            stepy: 'span.stepy',
            boxx: 'span.boxx',
            boxy: 'span.boxy',
            val: '.val',
            img: '.img',

            exp: 'i.expand',
            temp: 'span.temp',
            cc: '.dcc',
        },

        regions: {
            rplot: '.diviewer',
        },

        updateWAVELENGTH: function(value) {
            return value > 0 
                ? (6.62607004e-34 * 2.99792458e8 / (value * 1e-10) / 1.60218e-19 * 1e-3).toFixed(4)
                : 0
        },

        initialize: function() {
            this.gridplot = new GridPlot({ 
                onGridFetch: this.updateGridPromise.bind(this),
                BL: this.model.get('BL'), 
                ID: this.model.get('ID'), 
                NUMIMG: this.model.get('NUMIMG'), 
                parent: this.model, 
                imagestatuses: this.getOption('imagestatuses'), 
                xfm: true, 
                snapshot: 0, 
                colormap: 'viridis',
                padMax: false,
            })
            this.listenTo(this.gridplot, 'current', this.loadMCA, this)
        },

        loadMCA: function(number, x, y, z, val) {
            this.ui.val.text(val)
            this.ui.img.text(number+1)
            this.spectraPlot.selectPoint(number)
        },

        updateGridPromise: function() {
            this.gridplot.gridPromise().done(this.showBox.bind(this))
        },

        onShow: function() {
            DCItemView.__super__.onShow.call(this)
            
            this.ui.im.append(this.gridplot.render().$el)

            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('COMMENTS', 'text')

            this.updateGridPromise()
            this.spectraPlot = new NexusSpectraPlot({ id: this.model.get('ID') })
            this.rplot.show(this.spectraPlot)
        },


        showBox: function() {
            var gi = this.gridplot.gridInfo()
            this.ui.boxx.text((gi.get('DX_MM')*1000).toFixed(0))
            this.ui.boxy.text((gi.get('DY_MM')*1000).toFixed(0))

            this.ui.stepx.text(gi.get('STEPS_X'))
            this.ui.stepy.text(gi.get('STEPS_Y'))
        },

        onDestroy: function() {
            this.gridplot.destroy()
        },

        onDomRefresh: function() {
          this.gridplot.triggerMethod('dom:refresh')
          this.spectraPlot.triggerMethod('dom:refresh')
        }, 
    })

})