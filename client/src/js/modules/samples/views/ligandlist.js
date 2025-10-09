define(['marionette', 'backgrid', 'views/table', 'utils/table', 'templates/samples/ligandlist.html'], 
  function(Marionette, Backgrid, TableView, table, Template) {
    
    var ClickableRow = table.ClickableRow.extend({
        event: 'ligands:view',
        argument: 'LIGANDID',
        cookie: true,
    })
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: Template,
        regions: { 'wrap': '.wrapper' },
    
        clickableRow: ClickableRow,
        
        title: 'Ligand',
        url: 'ligand',
    
        templateHelpers: function() {
            return {
              title: this.getOption('title'),
              url: this.getOption('url'),
            }
        },
    
        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'SMILES', label: 'SMILES Code', cell: 'string', editable: false },
            { name: 'LIBRARYNAME', label: 'Library Name', cell: 'string', editable: false },
            { name: 'LIBRARYBATCHNUMBER', label: 'Library Batch No', cell: 'string', editable: false },
            { name: 'PLATEBARCODE', label: 'Plate Barcode', cell: 'string', editable: false },
            { name: 'SOURCEWELL', label: 'Source Well', cell: 'string', editable: false },
            { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
            { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
        ],

        initialize: function(options) {
    
          var cols = this.getOption('columns')
    
          var self = this
          this.table = new TableView({ collection: options.collection, columns: cols, tableClass: 'proposals', filter: 's', search: options.params && options.params.s, loading: true, 
            backgrid: { 
              row: this.getOption('clickableRow'), 
              emptyText: function() { 
                return self.collection.fetched ? 'No '+self.getOption('title')+'s found' : 'Retrieving '+self.getOption('title')+'s' 
              } 
            }
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
