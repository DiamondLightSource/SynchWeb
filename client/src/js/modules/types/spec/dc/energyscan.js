define([
    'modules/types/spec/dc/dc',
    'modules/dc/views/distl', 
    'modules/types/spec/dc/attplot.js',
    'modules/nexus/views/scalars.js',
    'views/dialog',
    'templates/types/spec/dc/energyscan.html'], function(
        DCItemView, DCDISTLView, 
        AttachmentPlot, NexusScalarsPlot, 
        DialogView,
        template) {

    var SpecDCDISTLView = DCDISTLView.extend({
        numimg: false,
        clickable: true,
        hidden: []
    })

    return DCItemView.extend({
        template: template,
        plotView: SpecDCDISTLView,

        regions: {
            rplot: '.diffraction',
        },

        updateWAVELENGTH: function(value) {
            return value > 0 
                ? (6.62607004e-34 * 2.99792458e8 / (value * 1e-10) / 1.60218e-19 * 1e-3).toFixed(4)
                : 0
        },

        updateDCAC: function(value) {
            if (this.plot) this.plot.fetch()
            return value
        },

        showPlot: function() {
        },

        selectPoint: function(point) {
            app.dialog.show(new DialogView({ 
                title: 'Nexus Scalar Plot', 
                view: new NexusScalarsPlot({
                    id: this.model.get('ID'),
                    entry: point,
                }),
                autoSize: true,
            }))
        },

        getEntry: function() {
            return this.entry
        },

        setAdditional: function() {
            var data = []
            this.plot.setAdditionalData(data)
        },

        onShow: function() {
            DCItemView.__super__.onShow.call(this)
            
            this.plot = new AttachmentPlot({ id: this.model.get('ID') })
            this.rplot.show(this.plot)

            if (this.plotview) this.listenTo(this.plotview, 'plot:click', this.selectPoint)
        },
    })
})
