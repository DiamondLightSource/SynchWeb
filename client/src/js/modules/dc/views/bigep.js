define(['marionette',
    'utils',
    'templates/dc/dc_bigep.html',
    'utils/xhrimage'], function(Marionette,
        utils,
        template, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,

        ui: {
            thumb: '.thumb',
            image: '.bigep-images figure',
            plot: '.plot_bigep',
        },

        showThumbnail: function() {
            this.ui.thumb.attr('src', this.thumb.src)
            this.ui.image.removeClass('pending').addClass('loaded')
        },

        onDomRefresh: function() {
            this.thumb = new XHRImage()
            this.thumb.onload = this.showThumbnail.bind(this)
            this.thumb.load(app.apiurl+'/processing/downstream/images/' + this.model.get('AID'))
                
            if (!this.model.get('IMAGE')) this.ui.image.height(170)

            var plot = this.model.get('SHELXC')
            if (plot) {
                if (app.mobile()) this.ui.plot.width(0.97*(this.options.holderWidth-14))
                else {
                    this.ui.plot.width(0.30*(this.options.holderWidth-14))
                }
                var data = [
                    { data: plot.DSIG, label: '&ltd"/sig&gt', yaxis: 1 },
                    { data: plot.CC12, label: 'CC(1/2)', yaxis: 2 },
                ]
                var options = {
                    series: {
                        lines: { show: true }
                    },
                    xaxis: {
                        ticks: function (axis) {
                            var res = [], nticks = 6, step = (axis.max - axis.min) / nticks
                            for (i = 0; i <= nticks; i++) {
                                res.push(axis.min + i * step)
                            }
                            return res
                        },
                        tickFormatter: function (val, axis) {
                            return (1.0/Math.sqrt(val)).toFixed(axis.tickDecimals)
                        },
                        tickDecimals: 2
                    },
                    yaxes: [{
                        position: "left",
                        }, {
                        position: "right",
                        }
                    ]
                }
                var pl = $.extend({}, utils.default_plot, options)
                $.plot(this.ui.plot, data, pl)
            }
        }
    })
})