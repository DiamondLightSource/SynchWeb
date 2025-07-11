define(['marionette', 
  'backgrid', 
  'views/table', ], 
  function(Marionette, Backgrid, TableView) {

  var ContactCell = Backgrid.Cell.extend({
    render: function() {
      this.$el.empty()
      var lcout = this.model.get('LCOUT')
      var lcret = this.model.get('LCRET')
      if (lcout && lcret && lcout !== lcret) {
        this.$el.html(lcout + ' / ' + lcret)
      } else if (lcout) {
        this.$el.text(lcout)
      } else if (lcret) {
        this.$el.text(lcret)
      }
      return this
    }
  })

  var FocusableRow = Backgrid.Row.extend({
    events: {
      'click': 'onClick',
    },
    onClick: function() {
      app.trigger('shipment:show', this.model.get('SHIPPINGID'))
    },
      
    render: function() {
        Backgrid.Row.prototype.render.call(this)
        
        console.log('render row', this.model.get('SAFETYLEVEL'))
        if (this.model.get('SAFETYLEVEL') == 'Yellow') this.$el.addClass('minor')
        if (this.model.get('SAFETYLEVEL') == 'Red') this.$el.addClass('inactive')
            
        return this
    },
  })
    
  return Marionette.LayoutView.extend({
    className: 'content',
    template: '<div><h1>Shipments</h1><p class="help">This page shows a list of shipments associated with the currently selected proposal</p><p class="help">In order to register your samples you need to create a shipment. Shipments contain dewars, dewars contain containers, and containers individual samples. These can be created sequentially by viewing a particular shipment</p><div class="ra"><a class="button add" href="/shipments/add" data-testid="add-shipment-button"><i class="fa fa-plus"></i> Add Shipment</a></div><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },
    ui: {
      add: 'a.add',
    },
    
    initialize: function(options) {
      var columns = [{ name: 'SHIPPINGNAME', label: 'Name', cell: 'string', editable: false },
                     { name: 'DEWARS', label: 'Dewar(s)', cell: 'string', editable: false },
                     { name: 'CREATED', label: 'Creation Date', cell: 'string', editable: false },
                     { name: 'VISIT', label: 'Visit', cell: 'string', editable: false },
                     { name: 'CONTACTS', label: 'Lab Contact', cell: ContactCell, editable: false },
                     { name: 'SHIPPINGSTATUS', label: 'Status', cell: 'string', editable: false },
                     { name: 'DCOUNT', label: '# Comp', cell: 'string', editable: false },
                     { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                     ]
        
      if (app.mobile()) {
        _.each([1,4,6,7], function(v) {
            columns[v].renderable = false
        })
      }
        
      //this.shipments = new Shipments()
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'shipments', backgrid: { row: FocusableRow, emptyText: 'No shipments found' } })
    },
                                      
    onRender: function() {
      if (app.proposal && app.proposal.get('ACTIVE') != 1) this.ui.add.hide()

      this.wrap.show(this.table)
    }
  })

})
