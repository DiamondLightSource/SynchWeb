define(['marionette', 
  'views/table', 'views/filter',
  'collections/proposaltypes',
  'modules/stats/collections/overview',
  'modules/stats/collections/runs',
  'utils'], 
  function(Marionette, TableView, FilterView, ProposalTypes, BAGOverview, Runs, utils) {

    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        onClick: function() {
            app.cookie(this.model.get('PROP'))
            app.trigger('pstats:show', this.model.get('SHIPPINGID'))
        },
    })


    var ShadedCell = Backgrid.Cell.extend({
        render: function() {
            var val = this.model.get(this.column.get('name'))
            this.$el.text(val)

            var vals = this.model.collection.pluck(this.column.get('name'))
            var avg = _.reduce(vals, function(v, n) { return v + n }, 0) / vals.length

            console.log(vals, avg)

            col = null
            if (val > avg) {
                col = utils.shadeColor('#00cc00', 1-(0.35*(val/avg)))
            }

            if (val < avg) {
                col = utils.shadeColor('#cc0000', 0.55*(val/avg))
            }

            if (col) this.$el.css('background-color', col)

            return this
        }
    })

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>BAG Overview</h1><p class="help">This page shows BAG overview statistics for the selected time period</p><div class="filter"><ul><li>Run: <select name="runid"></select></li></ul></div><div class="filter type"></div><div class="filter type2"></div><div class="wrapper"></div><h1>Beamlines</h1><div class="wrapper2"></div><h1>Session Types</h1><div class="wrapper3"></div><h1>Totals</h1><div class="wrapper4"></div></div>',
        regions: { 
            wrap: '.wrapper', 
            wrap2: '.wrapper2', 
            wrap3: '.wrapper3', 
            wrap4: '.wrapper4', 
            type: '.type',
            type2: '.type2',
        },
        
        ui: {
            run: 'select[name=runid]'
        },

        events: {
            'change @ui.run': 'changeRun'
        },

        changeRun: function() {
            this.collection.queryParams.runid = this.ui.run.val()
            this.beamlines.queryParams.runid = this.ui.run.val()
            this.sessiontypes.queryParams.runid = this.ui.run.val()
            this.total.queryParams.runid = this.ui.run.val()
            this.collection.fetch()
            this.beamlines.fetch()
            this.sessiontypes.fetch()
            this.total.fetch()
        },

        initialize: function(options) {
            this.collection = new BAGOverview(null)
            this.beamlines = new BAGOverview(null, { queryParams: { group_by: 'beamline' } })
            this.sessiontypes = new BAGOverview(null, { queryParams: { group_by: 'type' } })
            this.total = new BAGOverview(null, { queryParams: { group_by: 'total' } })

            this.runs = new Runs()
            this.ready = this.runs.fetch()

            this.types = new ProposalTypes()
            this.ready2 = this.types.fetch()

            var columns = [{ name: 'PROP', label: 'Proposal', cell: 'string', editable: false },
                           { name: 'VISITS', label: 'No. Visits', cell: 'string', editable: false },
                           { name: 'LEN', label: 'Allocated (hr)', cell: 'string', editable: false },
                           { name: 'REM', label: 'Remaining (hr)', cell: 'string', editable: false },
                           { name: 'USED', label: 'Used (%)', cell: ShadedCell, editable: false, avg: this.total },
                           { name: 'DCH', label: 'Data Collections / hr', cell: ShadedCell, editable: false, avg: this.total },
                           { name: 'MDCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'DC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SCH', label: 'Screenings / hr', cell: ShadedCell, editable: false, avg: this.total },
                           { name: 'MSCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SLH', label: 'Samples Loaded / hr', cell: ShadedCell, editable: false, avg: this.total },
                           { name: 'MSLH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SL', label: 'Total', cell: 'string', editable: false }]
                          
            var columns2 = [{ name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false }].concat(columns.slice(1))
            var columns3 = [{ name: 'TYPENAME', label: 'Type', cell: 'string', editable: false }].concat(columns.slice(1))

            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: 'No proposals found', } })
            this.table2 = new TableView({ collection: this.beamlines, columns: columns2, tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No beamlines found', } })
            this.table4 = new TableView({ collection: this.sessiontypes, columns: columns3, tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No session types found', } })
            this.table3 = new TableView({ collection: this.total, columns: columns.slice(1), tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No total found', } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
            this.wrap2.show(this.table2)
            this.wrap3.show(this.table4)
            this.wrap4.show(this.table3)
            this.showFilter()

            $.when(this.ready).done(this.popuateRuns.bind(this))
            $.when(this.ready2).done(this.showFilter2.bind(this))
        },

        updateFilter: function(selected) {
            this.beamlines.queryParams.ty = selected
            this.sessiontypes.queryParams.ty = selected
            this.total.queryParams.ty = selected

            this.beamlines.fetch()
            this.sessiontypes.fetch()
            this.total.fetch()
        },

        updateFilter2: function(selected) {
            this.beamlines.queryParams.proposalcode = selected
            this.sessiontypes.queryParams.proposalcode = selected
            this.total.queryParams.proposalcode = selected

            this.beamlines.fetch()
            this.sessiontypes.fetch()
            this.total.fetch()
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