define(['marionette', 
    'backgrid', 
    'views/table', 
    'views/filter', 
    'utils/table', 
    'utils'], function(Marionette, Backgrid, TableView, FilterView, table, utils) {
    
    var DisposeCell = Backgrid.Cell.extend({
        events: {
            'click a.dispose': 'disposeContainer',
        },

        initialize: function(options) {
            DisposeCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change', this.render, this)
        },

        disposeContainer: function(e) {
            e.preventDefault()

            utils.confirm({
                title: 'Dispose Container',
                content: 'Are you sure you want to dispose this container? ISPyB will no longer know where this plate is, so it must be removed from the imager',
                callback: this.doDispose.bind(this)
            })
        },


        doDispose: function() {
            this.model.set('DISPOSE', 1)
            this.model.save(this.model.changedAttributes(), { patch: true })
        },

        render: function() {
            this.$el.empty() 
            if (this.model.get('IMAGERID') && !this.model.get('CONTAINERQUEUEID')) {
                this.$el.html('<a href="#" class="button dispose" title="Dispose Container"><i class="fa fa-trash-o"></i></a>')    
            }

            return this
        }
    })


    var ClickableRow = table.ClickableRow.extend({
        event: 'container:show',
        argument: 'CONTAINERID',
        cookie: true,
    })

    var CustomHeaderCell = Backgrid.HeaderCell.extend({
        render: function() {
            // Allow HTML in the column header
            this.$el.html(this.column.get("label"));
            return this;
        }
    });

    var highlightQueued = function(data, auto) {
        const queued = auto ? data.QUEUEDAUTOSUBSAMPLES : data.QUEUEDMANUALSUBSAMPLES;
        const completed = auto ? data.COMPLETEDAUTOSUBSAMPLES : data.COMPLETEDMANUALSUBSAMPLES;
        const available = auto ? data.AVAILABLEAUTOSUBSAMPLES : data.AVAILABLEMANUALSUBSAMPLES;
        return (queued > 0 ? '<span class="minor">'+queued+'</span>' : queued)+' / '+completed+' / '+available;
    }

    var queuedCompleted = function(data) {
        if (data.LASTQUEUECOMPLETED) { return data.LASTQUEUECOMPLETED }
        if (data.CONTAINERQUEUEID) { return 'Queued' }
        return null
    }

    return Marionette.View.extend({
        className: 'content',
        template: _.template('<div><h1>Containers</h1><div class="filter"><span class="type"></span><span><ul><li><label><input type="checkbox" name="currentuser" /> My Containers</label></li></ul></span></div><div class="wrapper"></div></div>'),
        regions: { wrap: '.wrapper', type: '.type' },
        
        ui: {
            cur: 'input[name=currentuser]',
        },

        events: {
            'change @ui.cur': 'refresh'
        },

        hiddenColumns: [1,2,5,6,7,10,11,12],

        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
            { name: 'BARCODE', label: 'Barcode', cell: 'string', editable: false },
            { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
            { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
            { name: 'MANUAL', label: '<button>Manual Subsamples<br>Queued / Complete / Avail</button>', cell: table.TemplateCell, template: d=>highlightQueued(d,false), editable: false, headerCell: CustomHeaderCell },
            { name: 'AUTO', label: '<button>Auto Subsamples<br>Queued / Complete / Avail</button>', cell: table.TemplateCell, template: d=>highlightQueued(d,true), editable: false, headerCell: CustomHeaderCell },
            { name: 'CONTAINERTYPE', label: 'Type', cell: 'string', editable: false },
            { name: 'CONTAINERSTATUS', label: 'Status', cell: 'string', editable: false },
            { name: 'LASTQUEUECOMPLETED', label: 'Completed', cell: table.TemplateCell, template: queuedCompleted, editable: false },
            { name: 'INSPECTIONS', label: 'Inspections', cell: 'string', editable: false },
            { name: 'LASTINSPECTIONDAYS', label: 'Last (d)', cell: 'string', editable: false },
            { name: 'AGE', label: 'Age (d)', cell: 'string', editable: false },
        ],

        showFilter: true,
        filters: [
            { id: 'plate', name: 'Plates'},
            { id: 'puck', name: 'Pucks'},
            { id: 'imager', name: 'In Imager'},
            { id: 'queued', name: 'Queued'},
            { id: 'completed', name: 'Completed'},
            { id: 'processing', name: 'Processing'},
            { id: 'subsamples', name: 'Has Manual Subsamples'},
        ],

        showImaging: true,

        refresh: function() {
            this.collection.fetch()
        },

        getCurrent: function() {
            return this.ui.cur && this.ui.cur.is(':checked') ? 1 : null
        },

        initialize: function(options) {
            this.imager = options.imager
            // dont show Plates/Pucks/In Imager filters if in imager mode
            var filters = this.getOption('filters').slice(this.imager ? 3 : 0)
            var columns = this.getOption('columns').slice(0)
            if (app.user_can('disp_cont') && !app.mobile() && this.getOption('showImaging')) {
                columns.push({ name: 'VISIT', label: 'Visit', cell: 'string', editable: false })
                columns.push({ name: 'REQUESTEDIMAGER', label: 'Req. Imager', cell: 'string', editable: false })
                columns.push({ name: 'IMAGER', label: 'Imager', cell: 'string', editable: false })
                columns.push({ label: '', cell: table.TemplateCell, editable: false, test: 'REQUESTEDRETURN', template: '<i class="fa fa-paper-plane-o" title="User requested return"></i>' })
                columns.push({ label: '', cell: DisposeCell, editable: false })
                filters.push({ id: 'todispose', name: 'To Dispose'})
            }

            if (app.mobile()) {
                _.each(this.getOption('hiddenColumns'), function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.table = new TableView({ 
                collection: options.collection, 
                columns: columns, 
                tableClass: 'containers', filter: 's', search: options.params.s, loading: true, 
                backgrid: { row: ClickableRow, emptyText: 'No containers found' } })

            this.ty = new FilterView({
                url: !options.noFilterUrl,
                collection: options.collection,
                value: options.params && options.params.ty,
                name: 'ty',
                filters: filters
            })

            this.listenTo(this.ty, 'selected:change', this.updateCols)
        },

        updateCols: function(selected) {
            var isPuck = !this.imager && (selected === null || selected === 'puck')

            var dew = this.table.grid.columns.findWhere({ name: 'DEWAR' })
            var bc = this.table.grid.columns.findWhere({ name: 'BARCODE' })
            var manual = this.table.grid.columns.findWhere({ name: 'MANUAL' })
            var auto = this.table.grid.columns.findWhere({ name: 'AUTO' })
            dew.set('renderable', isPuck)
            bc.set('renderable', !isPuck)
            if (manual) manual.set('renderable', !isPuck)
            if (auto) auto.set('renderable', !isPuck)
        },
                                          
        onRender: function() {
            this.getRegion('wrap').show(this.table)
            if (this.getOption('showFilter')) this.getRegion('type').show(this.ty)

            this.collection.queryParams.currentuser = this.getCurrent.bind(this)
            this.updateCols(this.ty.selected())
        }
    })

})
