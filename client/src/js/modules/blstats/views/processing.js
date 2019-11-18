define(['marionette', 
    'modules/blstats/models/pcstats',
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.tooltip',
    'jquery.flot.tickrotor',
    ], function(Marionette, PCStats, utils, $) {
    
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Reprocessing Statistics</h1><div class="plot_wrap"><div class="plot_container"><div id="logon"></div><p class="plot_title"></p></div></div><a href="#" class="button download"><i class="fa fa-download"></i> Download</a>'),
        
        regions: {
            cont: '.wrapper',
        },
        
        ui: {
            title: '.plot_title',
            plot: '#logon',
        },

        events: {
            'click a.download': 'downloadData'
        },

        downloadData: function(e) {
            e.preventDefault()
            var url = app.apiurl+this.stats.url()+'?download=1'
            utils.sign({ 
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },
        
        initialize: function(options) {
            this.stats = new PCStats()
            this.stats.fetch()

        },
        
        onRender: function() {
            this.listenTo(this.stats, 'sync', this.plotStats, this)
        },

        onShow: function() {
            this.plotStats()
        },
        
        
        plotStats: function() {
            if (!this.stats.get('data')) return
            
            var data = []
            _.each(this.stats.get('data'), function(d, ty) {
                _.each(d, function(m,i) {
                    var pl = { label: (i==0? ' Jobs' : ' Time (min)'), data: m.data, yaxis: (i+1) }
                    if (i == 1) m.series = 'lines'
                    pl[m.series] = { show: true }
                    data.push(pl)
                })
            }, this)
            
                
            var ops = {
                axisLabels: {
                  show: true
                },
                series: {
                   bars: {
                   align: 'center'
                   },
                },
                grid: {
                    hoverable: true,
                    borderWidth: 0,
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: %y"
                },
                xaxis: {
                    rotateTicks: 45,
                },
                yaxes: [{}, { position: 'right' }],
                xaxes: [{}],
            }

            ops.xaxis.ticks = this.stats.get('ticks')
            ops.xaxes[0].axisLabel = this.stats.get('xaxis')
            ops.yaxes[0].axisLabel = this.stats.get('yaxis')
            
            $.plot(this.ui.plot, data, ops)
            this.ui.title.text(this.stats.get('title'))
            this.ui.plot.removeClass('loading')
        },
        
    })
    
})