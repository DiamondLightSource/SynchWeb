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
            'click .diffraction': 'showDiff',
            'click a.dd': utils.signHandler,
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },
        
    })

})