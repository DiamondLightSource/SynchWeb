define(['marionette', 'views/filter', 'modules/blstats/models/logons'], function(Marionette, FilterView, Logons) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Logon Statistics</h1><div class="filter types"></div><div class="plot_wrap"><div class="plot_container"><div id="logon"></div><p>Logons per <span class="type"></span></p></div></div>'),
        
        regions: {
            types: '.types',
        },
        
        ui: {
            type: 'span.type',
            plot: '#logon',
        },
        
        initialize: function(options) {
            this.plot = null
            this.logons = new Logons()
            this.listenTo(this.logons, 'sync', this.plotLogons, this)
            
            this.typeselector = new FilterView({
                filters: [
                    { id: 'hour', name: 'Hour' },
                    { id: 'wd', name: 'Week Day' },
                    { id: 'md', name: 'Month Day' },
                    { id: 'week', name: 'Week' },
                ],
                url: false,
            })
            this.listenTo(this.typeselector, 'selected:change', this.switchType, this)
        },
        
        onRender: function() {
            console.log('render logon')
            this.types.show(this.typeselector)
            this.switchType('hour')
        },
        
        switchType: function(type, name) {
            this.ui.plot.addClass('loading')
            this.logons.set({ type: type }).fetch()
            this.ui.type.text(name)
        },
        
        plotLogons: function() {
            if (!this.logons.get('data')) return
            
            var ops = {
                series: {
                    bars: {
                        show: true,
                        barWidth: .9,
                        align: 'center'
                    },
                },
                grid: {
                    hoverable: true,
                    borderWidth: 0,
                },
                xaxis: {
                    tickDecimals: 0,
                },
                yaxis: {
                    tickDecimals: 0,
                }
            }
           
            if (this.logons.get('type') == 'wd') ops.xaxis.ticks = [[0,'Mon'], [1,'Tue'], [2,'Wed'], [3,'Thu'], [4,'Fri'], [5,'Sat'], [6,'Sun']]
           
            this.plot = $.plot(this.ui.plot, this.logons.get('data'), ops)
            this.ui.plot.removeClass('loading')
        },
        
    onDestroy: function () {
        console.log('destroying logon view')
        if (this.plot) this.plot.destroy()
    }
        
    })
    
})