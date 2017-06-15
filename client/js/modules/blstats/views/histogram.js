define(['marionette', 'modules/blstats/models/histogram', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.tickrotor',
], function(Marionette, Histogram, utils, $) {
    
    return Marionette.ItemView.extend({
        template: _.template('<div id="visit_pie"></div><p><%=title%></p>'),
                              
        events: {
            'plotselected': 'zoom',
            'dblclick': 'reset',
        },

        zoom: function(e, ranges) {
                var opts = this.plot.getOptions()
                opts.xaxes[0].min = ranges.xaxis.from
                opts.xaxes[0].max = ranges.xaxis.to

                this.plot.setupGrid()
                this.plot.draw()
                this.plot.clearSelection()
        },

        reset: function(e) {
            this.zoom(e, {
                xaxis: {
                    from: null, to: null
                },
            })
        },

        templateHelpers: function() {
            return {
                title: this.getOption('title')
            }
        },

        initialize: function(options) {            
            this.$el.css('opacity', 0)
            this.listenTo(this.collection, 'add remove change:histograms', this.render)
        },
        

        getToolTip: function(lab, x, y, item) {
            var fh = this.collection.first()
            var f = fh.get('histograms')[0]
            return lab+': '+Object.keys(f['data'])[x]
        },

          
        onRender: function() {
            var options = {
                xaxis: {
                    tickDecimals: 0,
                    rotateTicks: 45,
                },
                bars: {
                    show: true,
                },
                grid: {
                  borderWidth: 0,
                  hoverable: true,
                },

                selection: { mode: 'x' },
                tooltipOpts: { content: this.getToolTip.bind(this) },
                tooltip: true,

                yaxes: [{}, { position: 'right' }],
            }
            
            var fh = this.collection.first()
            if (!fh) return
            if (!fh.get('histograms')) return
            var f = fh.get('histograms')[0]
            
            var ticks = []
            var i = 0
            var int = Math.floor(Object.keys(f['data']).length/15)
            _.each(f['data'], function(v, bin) {
                ticks.push([i, i % int == 0 ? bin : ''])
                i++
            })  
            options.xaxis.ticks = ticks

            var data = []
            this.collection.each(function(h) {
                _.each(h.get('histograms'), function(s) {
                    var series = { data: [], label: s['label'] }
                    var i = 0
                    _.each(s['data'], function(v, bin) {
                        series.data.push([i, parseFloat(v)])
                        i++
                    })  

                    data.push(series)
                }, this)
            })

            if (data.length) {
                this.plot = $.plot(this.$el.find('#visit_pie'), data, options)
                this.$el.css('opacity', 1)
            }
        },

  })       
       
})
