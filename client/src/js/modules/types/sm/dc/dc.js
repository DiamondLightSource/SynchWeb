define([
    'modules/dc/views/dc',
    'modules/dc/views/autointegration',
    'modules/types/sm/dc/views/apstatusitem'], function(DCItemView, DCAutoIntegrationView, APStatusItem) {

    return DCItemView.extend({
        apStatusItem: APStatusItem,

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCAutoIntegrationView({ id: this.model.get('ID'), el: this.$el.find('div.autoproc') })
            } else this.ap.$el.slideToggle()
        },
    })

})
