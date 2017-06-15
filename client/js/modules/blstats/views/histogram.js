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
            this.$el.css('opactiy', 0)
            this.collection.listenTo(this.collection, 'change:data', this.render)
        },
        

        getToolTip: function(lab, x, y, item) {
            console.log(lab, x, y, item)
            var f = this.collection.first()
            return lab+': '+Object.keys(f.get('data'))[x]
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
            
            var f = this.collection.first()
            if (!f.get('data')) return
            var ticks = []
            var i = 0
            var int = Math.floor(Object.keys(f.get('data')).length/15)
            _.each(f.get('data'), function(v, bin) {
                ticks.push([i, i % int == 0 ? bin : ''])
                i++
            })  
            options.xaxis.ticks = ticks

            var data = []
            this.collection.each(function(s) {
                var series = { data: [], label: s.get('label') }
                var i = 0
                _.each(s.get('data'), function(v, bin) {
                    series.data.push([i, parseFloat(v)])
                    i++
                })  

                data.push(series)
            })

            if (data.length) {
                this.plot = $.plot(this.$el.find('#visit_pie'), data, options)
                this.$el.css('opacity', 1)
            }
        },

  })       
       
})
