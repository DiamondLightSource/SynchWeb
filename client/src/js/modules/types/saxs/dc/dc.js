define([
    'modules/types/gen/dc/dc',
    'modules/types/saxs/dc/datplot',
    'modules/types/saxs/dc/views/autointegration',
    'utils',
    'templates/types/saxs/dc/dc.html'], function(DCItemView, DatPlot, DCAutoIntegrationView, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        // imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .holder h1.ap': 'loadAP',
            'click .diffraction': 'showDiff',
            'click a.dd': utils.signHandler,
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCAutoIntegrationView({ id: this.model.get('ID'), el: this.$el.find('div.autoproc') })
            } else this.ap.$el.slideToggle()
        },
        
    })

})