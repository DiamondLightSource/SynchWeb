define([
    'modules/types/gen/dc/dc',
    'modules/types/gen/dc/datplot',
    'modules/types/pow/dc/datplotlarge',
    'modules/types/gen/dc/imagestatusitem',
    'modules/dc/views/dccomments', 
    'utils',
    'templates/types/pow/dc/dc.html'], function(DCItemView, DatPlot, DatPlotLarge, DCImageStatusItem, DCCommentsView, utils, template) {

    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.assoc': 'associateSample',
            'click a.dd': utils.signHandler,
        },
        
        showPlot: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: '1D Plot', view: new DatPlotLarge({ parent: this.model }), autoSize: true }))
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },
        
    })

})