define([
    'modules/types/gen/dc/dc',
    'tpl!templates/types/tomo/dc/dc.html'], function(DCItemView, template) {

    return DCItemView.extend({
        template: template,
        plotView: null,
    })

})