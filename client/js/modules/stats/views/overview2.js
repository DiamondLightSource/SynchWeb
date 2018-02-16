define(['marionette', 
  'views/table', 'views/filter',
  'collections/proposaltypes',
  'modules/stats/collections/overview',
  'modules/stats/collections/runs',
  'utils', 'utils/table',
  'tpl!templates/stats/overview2.html'], 
  function(Marionette, TableView, FilterView, ProposalTypes, BAGOverview, Runs, utils, table, template) {

    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        onClick: function() {
            app.trigger('bloverview:show', this.model.get('BEAMLINENAME'))
        },
    })

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            wrap2: '.wrapper2', 
            wrap3: '.wrapper3', 
            wrap4: '.wrapper4', 
            type: '.type',
            type2: '.type2',
            rl: '.runlist',
        },
        
        ui: {
            run: 'select[name=runid]',
            sched: 'input[name=scheduled]',
            plot: '#avg_time',
        },

        events: {
            'change @ui.run': 'changeRun',
            'change @ui.sched': 'changeScheduled',
            'click a.download': 'downloadData',
            'change input[name=type]': 'plotRuns',
        },


        downloadData: function(e) {
            e.preventDefault()

            var type = $(e.target).attr('class').replace('button', '').replace('download', '').replace(/\s+/, '')
            if (!(type in this)) return

            var col = this[type]

            var ps = []
            _.each(_.omit(col.queryParams, _.keys(col.__proto__.queryParams)), function(val,k) { 
                var ev = _.isFunction(val) ? val() : val
                if (ev) ps.push(k+'='+val) 
            })

            var url = app.apiurl+col.url+'?'+ps.join('&')+'&download=1'
            utils.sign({ 
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },


        changeScheduled: function() {
            this.beamlines.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null
            this.sessiontypes.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null
            this.total.queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null

            this.beamlines.fetch()
            this.sessiontypes.fetch()
            this.total.fetch()

            this.plotruns.each(function(r) {
                r.get('data').queryParams.scheduled = this.ui.sched.is(':checked') ? 1 : null
                r.get('data').fetch().done(function() { r.collection.trigger('reset') })
            }, this)
        },

        changeRun: function() {
            this.beamlines.queryParams.runid = this.ui.run.val()
            this.sessiontypes.queryParams.runid = this.ui.run.val()
            this.total.queryParams.runid = this.ui.run.val()
            this.beamlines.fetch()
            this.sessiontypes.fetch()
            this.total.fetch()
        },

        initialize: function(options) {
            this.beamlines = new BAGOverview(null, { queryParams: { group_by: 'beamline' } })
            this.sessiontypes = new BAGOverview(null, { queryParams: { group_by: 'type' } })
            this.total = new BAGOverview(null, { queryParams: { group_by: 'total' } })

            this.runs = new Runs()
            this.listenTo(this.runs, 'backgrid:selected', this.selectRun, this)
            this.ready = this.runs.fetch()

            this.types = new ProposalTypes()
            this.ready2 = this.types.fetch()

            var columns = [{ name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false },
                           { name: 'VISITS', label: 'No. Visits', cell: 'string', editable: false },
                           { name: 'LEN', label: 'Allocated (hr)', cell: 'string', editable: false },
                           { name: 'REM', label: 'Remaining (hr)', cell: 'string', editable: false },
                           { name: 'USED', label: 'Used (%)', cell: 'string', editable: false },
                           { name: 'DCH', label: 'Data Collections / hr', cell: 'string', editable: false },
                           { name: 'MDCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'MX', label: 'M-Axis', cell: 'string', editable: false },
                           { name: 'DC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SCH', label: 'Screenings / hr', cell: 'string', editable: false },
                           { name: 'MSCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SLH', label: 'Samples Loaded / hr', cell: 'string', editable: false },
                           { name: 'MSLH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SL', label: 'Total', cell: 'string', editable: false }]
                          
            var columns3 = [{ name: 'TYPENAME', label: 'Type', cell: 'string', editable: false }].concat(columns.slice(1))

            this.table2 = new TableView({ collection: this.beamlines, columns: columns, tableClass: 'proposals', pages: false, loading: true, backgrid: { row: ClickableRow, emptyText: 'No beamlines found', } })
            this.table4 = new TableView({ collection: this.sessiontypes, columns: columns3, tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No session types found', } })
            this.table3 = new TableView({ collection: this.total, columns: columns.slice(1), tableClass: 'proposals', pages: false, loading: true, backgrid: { emptyText: 'No total found', } })

            this.runtable = new TableView({
                collection: this.runs,
                columns: [
                    { label: '', cell: 'select-row', editable: false },
                    { name: 'RUN', label: 'Run', cell: 'string', editable: false },
                ],
                backgrid: {
                    row: table.BGSelectRow,
                    emptyText: 'No runs found'
                }
            })

            this.plotruns = new Backbone.Collection(null, { comparator: 'runid' })
            this.listenTo(this.plotruns, 'reset add remove', this.plotRuns)
        },
               
        selectRun: function(m, checked) {
            if (checked) {
                var run = new BAGOverview(null, { queryParams: { group_by: 'beamline', runid: m.get('RUNID') } })
                var self = this
                run.fetch().done(function() {
                    self.plotruns.add({ run: m.get('RUN'), runid: m.get('RUNID'), data: run })   
                })
            } else { 
                var rs = this.plotruns.findWhere({ runid: m.get('RUNID')})
                _.each(rs, function(r) {
                    this.plotruns.remove(r)
                }, this)
                this.plotruns.trigger('reset')
            }
        },      

        plotRuns: function() {
            var data = {}

            var bls = _.unique(_.flatten(this.plotruns.map(function(pr) { return pr.get('data').pluck('BEAMLINENAME') }))).sort()
            var cols = utils.getColors(bls.length)
            _.each(bls, function(bl,i) {
                data[bl] = { label: bl, data: [], color: cols[i] }
            })

            
            var ty = this.$el.find('input[name=type]:checked').val()
            var ticks = this.plotruns.map(function(r,i) { return [i, r.get('run')] })

            this.plotruns.each(function(r,k) {
                r.get('data').each(function(bl,i) {
                    data[bl.get('BEAMLINENAME')].data.push([k, bl.get(ty)])
                }, this)
            }, this)

            var options = {
                xaxis: {
                    // tickDecimals: 0,
                    rotateTicks: 45,
                    ticks: ticks,
                    max: ticks.length-0.7
                },
                grid: {
                  borderWidth: 0,
                },
            }

            $.plot(this.ui.plot, Object.values(data), options)  
        },


        onRender: function() {
            this.wrap2.show(this.table2)
            this.wrap3.show(this.table4)
            this.wrap4.show(this.table3)
            this.showFilter()

            this.rl.show(this.runtable)

            $.when(this.ready).done(this.popuateRuns.bind(this))
            $.when(this.ready2).done(this.showFilter2.bind(this))
        },

        updateFilter: function(selected) {
            this.beamlines.queryParams.ty = selected
            this.sessiontypes.queryParams.ty = selected
            this.total.queryParams.ty = selected

            if (selected == 'yearly') {
                this.beamlines.queryParams.runid = null
                this.sessiontypes.queryParams.runid = null
                this.total.queryParams.runid = null
            } else {
                this.beamlines.queryParams.runid = this.ui.run.val()
                this.sessiontypes.queryParams.runid = this.ui.run.val()
                this.total.queryParams.runid = this.ui.run.val()
            }

            this.sessiontypes.fetch()
            this.total.fetch()
        },

        updateFilter2: function(selected) {
            this.sessiontypes.queryParams.proposalcode = selected
            this.total.queryParams.proposalcode = selected

            this.sessiontypes.fetch()
            this.total.fetch()

            this.plotruns.each(function(r) {
                r.get('data').queryParams.proposalcode = selected
                r.get('data').fetch().done(function() { r.collection.trigger('reset') })
            }, this)
        },

        showFilter2: function() {
            this.ty2 = new FilterView({
                url: false,
                collection: this.beamlines,
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

            _.each([0,1,2], function(i) {
                if (i < this.runs.length) this.runs.at(i).trigger("backgrid:select", this.runs.at(i), true)
            }, this)
        },



        showFilter: function() {
            this.ty = new FilterView({
                url: false,
                collection: this.beamlines,
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
        
    })

})