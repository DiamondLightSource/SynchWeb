define(['marionette', 
  'views/table', 'views/filter',
  'collections/proposaltypes',
  'modules/stats/collections/overview',
  'modules/stats/collections/runs',
  'utils', 'utils/table',
  'tpl!templates/stats/overview.html'], 
  function(Marionette, TableView, FilterView, ProposalTypes, BAGOverview, Runs, utils, table, template) {

    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        onClick: function() {
            app.cookie(this.model.get('PROP'))
            app.trigger('pstats:show', this.model.get('SHIPPINGID'))
        },
    })

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            wrap: '.wrapper', 
            type: '.type',
            type2: '.type2',
        },
        
        ui: {
            run: 'select[name=runid]',
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
            this.collection.fetch()
        },

        changeRun: function() {
            this.collection.queryParams.runid = this.ui.run.val()
            this.collection.fetch()

        },

        initialize: function(options) {
            this.collection = new BAGOverview(null)

            this.runs = new Runs()
            this.ready = this.runs.fetch()

            this.types = new ProposalTypes()
            this.ready2 = this.types.fetch()

            var columns = [{ name: 'PROP', label: 'Proposal', cell: 'string', editable: false },
                           { name: 'VISITS', label: 'No. Visits', cell: 'string', editable: false },
                           { name: 'LEN', label: 'Allocated (hr)', cell: 'string', editable: false },
                           { name: 'REM', label: 'Remaining (hr)', cell: 'string', editable: false },
                           { name: 'USED', label: 'Used (%)', cell: table.ShadedCell, editable: false },
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
                          
            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: 'No proposals found', } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
            this.showFilter()

            $.when(this.ready).done(this.popuateRuns.bind(this))
            $.when(this.ready2).done(this.showFilter2.bind(this))
        },

        updateFilter: function(selected) {
            this.collection.queryParams.ty = selected

            if (selected == 'yearly') {
                this.collection.queryParams.runid = null
            } else {
                this.collection.queryParams.runid = this.ui.run.val()
            }
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