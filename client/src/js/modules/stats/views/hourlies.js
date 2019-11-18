define(['marionette', 'modules/stats/models/hourlies'], function(Marionette, Hourlies) {

    
    return Marionette.ItemView.extend({
        template: _.template('<div id="dc_hist"></div><p>Data Collections / Hour</p><div id="dc_hist2"></div><p>Samples Loaded / Hour</p>'),
        
        modelEvents: {
            'change': 'render',
        },
        
        initialize: function(options) {
            this.model = new Hourlies({ visit: options && options.visit })
            this.model.fetch()
        },
        
        onRender: function() {
            if (this.model.get('data')) {
                var dc_opts = {
                    bars: {
                        show: true,
                        align: 'center',
                    },
                    grid: {
                        borderWidth: 0,
                        hoverable: true,
                    },
                    xaxis: {
                        tickSize: 1,
                        tickLength: 0,
                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: "%y"
                    },
                }
              
                $.plot(this.$el.find('#dc_hist'), [this.model.get('data').dcs], dc_opts)
              
                $.plot(this.$el.find('#dc_hist2'), [this.model.get('data').samples], dc_opts)
            }
        },
    })

})