define(['marionette', 'views/table', 'utils/table', 'modules/imaging/collections/inspections'], function(Marionette, TableView, table, Inspections) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>Inspection Schedule</h1><p class="help">This page lists all container inspections both completed and scheduled for the selected container</p><div class="wrapper"></div></div>',
        regions: { 'wrap': '.wrapper' },
        
        initialize: function(options) {
            this.inspections = new Inspections()
            this.inspections.queryParams.cid = options.CONTAINERID
            this.inspections.queryParams.allStates = 1
            this.inspections.fetch()

            var columns = [{ name: 'OFFSET_HOURS', label: 'Expected (hr)', cell: 'string', editable: false },
                           { name: 'SCHEDULEDTIMESTAMP', label: 'Scheduled', cell: 'string', editable: false },
                           { name: 'STATE', label: 'Status', cell: 'string', editable: false },
                           { name: 'PRIORITY', label: 'Priority', cell: 'string', editable: false },
                           { name: 'BLTIMESTAMP', label: 'Processed', cell: 'string', editable: false },
                           { name: 'DELTA', label: 'Delta (d)', cell: 'string', editable: false },
                           { name: 'INSPECTIONTYPE', label: 'Type', cell: 'string', editable: false },
                           { label: 'Adhoc', cell: table.TemplateCell, template: "<%=SCHEDULECOMPONENTID ? 'No' : 'Yes' %>", editable: false },
                           { label: 'Manual', cell: table.TemplateCell, template: "<%=MANUAL == 1 ? 'Yes' : 'No' %>", editable: false },
            ]
                          
            this.table = new TableView({ collection: this.inspections, columns: columns, tableClass: 'inspections', pages: false, loading: true, backgrid: { emptyText: 'No inspections found', } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
        
    })

})