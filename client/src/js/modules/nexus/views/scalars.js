define([
    'marionette', 
    'modules/nexus/collections/scalars', 
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.resize',
], function(Marionette, Scalars, utils, $) {

    return Marionette.ItemView.extend({
        template: _.template('<div class="rd_plot">Loading</div>'),

        ui: {
            plot: '.rd_plot',
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

            this.plot.setupGrid()
            this.plot.draw()
            this.plot.clearSelection()
        },

        initialize: function(options) {
            this.collection = new Scalars()
            this.collection.queryParams.id = options.id
            this.collection.queryParams.entry = options.entry
            this.listenTo(this.collection, 'sync', this.replot.bind(this))
            this.collection.fetch()
        },

        onDomRefresh: function() {
            this.ui.plot.height(this.$el.parent().height())
            this.replot()
        },
          
        replot: function() {
            if (this.collection.length) {
                var options = $.extend({}, utils.default_plot, {
                    tooltip: true,
                    selection: {
                        mode: 'xy',
                    },
                    grid: {
                        hoverable: true,
                        borderWidth: 0,
                        margin: 10,
                    },
                    yaxes: _.map(_.range(this.collection.length), function(i) { return {} }),
                })
                
                var data = []
                this.collection.each(function(m, i) {
                    data.push({
                        data: _.map(m.get('DATA'), function(v,i) { return [i, v]}),
                        label: m.get('TITLE'),
                        yaxis: i+1,
                        lines: {
                            show: true
                        }
                    })
                })

                console.log('scalars', data, options)

                this.ui.plot.text('')
                this.plot = $.plot(this.ui.plot, data, options)
            }
        },
    })       
})
