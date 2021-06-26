define([
    'modules/types/gen/dc/dc',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/downstream',
    'modules/types/saxs/dc/datplot',
    'utils',
    'templates/types/saxs/dc/dc.html'], function(DCItemView, APStatusItem, DCDownstreamView, DatPlot, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        apStatusItem: APStatusItem,
        
        events: {
            'click .holder h1.ap': 'loadAP',
            'click .diffraction': 'showDiff',
            'click a.dd': utils.signHandler,
            'click .holder h1.dp': 'loadAP',
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream') })
            } else this.ap.$el.slideToggle()
        },
        
    })

})