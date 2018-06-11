define(['marionette', 
    'modules/stats/collections/dewars',
    'modules/stats/collections/runs',
    'views/table',
    'utils/table',
    'utils',
    'highmaps',
    'highmaps-world',
    'tpl!templates/shipment/dewarstats.html', 'jquery.flot', 'jquery.flot.tooltip'], 
    function(Marionette, DewarOverview, Runs, TableView, table, utils, Highcharts, world, template) {
    
    var ClickableRow = table.ClickableRow.extend({
        event: 'shipment:show',
        argument: 'SHIPPINGID',
        cookie: true
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            rruns: '.runs',
            rrunsd: '.runsd',
            rcts: '.countries',
        },

        ui: {
            map: '.map',
            years: '.years',
        },
        

        initialize: function() {
            this.run = new DewarOverview(null, { queryParams: { group_by: 'year' } })
            this.countries = new DewarOverview(null, { queryParams: { group_by: 'country' } })
            this.countries.state.pageSize = 20

            this.run.fetch()
            this.countries.fetch()

            this.runs = new Runs()
            this.listenTo(this.runs, 'backgrid:selected', this.selectRun, this)
            this.ready = this.runs.fetch()
        },

        onRender: function() {
            var columns = [
                { name: 'YEAR', label: 'Year', cell: 'string', editable: false },
                { name: 'SHIPMENTS', label: 'Shipments', cell: 'string', editable: false },
                { name: 'CTA', label: 'Facility Shipping', cell: 'string', editable: false },
                { name: 'DEWARS', label: 'Dewars', cell: 'string', editable: false },
                { name: 'CONTAINERS', label: 'Containers', cell: 'string', editable: false },
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
                backgrid: { row: ClickableRow, emptyText: 'No run stats found' } 
            }))

            var columns2 = [{ name: 'COUNTRY', label: 'Country', cell: 'string', editable: false }].concat(columns.slice(1))
            this.rcts.show(new TableView({ 
                collection: this.countries, 
                columns: columns2, 
                filter: 's', 
                tableClass: 'runs', 
                backgrid: { row: ClickableRow, emptyText: 'No run stats found' } 
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
                { label: 'Paid Shipments', data: [], yaxis: 2, color: cols[2] },
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
                    tickPixelInterval: 100
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