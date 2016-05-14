define(['marionette', 'views/log', 'tpl!templates/dc/dc_fastep.html', 'utils'], function(Marionette, LogView, template, utils) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        ui: {
            plot: '.plot_fastep',
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
        
        onDomRefresh: function() {
            if (app.mobile()) this.ui.plot.width(0.97*(this.options.holderWidth-14))
            else {
                this.ui.plot.width(0.47*(this.options.holderWidth-14))
            }
                    
            var data = [{ data: this.model.get('PLOTS').FOM, label: 'FOM' },
                        { data: this.model.get('PLOTS').CC, label: 'mapCC' }]
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
        },
    })

})