define(['marionette', 'modules/dc/models/mca', 'utils',
        'jquery',
        'jquery.flot',
], function(Marionette, MCAModel, utils, $) {
       
  // DISTL Plot
  return Marionette.View.extend({
    template: false,
    model: MCAModel,
    modelEvents: { 'change': 'render' },
                                               
    initialize: function(options) {
        this.$el.css('opacity', 0)
        this.model = new MCAModel({ id: options.id })
        var self = this
        this.model.fetch().done(function() { console.log(self.model) })
    },
                                               
    render: function() {
        // Bind UI elements if not already done (render might be called multiple times)
        this.bindUIElements()

        var self = this
        var m = this.model
        var data = [{ label: 'XRF', data: m.get('XRF'), color: 'rgb(100,100,100)' }, { label: 'Compton', data: m.get('COMPTON'), color: 'rgb(200,200,200)' }]
        
        var pl = $.plot(this.$el, data, { grid: { borderWidth: 0 }, yaxis: { max: m.get('MAX')*1.1 } })
        var max = m.get('MAX')
        var plot_x_max = pl.getAxes().xaxis.datamax
        var plot_width = this.$el.width()
        
        $.each(m.get('ELEMENTS'), function(e,d) {
            var inten = e[e.length-1] ==  'K' ? [1,0.2] : [0.9,0.1,0.5,0.05,0.05]
            var elines = ['&alpha;', '&beta;', '&gamma;']
            var mp = d[1]/m.get('MP')
            
            $.each(d[0], function(i,en) {
                if (inten[i] > 0.1 & mp > 0.01) {
                    var o = pl.pointOffset({ x: en*1000-(plot_x_max*0.03), y: max*inten[i]*mp+(0.18*max)});
                    if (o.left > 0) {
                        self.$el.append('<div class="annote" style="left:' + (100*o.left/plot_width) + '%;top:' + o.top + 'px;">'+e+'<sub>'+elines[i]+'</sub></div>');
                    }
                }
            })
        })
        this.$el.css('opacity', 1)
        this.plot = pl
        return this
    },
            
    onDestroy: function() {
      if (this.plot) this.plot.shutdown()
      this.model.stop()
    }

  })       
       
})
