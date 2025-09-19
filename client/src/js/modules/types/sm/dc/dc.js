define([
    'modules/dc/views/dc',
    'modules/dc/views/autointegration',
    'modules/types/sm/dc/views/apstatusitem',
    'templates/types/sm/dc/dc.html'], function(DCItemView, DCAutoIntegrationView, APStatusItem, Template) {

    return DCItemView.extend({
        apStatusItem: APStatusItem,
        template: Template,

        setProcessingVars: function() {},

    })

})
