define(['marionette', 'views/table', 'views/filter', 
  'collections/componenttypes', 
  'modules/projects/views/addto', 'utils/table'], 
  function(Marionette, TableView, FilterView, ComponentTypes, AddToProjectView, table) {
    
    
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
    template: _.template('<h1><%=title%>s</h1><p class="help">This page lists all <%-title.toLowerCase()%>s associated with the currently selected proposal</p><div class="ra"><a class="button" href="/proteins/add"><i class="fa fa-plus"></i> Add <%-title%></a></div><div class="filter type"></div><div class="wrapper"></div>'),
    regions: { 'wrap': '.wrapper', type: '.type' },
    
    title: 'Protein',

    templateHelpers: function() {
        return {
          title: this.getOption('title')
        }
    },

    columns: [
        { name: 'NAME', label: 'Name', cell: 'string', editable: false },
        { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
        { name: 'MOLECULARMASS', label: 'Mass', cell: 'string', editable: false },
        { name: 'HASSEQ', label: 'Sequence', cell: 'string', editable: false },
        { name: 'COMPONENTTYPE', label: 'Type', cell: 'string', editable: false },
        { name: 'ABUNDANCE', label: 'Abundance', cell: 'string', editable: false },
        { name: 'CONCENTRATIONTYPE', label: 'Unit', cell: 'string', editable: false },
        { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
        { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
        { name: ' ', cell: table.ProjectCell, itemname: 'ACRONYM', itemid: 'PROTEINID', itemtype:'protein', editable: false },
    ],

    hiddenColumns: [2,3],

    initialize: function(options) {  
      if (app.mobile()) {
        _.each(this.getOption('hiddenColumns'), function(v) {
            columns[v].renderable = false
        })
      }
        
      var self = this
      this.table = new TableView({ collection: options.collection, columns: this.getOption('columns'), tableClass: 'proposals', filter: 's', search: options.params && options.params.s, loading: true, 
        backgrid: { 
          row: ClickableRow, 
          emptyText: function() { 
            return self.collection.fetched ? 'No '+self.getOption('title')+'s found' : 'Retrieving '+self.getOption('title')+'s' 
          } 
        }, noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl })

      this.types = new ComponentTypes()
      this.tr = this.types.fetch()
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
      this.tr.done(this.showFilter.bind(this))
    },

    showFilter: function() {
        this.ty = new FilterView({
            url: !this.getOption('noFilterUrl'),
            collection: this.getOption('collection'),
            value: this.getOption('params') && this.getOption('params').ty,
            name: 'type',
            filters: this.types.map(function(m) { return { id: m.get('COMPONENTTYPEID'), name: m.get('NAME') } })
        })
        this.type.show(this.ty)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

})
