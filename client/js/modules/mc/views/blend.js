define(['marionette', 
    'modules/mc/models/jobstatus',
    'modules/mc/collections/users',
    'modules/mc/collections/blended',
    'modules/mc/collections/integrated',
    'modules/mc/views/stats',

    'collections/datacollections',
    'modules/mc/collections/intstatuses',

    'views/table', 'utils/table', 'tpl!templates/mc/blend.html'], function(Marionette, JobStatus, Users, Blended, Integrated, StatsView, DCs, IntegrationStatuses, TableView, table, template) {

    var ClickableRow = table.ClickableRow.extend({
        event: 'mc:select',
        argument: 'IDS',
    })


    var SelectedRow = Backgrid.Row.extend({
        events: {
          'click': 'onClick',
        },

        initialize: function(options) {
            this.listenTo(this.model, 'change:selected', this.setClass, this)
            SelectedRow.__super__.initialize.call(this, options)
        },

        onClick: function() {
            this.model.set('selected', !this.model.get('selected'))
            this.setClass()
        },

        setClass: function() {
            console.log('change selected')
            this.model.get('selected') ? this.$el.addClass('selected') : this.$el.removeClass('selected')
        },
          
        render: function() {
            SelectedRow.__super__.render.call(this)
            if (this.model.get('selected')) this.$el.addClass('selected')
            return this
        },
    })

    var DetailCell = table.TemplateCell.extend({
        events: {
            'click a.logv': 'showLog',
        },

        showLog: function(e) {
            e.preventDefault()
            console.log('show log', this.model)
            var stats = new StatsView({ model: this.model })
            app.dialog.show(stats)
            stats.setTitle('Statistics for blended run '+this.model.get('ID'))
        },
    })

    var DeleteCell = table.TemplateCell.extend({
        events: {
            'click a.delete': 'delete',
        },

        delete: function(e) {
            e.preventDefault()
            this.model.destroy()
            return

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/mc/delete/visit/'+this.model.get('VISIT')+'/run/'+this.model.get('ID'),
                success: function(r){
                    if (r) {
                        self.model.collection.remove(self.model)
                    }
                }
            })

        },
    })
    

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        regions: {
            bl: '.blended',
            inte: '.integrated',
            dend: '.dendrogram',
        },

        ui: {
            jobs: '.jobs',
            count: '.count',
            user: 'select[name=user]',
            bl: '.data_collection',
            ana: '.analyse'
        },

        events: {
            'click .clear': 'clearSelection',
            'click .blend': 'blend',
            'click @ana': 'analyse',
            'change @ui.user': 'setUser',
        },


        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit')
            }
        },

        clearSelection: function(e) {
            e.preventDefault()
            this.integrated.fullCollection.each(function(d,i) {
                d.set({'selected': false}, { silent: false })
            })
            this.integrated.trigger('sync')
            this.countSelected()
        },

        blend: function(e) {
            e.preventDefault()

            if (this.integrated.where({ selected: true }).length < 2) app.alert({ message: 'You need to selected at least two data sets to blend'})

            Backbone.ajax({
                url: app.apiurl+'/mc/blended',
                type: 'POST',
                data: {
                    visit: this.getOption('visit'),
                    dcs: _.map(this.integrated.where({ selected: true }), function(d,i) { return d.get('ID') }),
                    res: this.$el.find('input[name=res]').val(), 
                    isigi: this.$el.find('input[name=isigi]').val(), 
                    rfrac: this.$el.find('input[name=rfrac]').val(), 
                    sg: this.$el.find('input[name=sg]').val(),
                    type: 0,  
                },

                success: function(r){
                   if (r) app.alert({ message: 'Job successfully submitted' })
                }
            })
        },

        setUser: function(e) {
            this.user = this.ui.user.val()

            var u = this.users.findWhere({ ID: parseInt(this.user) })
            if (u) {
                this.userid = u.gfet('USER')
                if (u.get('USER') == app.user) {
                    this.ui.bl.slideDown()
                    this.ui.ana.fadeIn()
                } else {
                    this.ui.bl.slideUp()
                    this.ui.ana.fadeOut()
                }
            }

            this.getStatuses()
            this.blended.fetch()
        },


        getStatuses: function() {
            var ids = this.dcs.pluck('ID')
            this.statuses.fetch({ data: { ids:  ids }, type: 'POST' })   
        },

        setStatuses: function() {
            this.statuses.each(function(s,i) {
                var d = this.dcs.findWhere({ ID: s.get('ID') })

                if (d) {
                    d.set('SUCCESS', s.get('INT') == 2)
                    d.set('INT', s.get('STATS'))
                }

            }, this)

            console.log('set statuses', this.statuses, this.dcs)

            this.integrated.fullCollection.reset(this.dcs.where({'SUCCESS': true }))
        },


        initialize: function(options) {
            app.on('mc:select', this.selectIntegrated.bind(this), this)

            var self = this
            this.users = new Users(null, { visit: options.visit })
            this.users.fetch().done(function() {
                var sel = ''
                var opts = self.users.map(function(u, i) {
                    if (u.get('USER') == app.user) sel = u.get('ID')
                    return '<option value="'+u.get('ID')+'">'+u.get('USER')+'</option>'
                }).join('')
                self.ui.user.html(opts).val(sel)
            })

            this.statuses = new IntegrationStatuses()
            this.statuses.user = function() {
                return self.user ? self.user : 0
            }

            this.listenTo(this.statuses, 'sync', this.setStatuses, this)

            this.dcs = new DCs(null, { running: false, queryParams: { visit: options.visit }, state: { pageSize: 9999 } })
            this.listenTo(this.dcs, 'sync', this.getStatuses, this)
            this.dcs.fetch()

            this.integrated = new Integrated()
            this.listenTo(this.integrated, 'change', this.countSelected, this)

            this.blended = new Blended(null, { visit: options.visit })
            this.blended.user = function() {
                return self.user ? self.user : 0
            }
            this.blended.fetch()

            var columns = [
                { name: 'ID', label: 'Run', cell: table.HTMLCell, editable: false },
                { name: 'FILES', label: 'Files', cell: 'string', editable: false },
                { name: 'RFRAC', label: 'Radfrac', cell: 'string', editable: false },
                { name: 'ISIGI', label: 'I/sig(I)', cell: 'string', editable: false },
                { name: 'STATUSICON', label: 'Status', cell: table.HTMLCell, editable: false, center: true },
                { name: 'SG', label: 'Spacegroup', cell: 'string', editable: false },
                { label: 'Resolution', cell: table.TemplateCell, editable: false, test: 'SUCCESS', template: '<%=STATS.RESL[1]%> - <%=STATS.RESH[1]%> (<%=STATS.RESL[3]%> - <%=STATS.RESH[3]%>)' },
                { label: 'Rmerge', cell: table.TemplateCell, editable: false, test: 'SUCCESS', template: '<%=STATS.RMERGE[1]%> (<%=STATS.RMERGE[3]%>)' },
                { label: 'Completeness', cell: table.TemplateCell, editable: false, test: 'SUCCESS', template: '<%=STATS.C[1]%> (<%=STATS.C[3]%>)' },
                { label: 'I/sig(I)', cell: table.TemplateCell, editable: false, test: 'SUCCESS', template: '<%=STATS.ISIGI[1]%>(<%=STATS.ISIGI[3]%>)' },
                { label: 'Multiplicity', cell: table.TemplateCell, editable: false, test: 'SUCCESS', template: '<%=STATS.M[1]%> (<%=STATS.M[3]%>)' },
                { label: '', cell: DetailCell, editable: false, test: 'SUCCESS', template: '<a href="#" class="button button-notext logv" title="View scaling statistics for the selected blend run"><i class="fa fa-search"></i> <span>View Log</span></a> <a class="button button-notext mtz" href="'+app.apiurl+'/download/bl/visit/<%=VISIT%>/run/<%=ID%>" title="Download ther merged mtz file"><i class="fa fa-download"></i> <span>Download Merged MTZ</span></a> <a class="mtz button button-notext" href="'+app.apiurl+'/download/bl/visit/<%=VISIT%>/run/<%=ID%>/s/1" title="Download the scaled mtz file"><i class="fa fa-download"></i> <span>Download Scaled MTZ</span></a>' },
                { label: '', cell: DeleteCell, editable: false, template: '<a class=" button button-notext delete" title="Delete this blend run"><i class="fa fa-times"></i> <span>Delete</span></a>' },
            ]
            
            if (app.mobile()) {
                _.each([2,3,6,7,8,9,10], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.blendedtable = new TableView({ collection: this.blended, columns: columns, tableClass: 'blended_table', filter: false, loading: false, backgrid: { emptyText: 'No blended sets found', row: ClickableRow } })



            var columns = [
                { name: 'DIR', label: 'Directory', cell: 'string', editable: false },
                { name: 'IMP', label: 'Prefix', cell: 'string', editable: false },
                { name: 'AXISSTART', label: '\3A9 Start', cell: 'string', editable: false },
                { label: 'SG', cell: table.TemplateCell, editable: false, template: '<%=INT.SG%>' },
                { label: 'Cell', cell: table.TemplateCell, editable: false, template: '<%=INT.CELL[0]%>,<%=INT.CELL[1]%>,<%=INT.CELL[2]%>,<%=INT.CELL[3]%>,<%=INT.CELL[4]%>,<%=INT.CELL[5]%>' },
                { label: 'Rmerge', cell: table.TemplateCell, editable: false, template: '<%=INT.R%>' },
                { label: 'Completeness', cell: table.TemplateCell, editable: false, template: '<%=INT.C%>' },
                { label: 'Resolution', cell: table.TemplateCell, editable: false, template: '<%=INT.RESH%>' },
            ]
            
            if (app.mobile()) {
                _.each([3,4,5], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.integratedtable = new TableView({ collection: this.integrated, columns: columns, tableClass: 'integrated', filter: false, loading: false, backgrid: { row: SelectedRow, emptyText: 'No integrated data sets found' } })


            this.status = new JobStatus({ local: 1 })
            this.listenTo(this.status, 'sync', this.setJobs, this)
            this.status.fetch()
        },


        selectIntegrated: function(ids) {
            console.log('select row', ids)
            this.integrated.fullCollection.each(function(d, i) {
                d.set({ 'selected': _.indexOf(ids, d.get('ID')) > -1 }, { silent: false })
            }, this)

            this.integrated.trigger('sync')
            this.countSelected()
        },


        countSelected: function() {
            this.ui.count.html(this.integrated.fullCollection.where({ selected: true }).length)
        },


        setJobs: function() {
            var n = this.status.get('NUMBER')
            console.log('jobs', n)
            this.ui.jobs.html(n)
            n > 0 ? this.ui.jobs.parent('li').addClass('running') : this.ui.jobs.parent('li').removeClass('running')
        },


        onShow: function() {
            this.bl.show(this.blendedtable)
            this.inte.show(this.integratedtable)
        },

        onDestroy: function() {
            this.blended.stop()
            this.status.stop()
        },

    })

})