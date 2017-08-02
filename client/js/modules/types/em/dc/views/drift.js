define(['marionette', 'modules/types/gen/dc/models/dat', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.selection',
], function(Marionette, DatModel, utils, $) {

  // Drift Plot
  return Marionette.ItemView.extend({
      template: false,
      model: DatModel,
      modelEvents: { 'change': 'render' },
                                               
      initialize: function(options) {
          var pm = options.parent
                                               
          var timestamp = utils._date_to_unix(pm.get('ST'))
          this.model = new DriftModel({ id: pm.get('ID'), timestamp: timestamp})
          this.model.fetch()
          this.$el.css('opacity', 0)
      },
      
      onRender: function() {
          //this.lazyLoad()
          if (this.model.get('data')) {
              var options = $.extend({}, utils.default_plot, {
                  xaxis: {
                        min: -20,
                        max: 20,
                    },
                    yaxis: {
                        min: -20,
                        max: 20,
                    },
                    grid: {
                        borderWidth: 0,
                    },
                    series: {
                        lines: { show: true },
                        points: {
                            show: true,
                            radius: 1,
                        }
                    },
              })
                  
              var d = [{ data: this.model.get('data')[0], label: 'Drift' }]
                  

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