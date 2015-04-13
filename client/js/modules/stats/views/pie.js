define(['marionette', 'modules/stats/models/pie', 'utils',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.pie',
], function(Marionette, Pie, utils, $) {
    
    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
                                               
        initialize: function(options) {
            if (!options.model) {
                this.model = new Pie({ visit: options.visit })
                this.model.fetch()
            }
            
            this.$el.css('opactiy', 0)
        },
        
          
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
                                formatter: utils.labelFormatter,
                            }
                        },
                    },
                    legend: {
                        show: false
                    },
                    //grid: {
                    //    hoverable: true,
                    //}
                }
                    
                var d = [
                    { label: 'Startup', color: 'yellow', data: this.model.get('data').SUP },
                    { label: 'Data Collection', color: 'green', data: this.model.get('data').DCTIME },
                    { label: 'Auto Indexing', color: '#93db70', data: this.model.get('data').AITIME },
                    { label: 'Centring', color: 'cyan', data: this.model.get('data').CENTTIME },
                    { label: 'Energy Scans', color: 'orange', data: this.model.get('data').EDGE },
                    { label: 'Robot Actions', color: 'blue', data: this.model.get('data').R },
                    { label: 'Thinking', color: 'purple', data: this.model.get('data').T },
                    { label: 'Remaining', color: 'red', data: this.model.get('data').REM },
                    { label: 'Beam Dump', color: 'black', data: this.model.get('data').NOBEAM },
                    { label: 'Faults', color: 'grey', data: this.model.get('data').FAULT },
                ]
                
                $.plot(this.$el, d, options)
                this.$el.css('opacity', 1)
            }
        },
          
        onDestroy: function() {
            this.model.stop()
        }
  })       
       
})