define([
    'modules/dc/views/dc',
    'modules/types/gen/dc/datplot',
    'modules/types/gen/dc/imagestatusitem',
    'tpl!templates/types/gen/dc/dc.html'], function(DCItemView, DatPlot, DCImageStatusItem, template) {

    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
        },
        
        showPlot: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Dat Plot', view: new DatPlot({ parent: this.model }), autoSize: true }))
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },
        
        
    })

})