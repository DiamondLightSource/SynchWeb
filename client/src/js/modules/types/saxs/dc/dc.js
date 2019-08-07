define([
    'modules/types/gen/dc/dc',
    'modules/types/saxs/dc/datplot',
    'utils',
    'templates/types/saxs/dc/dc.html'], function(DCItemView, DatPlot, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        // imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.dd': utils.signHandler,
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },
        
    })

})