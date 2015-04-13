define(['marionette', 'modules/dc/models/edge', 'utils',
        'jquery',
        'jquery.flot',
], function(Marionette, EdgeModel, utils, $) {
       
  // DISTL Plot
  return Marionette.ItemView.extend({
    template: false,
    model: EdgeModel,
    modelEvents: { 'change': 'render' },
                                               
    initialize: function(options) {
      this.model = new EdgeModel({ id: options.id })
      this.model.fetch()
      this.$el.css('opacity', 0)
    },
                                               
    onRender: function() {
        var options = $.extend({}, utils.default_plot, {
        yaxes: [{}, { position: 'right' }],
        series: {
            points: { show: false },
            lines: { show: true },
        },
        })
        
        var data = [{ data: this.model.get('RAW'), color: 'rgb(100,100,100)' },
            { data: this.model.get('FDP'), label: 'f&rsquo;&rsquo;', yaxis: 2 },
            { data: this.model.get('FP'), label: 'f&rsquo;', yaxis: 2 },]
                     
      this.plot = $.plot(this.$el, data, options)
      this.$el.css('opacity', 1)
    },
      
      
    onDestroy: function() {
      if (this.plot) this.plot.shutdown()
    }

  })
       
})