define(['marionette', 'modules/dc/models/distl', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.selection',
], function(Marionette, DCDISTLModel, utils, $) {
       
  // DISTL Plot
  return Marionette.ItemView.extend({
      template: false,
      model: DCDISTLModel,
      modelEvents: { 'change': 'render' },

      events: {
          'plotselected': 'plotSelected',
          'plotunselected': 'plotUnselected',
          'plotclick': 'plotClick',
      },
      numimg: true,
      clickable: false,
      hidden: ['Total'],

      plotClick: function(e, pos, item) {
          if (item && item.datapoint.length) {
              this.trigger('plot:click', item.datapoint[0], item.datapoint[1])
          }
      },

      plotSelected: function(e, ranges) {
          this.trigger('plot:select', Math.floor(ranges.xaxis.from), Math.ceil(ranges.xaxis.to))
      },

      plotUnselected: function(e) {
          this.trigger('plot:deselect')
      },

      setSelection: function(x1, x2) {
          this.plot.setSelection({ xaxis: { from: x1, to: x2 } })
      },
    
                                               
      initialize: function(options) {
          var pm = options.parent
                                               
          this.model = new DCDISTLModel({ id: pm.get('ID'), nimg: pm.get('NUMIMG'), pm: pm })
          this.model.fetch()
          this.$el.css('opacity', 0)
          //this.listenTo(app, 'window:scroll', this.lazyLoad, this)
      },
      
      lazyLoad: function() {
          if (utils.inView(this.$el) && !this.$el.hasClass('enabled')) {
              this.model.fetch()
              this.$el.addClass('enabled')
          }
      },
      
      
      onRender: function() {
          var p = this.getOption('parent')
          if (this.model.get('data')) {
              

              var options = $.extend({}, utils.default_plot, {
                  xaxis: {
                      minTickSize: 1,
                      tickDecimals: 0,
                  },
                  yaxes: [{}, { position: 'right', transform: function (v) { return -v; } }, { ticks: [] }],
                  grid: {
                    borderWidth: 0,
                    clickable: this.getOption('clickable'),
                    hoverable: this.getOption('clickable'),
                  }
              })

              var d = []
              _.each({ 'Spots': [0, 1], 'Bragg': [1, 1], 'Res': [2, 2], 'Total': [3, 4] }, function(val, title) {
                if (this.model.get('data')[val[0]].length && this.model.get('data')[val[0]][0][1] !== null && this.getOption('hidden').indexOf(title) == -1) {
                  d.push(
                        { 
                            data: this.model.get('data')[val[0]], 
                            label: title, yaxis: val[1] 
                        }
                    )
                }
              }, this)

              if (this.getOption('numimg')) {
                options.xaxes = [{ max: parseInt(p.get('NUMIMG'))+parseInt(p.get('SI'))-1 }, { position: 'top' }]
                var osc = []
                _.each(this.model.get('data')[0], function(d,i) {
                  osc.push([(d[0]-parseFloat(p.get('SI')))*parseFloat(p.get('AXISRANGE')) + parseFloat(p.get('AXISSTART')), 0])
                })
                d.push({ data: osc, yaxis: 3, xaxis: 2, points: { show: false }, lines: { show: false } })
              }
              
                  
              console.log('sel', this.getOption('selection'))
              if (this.getOption('selection')) {
                  options.selection = { mode: 'x' } 
              }

              this.plot = $.plot(this.$el, d, options)
              this.$el.css('opacity', 1)
          }
      },
        
      onDestroy: function() {
          this.model.stop()
          if (this.plot) this.plot.shutdown()
      }
  })       
       
})