define(['marionette', 'modules/blstats/models/robotdewar', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
], function(Marionette, Dewar, utils, $) {
    
    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
                                               
        initialize: function(options) {
            if (!options.model) {
                this.model = new Dewar({ visit: options.visit })
                this.model.fetch()
            }
            
            this.$el.css('opactiy', 0)
        },
        
          
        onRender: function() {
            if (this.model.get('data')) {
                console.log(this.model.get('data'))
                var options = {
                    xaxis: {
                        tickDecimals: 0,
                    },
                    bars: {
                        show: true,
                    },
                    grid: {
                      borderWidth: 0,
                    },
                    yaxes: [{}, { position: 'right' }],
                }
                
                $.plot(this.$el, this.model.get('data'), options)
                this.$el.css('opacity', 1)
            }
        },
          
        onDestroy: function() {
            this.model.stop()
        }
  })       
       
})