define(['marionette', 
        'modules/types/em/models/drift',
        'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.selection',
], function(Marionette, DriftModel, utils, $) {

  // Drift Plot
  return Marionette.ItemView.extend({
      template: false,
      modelEvents: { 'change': 'render' },
                                               
      initialize: function(options) {
          this.model = new DriftModel({ id: options.id })
          this.model.fetch({ data: { IMAGENUMBER: this.getOption('imagenumber') }})
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
                  
              var d = [{ data: this.model.get('data'), label: 'Drift' }]
                  
              console.log('drift', d)
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