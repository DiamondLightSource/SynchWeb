define(['marionette', 'backgrid', 'views/search', 'views/pages', 'backgrid-select-all'], function(Marionette, Backgrid, Search, Pages) {
    
  /*
    Generic Table UI with Paginator
  */
  return Marionette.LayoutView.extend({
    template: _.template('<div class="perp"></div><div class="srch clearfix"></div><div class="tbl bg"></div><div class="page_wrap"></div>'),
    regions: { 'table': '.tbl', 'pages': '.page_wrap:last', search: '.srch', pp: '.perp' },
      
    pages: true,
    noTableHolder: false,
      
    initialize: function(options) {
                    
      this.collection = options.collection
      if (options.loading) {
        this.listenTo(this.collection, 'request', this.displaySpinner);
        this.listenTo(this.collection, 'sync', this.removeSpinner);
        this.listenTo(this.collection, 'error', this.removeSpinner);
      }
                                      
      //options.collection.fetch()
      var gridopts = $.extend({}, { columns: this.getOption('columns'), collection: options.collection, className: options.tableClass }, this.getOption('backgrid'))
      this.grid = new Backgrid.Grid(gridopts)
        
      if (this.getOption('pages')) this.paginator = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
        
      if (options.filter) this.filter = new Search({ collection: options.collection, name: options.filter, url: !options.noSearchUrl, value: options.search });
    },
                                      
    displaySpinner: function() {
      this.table.$el.addClass('loading')
    },

    removeSpinner: function() {
      this.table.$el.removeClass('loading')
    },
                                      
    onRender: function() {
      console.log('render')
      this.table.show(this.grid)
      if (!this.getOption('noTableHolder')) this.table.$el.addClass('table')
      if (this.getOption('pages')) this.pages.show(this.paginator)
      else this.$el.find('.page_wrap').hide()
      if (this.filter) this.search.show(this.filter)
    },
    
    focusSearch: function() {
      this.$el.find('input[type=search]').focus()
    }
  })
        
})
