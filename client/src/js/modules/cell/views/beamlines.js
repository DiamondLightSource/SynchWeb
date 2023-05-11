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
                  var did = this.getOption('second') ? 1 : 0
                  var ticks = []
                
                var years = {}
                var bls = {}
                _.each(this.model.get('data')[did], function(v, i) {
                    years[v.YEAR] = 1
                    bls[v.BL] = 1
                })

                var d = []
                var yrs = []

                _.each(years, function(i, y) {
                    yrs.push(y)
                    d.push({ label: y, data: [] })
                })

                var bl = []
                _.each(bls, function(i, b) {
                    bl.push(b)
                    ticks.push([bl.length-1, b])
                })

                  _.each(this.model.get('data')[did], function(v, i) {
                      var y = yrs.indexOf(v.YEAR)
                      var b = bl.indexOf(v.BL)
                      //console.log('d', y, b)
                      d[y].data.push([b, v.COUNT])
                  })

                  function ascsort(a,b) {
                      if (a[0] == b[0]) return 0
                      else return (a[0] < b[0]) ? -1 : 1
                  }

                  _.each(d, function(d,i) {
                      d.data.sort(ascsort)
                  })

                  console.log(d)

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
