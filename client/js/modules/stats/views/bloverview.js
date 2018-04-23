define(['marionette', 
    'views/table', 'views/filter',
    'collections/proposaltypes',
    'modules/stats/collections/overview',
    'modules/stats/collections/runs',

    'modules/blstats/models/histogram',
    'modules/blstats/views/histogram',

    'utils', 'utils/table',
    'tpl!templates/stats/bloverview.html',
    'backgrid', 'backgrid-select-all'], 
    function(Marionette, TableView, FilterView, ProposalTypes, BAGOverview, Runs, 
        Histogram, HistogramPlot,
        utils, table, template, Backgrid) {

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            wrap: '.wrapper', 
            wrap2: '.wrapper2', 
            wrap3: '.wrapper3', 
            wrap4: '.wrapper4', 
            type: '.type',
            type2: '.type2',

            en: '.en',
            rbsx: '.bsx',
            rbsy: '.bsy',
            ex: '.exp'
        },
        
        templateHelpers: function() {
            return {
                BL: this.getOption('bl')
            }
        },

        ui: {
            run: 'select[name=runid]',
            plot: '#avg_time',
            sched: 'input[name=scheduled]',
        },

        events: {
            'change @ui.run': 'changeRun',
            'change @ui.sched': 'changeScheduled',
            'click a.download': 'downloadData',
        },


        downloadData: function(e) {
            e.preventDefault()
            
            var ps = []
            _.each(_.omit(this.collection.queryParams, _.keys(this.collection.__proto__.queryParams)), function(val,k) { 
                var ev = _.isFunction(val) ? val() : val
                if (ev) ps.push(k+'='+val) 
            })

            var url = app.apiurl+this.collection.url+'?'+ps.join('&')+'&download=1'
            utils.sign({ 
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },

        changeScheduled: function() {
            this.collection.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null
            this.proposals.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null
            this.sessiontypes.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null

            this.collection.fetch()
            this.proposals.fetch()
            this.sessiontypes.fetch()
        },

        changeRun: function() {
            this.proposals.queryParams.runid = this.ui.run.val()
            this.sessiontypes.queryParams.runid = this.ui.run.val()
            this.proposals.fetch()
            this.sessiontypes.fetch()
        }, 

        selectFirst: function() {
            if (this.collection.length) {
                var m = this.collection.filter(function(m) { return m.get('REM') != null })
                if (m.length) m[0].trigger("backgrid:select", m[0], true)
            }
        },

        initialize: function(options) {
            this.collection = new BAGOverview(null, { queryParams: { group_by: 'run', bl: this.getOption('bl') } })
            this.listenTo(this.collection, 'sync reset', this.plotRuns)
            this.listenTo(this.collection, 'backgrid:selected', this.selectRun, this)
            this.collection.fetch().done(this.selectFirst.bind(this))

            this.proposals = new BAGOverview(null, { queryParams: { bl: this.getOption('bl') } })
            this.sessiontypes = new BAGOverview(null, { queryParams: { group_by: 'type', bl: this.getOption('bl') } })

            this.runs = new Runs()
            this.ready = this.runs.fetch()

            this.types = new ProposalTypes()
            this.ready2 = this.types.fetch()

            var columns = [{ label: '', cell: 'select-row', editable: false },
                           { name: 'RUN', label: 'Run', cell: 'string', editable: false },
                           { name: 'VISITS', label: 'No. Visits', cell: 'string', editable: false },
                           { name: 'LEN', label: 'Allocated (hr)', cell: 'string', editable: false },
                           { name: 'REM', label: 'Remaining (hr)', cell: 'string', editable: false },
                           { name: 'USED', label: 'Used (%)', cell: 'string', editable: false },
                           { name: 'DCH', label: 'Data Collections / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MDCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'MX', label: 'M-Axis', cell: 'string', editable: false },
                           { name: 'DC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SCH', label: 'Screenings / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MSCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SLH', label: 'Samples Loaded / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MSLH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SL', label: 'Total', cell: 'string', editable: false }]
                          
            var columns2 = [{ name: 'PROP', label: 'Proposal', cell: 'string', editable: false }].concat(columns.slice(2))
            var columns3 = [{ name: 'TYPENAME', label: 'Type', cell: 'string', editable: false }].concat(columns.slice(2))

            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'proposals', loading: true, backgrid: { row: table.BGSelectRow, emptyText: 'No runs found', } })
            this.table2 = new TableView({ collection: this.proposals, columns: columns2, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, backgrid: { emptyText: 'No proposals found', } })
            this.table4 = new TableView({ collection: this.sessiontypes, columns: columns3, tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No session types found', } })

            this.hists = [new Backbone.Collection(), new Backbone.Collection(), new Backbone.Collection(), new Backbone.Collection()]
        },


        selectRun: function(m, checked) {
            if (checked) {
                _.each(['', 'beamsizex', 'beamsizey', 'exposuretime'], function(t,i) {
                    var h = new Histogram({ RUNID: m.get('RUNID') })
                    var self = this
                    h.fetch({ data: {
                        bl: this.getOption('bl'),
                        runid: m.get('RUNID'),
                        ty: t
                    }}).done(function() {
                        var his = h.get('histograms')
                        if (his.length) his[0].label = m.get('RUN')+': '+his[0].label
                        h.set('histograms', his)
                        self.hists[i].add(h)
                    })
                    
                }, this)
            } else { 
                _.each(this.hists, function(hs) {
                    var h = hs.findWhere({ RUNID: m.get('RUNID') })
                    if (h) hs.remove(h)
                })
            }
        },


        plotRuns: function() {
            var cols = utils.getColors(4)

            var data = []
            var i = 0
            _.each({ 'USED': 'Used (%)', 
                    'DCH': 'Data Collections / hr ', 
                    'SCH': 'Screenings / hr', 
                    'SLH': 'Samples Loaded / hr'}, function(p,k) {
                var s = { label: p, data: [], color: cols[i] }
                if (k == 'USED') s.yaxis = 2

                this.collection.each(function(r,i) {
                    var val = r.get(k)
                    s.data.push([i,val < 0 ? 0 : val])
                }, this)

                data.push(s)

                var vals = this.collection.fullCollection.pluck(k)
                var avg = _.reduce(vals, function(v, n) { return v + n }, 0) / vals.length

                data.push({ 
                    color: utils.shadeColor(cols[i], 0.5), 
                    label: null, 
                    legend: false, 
                    lines: { show: true, lineWidth: 1 }, 
                    shadowSize: 0,
                    data: [[0,avg], [this.collection.length-1, avg]], 
                    yaxis: k == 'USED' ? 2 : 1 
                })

                i++
            }, this)

            var ticks = this.collection.map(function(r,i) { return [i, r.get('RUN')] })

            var options = {
                xaxis: {
                    tickDecimals: 0,
                    rotateTicks: 45,
                    ticks: ticks
                },
                grid: {
                  borderWidth: 0,
                },

                yaxes: [{}, { position: 'right' }],
            }

            $.plot(this.ui.plot, data, options)            
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
            this.wrap2.show(this.table2)
            this.wrap3.show(this.table4)
            this.showFilter()

            $.when(this.ready).done(this.popuateRuns.bind(this))
            $.when(this.ready2).done(this.showFilter2.bind(this))

            this.en.show(new HistogramPlot({ collection: this.hists[0] }))
            this.ex.show(new HistogramPlot({ collection: this.hists[1] }))
            this.rbsx.show(new HistogramPlot({ collection: this.hists[2] }))
            this.rbsy.show(new HistogramPlot({ collection: this.hists[3] }))
        },

        updateFilter: function(selected) {
            this.beamlines.queryParams.ty = selected
            this.sessiontypes.queryParams.ty = selected

            if (selected == 'yearly') {
                this.beamlines.queryParams.runid = null
                this.sessiontypes.queryParams.runid = null
            } else {
                this.beamlines.queryParams.runid = this.ui.run.val()
                this.sessiontypes.queryParams.runid = this.ui.run.val()
            }

            this.proposal.fetch()
            this.sessiontypes.fetch()
        },

        updateFilter2: function(selected) {
            this.collection.queryParams.proposalcode = selected
            this.proposals.queryParams.proposalcode = selected
            this.sessiontypes.queryParams.proposalcode = selected

            this.collection.fetch()
            this.proposals.fetch()
            this.sessiontypes.fetch()
        },

        showFilter2: function() {
            this.ty2 = new FilterView({
                url: false,
                collection: this.collection,
                name: 'proposalcode',
                filters: this.types.map(function(b) { return { id: b.get('PROPOSALCODE'), name: b.get('PROPOSALCODE') } }),
            })
            this.listenTo(this.ty2, 'selected:change', this.updateFilter2, this)
            this.type2.show(this.ty2)
        },


        popuateRuns: function() {
            this.ui.run.html(this.runs.opts())

            var last = this.runs.first()
            this.ui.run.val(last.get('RUNID'))
            this.changeRun()
        },


        showFilter: function() {
            this.ty = new FilterView({
                url: false,
                collection: this.collection,
                name: 'ty',
                filters: [
                  { id: 'yearly', name: 'Yearly' },
                  { id: 'monthly', name: 'Monthly' },
                  { id: 'weekly', name: 'Weekly' }
                ],
            })
            this.listenTo(this.ty, 'selected:change', this.updateFilter, this)
            this.type.show(this.ty)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },
        
    })

})