define([
    'modules/dc/views/dc',
    'modules/dc/views/autointegration',
    'modules/types/sm/dc/views/apstatusitem',
    'templates/types/sm/dc/dc.html'], function(DCItemView, DCAutoIntegrationView, APStatusItem, Template) {

    return DCItemView.extend({
        apStatusItem: APStatusItem,
        template: Template,

        setProcessingVars: function() {},

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCAutoIntegrationView({ id: this.model.get('ID'), dcPurgedProcessedData: this.model.get('PURGEDPROCESSEDDATA'), el: this.$el.find('div.autoproc') })
            } else this.ap.$el.slideToggle()
        },
    })

})
