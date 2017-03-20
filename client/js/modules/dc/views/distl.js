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
                                               
          var timestamp = utils._date_to_unix(pm.get('ST'))
          this.model = new DCDISTLModel({ id: pm.get('ID'), nimg: pm.get('NUMIMG'), timestamp: timestamp})
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
          //this.lazyLoad()
          if (this.model.get('data')) {
              var osc = []
              _.each(this.model.get('data')[0], function(d,i) {
                osc.push([(d[0]-parseFloat(p.get('SI')))*parseFloat(p.get('AXISRANGE')) + parseFloat(p.get('AXISSTART')), 0])
              })

              var options = $.extend({}, utils.default_plot, {
                  xaxis: {
                      minTickSize: 1,
                      tickDecimals: 0,
                  },
                  yaxes: [{}, { position: 'right', transform: function (v) { return -v; } }, { ticks: [] }],
                  xaxes: [{ max: parseInt(p.get('NUMIMG'))+parseInt(p.get('SI'))-1 }, { position: 'top' }],
              })

              var d = [{ data: this.model.get('data')[0], label: 'Spots' },
                       { data: this.model.get('data')[1], label: 'Bragg' },
                       { data: this.model.get('data')[2], label: 'Res', yaxis: 2 },
                       { data: osc, yaxis: 3, xaxis: 2, points: { show: false }, lines: { show: false } },
                       ]
                  
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