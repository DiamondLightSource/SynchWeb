define(['marionette', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.pie',
], function(Marionette, utils, $) {
       

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },

        onRender: function() {
            if (this.model.get('data')) {
                var options = {
                            series: {
                                pie: {
                                    show: true,
                                    radius: 1,
                                    label: {
                                        show: true,
                                        radius: 0.66666,
                                        formatter: utils.labelFormatterNo,
                                    }
                                },
                            },
                            legend: {
                                show: false
                            },
                        }
                          
                var d = []
                _.each(this.model.get('data'), function(v,k) {
                    d.push({ label: k, data: v })
                })

                this.plot = $.plot(this.$el, d, options)
                this.$el.css('opacity', 1)
               }
        },
            
        onDestroy: function() {
            if (this.plot) this.plot.shutdown()
        }

    })

})
