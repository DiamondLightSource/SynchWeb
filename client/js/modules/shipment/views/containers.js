define(['marionette', 'views/table', 'collections/containers', 'views/filter', 'utils/table'], function(Marionette, TableView, Shipments, FilterView, table) {
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'container:show',
    argument: 'CONTAINERID',
  })
    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Containers</h1><div class="filter type"></div><div class="wrapper"></div></div>',
    regions: { wrap: '.wrapper', type: '.type' },
    
    initialize: function(options) {
      var columns = [{ name: 'NAME', label: 'Name', cell: 'string', editable: false },
                     { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
                     { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
                     { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
                     { name: 'CONTAINERTYPE', label: 'Type', cell: 'string', editable: false },
                     { name: 'CONTAINERSTATUS', label: 'Status', cell: 'string', editable: false },
                     { name: 'INSPECTIONS', label: 'Inspections', cell: 'string', editable: false },
                     { name: 'LASTINSPECTION', label: 'Last', cell: 'string', editable: false },
                     ]
        
      if (app.mobile()) {
        _.each([1,2,5,6], function(v) {
            columns[v].renderable = false
        })
      }
        
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'containers', filter: 's', search: options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: 'No containers found' } })

      this.ty = new FilterView({
        url: !options.noFilterUrl,
        collection: options.collection,
        value: options.params && options.params.ty,
        name: 'ty',
        filters: [
          { id: 'plate', name: 'Plates'},
          { id: 'puck', name: 'Pucks'},
        ]  
      })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
      this.type.show(this.ty)
    }
  })

})