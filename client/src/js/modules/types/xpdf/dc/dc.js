define([
    'modules/types/gen/dc/dc',
    'modules/types/gen/dc/datplot',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/downstream',
    'utils',
    'templates/types/xpdf/dc/dc.html'], function(DCItemView, DatPlot, APStatusItem, DCDownstreamView, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        apStatusItem: APStatusItem,
        
        events: {
            'click .holder h1.dp': 'loadAP',
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.dd': utils.signHandler,
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },

        loadAP: function() {
            if (!this.ap) {
              this.ap = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream') })
            } else this.ap.$el.slideToggle()
        },
    })

})
