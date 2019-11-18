define(['marionette', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.pie',
], function(Marionette, utils, $) {
       

    return Marionette.ItemView.extend({
    	template: false,
		modelEvents: { 'change': 'render' },

		onRender: function() {
          	if (this.model.get('tot')) {
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
				  
				var d = [{ data: this.model.get('tot').AP, label: 'Auto Processed' },
				       	 { data: this.model.get('tot').MAN, label: 'Manual' }]

				this.plot = $.plot(this.$el, d, options)
				this.$el.css('opacity', 1)
          	}
      },
        
      onDestroy: function() {
          if (this.plot) this.plot.shutdown()
      }

  	})

})
