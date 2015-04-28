define(['marionette', 'views/table', 'collections/visits', 'utils/table',
    
    'tpl!templates/proposal/visitlinks.html',
    'tpl!templates/types/saxs/proposal/visitlinks.html',
    
    ], function(Marionette, TableView, Visits, table, visitlinks, saxsvisitlinks) {


    var ClickableRow = table.ClickableRow.extend({
        event: 'dclist:show',
        argument: 'VISIT',
    })
    

    var LinksCell = table.TemplateCell.extend({
      getTemplate: function() {
        return this.model.get('TYPE') == 'saxs' ? saxsvisitlinks : visitlinks
      }
    })

       
  return Marionette.LayoutView.extend({
    linksTemplate: visitlinks,
    linksCell: LinksCell,
    clickable: true,
      
    className: 'content',
    template: '<div><h1>Visit List</h1><p class="help">This page lists the visits available to the currently selected proposal</p><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },

    initialize: function(options) {
      var columns = [{ name: 'ST', label: 'Start', cell: 'string', editable: false },
                     { name: 'EN', label: 'End', cell: 'string', editable: false },
                     { name: 'VIS', label: 'Number', cell: 'string', editable: false },
                     { name: 'BL', label: 'Beamline', cell: 'string', editable: false },
                     { name: 'LC', label: 'Local Contact', cell: 'string', editable: false },
                     { name: 'COMMENT', label: 'Comment', cell: 'string', editable: false },
                     { name: 'DCCOUNT', label: 'Data Collections', cell: 'string', editable: false },
                     { name: 'LINKS', label: '', cell: this.getOption('linksCell'), template: this.getOption('linksTemplate'), test: 'DCCOUNT', editable: false }]
        
      if (app.mobile()) {
        console.log('mobile!')
        _.each([1,4,5,6], function(v) {
            columns[v].renderable = false
        })
      }
        
      var bgopts = {}
      if (this.getOption('clickable')) bgopts.row = ClickableRow

      this.table = new TableView({ collection: options.collection, columns: columns, filter: 's', search: options.params.s, tableClass: 'proposals', loading: true, backgrid: bgopts })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
    }
  })
       
})