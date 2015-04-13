define(['marionette', 'views/table', 'collections/containers', 'utils/table'], function(Marionette, TableView, Shipments, table) {
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'container:show',
    argument: 'CONTAINERID',
  })
    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Containers</h1><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },
    
    initialize: function(options) {
      var columns = [{ name: 'NAME', label: 'Name', cell: 'string', editable: false },
                     { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
                     { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
                     { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
                     { name: 'CONTAINERSTATUS', label: 'Status', cell: 'string', editable: false },
                     ]
        
      if (app.mobile()) {
        _.each([1,2], function(v) {
            columns[v].renderable = false
        })
      }
        
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'containers', filter: 's', loading: true, backgrid: { row: ClickableRow, emptyText: 'No containers found' } })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    }
  })

})