define(['marionette', 
    'modules/dc/views/downstreambase',
    'templates/dc/dc_fastep.html', 'utils'], function(Marionette, DownstreamBase,
        template, utils) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        ui: {
            plot: '.plot_fastep',
        },
        
        onDomRefresh: function() {
            if (app.mobile()) this.ui.plot.width(0.97*(this.options.holderWidth-14))
            else {
                this.ui.plot.width(0.47*(this.options.holderWidth-14))
            }

            var plotsData = this.model.get('PLOTS');
            if (plotsData && Array.isArray(plotsData.FOM) && plotsData.FOM.length > 0 && Array.isArray(plotsData.CC) && plotsData.CC.length > 0) {
                var data = [{ data: plotsData.FOM, label: 'FOM' },
                            { data: plotsData.CC, label: 'mapCC' }]
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
                    }
                }
                var pl = $.extend({}, utils.default_plot, options)
                $.plot(this.ui.plot, data, pl)
            }
        },
    })

})
