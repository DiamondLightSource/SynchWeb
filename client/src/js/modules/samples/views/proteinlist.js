define(['marionette', 'backgrid', 'views/table', 'views/filter', 
  'collections/componenttypes', 
  'modules/projects/views/addto',
  'utils/table',
  'templates/samples/proteinlist.html'], 
  function(Marionette, Backgrid, TableView, FilterView, ComponentTypes, AddToProjectView, table, Template) {
    
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'proteins:view',
    argument: 'PROTEINID',
    cookie: true,

    render: function() {
      Backgrid.Row.prototype.render.call(this)

      // Highlight approved samples
      // Currently all samples with an external id are green
      // In future use Protein safetyLevel to discriminate
      if (this.model.get('EXTERNAL') == '1') this.$el.addClass('active')
          
      return this
    },

  })

    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: Template,
    regions: { 'wrap': '.wrapper', type: '.type' },
    // ui: {
    //   add: 'a.add',
    // },

    clickableRow: ClickableRow,
    showFilter: true,
    
    title: 'Protein',
    url: 'protein',

    templateHelpers: function() {
        return {
          title: this.getOption('title'),
          url: this.getOption('url'),
          // In future combine with a global 'strict mode' or 'valid_samples' config option
          CAN_CREATE: app.staff && (app.proposal && app.proposal.get('ACTIVE') == 1),
        }
    },

    columns: [
        { name: 'NAME', label: 'Name', cell: 'string', editable: false },
        { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
        { name: 'MOLECULARMASS', label: 'Mass', cell: 'string', editable: false },
        { name: 'HASSEQ', label: 'Sequence', cell: 'string', editable: false },
        { name: 'PDBS', label: 'PDBs', cell: 'string', editable: false },
        { name: 'COMPONENTTYPE', label: 'Type', cell: 'string', editable: false },
        { name: 'CONCENTRATIONTYPE', label: 'Unit', cell: 'string', editable: false },
        { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
        { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
        { name: ' ', cell: table.ProjectCell, itemname: 'ACRONYM', itemid: 'PROTEINID', itemtype:'protein', editable: false },
    ],

    hiddenColumns: [2,3,5],

    
    selectModel: function(m, checked) {
        console.log('model seleted in grid')
        m.set({ isGridSelected: checked })
    },


    initialize: function(options) {
      if (app.mobile()) {
        _.each(this.getOption('hiddenColumns'), function(v) {
            this.getOption('columns')[v].renderable = false
        }, this)
      }

      var cols = this.getOption('columns').slice(0)
      if (options.selectable) {
          cols.unshift({ label: '', cell: 'select-row', headerCell: 'select-all', editable: false })
          this.options.clickableRow = Backgrid.Row
          this.listenTo(this.collection, 'backgrid:selected', this.selectModel, this)
      }

      var self = this
      this.table = new TableView({ collection: options.collection, columns: cols, tableClass: 'proposals', filter: 's', search: options.params && options.params.s, loading: true, 
        backgrid: { 
          row: this.getOption('clickableRow'), 
          emptyText: function() { 
            return self.collection.fetched ? 'No '+self.getOption('title')+'s found' : 'Retrieving '+self.getOption('title')+'s' 
          } 
        }, noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl })

      this.types = new ComponentTypes()
      this.tr = this.types.fetch()
    },
                                      
    onRender: function() {
      // if (app.proposal && app.proposal.get('ACTIVE') != 1) this.ui.add.hide()

      this.wrap.show(this.table)
      if (this.getOption('showFilter')) this.tr.done(this.showFilter.bind(this))
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
