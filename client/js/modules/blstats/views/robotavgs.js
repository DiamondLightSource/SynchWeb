define(['marionette', 'modules/blstats/models/robotavgs', 'jquery', 'jquery.flot'], function(Marionette, RobotAverages, $) {
    
    return Marionette.LayoutView.extend({
        template: false,
        
        modelEvents: {
            'change': 'render',
        },
        
        initialize: function(options) {
            this.plot = null
            this.$el.addClass('loading')
            this.model = new RobotAverages()
            this.model.fetch()
        },
        
        onRender: function() {
            if (!this.model.get('data')) return
            
            var ops = {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    ticks: this.model.get('ticks'),
                },
                grid: {
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: this.getToolTip.bind(this),
                }
            }
            
            var data = []
            _.each(this.model.get('data'), function(d,n) {
                data.push({ data: d, label: n })
            })

            this.plot = $.plot(this.$el, data, ops)
            this.$el.removeClass('loading')
        },
        
        getToolTip: function(label, x, y, item) {
            return item.datapoint[1] + 's'
        },

        getrids: function () {
            return this.model.get('rids')
        },
        
        onDestroy: function () {
            if (this.plot) this.plot.destroy()
        },
        
    })
    
})