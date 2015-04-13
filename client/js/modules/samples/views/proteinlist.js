define(['marionette', 'views/table', 'collections/proposals', 'modules/projects/views/addto', 'utils/table'], function(Marionette, TableView, Proposals, AddToProjectView, table) {
    
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'proteins:view',
    argument: 'PROTEINID',
    cookie: true,
  })
    
  /*var ClickableRow = Backgrid.Row.extend({
    events: {
      'click': 'onClick',
    },
    onClick: function() {
      if ($(e.target).is('i') || $(e.target).is('a')) return        
      app.cookie(this.model.get('PROP'))
      app.trigger('proteins:view', this.model.get('PROTEINID'))
    },
  })*/
    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Proteins</h1><p class="help">This page lists all proteins associated with the currently selected proposal</p><div class="ra"><a class="button" href="/proteins/add"><i class="fa fa-plus"></i> Add Protein</a></div><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },
    
    initialize: function(options) {
      var columns = [
        { name: 'NAME', label: 'Name', cell: 'string', editable: false },
        { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
        { name: 'MOLECULARMASS', label: 'Mass', cell: 'string', editable: false },
        { name: 'SEQ', label: 'Sequence', cell: 'string', editable: false },
        { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
        { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
        { name: ' ', cell: table.ProjectCell, itemname: 'ACRONYM', itemid: 'PROTEINID', itemtype:'protein', editable: false },
      ]
        
      if (app.mobile()) {
        _.each([2,3], function(v) {
            columns[v].renderable = false
        })
      }
        
      var self = this
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'proposals', filter: 's', loading: true, backgrid: { row: ClickableRow, emptyText: function() { return self.collection.fetched ? 'No proteins found' : 'Retrieving proteins' } }, noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

})
