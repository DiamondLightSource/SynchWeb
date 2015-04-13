define(['marionette', 'jquery', 'jquery.flot'], function(Marionette, $) {
    
    return Marionette.LayoutView.extend({
        template: false,
        
        collectionEvents: {
            'sync': 'render',
        },
        
        initialize: function(options) {
            this.plot = null
            this.$el.addClass('loading')
        },
        
        onRender: function() {
            console.log('rendering tplot', this.collection)
            if (!this.collection.length) return
            
            var ticks = []
            var data = []
            this.collection.each(function(m,i) {
                if (m.get('VIS') == 'TOTAL') return
                data.push([this.collection.length-i, parseFloat(m.get('AVGT'))])
                ticks.push([this.collection.length-i, m.get('VIS')])
            }, this)

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
                    ticks: ticks,
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

            this.plot = $.plot(this.$el, [data], ops)
            this.$el.removeClass('loading')
        },
        
        getToolTip: function(label, x, y, item) {
            return item.datapoint[1] + 's'
        },
        
        onDestroy: function () {
            if (this.plot) this.plot.destroy()
        }
        
    })
    
})