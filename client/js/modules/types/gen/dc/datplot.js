define(['marionette', 'modules/types/gen/dc/models/dat', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
], function(Marionette, Dat, utils, $) {
       
    // DAT Plot
    return Marionette.ItemView.extend({
        template: false,
        model: Dat,
        modelEvents: { 'change': 'render' },
                           
        initialize: function(options) {
            var pm = options.parent

            this.model = new Dat({ id: pm.get('ID'), pm: pm })
            this.model.fetch()
            this.$el.css('opacity', 0)
        },

        onRender: function() {
            if (this.model.get('data')) {
                var options = $.extend({}, utils.default_plot, {
                    series: {
                        lines: {
                            show: true,
                        },
                        points: {
                            show: false,
                        }
                    },
                })

                this.plot = $.plot(this.$el, this.model.get('data'), options)
                this.$el.css('opacity', 1)
            }
        },

        onDestroy: function() {
            this.model.stop()
            if (this.plot) this.plot.shutdown()
        }
    })       
    
})