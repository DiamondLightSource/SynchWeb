define(['marionette', 'tpl!templates/stats/breakdown.html',
    'jquery',
    'jquery.flot',
    'jquery.flot.time',
    'jquery.flot.selection',
    'jquery.flot.tooltip',
    ], function(Marionette, template, $) {

    return Marionette.ItemView.extend({
        template: template,
        
        events: {
            'plotselected #dc_hist': 'zoomTime',
            'plotselected #avg_time': 'zoomTime',
            'plotclick #avg_time': 'showDC',
            'plotselected #overview': 'zoomOverview',
            'click a[name=reset]': 'resetPlots',
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

            this.overview.setSelection(ranges, true);
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
                app.trigger('dc:show', types[item.series.type], item.series.id)
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

                    /*points: {
                        show: true,
                        radius: 1,
                    },

                    lines: {
                        show: false,
                    },*/

                    yaxes: [{ position: 'right' }, { position: 'right' }, { position: 'right' }],
                }
                this.extra = $.plot(this.$el.find('#dc_hist'), this.model.get('lines'), this.options3);

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
            }
            
            var len = (item.datapoint[0] - item.datapoint[2]) / 1000
            if (len > 60) {
                len = (len/60).toFixed(1) + 'mins'
            } else {
                len += 's'
            }
            return titles[item.series.type] + ': ' + len + ' ' + (item.series.status ? item.series.status : '')
        },
    })

})