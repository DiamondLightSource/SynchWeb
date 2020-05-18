define([
    'modules/types/gen/dc/dc',
    'templates/types/spec/dc/dc.html'], function(DCItemView, template) {

    return DCItemView.extend({
        template: template,
    })
})
