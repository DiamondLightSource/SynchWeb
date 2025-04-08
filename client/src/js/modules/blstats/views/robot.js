define(['marionette',
    'modules/blstats/views/robotavgs',
    'modules/blstats/collections/roboterrors',
    'modules/blstats/collections/robottotals',
    'modules/blstats/views/roboterrors',
    'modules/blstats/views/robottotals',
    'modules/blstats/views/robottotalplot',
    'utils'
    
    ], function(Marionette, RobotAveragesView, RobotErrors, RobotTotals, RobotErrorsView, RobotTotalsView, RobotTotalsPlot, utils) {
    
    return Marionette.View.extend({
        className: 'content',
        template: _.template('<h1>Robot Averages</h1><div class="plot_container"><div id="avg_time"></div></div><a href="#" class="button download"><i class="fa fa-download"></i> Download</a><div class="wrapper"></div><h1>Totals</h1><div class="plot_container"><div id="tots" style="height:250px"></div></div><div class="totals"></div>'),
        
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
            'click a.download': 'downloadData',
        },

        downloadData: function(e) {
            e.preventDefault()
            var url = app.apiurl+'/robot/averages?download=1'
            utils.sign({ 
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
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
        
        onRender: function() {
            this.plot = new RobotAveragesView({ el : this.ui.plot })
            this.getRegion('wrap').show(new RobotErrorsView({ collection: this.roboterrors }))

            this.plot2 = new RobotTotalsPlot({ el: this.ui.tot, collection: this.robottotals })
            this.plot2.render()
            this.tot.show(new RobotTotalsView({ collection: this.robottotals }))
        },
        
    })
    
})
