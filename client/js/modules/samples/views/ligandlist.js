define(['marionette', 'views/table', 'collections/proposals', 'modules/projects/views/addto', 'utils/table'], function(Marionette, TableView, Proposals, AddToProjectView, table) {
    
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'ligands:view',
    argument: 'LIGANDID',
  })

  return Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Ligands</h1><p class="help">This page lists all ligands associated with the currently selected proposal</p><div class="ra"><a class="button" href="/ligands/add"><i class="fa fa-plus"></i> Add Ligand</a></div><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },
    
    initialize: function(options) {
      var columns = [
        { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
        { name: 'IUPAC', label: 'IUPAC', cell: 'string', editable: false },
        { name: 'HASSMILES', label: 'SMILES', cell: 'string', editable: false },
        { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
        { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
        { name: ' ', cell: table.ProjectCell, itemname: 'ACRONYM', itemid: 'LIGANDID', itemtype:'ligand', editable: false },
      ]
        
      if (app.mobile()) {
        _.each([2,3], function(v) {
            columns[v].renderable = false
        })
      }
        
      var self = this
      this.table = new TableView({ 
          collection: options.collection, 
          columns: columns, 
          tableClass: 'ligands', filter: 's', search: options.params && options.params.s, loading: true, 
          backgrid: { row: ClickableRow, emptyText: function() { return self.collection.fetched ? 'No ligands found' : 'Retrieving ligands' } }, 
          noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl 
        })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

})
