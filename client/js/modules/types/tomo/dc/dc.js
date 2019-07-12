define([
    'modules/types/gen/dc/dc',
    'templates/types/tomo/dc/dc.html'], function(DCItemView, template) {

    return DCItemView.extend({
        template: template,
        plotView: null,
    })

})