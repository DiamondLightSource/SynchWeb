define([
    'modules/dc/views/dc',
    'modules/types/gen/dc/datplot',
    'modules/types/gen/dc/assoc',
    'modules/types/gen/dc/imagestatusitem',
    'modules/dc/views/dccomments', 
    'utils',
    'templates/types/gen/dc/dc.html'], function(DCItemView, DatPlot, AssocSampleView, DCImageStatusItem, DCCommentsView, 
        utils, template) {

    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.assoc': 'associateSample',
            'click a.dd': utils.signHandler,
            'click a.attach': 'attachments',
        },

        associateSample: function(e) {
            e.preventDefault()
            app.dialog.show(new AssocSampleView({ model: this.model }))
            this.listenTo(app.dialog.currentView, 'sample:associated', this.updateSample, this)
        },

        updateSample: function() {
            var s = this.$el.find('.sample')
            console.log(s.length, this.$el.find('ul'))
            if (s.length) {
                var a = s.eq(0).find('a')
                a.text(this.model.get('SAMPLE')).attr('href', '/samples/sid/'+this.model.get('BLSAMPLEID'))

            } else {
                this.$el.find('ul').prepend('<li class="sample"><span class="wrap">Sample: <a href="/samples/sid/'+this.model.get('BLSAMPLEID')+'">'+this.model.get('SAMPLE')+'</a></span></li>')
            }
            
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