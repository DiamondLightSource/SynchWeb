define(['marionette',
    'modules/blstats/views/robotavgs',
    'modules/blstats/collections/roboterrors',
    'modules/blstats/collections/robottotals',
    'modules/blstats/views/roboterrors',
    'modules/blstats/views/robottotals',
    'modules/blstats/views/robottotalplot',
    
    ], function(Marionette, RobotAveragesView, RobotErrors, RobotTotals, RobotErrorsView, RobotTotalsView, RobotTotalsPlot) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Robot Averages</h1><div class="plot_container"><div id="avg_time"></div></div><div class="wrapper"></div><h1>Totals</h1><div class="plot_container"><div id="tots" style="height:250px"></div></div><div class="totals"></div>'),
        
        regions: {
            wrap: '.wrapper',
            tot: '.totals',
        },
        
        ui: {
            plot: '#avg_time',
            tot: '#tots',
        },
        
        events: {
            'click .legend table tr': 'filterBL',
            'plotclick #avg_time': 'filterRun',
        },

        filterRun: function (e, pos, item) {
            var rx = item.datapoint[0]
            var run = item.series.xaxis.ticks[rx].label
            var runid = this.plot.getrids()[run]

            this.roboterrors.queryParams.bl = item.series.label
            this.roboterrors.fetch()

            this.robottotals.queryParams.bl = item.series.label
            this.robottotals.queryParams.run = runid
            this.robottotals.fetch()
        },

        filterBL: function(e) {
            var bl = $(e.currentTarget).children('td.legendLabel').html()
            console.log(bl, e)
            
            this.roboterrors.queryParams.bl = bl
            this.roboterrors.fetch()

            this.robottotals.queryParams.bl = bl
            this.robottotals.fetch()
        },
        
        initialize: function(options) {
            this.roboterrors = new RobotErrors()
            this.roboterrors.fetch()

            this.robottotals = new RobotTotals()
            this.robottotals.fetch()
        },
        
        onShow: function() {
            this.plot = new RobotAveragesView({ el : this.ui.plot })
            this.wrap.show(new RobotErrorsView({ collection: this.roboterrors }))

            this.plot2 = new RobotTotalsPlot({ el: this.ui.tot, collection: this.robottotals })
            this.plot2.render()
            this.tot.show(new RobotTotalsView({ collection: this.robottotals }))
        },
        
    })
    
})