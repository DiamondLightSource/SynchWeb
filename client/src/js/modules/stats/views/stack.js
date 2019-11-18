define(['marionette', 'modules/stats/models/pie', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.stack',
        'jquery.flot.tooltip',
], function(Marionette, Pie, utils, $) {
    
    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
                                               
        initialize: function(options) {
            this.model = new Pie(options)
            this.model.fetch()
                
            this.$el.css('opactiy', 0)
        },
        
        className: 'horizontal_stack',
        
          
        onRender: function() {
            if (this.model.get('data')) {
                var options = {
                    series: {
                        bars: {
                            horizontal: true,
                            show: true,
                        },
                        stack: true
                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: this.getTooltip.bind(this),
                    },
                    legend: {
                        show: false
                    },
                    grid: {
                        borderWidth: 0,
                        hoverable: true,
                    },
                    yaxis: {
                        max: 1,
                        ticks: [],
                    },
                    xaxis: {
                        ticks: []//[0,4,8,12,16,20,24]
                    },
                }
                
                var data = this.model.get('data')
                _.each(data, function(v, k) {
                    data[k] = parseFloat(v)
                })
                
                var d = [
                    { label: 'Startup', color: 'yellow', data: [[this.model.get('data').SUP,0]] },
                    { label: 'Data Collection', color: 'green', data: [[data.DCTIME,0]] },
                    { label: 'Auto Indexing', color: '#93db70', data: [[data.AITIME,0]] },
                    { label: 'Centring', color: 'cyan', data: [[data.CENTTIME,0]] },
                    { label: 'Energy Scans', color: 'orange', data: [[data.EDGE,0]] },
                    { label: 'Robot Actions', color: 'blue', data: [[data.R,0]] },
                    { label: 'Thinking', color: 'purple', data: [[data.T,0]] },
                    { label: 'Remaining', color: 'red', data: [[data.REM,0]] },
                    { label: 'Beam Dump', color: 'black', data: [[data.NOBEAM,0]] },
                    { label: 'Faults', color: 'grey', data: [[data.FAULT,0]] },
                ]
                
                $.plot(this.$el, d, options)
                this.$el.css('opacity', 1)
            }
        },
        
        getTooltip: function(lab, x, y, item) {
            return item.series.label+': '+x.toFixed(2)+'hrs'
            
        },
        
        onDestroy: function() {
            this.model.stop()
        },
        
  })       
       
})