define([
    'backbone',
    'marionette', 
    'collections/attachments',
    'utils',
    'jquery',
    'jquery.flot',
    'jquery.flot.resize',
], function(Backbone, Marionette, Attachments, utils, $) {

    return Marionette.ItemView.extend({
        template: _.template('<div class="plot"></div>'),

        initialize: function(options) {
            this.collection = new Attachments()
            this.collection.queryParams.id = options.id
            this.collection.queryParams.filetype = 'xy'
            this.listenTo(this.collection, 'sync', this.getFiles.bind(this))
        },

        fetch: function() {
            this.collection.fetch()
        },

        setAdditionalData: function(data) {
            this.additionalData = data
            this.replot()
        },

        getFiles: function() {
            var promises = this.collection.map(function(a) {
                return Backbone.ajax({
                    url: app.apiurl+'/download/attachment/id/'+this.getOption('id')+'/aid/'+a.get('DATACOLLECTIONFILEATTACHMENTID'),
                    success: function(resp) {
                        var data = _.filter(_.map(resp.split(/\n/), function(l) {
                            return l.split(/[\s|\t]+/)
                        }), function(line) { return !!line[0] })

                        var headers = []
                        if (data[0] && data[0][0] == '#') {
                            headers = data.shift()
                            headers.shift()
                        }

                        var transpose = _.map(data[0], function(col, i) { return _.map(data, function(row) { return row[i] }) });
                        a.set({ X: transpose.shift(), SERIES: transpose, HEADERS: headers }, { silent: true })
                    }
                })
            }, this)

            $.when.apply($, promises).then(this.replot.bind(this))
        },

        onShow: function() {
            this.$el.find('.plot').height(this.$el.parent().height())
            this.collection.fetch()
        },

        replot: function() {
            if (this.collection.length) {
                var options = $.extend({}, utils.default_plot, {
                    xaxis: {
                        minTickSize: 1,
                        tickDecimals: 0,
                    },
                })
                
                var data = []
                this.collection.each(function(m) {
                    _.each(m.get('SERIES'), function(ser, j) {
                        data.push({
                            data: _.map(ser, function(v, i) { return [m.get('X')[i], v] }),
                            label: m.get('HEADERS')[j+1],
                            lines: {
                                show: true
                            }
                        })
                    })
                })

                if (this.additionalData) {
                    data = data.concat(this.additionalData)
                }

                this.plot = $.plot(this.$el.find('.plot'), data, options)
            }
        },
    })       
})
