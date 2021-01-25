define(['marionette', 'views/log', 'templates/dc/dc_bigep.html', 'utils'], function(Marionette, LogView, template, utils) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        ui: {
            XDS: '.plot_shelx-XDS',
            DIALS: '.plot_shelx-DIALS',
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
        
        
        onShow: function() {
            var plots = this.model.get('SHELXC')['PLOTS']
            for (var ds in plots) {
                    if (app.mobile()) this.ui[ds].width(0.97*(this.options.holderWidth-14))
                    else {
                        this.ui[ds].width(0.47*(this.options.holderWidth-14))
                    }
                    var data = [
                        { data: plots[ds].DSIG, label: '&ltd"/sig&gt', yaxis: 1 },
                        { data: plots[ds].CC12, label: 'CC(1/2)', yaxis: 2 },
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
                    $.plot(this.ui[ds], data, pl)
            }
        },
    })
})