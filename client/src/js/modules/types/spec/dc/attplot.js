define([
    'backbone',
    'marionette', 
    'collections/attachments',
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.resize',
], function(Backbone, Marionette, Attachments, utils, $) {

    return Marionette.ItemView.extend({
        template: _.template('<div class="plot"></div>'),

        ui: {
            plot: '.plot',
        },

        events: {
            plotselected: 'zoom',
            'dblclick @ui.plot': 'reset',
            'click span.series-toggle': 'toggleSeries',
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

        toggleSeries: function(e) {
            e.preventDefault()
            var series = $(e.target).attr('data-series')
            this.series[series] = series in this.series ? !this.series[series] : false
            this.replot()
        },

        initialize: function(options) {
            this.series = {}
            this.collection = new Attachments()
            this.collection.queryParams.id = options.id
            this.collection.queryParams.filetype = 'xy'
            this.listenTo(this.collection, 'sync', this.getFiles.bind(this))
        },

        fetch: function() {
            this.collection.fetch()
        },

        setAdditionalData: function(data) {
            this.additionalData = data
            this.replot()
        },

        getFiles: function() {
            var promises = this.collection.map(function(a) {
                return Backbone.ajax({
                    url: app.apiurl+'/download/attachment/id/'+this.getOption('id')+'/aid/'+a.get('DATACOLLECTIONFILEATTACHMENTID'),
                    success: function(resp) {
                        var data = _.filter(_.map(resp.split(/\n/), function(l) {
                            return l.split(/[\s|\t]+/)
                        }), function(line) { return !!line[0] })

                        var headers = []
                        if (data[0] && data[0][0] == '#') {
                            headers = data.shift()
                            headers.shift()
                        }

                        var transpose = _.map(data[0], function(col, i) { return _.map(data, function(row) { return row[i] }) });
                        a.set({ X: transpose.shift(), SERIES: transpose, HEADERS: headers }, { silent: true })
                    }
                })
            }, this)

            $.when.apply($, promises).then(this.replot.bind(this))
        },

        onShow: function() {
            this.$el.find('.plot').height(this.$el.parent().height())
            this.collection.fetch()
        },

        replot: function() {
            console.log('replot', this.series)
            var self = this
            if (this.collection.length) {
                var options = $.extend({}, utils.default_plot, {
                    xaxis: {
                        minTickSize: 1,
                        tickDecimals: 0,
                    },
                    selection: {
                        mode: 'xy',
                    },
                    legend: {
                        labelFormatter: function(label, series) {
                            var active = (series.label in self.series ? self.series[series.label] : true) ? 'active' : ''
                            return '<span class="series-toggle '+active+'" data-series="'+series.label+'">'+label+'</span>'
                        }
                    }
                })
                
                var data = []
                this.collection.each(function(m) {
                    _.each(m.get('SERIES'), function(ser, j) {
                        var label = m.get('HEADERS')[j+1]
                        var active = _.keys(this.series).length == 0 || (label in this.series ? this.series[label] : true)
                            console.log(label, active)
                        data.push({
                            data: active ? _.map(ser, function(v, i) { return [m.get('X')[i], v] }) : [],
                            label: label,
                            lines: {
                                show: true
                            },
                            points: {
                                show: false
                            }
                        })
                    }, this)
                }, this)

                if (this.additionalData) {
                    data = data.concat(this.additionalData)
                }

                this.plot = $.plot(this.$el.find('.plot'), data, options)
            }
        },
    })       
})
