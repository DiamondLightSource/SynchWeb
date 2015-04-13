define(['marionette', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.stack',
], function(Marionette, utils, $) {
       

    return Marionette.ItemView.extend({
    	template: false,
		modelEvents: { 'change': 'render' },

		onRender: function() {
          	if (this.model.get('data')) {
          		var ticks = []
				var d = [{ data: [], label: 'Auto Processed' },
				       	 { data: [], label: 'Manual' }]
          		_.each(this.model.get('data'), function(v, i) {
          			ticks.push([i, v.YEAR])
          			d[0].data.push([i, v.AP])
          			d[1].data.push([i, v.MAN])
          		})

				var options = {
			        series: {
			            bars: {
			                show: true,
			                barWidth: .9,
			                align: 'center'
			            },
			            stack: true
			        },
			        grid: {
			            hoverable: true,
			            borderWidth: 0,
			        },
			        xaxis: {
			           ticks: ticks
			        },
			    }

				this.plot = $.plot(this.$el, d, options)
				this.$el.css('opacity', 1)
          	}
      },
        
      onDestroy: function() {
          if (this.plot) this.plot.shutdown()
      }

  	})

})
