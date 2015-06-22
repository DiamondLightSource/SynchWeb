define([
    'modules/types/gen/dc/dc',
    'modules/types/em/dc/views/drift',
    'modules/types/em/dc/views/apstatusitem',
    'tpl!templates/types/em/dc/dc.html'], function(DCItemView, DriftPlot, APStatusItem, template) {

    return DCItemView.extend({
        template: template,
        plotView: DriftPlot,
        apStatusItem: APStatusItem,
    })

})