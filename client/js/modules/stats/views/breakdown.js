define(['marionette', 'tpl!templates/stats/breakdown.html',
    'utils',
    'moment',
    'jquery',
    'jquery.flot',
    'jquery.flot.time',
    'jquery.flot.selection',
    'jquery.flot.tooltip',
    ], function(Marionette, template, utils, moment, $) {

    return Marionette.ItemView.extend({
        template: template,
        
        modelEvents: {
            'sync': 'onDomRefresh'
        },

        events: {
            'plotselected #dc_hist': 'zoomTime',
            'plotselected #avg_time': 'zoomTime',
            'plotclick #avg_time': 'showDC',
            'plotselected #overview': 'zoomOverview',
            'click a[name=reset]': 'resetPlots',
        },
        
        ui: {
            span: '.span',
        },

        onRender: function() {
            if (this.getOption('large')) this.$el.find('#avg_time').addClass('large')
        },

        resetPlots: function(e) {
            e.preventDefault()
            this.main.setSelection({ xaxis: { from: this.model.get('info').start, to: this.model.get('info').end } })
            this.overview.clearSelection();
        },
        
        zoomTime: function(e, ranges) {
            _.each([this.main, this.extra], function(p) {
                var opts = p.getOptions()
                opts.xaxes[0].min = ranges.xaxis.from
                opts.xaxes[0].max = ranges.xaxis.to

                p.setupGrid()
                p.draw()
                p.clearSelection()
            })

            this.showSpan()
            this.overview.setSelection(ranges, true);
        },


        showSpan: function() {
            var opts = this.main.getOptions()

            var from = moment(opts.xaxes[0].min).format('MMMM Do YYYY')
            var to = moment(opts.xaxes[0].max).format('MMMM Do YYYY')

            if (from != to) this.ui.span.html(from+' - '+to)
            else this.ui.span.html(from)
        },
        
        zoomOverview: function(e, ranges) {
            this.main.setSelection(ranges);
        },
        
        showDC:  function(e, pos, item) {
            if (!item) return
                
            var types = {
                dc: 'dc',
                ed: 'edge',
                mca: 'mca',
            }
            if (item.series.id) {
                app.trigger('dc:show', types[item.series.type], item.series.id, item.series.visit)
            }
        },
        
        onDomRefresh: function() {
            if (this.model.get('data')) {
                this.options = {
                  grid: {
                      borderWidth: 0,
                  },
              
                  selection: { mode: 'x' },

                  bars: {
                    horizontal: true,
                    show: true,
                    lineWidth: 0.5,
                    barWidth: 0.8,
                    stack: true,
                  },
              
                  xaxis: {
                        mode: 'time',
                        // timeformat: '%m %b %H:%M',
                        timezone: 'Europe/London',
                        min: this.model.get('info').start,
                        max: this.model.get('info').end,
                  },
              
                  yaxis: {
                    show: false,
                  },
                }
              
                this.options2 = _.extend({}, this.options);
                this.options2.tooltip = true;
                this.options2.grid.hoverable = true
                this.options2.grid.clickable = true
                this.options2.tooltipOpts = { content: this.getToolTip.bind(this) }

                var dc = _.where(this.model.get('data'), { type: 'dc' })
                var pids = _.unique(_.pluck(dc, 'pid'))
                var cols = utils.shuffle(utils.getColors(pids.length))
                _.each(dc, function(d) {
                    if (d.pid) d.color = cols[pids.indexOf(d.pid)]
                })

                var vis = _.where(this.model.get('data'), { type: 'visit_ns' })
                var vids = _.unique(_.pluck(vis, 'visit'))
                var cols = utils.shuffle(utils.getColors(vids.length))
                _.each(vis, function(v) {
                    v.color = cols[vids.indexOf(v.visit)]
                })

                // var markings = []
                // var vis = _.where(this.model.get('data'), { type: 'visit' })
                // _.each(vis, function(v) {
                //     var vdc = _.where(dc, { visit: v['visit'] })

                //     if (!vdc.length) return

                //     var f = _.first(vdc)
                //     var l = _.last(vdc)

                //     markings.push({ color: '#000', lineWidth: 1, yaxis: { from: 0, to: v['data'][0][1] }, xaxis: { from: f['data'][0][0], to: f['data'][0][0] } })
                //     markings.push({ color: '#000', lineWidth: 1, yaxis: { from: 0, to: v['data'][1][1] }, xaxis: { from: l['data'][1][2], to: l['data'][1][2] } })
                // }, this)

                // this.options2.grid.markings = markings

                this.main = $.plot(this.$el.find('#avg_time'), this.model.get('data'), this.options2);
                this.overview = $.plot(this.$el.find('#overview'), this.model.get('data'), this.options);

                this.options3 = {
                    xaxis: {
                        mode: 'time',
                        timezone: 'Europe/London',
                        min: this.model.get('info').start,
                        max: this.model.get('info').end,
                    },

                    tooltip: true,
                    grid: {
                        hoverable: true,
                        borderWidth: 0,
                    },

                    yaxes: [{ position: 'right' }, { position: 'right' }, { position: 'right' }],
                }
                this.extra = $.plot(this.$el.find('#dc_hist'), this.model.get('lines'), this.options3)
                this.showSpan()
            }
            
        },
        
        getToolTip: function(lab, x, y, item) {
            var titles = {
                ai: 'Auto Indexing',
                dc: 'Data Collection',
                mca: 'MCA Spectrum',
                ed: 'Edge Scan',
                robot: 'Robot Action',
                fault: 'Fault',
                nobeam: 'Beam Dump',
                cent: 'Centring',
                visit: 'Visit (Scheduled)',
                visit_ns: 'Visit (Queued)',
            }
            
            var len = (item.datapoint[0] - item.datapoint[2]) / 1000
            if (len > 3600) {
                len = (len/3600).toFixed(1) + 'hrs'
            } else if (len > 60) {
                len = (len/60).toFixed(1) + 'mins'
            } else {
                len += 's'
            }
            return titles[item.series.type] + ': ' + len + ' ' + (item.series.status ? item.series.status : '')
        },
    })

})