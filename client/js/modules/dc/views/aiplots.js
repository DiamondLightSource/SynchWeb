define(['marionette', 'modules/dc/collections/aiplots', 
        'utils',
        'tpl!templates/dc/aiplots.html',
        'jquery',
        'jquery.flot',
        'jquery.flot.resize',
        'jquery.flot.tooltip',
], function(Marionette, AIPlots, utils, template, $) {
       

    var SeriesSelect = Marionette.ItemView.extend({
        template: _.template('<label><input type="checkbox"> <%-TYPE%></label>'),
        tagName: 'li',
        ui: {
            check: 'input[type=checkbox]',
        },
        events: {
            'click @ui.check': 'select',
        },
        
        select: function() {
            var val = this.ui.check.is(':checked')
            this.model.set('isSelected', val)
        },

        onRender: function() {
            if (this.model.get('isSelected')) this.ui.check.prop('checked', true)
        },
    })

    var SeriesSelector = Marionette.CollectionView.extend({
        childView: SeriesSelect,
        tagName: 'ul',
        className: 'clearfix'
    })

    return Marionette.LayoutView.extend({
        template: template,

        regions: {
            rprogs: '.programs',
            rplots: '.plots',
        },
                                               
        initialize: function(options) {
            this.plots = new AIPlots()
            this.plots.queryParams.id = options.id
            this.ready = this.plots.fetch()

            this.availplots = new Backbone.Collection()
            this.listenTo(this.availplots, 'change:isSelected', this.plot)
            this.listenTo(this.plots, 'change:isSelected', this.plot)
        },
          
        onRender: function() {
            this.$el.find('.plot').height(this.$el.height()*0.85)
            this.ready.done(this.populateSeries.bind(this))
        },

        populateSeries: function() {
            var cur = this.plots.findWhere({ AUTOPROCPROGRAMID: this.getOption('aid') })
            if (cur) cur.set('isSelected', true)

            this.rprogs.show(new SeriesSelector({ collection: this.plots }))

            if (!this.plots.length) {
                this.$el.find('.plot').text('No plots available for this datacollection')
                return
            }

            this.availplots.reset(_.map(
                _.filter(Object.keys(this.plots.at(0).get('PLOTS')), 
                    function(v) {
                        return (['d_star_sq_min','d_star_sq_max'].indexOf(v) == -1)
                }),
            function(m) { 
                var pl = { TYPE: m } 
                if (['completeness', 'r_merge', 'i_over_sigma_mean'].indexOf(m) > -1) pl.isSelected = true
                return pl
            }))
            this.rplots.show(new SeriesSelector({ collection: this.availplots }))
            this.plot()
        },


        plot: function() {
            var options = {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: false,
                    },
                },
                xaxis: {
                    tickFormatter: function(v, axis) {
                        return (1/Math.sqrt(v)).toFixed(axis.tickDecimals)
                    }
                },
                grid: {
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: %y.2"
                }
            }
                
            var yaxis = 0
            var data = []
            var plots = this.plots.where({ isSelected: true })
            var selected = _.map(this.availplots.where({ isSelected: true }), function(m) { return m.get('TYPE') })
            var cols = utils.getColors(plots.length)
            _.each(plots, function(m,i) {
                var min = m.get('PLOTS')['d_star_sq_min']
                var max = m.get('PLOTS')['d_star_sq_max']
                var bin = _.map(min, function(mi, i) { return max[i]+(mi - max[i]) / 2 })

                var j = 0
                _.each(m.get('PLOTS'), function(p,k) {
                    if (selected.indexOf(k) == -1) return

                    var series = _.map(p, function(v,i) { return [bin[i], v] })
                    data.push({ label: m.get('TYPE')+': '+k, data: series, yaxis: j+1, color: utils.shadeColor(cols[i], 0.3*j) })
                    j++
                })
            }, this)

            this._plot = $.plot(this.$el.find('.plot'), data, options)
        },

    })
       
})