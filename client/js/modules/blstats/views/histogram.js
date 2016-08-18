define(['marionette', 'modules/blstats/models/histogram', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.tickrotor',
], function(Marionette, Histogram, utils, $) {
    
    return Marionette.ItemView.extend({
        template: _.template('<div id="visit_pie"></div><p><%=title%></p>'),
                                               
        templateHelpers: function() {
            return {
                title: this.getOption('title')
            }
        },

        initialize: function(options) {            
            this.$el.css('opactiy', 0)
            this.collection.listenTo(this.collection, 'change:data', this.render)
        },
        
          
        onRender: function() {
            var options = {
                xaxis: {
                    tickDecimals: 0,
                    rotateTicks: 45,
                },
                bars: {
                    show: true,
                },
                grid: {
                  borderWidth: 0,
                },
                yaxes: [{}, { position: 'right' }],
            }
            
            var f = this.collection.first()
            if (!f.get('data')) return
            var ticks = []
            var i = 0
            _.each(f.get('data'), function(v, bin) {
                ticks.push([i, i % 2 == 0 ? bin : ''])
                i++
            })  
            options.xaxis.ticks = ticks

            var data = []
            this.collection.each(function(s) {
                var series = { data: [], label: s.get('label') }
                var i = 0
                _.each(s.get('data'), function(v, bin) {
                    series.data.push([i, parseFloat(v)])
                    i++
                })  

                data.push(series)
            })

            console.log(data)
            if (data.length) {
                $.plot(this.$el.find('#visit_pie'), data, options)
                this.$el.css('opacity', 1)
            }
        },

  })       
       
})
