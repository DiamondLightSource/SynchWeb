define(['marionette', 
    'backgrid', 
    'views/table', 
    'modules/dc/collections/apstatuses', 
    'modules/dc/views/reprocess', 
    'templates/dc/apstatussummary.html'], 
    function(Marionette, 
        Backgrid, 
        TableView, 
        APStatuses, 
        ReprocessView, 
        template) {

    var APCell = Backgrid.Cell.extend({
        initialize: function(options) {
            APCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change reset', this.render, this)
            this.template = options.column.get('template')
        },
        
        render: function() {
            this.$el.empty();
            
            if (this.model.get('APLOADED') == true) {
                var tmpl = _.template(this.template)
                this.$el.html(tmpl(this.model.toJSON()))
                
            }
            
            this.delegateEvents();
            return this;
        }
    })
    
    var RPCell = APCell.extend({
        events: {
            'click a.reprocess': 'reprocess',
        },
        
        reprocess: function(e) {
            e.preventDefault()
            
            if (app.dialog.currentView instanceof ReprocessView) app.dialog.currentView.collection.add(this.model)
            else app.dialog.show(new ReprocessView({ model: this.model, visit: this.model.get('VISIT') }))
        }

    })
    
    var APItemCell = Backgrid.Cell.extend({
        initialize: function(options) {
            APItemCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change reset', this.render, this)
            this.template = '<i class="fa fa-spin fa-spinner"></i>'
        },
        
        render: function() {
            this.$el.empty();
            
            var id = this.model.get('ID')
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']
        
            var label = this.column.get('program')
            this.$el.html(_.template(this.template))
            if (this.model.get('APLOADED') == true) {
                var ap = res[this.column.get('group')][label]
                var ress = {}
                _.each(ap, function(a) {
                    if (!(a in ress)) ress[a] = 0
                    ress[a]++
                })
                this.$el.html(_.map(ress, function(c, st) { return c > 1 ? '<span class="count">'+c+'x</span> '+val[st] : val[st]}))
            }
            this.delegateEvents();
            return this;
        }
    })
    
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { wrap: '.wrapper' },
        
        collectionEvents: {
            'update sync reset': 'updateStatus',
        },
        
        initialize: function(options) {
            this.statuses = new APStatuses()
            this.columns = [
                { name: 'FILETEMPLATETRIM', label: 'Prefix', cell: 'string', editable: false },
                { label: 'Sample', cell: APCell, template: '<% if (BLSAMPLEID) { %><a href="/samples/sid/<%-BLSAMPLEID%>" class="wrap sample"><%-SAMPLE%></a><% } %>', editable: false },
                { name: 'ST', label: 'Date', cell: 'string', editable: false },
            ]

            this.columns.push.apply(this.columns, [
                { label: '', cell: RPCell, template: '<a href="#" class="reprocess button button-notext" title="Reprocess"><i class="fa fa-cog"></i> <span>Reprocess</span></a>', editable: false },
                { label: '', cell: APCell, template: '<a href="/dc/visit/'+this.model.escape('VISIT')+'/id/<%-ID%>" class="button button-notext dll" title="Open data collection"><i class="fa fa-arrow-right"></i> <span>Open data collection</span></a>', editable: false },
            ])

            this.table = new TableView({
                collection: this.collection,
                columns: this.columns,
                tableClass: 'break-header',
                filter: 's',
                loading: true,
                backgrid: { 
                    row: Backgrid.Row,
                    emptyText: 'No data collections found', 
                }
            })

        },

        updateColumns: function() {
            var states = this.statuses.pluck('STATES')
            var group_names = _.keys(states[0])
            var groups = {}
            _.each(group_names, function(group) {
                groups[group] = _.unique(_.map(states, function(state) { return _.keys(state[group]) }).flat())
            })
            
            _.each(groups, function(programs, group) {
                _.each(programs, function(program) {
                    var id = group+program
                    var col = this.table.grid.columns.where({ pid: id });
                    var title = program.replace('+', '+ ').replace('.', '. ')
                    if (!col.length) {
                        this.table.grid.insertColumn(
                            { label: title , cell: APItemCell, editable: false, group: group, program: program, pid: id }
                        )
                    }
                }, this)
            }, this)
        },
         
        updateStatus: function() {
            var self = this
            this.statuses.fetch({ type: 'POST', data: { ids: this.collection.pluck('ID') } }).done(function() {
                self.collection.each(function(dc) {
                    var s = self.statuses.findWhere({ ID: dc.get('ID') })
                    var st = s.get('STATES')
                    dc.set({
                        STATES: st,
                        APLOADED: true 
                    })
                })
                self.updateColumns()
            })
        },
        
        onRender: function() {
            this.updateStatus()
            this.wrap.show(this.table)
        }
    })
})