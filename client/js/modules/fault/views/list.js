define(['marionette', 'modules/fault/views/filters', 'views/table', 'utils/table'], function(Marionette, FilterView, TableView, table) {

    var ClickableRow = table.ClickableRow.extend({
        event: 'fault:show',
        argument: 'FAULTID',
    })

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Faults</h1><% if (app.user_can(\'fault_add\')) { %><div class="r"><a class="button add" href="/faults/add"><i class="fa fa-plus"></i> Add Fault Report</a></div><% } %><div class="filters"></div><div class="wrapper"></div>'),
        regions: { wrap: '.wrapper', flts: '.filters' },
        filters: true,
        search: true,

        initialize: function(options) {
            var columns = [
                { name: 'TITLE', label: 'Title', cell: table.HTMLCell, editable: false },
                { name: 'STARTTIME', label: 'Time', cell: 'string', editable: false },
                { name: 'BEAMLINE', label: 'Beamline', cell: 'string', editable: false },
                { name: 'VISIT', label: 'Visit', cell: 'string', editable: false },
                { name: 'SYSTEM', label: 'System', cell: 'string', editable: false },
                { name: 'COMPONENT', label: 'Component', cell: 'string', editable: false },
                { name: 'RESOLVEDTEXT', label: 'Resolved', cell: 'string', editable: false },
                { name: 'BEAMTIMELOSTTEXT', label: 'Beamtime Lost', cell: 'string', editable: false },
                { name: 'NAME', label: 'Reporter', cell: 'string', editable: false },
              
            ]
            
            if (app.mobile()) {
                _.each([3,4,5,6,8], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'proposals', filter: this.getOption('search') ? 's' : false, loading: true, backgrid: { row: ClickableRow, emptyText: 'No faults found' } })
            
            if (this.getOption('filters')) this.filters = new FilterView({ collection: options.collection, params: this.getOption('params') })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
            if (this.getOption('filters')) this.flts.show(this.filters)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },
    })

})