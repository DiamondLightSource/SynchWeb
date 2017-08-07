define(['marionette', 'views/table', 'views/filter', 'modules/projects/views/addto', 'utils/table',
  'utils/xhrimage'], 
  function(Marionette, TableView, FilterView, AddToProjectView, table, XHRImage) {

    
  var ClickableRow = table.ClickableRow.extend({
    event: 'samples:view',
    argument: 'BLSAMPLEID',
    cookie: true,
  })
    

  var SnapshotCell = Backgrid.Cell.extend({
      render: function() {
          this.$el.empty()

          if (this.model.get('DCID')) {
              this.$el.html('<img class="img img1" /> <img class="img img2" />')

              var self = this
              var img1 = new XHRImage()
              var img2 = new XHRImage()
              img1.onload = function() {
                  self.$el.find('.img1').attr('src', img1.src)
              }

              img2.onload = function() {
                  self.$el.find('.img2').attr('src', img2.src)
              }

              img1.load(app.apiurl+'/image/id/'+this.model.get('DCID')+'/n/2')
              img2.load(app.apiurl+'/image/id/'+this.model.get('DCID'))
          }

          return this
      }
  })
    
  var module = Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Samples</h1><p class="help">This page shows sample associated with the currently selected proposal</p><div class="filter type"></div><div class="wrapper"></div></div>',
    regions: { wrap: '.wrapper', type: '.type' },

    filters: [
        { id: 'R', name: 'Robot Loaded'},
        { id: 'SC', name: 'Screened'},
        { id: 'AI', name: 'Auto Indexed'},
        { id: 'DC', name: 'Data Collected'},
        { id: 'AP', name: 'Auto Integrated'},
    ],


    columns: [
        //{ name: 'BLSAMPLEID', label: 'ID', cell: 'string', editable: false },
        { name: 'NAME', label: 'Name', cell: 'string', editable: false },
        { name: 'RECORDTIMESTAMP', label: 'Created', cell: 'string', editable: false },
        { name: 'ACRONYM', label: 'Protein', cell: 'string', editable: false },
        { label: 'Abundance', cell: table.TemplateCell, editable: false, template: '<% if (ABUNDANCE) { %><%-ABUNDANCE%><%-SYMBOL%><% } %>' },
        { name: 'COMPONENTACRONYMS', label: 'Components', cell: 'string', editable: false },
        { name: 'SPACEGROUP', label: 'SG', cell: 'string', editable: false },
        { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
        { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
        { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },

        { name: 'CONTAINER', label: 'Container', cell: 'string', editable: false },
        // { label: 'Snapshot', cell: table.TemplateCell, test: 'DCID', editable: false, template: '<img class="img" src="'+app.apiurl+'/image/id/<%-DCID%>" /> <img class="img" src="'+app.apiurl+'/image/id/<%-DCID%>/n/2" />' },
        { label: 'Snapshot', cell: SnapshotCell, editable: false },
        { name: 'SC', label: 'SCs', cell: 'string', editable: false },
        { name: 'SCRESOLUTION', label: 'Res', cell: 'string', editable: false },
        { name: 'DC', label: 'DCs', cell: 'string', editable: false },
        { name: 'DCRESOLUTION', label: 'Res', cell: 'string', editable: false },
        { label: 'Status', cell: table.StatusCell, editable: false },
        { label: ' ', cell: table.ProjectCell, itemname: 'NAME', itemid: 'BLSAMPLEID', itemtype:'sample', editable: false },
    ],

    hiddenColumns: [2,3,4,5,6,7,8,10],

    
    initialize: function(options) {
      if (app.mobile()) {
        //_.each([0,3,4,5,6,7,9,11], function(v) {
        _.each(this.getOption('hiddenColumns'), function(v) {
            this.getOption('columns')[v].renderable = false
        }, this)
      }
        
      var self = this
      this.table = new TableView({ collection: options.collection, columns: this.getOption('columns'), tableClass: 'samples', filter: 's', search: options.params && options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: function() { return self.collection.fetched ? 'No samples found' : 'Retrieving samples' }  }, noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl })
        
      this.ty = new FilterView({
        url: !options.noFilterUrl,
        collection: options.collection,
        name: 't',
        filters: this.getOption('filters'),
      })
    },
                                      
    onRender: function() {
      this.wrap.show(this.table)
      this.type.show(this.ty)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

  module.SnapshotCell = SnapshotCell
  module.StatusCell = table.StatusCell


  return module

})
