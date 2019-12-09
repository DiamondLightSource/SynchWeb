define(['marionette', 
  'backgrid', 
  'views/table'], 
  function(Marionette, Backgrid, TableView) {
    
    
  var ClickableRow = Backgrid.Row.extend({
    events: {
      'click': 'onClick',
    },
    onClick: function() {
      var prop = app.prop
      app.cookie(this.model.get('PROPOSALCODE') + this.model.get('PROPOSALNUMBER'))
      app.type = this.model.get('TYPE')
      if (!prop  && !app.staff) app.trigger('current:show')
      else app.trigger('visits:show')
    },
  })
    
  return Marionette.LayoutView.extend({
    clickableRow: ClickableRow,
    className: 'content',
    template: _.template('<h1>Proposals</h1><p class="help">This page lists all proposals available to you. Click on a row to select that proposal</p><div class="wrapper"></div>'),
    regions: { 'wrap': '.wrapper' },
    
    initialize: function(options) {
      var columns = [
                     // { name: 'ST', label: 'Start Date', cell: 'string', editable: false },
                     { name: 'PROPOSALCODE', label: 'Code', cell: 'string', editable: false },
                     { name: 'PROPOSALNUMBER', label: 'Number', cell: 'string', editable: false },
                     { name: 'VCOUNT', label: 'Visits', cell: 'string', editable: false },
                     { name: 'TITLE', label: 'Title', cell: 'string', editable: false }]
                    
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, backgrid: { row: this.getOption('clickableRow'), emptyText: 'No proposals found', } })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

})