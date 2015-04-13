define(['marionette', 'views/pages',
    'jquery',
    'jquery.flot',
    'jquery.flot.stack',
    ], function(Marionette, Pages, $) {


    return Marionette.LayoutView.extend({
        template: _.template('<div class="page_wrap"></div><div class="legend clearfix"></div><div class="plot_container"><div id="visit_breakdown"></div></div>'),
        
        collectionEvents: {
            'change sync reset': 'doPlot',
        },
        
        regions: {
            pgs: '.page_wrap',
        },
        
        events: {
            'plotclick': 'showVisit',
        },
        
        showVisit: function(e, pos, item) {
            var x = this.plot.getXAxes()
            if (x.length && item) {
                
                console.log('visit', x[0], item.dataIndex)
                app.trigger('stats:show', x[0].ticks[item.dataIndex].label)
            }
        },
        
        initialize: function(options) {
            this.paginator = new Pages({ collection: options.collection })
        },
        
        onShow: function() {
            this.pgs.show(this.paginator)
            this.doPlot()
        },
        
            
        doPlot: function() {
            var ticks = this.collection.map(function(v,i) { return [i,app.prop+'-'+v.get('data').VISIT] })
            
            var options = {
                series: {
                  bars: {
                      show: true,
                      barWidth: .9,
                      align: "center"
                  },
                  stack: true
                },
                xaxis: {
                    ticks: ticks,
                },
                yaxis: {
                    min: 0,
                    max: 24.1,
                    ticks: [0,8,16,24]
                },
                grid: {
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                },
                legend: {
                    noColumns: 10,
                    container: this.$el.find('.legend'),
                },
                tooltip: true,
                tooltipOpts: {
                    content: this.getToolTip.bind(this),
                },
            }
            
            var types = {
                SUP: { color: 'yellow', label: 'Startup' },
                DCTIME: { color: 'green', label: 'Data Collections' },
                AITIME: { color: '#93db70', label: 'Auto Indexing' },
                CENTTIME: { color: 'cyan', label: 'Centring' },
                EDGE: { color: 'orange', label: 'Edge Scans' },
                R: { color: 'blue', label: 'Robot Actions' },
                FAULT: { color: 'grey', label: 'Faults' },
                NOBEAM: { color: 'black', label: 'No Beam' },
                T: { color: 'purple', label: 'Thinking' },
                REM: { color: 'red', label: 'Remaining' },
            }
            
            this.collection.each(function(v,i) {
                _.each(types, function(t,k) {
                    if (!t.data) t.data = []
                    t.data.push([i,parseFloat(v.get('data')[k])])
                        
                }, this)
            }, this)
            console.log(types,_.values(types))
            
            this.plot = $.plot(this.$el.find('#visit_breakdown'), _.values(types), options);
        },
        

        getToolTip: function(lab, x, y, item) {
            return item.series.label + ': ' + (item.datapoint[1]-item.datapoint[2]).toFixed(1) + 'hrs'
        },
        
        
        destroy: function() {
            this.plot.destroy()
        },

        
    })
    

})