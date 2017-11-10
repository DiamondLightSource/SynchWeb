define(['marionette', 'views/filter', 'modules/blstats/models/blstats',
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.tooltip',
    'jquery.flot.tickrotor',
    ], function(Marionette, FilterView, BLStats, utils, $) {
    
    
    var SeriesItem = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<label><input type="checkbox" name="<%-name%>" checked="checked" /> <%-name%><label>'),
        events: {
            'change input': 'setStatus',
        },
        
        setStatus: function(e) {
            this.model.set({ show: this.$el.find('input').is(':checked') })
        }
    })
    
    var SeriesSelector = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'series',
        childView: SeriesItem,
    })
    
    
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Beamline Statistics</h1><div class="filter filter-nohide types"></div><div class="filter filter-nohide series"></div><div class="plot_wrap"><div class="plot_container"><div id="logon"></div><p class="plot_title"></p></div></div><a href="#" class="button download"><i class="fa fa-download"></i> Download</a>'),
        
        regions: {
            types: '.types',
            srs: '.series',
            cont: '.wrapper',
        },
        
        ui: {
            title: '.plot_title',
            plot: '#logon',
        },

        events: {
            'click a.download': 'downloadData'
        },

        
        initialize: function(options) {
            this.stats = new BLStats()
            this.listenTo(this.stats, 'sync', this.processData, this)
            this.series = new Backbone.Collection()
            this.listenTo(this.series, 'reset change', this.plotStats, this)
        },
        
        onRender: function() {
            this.typeselector = new FilterView({
                filters: [
                    { id: 'dc', name: 'Data Collections' },
                    { id: 'fc', name: 'Full Data Collections' },
                    { id: 'sc', name: 'Screenings' },
                    { id: 'im', name: 'Images Collected' },
                    { id: 'smp', name: 'Samples Loaded' },
                    { id: 'dct', name: 'Data Collection Times' },
                    { id: 'dl', name: 'Daily Usage' },
                ],
                url: false,
            })
            this.listenTo(this.typeselector, 'selected:change', this.switchType, this)
            this.types.show(this.typeselector)
            this.srs.show(new SeriesSelector({ collection: this.series }))
        },
        
        onShow: function() {
            this.switchType(this.getOption('type') || 'dc')
        },
        
        switchType: function(type) {
            this.ui.plot.addClass('loading')
            this.stats.set({ type: type }).fetch()
        },

        downloadData: function(e) {
            e.preventDefault()
            var url = app.apiurl+this.stats.url()+'?download=1'
            utils.sign({ 
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },
        
        processData: function() {
            this.series.reset(_.map(this.stats.get('data'), function(s, bl) { return { name: bl, show: true } }))
            this.plotStats()
        },
        
        plotStats: function() {
            if (!this.stats.get('data')) return
            
            var data = []
            _.each(this.stats.get('data'), function(d, bl) {
                var status = this.series.findWhere({ name: bl })
                if (status.get('show') == true) {
                    _.each(d, function(m,i) {
                        var pl = { label: bl, data: m.data, yaxis: (i+1) }
                        pl[m.series] = { show: true }
                        data.push(pl)
                    })
                }
            }, this)
            
                
            var ops = {
                axisLabels: {
                  show: true
                },
                series: {
                   bars: {
                   barWidth: .09,
                   align: 'center'
                   },
                },
                grid: {
                    hoverable: true,
                    borderWidth: 0,
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: %y.2"
                },
                xaxis: {
                    rotateTicks: 45,
                },
                yaxes: [{}, { position: 'right', transform: function (v) { return -v; } }],
                xaxes: [{}],
            }

            ops.xaxis.ticks = this.stats.get('ticks')
            ops.xaxes[0].axisLabel = this.stats.get('xaxis')
            ops.yaxes[0].axisLabel = this.stats.get('yaxis')
            
            $.plot(this.ui.plot, data, ops)
            this.ui.title.text(this.stats.get('title'))
            this.ui.plot.removeClass('loading')
        },
        
    })
    
})