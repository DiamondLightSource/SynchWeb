define([
    'marionette',
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.resize',
    'jquery.flot.tickrotor',
], function(
    Marionette,
    utils,
    $
) {
    return Marionette.ItemView.extend({
        'template': _.template('<div id="visit_pie"></div><p><%-title%></p>'),
        'events': {
            'plotselected': 'zoom',
            'dblclick': 'reset',
        },
        'zoom': function(e, ranges) {
            var opts = this.plot.getOptions()
            opts.xaxes[0].min = ranges.xaxis.from
            opts.xaxes[0].max = ranges.xaxis.to
            this.plot.setupGrid()
            this.plot.draw()
            this.plot.clearSelection()
        },
        'reset': function(e) {
            this.zoom(e, {
                'xaxis': {
                    'from': null,
                    'to': null
                },
            })
        },
        'templateHelpers': function() {
            return {
                'title': this.getOption('title')
            }
        },
        // eslint-disable-next-line no-unused-vars
        'initialize': function(options) {
            this.$el.css('opacity', 0)
            this.listenTo(
                this.collection,
                'add remove change:data',
                this.render
            )
        },
        'getToolTip': function(lab, x, y, item) {
            // var fh = this.collection.first()
            // var f = fh.get('data')[0]
            return (
                lab ? lab + ': ' : ''
            ) + item.series.type + ' - ' + item.datapoint[1]

        },
        'onRender': function() {
            var options = {
                'xaxis': {
                    'tickDecimals': 0,
                    'rotateTicks': 45,
                },
                'series': {
                    'lines': { 'show': false },
                    'points': { 'show': true },
                },
                'grid': {
                    'borderWidth': 0,
                    'hoverable': true,
                },
                'selection': { 'mode': 'x' },
                'tooltipOpts': { 'content': this.getToolTip.bind(this) },
                'tooltip': true,
            }
            const fh = this.collection.first()
            if ((!fh) || (!fh.get('data'))) {
                return
            }
            options.xaxis.ticks = _.map(
                fh.get('ticks'),
                function(v, i) { return [i,v] }
            )
            var series = 0
            this.collection.each(function(h) {
                // eslint-disable-next-line no-unused-vars
                _.each(h.get('data'), function(s) {
                    series++
                })
            })
            var cols = utils.shuffle(utils.getColors(series))
            var cid = 0
            var data = []
            this.collection.each(function(h) {
                _.each(h.get('data'), function(s) {
                    data.push({
                        'data': _.map(
                            s.avg,
                            function(v,i) { return [i,v] }
                        ),
                        'label': s.label,
                        'color': cols[cid],
                        'type': 'Avg'
                    })
                    data.push({
                        'data': _.map(
                            s.min,
                            function(v,i) { return [i,v] }
                        ),
                        'points': { 'radius': 1 },
                        'color': cols[cid],
                        'type': 'Min'
                    })
                    data.push({
                        'data': _.map(
                            s.max,
                            function(v,i) { return [i,v] }
                        ),
                        'points': { 'radius': 1 },
                        'color': cols[cid],
                        'type': 'Max'
                    })
                    cid++
                }, this)
            })
            if (data.length) {
                this.plot = $.plot(this.$el.find('#visit_pie'), data, options)
                this.$el.css('opacity', 1)
            }
        },
    })
})
