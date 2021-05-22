define(['backbone', 'marionette', 
    'backgrid', 
    'views/table', 
    'views/filter', 
    'utils/table', 
    'utils',
    'collections/proposaltypes',
    'collections/bls', 
    'collections/containers'], function(Backbone, Marionette, Backgrid, TableView, FilterView, table, utils,
        ProposalTypes,
        Beamlines,
        Containers) {


    var ClickableRow = table.ClickableRow.extend({
        event: 'container:review',
        argument: 'CONTAINERID',
        cookie: true,
    })

    var ActionCell = Backgrid.Cell.extend({
        events: {
            'click a.completed': 'markCompleted'
        },

        markCompleted: function(e) {
            e.preventDefault()
            utils.confirm({
                title: 'Confirm Mark Completed',
                content: 'Are you sure you want to mark &quot;'+this.model.get('NAME')+'&quot; completed?',
                callback: this.doMarkCompleted.bind(this)
            })
        },

        doMarkCompleted: function() {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue/'+this.model.get('CONTAINERQUEUEID'),
                method: 'POST',
                success: function() {
                    app.alert({ className: 'message notify', message: 'Container queue successfully marked as completed' })
                    self.model.collection.fetch()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong marking this container queue as completed, please try again' })
                },
                
            })
        },

        render: function() {
            if (app.staff && this.model.get('CONTAINERQUEUEID')) {
                this.$el.html('<a href="#" class="button completed" title="Manually mark container completed"><i class="fa fa-check"></i></a>')
            }
            
            return this
        }
    })

    var LocationCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.html(this.model.escape('BEAMLINELOCATION'))
            if (this.model.get('SAMPLECHANGERLOCATION')) {
                this.$el.append(' - ' + this.model.escape('SAMPLECHANGERLOCATION'))
            }
            return this
        }
    })

    var FilterWithDefault = FilterView.extend({
        default: null,

        selected: function() {
            var selected = this.collection.findWhere({ isSelected: true })
            if (!selected) {
                var selected = this.collection.findWhere({ id: this.getOption('default')})
                selected.set({isSelected: true})
            }
            return selected ? selected.get('id') : null
        },
    })
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>Queued Containers (<span class="total">-</span>)</h1><div class="filter type"></div><div class="filter type2"></div><div class="filter typeas"></div><div class="filter typebl"></div><div class="wrapper"></div></div>',
        regions: { 
            wrap: '.wrapper',
            type: '.type', type2: '.type2', typeas: '.typeas', typebl: '.typebl'
        },


        hiddenColumns: [3,4,5,7,9,10,11],

        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'PROP', label: 'Proposal', cell: 'string', editable: false },
            { name: 'OWNER', label: 'Owner', cell: 'string', editable: false },
            { name: 'CARDNAME', label: 'Contact', cell: 'string', editable: false },
            { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
            { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
            { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
            { name: 'MODES', label: 'Modes', cell: 'string', editable: false },
            { name: 'CONTAINERSTATUS', label: 'Status', cell: 'string', editable: false },
            { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
            { name: 'QUEUEDTIMESTAMP', label: 'Queued', cell: 'string', editable: false },
            { name: 'LASTQUEUECOMPLETED', label: 'Completed', cell: 'string', editable: false },
            { label: 'SC', cell: LocationCell, editable: false },
            { label: '', cell: ActionCell, editable: false },
        ],

        showFilter: true,
        filters: [
            { id: 'queued', name: 'Queued'},
            { id: 'completed', name: 'Completed'},
        ],

        ui: {
            total: 'span.total',
        },

        refresh: function() {
            this.collection.fetch()
        },

        updateTotal: function() {
            this.ui.total.text(this.collection.state.totalRecords)
        },

        initialize: function(options) {
            this.types = new ProposalTypes()
            this.ready = []
            this.ready.push(this.types.fetch())

            this.beamlines = new Beamlines(null, { ty: app.type })
            this.ready.push(this.beamlines.fetch())

            this.collection = new Containers()
            this.collection.queryParams.all = 1
            this.collection.queryParams.PUCK = 1
            this.collection.queryParams.ty = 'queued'
            this.collection.state.currentPage = options.params.page
            this.listenTo(this.collection, 'sync', this.updateTotal)

            var filters = this.getOption('filters').slice(0)
            var columns = this.getOption('columns').slice(0)

            if (app.mobile()) {
                _.each(this.getOption('hiddenColumns'), function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.table = new TableView({ 
                collection: this.collection, 
                columns: columns, 
                tableClass: 'containers', filter: 's', search: options.params.s, loading: true, 
                backgrid: { row: ClickableRow, emptyText: 'No containers found' } })

            this.ty = new FilterWithDefault({
                default: 'queued',
                collection: this.collection,
                value: options.params && options.params.ty,
                name: 'ty',
                filters: filters
            })

            this.assigned = new FilterView({
                collection: this.collection,
                name: 'assigned',
                filters: { id: 1, name: 'Assigned'},
            })
        },
                               
        onRender: function() {
            this.wrap.show(this.table)
            this.type.show(this.ty)
            this.typeas.show(this.assigned)

            $.when.apply($, this.ready).then(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            this.showProposalFilter()
            this.showBeamlineFilter()
            this.refresh()
        },

        showProposalFilter: function() {
            this.ty2 = new FilterView({
                collection: this.collection,
                name: 'PROPOSALCODE',
                urlFragment: 'pt',
                value: this.getOption('params') && this.getOption('params').pt,
                filters: this.types.map(function(b) { return { id: b.get('PROPOSALCODE'), name: b.get('PROPOSALCODE') } }),
            })
            this.type2.show(this.ty2)
        },

        updateFilter2: function(selected) {
            this.collection.queryParams.proposalcode = selected
            this.refresh()
        },

        showBeamlineFilter: function() {
            this.tybl = new FilterView({
                collection: this.collection,
                name: 'bl',
                urlFragment: 'bl',
                value: this.getOption('params') && this.getOption('params').bl,
                filters: this.beamlines.map(function(b) { return { id: b.get('BEAMLINE'), name: b.get('BEAMLINE') } }),
            })
            this.typebl.show(this.tybl)
        },
    })

})
