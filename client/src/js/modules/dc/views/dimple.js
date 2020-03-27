define(['marionette', 'views/log', 'templates/dc/dc_dimple.html', 'utils', 'utils/xhrimage', 'jquery.mp'], function(Marionette, LogView, template, utils, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        className: 'clearfix',
    
        ui: {
            plot: '.plot_dimple',
        },
        
        
        events: {
            'click .logf': 'showLog',
            'click .dll': utils.signHandler,
        },

        showLog: function(e) {
            e.preventDefault()
            var url = $(e.target).attr('href')
            var self = this
            utils.sign({
                url: url,
                callback: function(resp) {
                    app.dialog.show(new LogView({ title: self.model.get('TYPE') + ' Log File', url: url+'?token='+resp.token }))
                }
            })
        },
        
        showBlob: function() {
            this.$el.find('.blobs img').attr('src', this.blob.src)
        },

        onDomRefresh: function() {
            console.log('showing dimple')
            this.$el.find('.blobs').magnificPopup({
                delegate: 'a', type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                }
            })
            
            if (this.model.get('BLOBS') > 0) {
                this.blob = new XHRImage()
                this.blob.onload = this.showBlob.bind(this)
                this.blob.load(app.apiurl+'/image/dimp/id/'+this.getOption('DCID'))
            }

            if (app.mobile()) this.ui.plot.width(0.93*(this.options.holderWidth-14))
            else {
                this.ui.plot.width(0.67*(this.options.holderWidth-14))
                this.ui.plot.height(this.ui.plot.width()*0.41-80)
            }
            
            console.log(this.ui.plot)
            
            var data = [{ data: this.model.get('PLOTS').FVC, label: 'Rfree vs. Cycle' },
                        { data: this.model.get('PLOTS').RVC, label: 'R vs. Cycle' }]
            var pl = $.extend({}, utils.default_plot, { series: { lines: { show: true }}})
            $.plot(this.ui.plot, data, pl)
            
        },
    
    })

})