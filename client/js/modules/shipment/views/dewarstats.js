define(['marionette', 
    'modules/stats/collections/dewars',
    'modules/stats/collections/runs',
    'views/table',
    'utils/table',
    'utils',
    'highmaps',
    'highmaps-world',
    'templates/shipment/dewarstats.html', 'jquery.flot', 'jquery.flot.tooltip'], 
    function(Marionette, DewarOverview, Runs, TableView, table, utils, Highcharts, world, template) {
    

    var SortedDewars = DewarOverview.extend({
        comparator: function(m) {
            return -m.get('DEWARS')
        }
    })


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            rruns: '.runs',
            rcts: '.countries',
        },

        ui: {
            map: '.map',
            years: '.years',
            data: 'input[name=data]',
            hist: 'input[name=hist]',
        },

        events: {
            'change @ui.data': 'refresh',
            'change @ui.hist': 'refresh',
        },

        
        refresh: function() {
            this.run.fetch()
            this.countries.fetch()
        },


        getData: function() {
            return this.ui.data.is(':checked') ? 1 : ''
        },


        getHist: function() {
            return this.ui.hist.is(':checked') ? 1 : ''
        },


        addSpinnerRun: function() {
            this.ui.years.addClass('loading')
        },

        removeSpinnerRun: function() {
            this.ui.years.removeClass('loading')
        },

        addSpinnerCountry: function() {
            this.ui.map.addClass('loading')
        },

        removeSpinnerCountry: function() {
            this.ui.map.removeClass('loading')
        },


        initialize: function() {
            this.run = new DewarOverview(null, { queryParams: { group_by: 'year' } })
            this.countries = new SortedDewars(null, { queryParams: { group_by: 'country' } })
            this.countries.state.pageSize = 25

            this.listenTo(this.run, 'request', this.addSpinnerRun)
            this.listenTo(this.run, 'sync', this.removeSpinnerRun)
            this.listenTo(this.run, 'error', this.removeSpinnerRun)

            this.listenTo(this.countries, 'request', this.addSpinnerCountry)
            this.listenTo(this.countries, 'sync', this.removeSpinnerCountry)
            this.listenTo(this.countries, 'error', this.removeSpinnerCountry)

            this.run.queryParams.data = this.getData.bind(this)
            this.countries.queryParams.data = this.getData.bind(this)

            this.run.queryParams.history = this.getHist.bind(this)
            this.countries.queryParams.history = this.getHist.bind(this)

            this.runs = new Runs()
            this.listenTo(this.runs, 'backgrid:selected', this.selectRun, this)
            this.ready = this.runs.fetch()
        },

        onRender: function() {
            this.refresh()

            var columns = [
                { name: 'YEAR', label: 'Year', cell: 'string', editable: false },
                { name: 'SHIPMENTS', label: 'Shipments', cell: 'integer', editable: false },
                { name: 'CTA', label: 'Facility Shipping', cell: 'integer', editable: false },
                { name: 'DEWARS', label: 'Dewars', cell: 'integer', editable: false },
                { name: 'CONTAINERS', label: 'Containers', cell: 'integer', editable: false },
                // { name: 'DCS', label: '# DCs', cell: 'string', editable: false },
            ]
        
            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }

            this.rruns.show(new TableView({ 
                collection: this.run, 
                columns: columns, 
                filter: 's', 
                tableClass: 'runs', 
                loading: true,
                backgrid: { emptyText: 'No dewar stats found' } 
            }))

            var columns2 = [{ name: 'COUNTRY', label: 'Country', cell: 'string', editable: false }].concat(columns.slice(1))
            this.rcts.show(new TableView({ 
                collection: this.countries, 
                columns: columns2, 
                filter: 's', 
                tableClass: 'countries',
                loading: true, 
                backgrid: { emptyText: 'No dewar stats found' } 
            }))

            this.listenTo(this.countries, 'sync', this.plotMap)
            this.plotMap()
        },


        onShow: function() {
            this.listenTo(this.run, 'sync', this.plotYears)
            this.plotMap()
        },


        plotYears: function() {
            var ticks = []
            var cols = utils.getColors(3)
            var data = [
                { label: 'Dewars', data: [], series: { bars: { show: true }, lines: { show: false } }, color: cols[0] },
                { label: 'Shipments', data: [], yaxis: 2, color: cols[1] },
                { label: 'Facility Shipping', data: [], yaxis: 2, color: cols[2] },
            ]

            this.run.fullCollection.each(function(y,i) {
                ticks.push([this.run.fullCollection.length-i, y.get('YEAR')])
                data[0].data.push([this.run.fullCollection.length-i, y.get('DEWARS')])
                data[1].data.push([this.run.fullCollection.length-i, y.get('SHIPMENTS')])
                data[2].data.push([this.run.fullCollection.length-i, y.get('CTA')])
            }, this)


            var options = {
                xaxis: {
                    ticks: ticks,
                },
                grid: {
                    borderWidth: 0,
                    hoverable: true,
                },
                tooltip: true,
                yaxes: [{}, { position: 'right' }],
            }

            $.plot(this.ui.years, data, options)  
        },


        plotMap: function() {
            var data = []
            this.countries.fullCollection.each(function(c) {
                if (c.get('CODE')) data.push({ code: c.get('CODE'), value: parseInt(c.get('DEWARS')) })
            })

            var num = 5
            var cols = utils.getColors(num)
            var stops = []
            _.each(_.range(num), function(n) {
                stops.push([(1/num)*n, cols[n]])
            })

            Highcharts.mapChart({
                chart: {
                    renderTo: this.ui.map[0],
                    backgroundColor:'rgba(255, 255, 255, 0.0)',
                    map: 'custom/world'
                },

                title: {
                    text: 'Dewar breakdown by Country'
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                colorAxis: {
                    min: 1,
                    type: 'logarithmic',
                    stops: stops,
                },

                series: [{
                    data: data,
                    joinBy: ['iso-a2', 'code'],
                    states: {
                        hover: {
                            color: '#a4edba'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.properties.postal}'
                    }
                }]
            });
        },
        
    })

})