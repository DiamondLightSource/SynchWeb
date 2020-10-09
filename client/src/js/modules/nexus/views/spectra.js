define([
    'marionette', 
    'modules/nexus/collections/spectra', 
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.resize',
    'jquery.flot.selection'
], function(Marionette, Spectra, utils, $) {

    return Marionette.ItemView.extend({
        template: _.template('<div class="plot"></div>'),

        ui: {
            plot: '.plot',
        },

        events: {
            plotselected: 'zoom',
            'dblclick @ui.plot': 'reset',
        },

        reset: function(e) {
            this.zoom(e, { 
                xaxis: {from: null, to: null},
                yaxis: {from: null, to: null},
            })
        },

        zoom: function (event, ranges) {
            if (!ranges.xaxis) return
            
            var opts = this.plot.getOptions()
            _.each(opts.xaxes, function(axis) {
                axis.min = ranges.xaxis.from
                axis.max = ranges.xaxis.to
            })
            _.each(opts.yaxes, function(axis) {
                axis.min = ranges.yaxis.from
                axis.max = ranges.yaxis.to
            })
            
            this.plot.setupGrid()
            this.plot.draw()
            this.plot.clearSelection()
        },

        selectPoint: function(point) {
            this.point = point
            this.collection.fetch()
        },

        getPoint: function() {
            return this.point
        },

        initialize: function(options) {
            this.point = 0
            this.collection = new Spectra()
            this.collection.queryParams.id = options.id
            this.collection.queryParams.point = this.getPoint.bind(this)
            this.listenTo(this.collection, 'sync', this.replot.bind(this))
        },

        onDomRefresh: function() {
            this.ui.plot.height(this.$el.parent().height())
            this.replot()
        },
          
        replot: function() {
            if (this.collection.length) {
                var options = $.extend({}, utils.default_plot, {
                    xaxis: {
                        minTickSize: 1,
                        tickDecimals: 0,
                    },
                    grid: {
                        borderWidth: 0,
                        margin: 10,
                    },
                    selection: {
                        mode: 'xy',
                    },
                })
                
                var data = []
                this.collection.each(function(m) {
                    data.push({
                        data: _.map(m.get('DATA'), function(v,i) { return [i, v]}),
                        label: m.get('TITLE'),
                        lines: {
                            show: true,
                        },
                        points: {
                            show: false,
                        },
                    })
                })
                this.$el.css({ background: 'none' })
                this.ui.plot.text('')
                this.plot = $.plot(this.ui.plot, data, options)
            } else {
                this.ui.plot.text('Click a point to show the corresponding spectrum')
                this.$el.css({ background: '#dddddd' })
            }
        },
    })       
})
