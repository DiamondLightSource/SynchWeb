define(['marionette', 'views/table', 'utils/table'], function(Marionette, TableView, table) {
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'rdewar:show',
    argument: 'FACILITYCODE',
    cookie: true,
  })
    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: _.template('<h1>Registered Dewars</h1><div class="ra"><% if (STAFF) { %><a href="#" class="button all">Show All</a><% } %> <a class="button" href="/dewars/add"><i class="fa fa-plus"></i> Register Dewar</a></div><div class="wrapper"></div>'),
    regions: { wrap: '.wrapper', type: '.type' },
    
    templateHelpers: {
      STAFF: app.staff
    },

    events: {
      'click a.all': 'showAll'
    },

    showAll: function(e) {
      e.preventDefault()

      this.collection.queryParams.all = 1
      this.collection.fetch()
    },

    initialize: function(options) {
      var columns = [{ name: 'FACILITYCODE', label: 'Dewar Code', cell: 'string', editable: false },
                     { name: 'CARDNAME', label: 'Lab Contact', cell: 'string', editable: false },
                     { name: 'GIVENNAME', label: 'Name', cell: 'string', editable: false },
                     { name: 'FAMILYNAME', label: 'Surname', cell: 'string', editable: false },
                     { name: 'LABNAME', label: 'Lab Name', cell: 'string', editable: false },
                     { name: 'ADDRESS', label: 'Address', cell: 'string', editable: false },
                     { name: 'DEWARS', label: '# Uses', cell: 'string', editable: false },
                     ]
        
      if (app.mobile()) {
        _.each([1,2,5,6], function(v) {
            columns[v].renderable = false
        })
      }
        
      this.table = new TableView({ collection: options.collection, 
        columns: columns, tableClass: 'containers', filter: 's', search: options.params.s, loading: true, 
        backgrid: { row: ClickableRow, emptyText: 'No dewars found' } })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    }
  })

})