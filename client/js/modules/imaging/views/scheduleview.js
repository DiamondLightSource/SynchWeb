define(['marionette', 'views/table', 'utils/table', 
  'modules/imaging/collections/schedulecomponents'
  ], function(Marionette, TableView, table, ScheduleComponents) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Schedule for <%=NAME%></h1><p class="help">This page lists the components for the selected schedule</p><div class="wrapper"></div>'),
        regions: { 'wrap': '.wrapper' },
        
        initialize: function(options) {
            this.components = new ScheduleComponents()
            this.components.queryParams.shid = this.model.get('SCHEDULEID')
            this.components.fetch()

            var columns = [{ name: 'OFFSET_HOURS', label: 'Offset Hours', cell: 'string', editable: false },
                           { name: 'INSPECTIONTYPE', label: 'Imaging Type', cell: 'string', editable: false },
            ]
                          
            this.table = new TableView({ collection: this.components, columns: columns, tableClass: 'components', pages: false, loading: true, backgrid: { emptyText: 'No components found', } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
        
    })

})