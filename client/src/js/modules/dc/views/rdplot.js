define(['marionette', 'modules/dc/models/rd', 'utils',
        'templates/dc/rdplot.html',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
], function(Marionette, RDModel, utils, template, $) {
       

  return Marionette.ItemView.extend({
    template: template,
    model: RDModel,
    modelEvents: { 'change': 'render' },
                                               
    initialize: function(options) {
      this.model = new RDModel({ id: options.id, aid: options.aid })
      this.model.fetch()
        
      this.$el.css('opacity', 0)
    },
      
    onRender: function() {
      if (this.model.get('data')) {
          this.$el.find('.rd_plot').height(this.$el.height()-30)
          var options = $.extend({}, utils.default_plot, {
            xaxis: {
              minTickSize: 1,
              tickDecimals: 0,
            },
          })
            
          this.plot = $.plot(this.$el.find('.rd_plot'), [this.model.get('data')], options)
          this.$el.css('opacity', 1)
      }
    },

      
    onDestroy: function() {
         if (this.plot) this.plot.shutdown()   
    },
  })
       
})