define(['marionette', 'views/log', 'tpl!templates/dc/dc_fastep.html', 'utils'], function(Marionette, LogView, template, utils) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        ui: {
            plot: '.plot_fastep',
        },
        
        
        events: {
            'click .logf': 'showLog',
        },
            
        showLog: function(e) {
            e.preventDefault()
            app.dialog.show(new LogView({ title: this.model.get('TYPE') + ' Log File', url: $(e.target).attr('href') }))
            return false
        },
        
        onDomRefresh: function() {
            if (app.mobile()) this.ui.plot.width(0.97*(this.options.holderWidth-14))
            else {
                this.ui.plot.width(0.47*(this.options.holderWidth-14))
            }
                    
            var data = [{ data: this.model.get('PLOTS').FOM, label: 'FOM' },
                        { data: this.model.get('PLOTS').CC, label: 'mapCC' }]
            var pl = $.extend({}, utils.default_plot, { series: { lines: { show: true }}})
            $.plot(this.ui.plot, data, pl)
        },
    })

})